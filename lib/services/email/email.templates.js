/**
 * Master HTML Email Layout Wrapper
 */
function emailLayout({ title, preheader, bodyContent, companyName = 'LeadAI Pro Agency', companyAddress = '100 Innovation Way, Suite 500, San Francisco, CA' }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || companyName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0052ff, #7c3aed); padding: 32px 28px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.85); }
    .content { padding: 32px 28px; line-height: 1.6; font-size: 14.5px; color: #334155; }
    .content h2 { color: #0f172a; font-size: 18px; margin-top: 0; }
    .highlight-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; margin: 20px 0; }
    .highlight-card p { margin: 6px 0; font-size: 13.5px; }
    .btn-container { text-align: center; margin: 30px 0 20px 0; }
    .btn { background: #0052ff; color: #ffffff !important; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 14px; display: inline-block; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader || ''}
  </div>
  <div class="container">
    <div class="header">
      <h1>${companyName}</h1>
      <p>Sales Automation & AI Solutions</p>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p style="margin: 4px 0;"><strong>${companyName}</strong></p>
      <p style="margin: 4px 0;">${companyAddress}</p>
      <p style="margin: 12px 0 0 0; font-size: 11px;">You received this automated notification regarding your sales and project inquiries.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 1. Welcome Email
 */
export function renderWelcomeTemplate(vars = {}) {
  const clientName = vars.clientName || 'there';
  const companyName = vars.companyName || 'LeadAI Pro Agency';
  const projectType = vars.projectType || 'Software Development';
  const portalUrl = vars.portalUrl || vars.proposalUrl || 'https://leadaipro.com';

  const body = `
    <h2>Welcome to ${companyName}, ${clientName}! 👋</h2>
    <p>Thank you for connecting with our 24/7 AI Business Consultant. We're excited to learn about your upcoming <strong>${projectType}</strong> initiative.</p>
    
    <div class="highlight-card">
      <p><strong>🎯 Your Project Interest:</strong> ${projectType}</p>
      <p><strong>🤖 AI Status:</strong> Lead Qualified & Priority Account Created</p>
      <p><strong>⚡ Next Step:</strong> Our team is synthesizing an architectural blueprint tailored to your business goals.</p>
    </div>

    <p>You can track project updates, instant cost estimates, and scheduled discovery sessions anytime through our client portal.</p>

    <div class="btn-container">
      <a href="${portalUrl}" class="btn">Explore Client Portal →</a>
    </div>
    <p style="font-size: 13px; color: #64748b;">If you have any urgent questions, simply reply directly to this email.</p>
  `;

  return emailLayout({
    title: `Welcome to ${companyName}!`,
    preheader: `We've received your ${projectType} request and our AI team is reviewing it.`,
    bodyContent: body,
    companyName,
    companyAddress: vars.companyAddress,
  });
}

/**
 * 2. Proposal Email
 */
export function renderProposalTemplate(vars = {}) {
  const clientName = vars.clientName || 'Valued Client';
  const companyName = vars.companyName || 'LeadAI Pro Agency';
  const projectName = vars.projectName || vars.projectType || 'Custom Software Project';
  const proposalNumber = vars.proposalNumber || 'PROP-001';
  const budget = vars.budget || (vars.total ? `$${Number(vars.total).toLocaleString()}` : '$10,000');
  const timeline = vars.timeline || '4-6 weeks';
  const proposalUrl = vars.proposalUrl || '#';

  const body = `
    <h2>Executive Project Proposal Ready 📄</h2>
    <p>Dear <strong>${clientName}</strong>,</p>
    <p>We are delighted to present your comprehensive technical blueprint and investment proposal for <strong>${projectName}</strong>.</p>

    <div class="highlight-card">
      <p><strong>Proposal Number:</strong> ${proposalNumber}</p>
      <p><strong>Estimated Investment:</strong> ${budget}</p>
      <p><strong>Target Delivery:</strong> ${timeline}</p>
      <p><strong>Deliverables:</strong> Full Architecture, Responsive Frontend, Secure Backend API & Deployment</p>
    </div>

    <div class="btn-container">
      <a href="${proposalUrl}" class="btn" style="background: #0052ff;">View Proposal & Download PDF →</a>
    </div>
    <p>Please review the milestones and let us know if you have any questions before we finalize the legal agreement.</p>
  `;

  return emailLayout({
    title: `Proposal ${proposalNumber} for ${projectName}`,
    preheader: `Your customized executive proposal for ${projectName} is ready for review.`,
    bodyContent: body,
    companyName,
    companyAddress: vars.companyAddress,
  });
}

/**
 * 3. Quotation Email
 */
export function renderQuotationTemplate(vars = {}) {
  const clientName = vars.clientName || 'Valued Client';
  const companyName = vars.companyName || 'LeadAI Pro Agency';
  const quotationNumber = vars.quotationNumber || 'QUO-001';
  const projectName = vars.projectName || 'Software Services';
  const total = vars.total ? `$${Number(vars.total).toLocaleString()}` : (vars.budget || '$5,000');
  const quotationUrl = vars.quotationUrl || '#';

  const body = `
    <h2>Official Quotation: ${quotationNumber} 💰</h2>
    <p>Dear <strong>${clientName}</strong>,</p>
    <p>Here is your official itemized price quote for <strong>${projectName}</strong>.</p>

    <div class="highlight-card">
      <p><strong>Quotation Ref:</strong> ${quotationNumber}</p>
      <p><strong>Total Agreed Investment:</strong> <span style="font-size: 16px; font-weight: 800; color: #10b981;">${total}</span></p>
      <p><strong>Validity:</strong> 30 Days from issue date</p>
    </div>

    <div class="btn-container">
      <a href="${quotationUrl}" class="btn" style="background: #0052ff;">Review Itemized Quotation →</a>
    </div>
  `;

  return emailLayout({
    title: `Quotation ${quotationNumber} from ${companyName}`,
    preheader: `Your formal quotation for ${projectName} is ready.`,
    bodyContent: body,
    companyName,
    companyAddress: vars.companyAddress,
  });
}

/**
 * 4. Contract Email
 */
export function renderContractTemplate(vars = {}) {
  const clientName = vars.clientName || 'Valued Client';
  const companyName = vars.companyName || 'LeadAI Pro Agency';
  const contractNumber = vars.contractNumber || 'MSA-001';
  const projectName = vars.projectName || 'Software Services';
  const contractUrl = vars.contractUrl || '#';

  const body = `
    <h2>Master Services Agreement Ready for Signature ✍️</h2>
    <p>Dear <strong>${clientName}</strong>,</p>
    <p>Your legal contract for <strong>${projectName}</strong> is ready for review and digital signature execution.</p>

    <div class="highlight-card">
      <p><strong>Contract Ref:</strong> ${contractNumber}</p>
      <p><strong>Scope:</strong> Master Services Agreement & Intellectual Property Ownership</p>
      <p><strong>Digital Signing:</strong> Available online with instant timestamped audit trail</p>
    </div>

    <div class="btn-container">
      <a href="${contractUrl}" class="btn" style="background: #10b981;">Review & Sign Contract Digitally →</a>
    </div>
  `;

  return emailLayout({
    title: `Legal Contract ${contractNumber} for ${projectName}`,
    preheader: `Please review and digitally sign your agreement for ${projectName}.`,
    bodyContent: body,
    companyName,
    companyAddress: vars.companyAddress,
  });
}

/**
 * 5. Invoice Email
 */
export function renderInvoiceTemplate(vars = {}) {
  const clientName = vars.clientName || 'Valued Client';
  const companyName = vars.companyName || 'LeadAI Pro Agency';
  const invoiceNumber = vars.invoiceNumber || 'INV-001';
  const total = vars.total ? `$${Number(vars.total).toLocaleString()}` : '$2,500';
  const dueDate = vars.dueDate || 'Upon Receipt';
  const invoiceUrl = vars.invoiceUrl || '#';

  const body = `
    <h2>Invoice ${invoiceNumber} Generated 🧾</h2>
    <p>Dear <strong>${clientName}</strong>,</p>
    <p>Your invoice for <strong>${total}</strong> has been issued. Payment can be recorded online via credit card, Stripe, or bank wire transfer.</p>

    <div class="highlight-card">
      <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
      <p><strong>Amount Due:</strong> <strong style="color: #0052ff;">${total}</strong></p>
      <p><strong>Payment Due Date:</strong> ${dueDate}</p>
    </div>

    <div class="btn-container">
      <a href="${invoiceUrl}" class="btn" style="background: #0052ff;">View & Pay Invoice Online →</a>
    </div>
  `;

  return emailLayout({
    title: `Invoice ${invoiceNumber} from ${companyName}`,
    preheader: `Your invoice ${invoiceNumber} for ${total} is ready for payment.`,
    bodyContent: body,
    companyName,
    companyAddress: vars.companyAddress,
  });
}

/**
 * 6. Follow-up Email
 */
export function renderFollowupTemplate(vars = {}) {
  const clientName = vars.clientName || 'there';
  const companyName = vars.companyName || 'LeadAI Pro Agency';
  const projectName = vars.projectName || 'Software Initiative';
  const portalUrl = vars.portalUrl || 'https://leadaipro.com';

  const body = `
    <h2>Quick Follow-up regarding ${projectName} 🚀</h2>
    <p>Hi <strong>${clientName}</strong>,</p>
    <p>I wanted to check in and see if you had a chance to review our recent project blueprint and proposal for <strong>${projectName}</strong>.</p>
    <p>Our engineering team is prepared to begin architecture kickoff. If you need any adjustments to scope, timeline, or milestones, we'd be happy to schedule a quick 15-minute call.</p>

    <div class="btn-container">
      <a href="${portalUrl}" class="btn">View Project Details & Schedule Call →</a>
    </div>
  `;

  return emailLayout({
    title: `Checking in regarding ${projectName}`,
    preheader: `Quick follow-up on your ${projectName} proposal from ${companyName}.`,
    bodyContent: body,
    companyName,
    companyAddress: vars.companyAddress,
  });
}

/**
 * 7. Meeting Reminder Email
 */
export function renderMeetingReminderTemplate(vars = {}) {
  const clientName = vars.clientName || 'there';
  const companyName = vars.companyName || 'LeadAI Pro Agency';
  const meetingDate = vars.meetingDate || 'Tomorrow';
  const meetingTime = vars.meetingTime || '2:00 PM EST';
  const meetingUrl = vars.meetingUrl || 'https://meet.google.com';
  const title = vars.title || 'Technical Discovery Call';

  const body = `
    <h2>Reminder: Upcoming Discovery Session 📅</h2>
    <p>Hi <strong>${clientName}</strong>,</p>
    <p>This is a friendly reminder for our upcoming meeting: <strong>${title}</strong>.</p>

    <div class="highlight-card">
      <p><strong>Session:</strong> ${title}</p>
      <p><strong>Date & Time:</strong> ${meetingDate} at ${meetingTime}</p>
      <p><strong>Host:</strong> ${companyName} Engineering Team</p>
    </div>

    <div class="btn-container">
      <a href="${meetingUrl}" class="btn" style="background: #06b6d4;">Join Google Meet →</a>
    </div>
  `;

  return emailLayout({
    title: `Reminder: ${title} (${meetingDate})`,
    preheader: `Upcoming meeting reminder with ${companyName} on ${meetingDate}.`,
    bodyContent: body,
    companyName,
    companyAddress: vars.companyAddress,
  });
}

/**
 * 8. Payment Reminder Email
 */
export function renderPaymentReminderTemplate(vars = {}) {
  const clientName = vars.clientName || 'Valued Client';
  const companyName = vars.companyName || 'LeadAI Pro Agency';
  const invoiceNumber = vars.invoiceNumber || 'INV-001';
  const balanceDue = vars.balanceDue || (vars.total ? `$${Number(vars.total).toLocaleString()}` : '$1,500');
  const invoiceUrl = vars.invoiceUrl || '#';

  const body = `
    <h2>Payment Reminder: Invoice ${invoiceNumber} ⏰</h2>
    <p>Dear <strong>${clientName}</strong>,</p>
    <p>This is a friendly reminder regarding outstanding invoice <strong>${invoiceNumber}</strong> with a remaining balance of <strong>${balanceDue}</strong>.</p>

    <div class="highlight-card">
      <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
      <p><strong>Outstanding Balance:</strong> <strong style="color: #ef4444;">${balanceDue}</strong></p>
      <p><strong>Status:</strong> Awaiting Settlement</p>
    </div>

    <div class="btn-container">
      <a href="${invoiceUrl}" class="btn" style="background: #0052ff;">Complete Payment Online →</a>
    </div>
  `;

  return emailLayout({
    title: `Payment Reminder: Invoice ${invoiceNumber}`,
    preheader: `Friendly reminder regarding your invoice ${invoiceNumber} for ${balanceDue}.`,
    bodyContent: body,
    companyName,
    companyAddress: vars.companyAddress,
  });
}

/**
 * 9. Status Update Email
 */
export function renderStatusUpdateTemplate(vars = {}) {
  const clientName = vars.clientName || 'there';
  const companyName = vars.companyName || 'LeadAI Pro Agency';
  const projectName = vars.projectName || 'Software Development';
  const status = vars.status || 'In Progress';
  const updateDetails = vars.updateDetails || 'Milestone completed on schedule.';
  const portalUrl = vars.portalUrl || 'https://leadaipro.com';

  const body = `
    <h2>Project Status Update: ${projectName} ⚡</h2>
    <p>Hi <strong>${clientName}</strong>,</p>
    <p>Here is your latest progress report for <strong>${projectName}</strong>.</p>

    <div class="highlight-card">
      <p><strong>Current Stage:</strong> <span style="font-weight: 700; color: #0052ff;">${status}</span></p>
      <p><strong>Update Summary:</strong> ${updateDetails}</p>
    </div>

    <div class="btn-container">
      <a href="${portalUrl}" class="btn">View Project Kanban →</a>
    </div>
  `;

  return emailLayout({
    title: `Status Update: ${projectName} is now ${status}`,
    preheader: `Latest progress update for your project ${projectName}.`,
    bodyContent: body,
    companyName,
    companyAddress: vars.companyAddress,
  });
}

/**
 * 10. Thank You & Receipt Email
 */
export function renderThankYouTemplate(vars = {}) {
  const clientName = vars.clientName || 'Valued Client';
  const companyName = vars.companyName || 'LeadAI Pro Agency';
  const paymentAmount = vars.paymentAmount || vars.total || '$2,500';
  const receiptNumber = vars.receiptNumber || 'REC-001';
  const invoiceNumber = vars.invoiceNumber || 'INV-001';

  const body = `
    <h2>Payment Received — Thank You! 🎉</h2>
    <p>Dear <strong>${clientName}</strong>,</p>
    <p>We have successfully received and processed your payment of <strong>${paymentAmount}</strong> for invoice <strong>${invoiceNumber}</strong>.</p>

    <div class="highlight-card">
      <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
      <p><strong>Amount Processed:</strong> <strong style="color: #10b981;">${paymentAmount}</strong></p>
      <p><strong>Invoice Reference:</strong> ${invoiceNumber}</p>
      <p><strong>Status:</strong> Confirmed & Cleared</p>
    </div>

    <p>Thank you for partnering with ${companyName}. We look forward to reaching the next milestone!</p>
  `;

  return emailLayout({
    title: `Payment Receipt: ${receiptNumber} (${paymentAmount})`,
    preheader: `We've received your payment of ${paymentAmount}. Thank you!`,
    bodyContent: body,
    companyName,
    companyAddress: vars.companyAddress,
  });
}

/**
 * Dispatcher helper mapping template name to rendering function
 */
export function renderTemplate(templateName, variables = {}) {
  switch (templateName?.toLowerCase()) {
    case 'welcome':
      return {
        subject: `Welcome to ${variables.companyName || 'LeadAI Pro'}!`,
        html: renderWelcomeTemplate(variables),
      };
    case 'proposal':
      return {
        subject: `Executive Project Proposal ${variables.proposalNumber || ''} - ${variables.projectName || 'Your Software Project'}`,
        html: renderProposalTemplate(variables),
      };
    case 'quotation':
      return {
        subject: `Formal Quotation ${variables.quotationNumber || ''} - ${variables.companyName || 'LeadAI Pro'}`,
        html: renderQuotationTemplate(variables),
      };
    case 'contract':
      return {
        subject: `Legal Contract ${variables.contractNumber || ''} Ready for Signature`,
        html: renderContractTemplate(variables),
      };
    case 'invoice':
      return {
        subject: `Invoice ${variables.invoiceNumber || ''} from ${variables.companyName || 'LeadAI Pro'}`,
        html: renderInvoiceTemplate(variables),
      };
    case 'followup':
      return {
        subject: `Checking in regarding ${variables.projectName || 'your software initiative'}`,
        html: renderFollowupTemplate(variables),
      };
    case 'meeting_reminder':
    case 'meeting':
      return {
        subject: `Reminder: ${variables.title || 'Discovery Call'} (${variables.meetingDate || 'Upcoming'})`,
        html: renderMeetingReminderTemplate(variables),
      };
    case 'payment_reminder':
      return {
        subject: `Payment Reminder: Invoice ${variables.invoiceNumber || ''}`,
        html: renderPaymentReminderTemplate(variables),
      };
    case 'status_update':
      return {
        subject: `Project Update: ${variables.projectName || 'Project'} is now ${variables.status || 'Updated'}`,
        html: renderStatusUpdateTemplate(variables),
      };
    case 'thank_you':
    case 'receipt':
      return {
        subject: `Payment Receipt ${variables.receiptNumber || ''} - Thank you!`,
        html: renderThankYouTemplate(variables),
      };
    default:
      return {
        subject: variables.subject || `${variables.companyName || 'LeadAI Pro'} Notification`,
        html: emailLayout({
          title: variables.subject || 'Notification',
          preheader: variables.message || 'Notification from LeadAI Pro',
          bodyContent: `<p>Hello <strong>${variables.clientName || 'there'}</strong>,</p><p>${variables.message || 'Thank you for connecting with us.'}</p>`,
          companyName: variables.companyName,
          companyAddress: vars?.companyAddress,
        }),
      };
  }
}
