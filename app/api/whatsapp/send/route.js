import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import ActivityLog from '@/models/ActivityLog';
import Settings from '@/models/Settings';
import { apiSuccess, apiError } from '@/lib/api';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { phone, message, leadId } = body;

    if (!phone) {
      return apiError('Recipient phone number is required.', 400);
    }
    if (!message) {
      return apiError('Message text is required.', 400);
    }

    // Clean phone number (strip whitespace, dashes, plus sign for wa.me format)
    const rawClean = phone.replace(/[^\d+]/g, '');
    const waNumber = rawClean.replace(/^\+/, '');

    // Direct WhatsApp Web / App deep-link
    const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

    // Check if WhatsApp Business Cloud API is configured
    const settings = (await Settings.findOne()) || {};
    const apiToken = process.env.WHATSAPP_API_TOKEN || settings.whatsappAccessToken;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || settings.whatsappPhoneNumberId;

    let apiDelivered = false;
    let apiResponse = null;

    if (apiToken && phoneId) {
      try {
        const metaRes = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: waNumber,
            type: 'text',
            text: { body: message },
          }),
        });

        const metaData = await metaRes.json();
        if (metaRes.ok) {
          apiDelivered = true;
          apiResponse = metaData;
        } else {
          console.warn('WhatsApp Cloud API notice:', metaData.error?.message || metaData);
        }
      } catch (err) {
        console.warn('WhatsApp API delivery skipped, falling back to direct link:', err.message);
      }
    }

    // Record activity in CRM
    if (leadId) {
      const lead = await Lead.findById(leadId);
      if (lead) {
        lead.lastContactedAt = new Date();
        await lead.save();

        await ActivityLog.create({
          leadId: lead._id,
          action: 'whatsapp_sent',
          title: apiDelivered ? '💬 WhatsApp Message Sent via Cloud API' : '💬 WhatsApp Direct Chat Opened',
          description: `Message to ${phone}: "${message.substring(0, 80)}${message.length > 80 ? '...' : ''}"`,
          metadata: { phone, waLink, apiDelivered },
        });
      }
    }

    return apiSuccess({
      waLink,
      phone: waNumber,
      apiDelivered,
      message,
    }, apiDelivered ? 'WhatsApp message dispatched successfully via Cloud API!' : 'WhatsApp direct chat link generated.');
  } catch (error) {
    console.error('WhatsApp Send Error:', error);
    return apiError(error.message || 'Failed to dispatch WhatsApp message', 500);
  }
}
