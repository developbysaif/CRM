import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import EmailLog from '@/models/EmailLog';
import ActivityLog from '@/models/ActivityLog';
import nodemailer from 'nodemailer';
import { renderTemplate } from './email.templates';

/**
 * Resolves Resend credentials from environment or Settings model
 */
export async function getResendConfig() {
  const envKey = process.env.RESEND_API_KEY;
  const envFrom = process.env.EMAIL_FROM;

  if (envKey && envKey.trim()) {
    return {
      apiKey: envKey.trim(),
      fromEmail: envFrom ? envFrom.trim() : 'onboarding@resend.dev',
    };
  }

  try {
    await connectDB();
    const settings = await Settings.findOne();
    if (settings?.resendApiKey && settings.resendApiKey.trim()) {
      return {
        apiKey: settings.resendApiKey.trim(),
        fromEmail: settings.resendFromEmail?.trim() || 'onboarding@resend.dev',
      };
    }
  } catch (err) {
    console.warn('Could not read Resend config from Settings:', err.message);
  }

  return { apiKey: null, fromEmail: 'onboarding@resend.dev' };
}

/**
 * Dispatch an email via the Resend API
 */
async function sendViaResend({ apiKey, from, to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Resend Error (HTTP ${res.status})`);
  }

  return data.id || 'resend_ok';
}

/**
 * Dispatch an email via Nodemailer SMTP fallback
 */
async function sendViaSMTP({ settings, to, subject, html, companyName }) {
  const transporter = nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort || 587,
    secure: Boolean(settings.smtpSecure),
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPass,
    },
  });

  const info = await transporter.sendMail({
    from: `"${companyName}" <${settings.fromEmail || settings.smtpUser}>`,
    to,
    subject,
    html,
  });

  return info.messageId || 'smtp_ok';
}

/**
 * Core Automated Email Sender with deduplication, template rendering, and error logging
 * @param {object} params { to, template, variables, leadId, clientId, dedupKey, subject, customHtml }
 */
export async function sendAutomatedEmail({
  to,
  template = 'general',
  variables = {},
  leadId = null,
  clientId = null,
  dedupKey = null,
  subject: customSubject = null,
  customHtml = null,
}) {
  await connectDB();

  if (!to || !to.trim()) {
    throw new Error('Recipient email address is required');
  }

  const recipientEmail = to.trim().toLowerCase();

  // 1. Deduplication Check
  if (dedupKey) {
    const existingSent = await EmailLog.findOne({
      dedupKey,
      status: 'sent',
    });

    if (existingSent) {
      return {
        success: true,
        deduplicated: true,
        message: `Email already sent previously (dedupKey: ${dedupKey})`,
        emailLogId: existingSent._id,
      };
    }
  }

  // 2. Load Settings & Company Profile
  const settings = (await Settings.findOne()) || {};
  const companyName = settings.companyName || 'LeadAI Pro Software Agency';
  const companyAddress = settings.companyAddress || '100 Innovation Way, Suite 500, San Francisco, CA';

  // 3. Render HTML Template
  const mergedVars = {
    companyName,
    companyAddress,
    ...variables,
  };

  const rendered = customHtml
    ? { subject: customSubject || `${companyName} Notification`, html: customHtml }
    : renderTemplate(template, mergedVars);

  const finalSubject = customSubject || rendered.subject;
  const finalHtml = rendered.html;

  // 4. Create Pending EmailLog
  const emailLog = await EmailLog.create({
    leadId,
    clientId,
    type: template,
    recipient: recipientEmail,
    subject: finalSubject,
    provider: 'resend',
    status: 'pending',
    dedupKey: dedupKey || undefined,
    metadata: { template, variables: mergedVars },
  });

  let provider = 'simulated';
  let providerMessageId = '';
  let sendError = null;

  // 5. Attempt Delivery: Resend -> SMTP -> Simulated
  const resendConfig = await getResendConfig();

  if (resendConfig.apiKey) {
    try {
      provider = 'resend';
      const from = `${companyName} <${resendConfig.fromEmail}>`;
      providerMessageId = await sendViaResend({
        apiKey: resendConfig.apiKey,
        from,
        to: recipientEmail,
        subject: finalSubject,
        html: finalHtml,
      });
    } catch (err) {
      console.warn('Resend send failed, attempting SMTP fallback:', err.message);
      sendError = err.message;
    }
  }

  // Fallback to SMTP if Resend not configured or failed
  if (!providerMessageId && settings.smtpHost && settings.smtpUser && settings.smtpPass) {
    try {
      provider = 'smtp';
      providerMessageId = await sendViaSMTP({
        settings,
        to: recipientEmail,
        subject: finalSubject,
        html: finalHtml,
        companyName,
      });
      sendError = null; // Cleared on SMTP success
    } catch (err) {
      console.warn('SMTP fallback send failed:', err.message);
      sendError = err.message;
    }
  }

  // Fallback to Simulation mode (when testing locally without credentials)
  if (!providerMessageId && !resendConfig.apiKey && (!settings.smtpHost || !settings.smtpUser)) {
    provider = 'simulated';
    providerMessageId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    sendError = null;
  }

  // 6. Update EmailLog
  if (providerMessageId) {
    emailLog.status = 'sent';
    emailLog.provider = provider;
    emailLog.providerMessageId = providerMessageId;
    emailLog.sentAt = new Date();
    emailLog.error = '';
    await emailLog.save();

    // Log in Lead's Activity Timeline if attached to a lead
    if (leadId) {
      await ActivityLog.create({
        leadId,
        action: 'email_sent',
        title: `✉️ Automated Email Sent: ${template}`,
        description: `Delivered to ${recipientEmail} via ${provider.toUpperCase()} (${finalSubject})`,
      });
    }

    return {
      success: true,
      sent: true,
      provider,
      providerMessageId,
      emailLogId: emailLog._id,
      subject: finalSubject,
      previewHtml: finalHtml,
    };
  } else {
    emailLog.status = 'failed';
    emailLog.provider = provider;
    emailLog.error = sendError || 'Email delivery failed across all providers';
    await emailLog.save();

    return {
      success: false,
      sent: false,
      provider,
      error: emailLog.error,
      emailLogId: emailLog._id,
    };
  }
}

/**
 * Retry sending a previously failed email
 */
export async function retryEmail(emailLogId) {
  await connectDB();
  const log = await EmailLog.findById(emailLogId);
  if (!log) throw new Error('Email log not found');

  log.retryCount = (log.retryCount || 0) + 1;
  log.status = 'pending';
  await log.save();

  const result = await sendAutomatedEmail({
    to: log.recipient,
    template: log.type,
    variables: log.metadata?.variables || {},
    leadId: log.leadId,
    clientId: log.clientId,
    subject: log.subject,
  });

  return result;
}
