import { apiSuccess, apiError } from '@/lib/api';
import { sendAutomatedEmail, getResendConfig } from '@/lib/services/email/email.service';
import Settings from '@/models/Settings';
import connectDB from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      to,
      subject,
      template = 'general',
      leadId,
      clientId,
      variables = {},
      dedupKey,
      isTest = false,
      data,
    } = body;

    if (!to) {
      return apiError('Recipient email (to) is required', 400);
    }

    // Support payload formats (variables or data)
    const mergedVars = { ...variables, ...(data || {}) };

    if (isTest) {
      await connectDB();
      const resendConfig = await getResendConfig();
      const settings = (await Settings.findOne()) || {};

      const testResult = await sendAutomatedEmail({
        to,
        template: 'general',
        variables: {
          clientName: 'Admin',
          subject: 'LeadAI Pro - Email Configuration Verification Test',
          message: `This is a verification test. Resend status: ${resendConfig.apiKey ? 'Configured ✅' : 'Not Configured ⚠️'}. SMTP status: ${settings.smtpHost ? 'Configured ✅' : 'Not Configured ⚠️'}.`,
          ...mergedVars,
        },
        subject: subject || 'LeadAI Pro - Email Configuration Test',
      });

      return apiSuccess(testResult, 'Email delivery test dispatched');
    }

    const result = await sendAutomatedEmail({
      to,
      template,
      variables: mergedVars,
      leadId,
      clientId,
      dedupKey,
      subject,
    });

    return apiSuccess(result, result.deduplicated ? 'Email skipped (duplicate prevention active)' : 'Email dispatched successfully');
  } catch (error) {
    console.error('Email API Error:', error);
    return apiError('Failed to dispatch email: ' + error.message, 500);
  }
}
