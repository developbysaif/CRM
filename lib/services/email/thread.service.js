import connectDB from '@/lib/db';
import EmailThread from '@/models/EmailThread';
import EmailMessage from '@/models/EmailMessage';

/**
 * Records an email message and links/creates the appropriate EmailThread
 */
export async function recordEmailMessage({
  organizationId = 'org_default',
  leadId,
  direction, // 'outbound' | 'inbound'
  from,
  to,
  subject,
  bodyText,
  bodyHtml = '',
  status = 'sent',
  messageId = '',
  aiClassification = null,
  sentAt = null,
  receivedAt = null,
  campaignId = null,
}) {
  await connectDB();

  // Find or create existing thread for this lead
  let thread = await EmailThread.findOne({ organizationId, leadId });
  if (!thread) {
    thread = await EmailThread.create({
      organizationId,
      leadId,
      campaignId,
      subject: subject || 'Outreach Conversation',
      snippet: (bodyText || '').slice(0, 100),
      lastMessageAt: new Date(),
      messageCount: 1,
      status: direction === 'inbound' ? 'replied' : 'waiting_reply',
    });
  } else {
    thread.snippet = (bodyText || '').slice(0, 100);
    thread.lastMessageAt = new Date();
    thread.messageCount += 1;
    if (direction === 'inbound') {
      thread.status = 'replied';
      thread.unreadCount += 1;
      if (aiClassification?.intent) {
        thread.aiIntent = aiClassification.intent;
      }
      if (aiClassification?.suggestedReply) {
        thread.suggestedReply = aiClassification.suggestedReply;
      }
    } else {
      thread.status = 'waiting_reply';
    }
    await thread.save();
  }

  const message = await EmailMessage.create({
    organizationId,
    threadId: thread._id,
    leadId,
    direction,
    from,
    to,
    subject,
    bodyText,
    bodyHtml,
    status,
    messageId: messageId || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    aiClassification: aiClassification || { intent: 'None', confidence: 0, reasoning: '', suggestedReply: '' },
    sentAt: sentAt || (direction === 'outbound' ? new Date() : null),
    receivedAt: receivedAt || (direction === 'inbound' ? new Date() : null),
  });

  return { thread, message };
}

/**
 * Returns full Gmail-style conversation thread for a lead
 */
export async function getLeadEmailThread(leadId) {
  await connectDB();
  const thread = await EmailThread.findOne({ leadId }).lean();
  if (!thread) return null;

  const messages = await EmailMessage.find({ threadId: thread._id }).sort({ createdAt: 1 }).lean();
  return { ...thread, messages };
}
