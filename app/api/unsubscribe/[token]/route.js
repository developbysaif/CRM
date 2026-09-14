import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import SuppressionList from '@/models/SuppressionList';
import ActivityLog from '@/models/ActivityLog';
import { cancelFollowUpsForLead } from '@/lib/services/followup/followup.service';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { token } = await params;

    const lead = await Lead.findOne({ unsubscribeToken: token });

    if (lead) {
      lead.unsubscribed = true;
      lead.doNotContact = true;
      lead.pipelineStatus = 'Do Not Contact';
      await lead.save();

      await SuppressionList.create({
        organizationId: lead.organizationId,
        email: lead.email,
        domain: lead.domain,
        reason: 'unsubscribed',
        source: 'Unsubscribe Link Click',
      });

      await cancelFollowUpsForLead(lead._id, 'Recipient unsubscribed via email link');

      await ActivityLog.create({
        organizationId: lead.organizationId,
        leadId: lead._id,
        action: 'lead_updated',
        title: '🚫 Lead Unsubscribed',
        description: `${lead.name} (${lead.email}) clicked unsubscribe link. All outreach halted.`,
      });
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribed Successfully</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 36px; max-width: 440px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .icon { font-size: 40px; margin-bottom: 16px; }
            h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0; }
            p { font-size: 14px; color: #64748b; line-height: 1.5; margin: 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✅</div>
            <h1>You have been unsubscribed</h1>
            <p>Your email preference has been updated. You will no longer receive sales outreach or follow-up communications from this organization.</p>
          </div>
        </body>
      </html>
    `;

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    return new Response('Error processing unsubscribe request', { status: 500 });
  }
}
