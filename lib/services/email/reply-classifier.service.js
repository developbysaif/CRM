import OpenAI from 'openai';
import Settings from '@/models/Settings';
import Lead from '@/models/Lead';
import SuppressionList from '@/models/SuppressionList';
import ActivityLog from '@/models/ActivityLog';
import Notification from '@/models/Notification';
import { recordEmailMessage } from './thread.service';
import { cancelFollowUpsForLead } from '@/lib/services/followup/followup.service';
import { generateDraftProposal } from '@/lib/services/proposals/proposal.service';

export const CLASSIFICATION_INTENTS = [
  'Interested',
  'Not Interested',
  'Question',
  'Price Request',
  'Meeting Request',
  'Negotiation',
  'Out of Office',
  'Unsubscribe',
  'Wrong Person',
  'Already Has Provider',
  'Spam',
];

/**
 * Classifies an incoming reply text using OpenAI
 */
export async function classifyInboundReply(replyText, leadContext = {}) {
  let apiKey = process.env.OPENAI_API_KEY;
  try {
    const settings = await Settings.findOne();
    if (settings?.openaiApiKey) apiKey = settings.openaiApiKey;
  } catch {}

  let classification = null;

  if (apiKey && apiKey.startsWith('sk-')) {
    try {
      const openai = new OpenAI({ apiKey });
      const prompt = `Classify this client email response to a B2B sales outreach email:
Client Reply:
"${replyText}"

Context:
Lead Company: ${leadContext.company || 'Unknown'}
Contact: ${leadContext.name || 'Unknown'}

Choose exactly one intent from:
[Interested, Not Interested, Question, Price Request, Meeting Request, Negotiation, Out of Office, Unsubscribe, Wrong Person, Already Has Provider, Spam]

Return strict JSON:
{
  "intent": "Interested|Not Interested|Question|Price Request|Meeting Request|Negotiation|Out of Office|Unsubscribe|Wrong Person|Already Has Provider|Spam",
  "confidence": number (0.0 to 1.0),
  "reasoning": "1 sentence explanation of why this was chosen",
  "suggestedReply": "Professional polite response draft addressing their specific point",
  "recommendedStage": "Interested|Qualified|Meeting|Negotiation|Closed Lost|Do Not Contact|Replied"
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });

      classification = JSON.parse(completion.choices[0].message.content);
    } catch (err) {
      console.warn('OpenAI classification notice:', err.message);
    }
  }

  // Heuristic rule-based fallback if OpenAI unavailable
  if (!classification) {
    const lower = (replyText || '').toLowerCase();
    let intent = 'Question';
    let reasoning = 'General inquiry detected';
    let suggestedReply = 'Thank you for getting back to us. I would be glad to share more details with your team.';
    let recommendedStage = 'Replied';

    if (lower.includes('unsubscribe') || lower.includes('stop') || lower.includes('remove me') || lower.includes('do not contact')) {
      intent = 'Unsubscribe';
      reasoning = 'Explicit unsubscribe instruction detected';
      suggestedReply = 'You have been unsubscribed and will not receive further outreach.';
      recommendedStage = 'Do Not Contact';
    } else if (lower.includes('not interested') || lower.includes('no thank') || lower.includes('pass') || lower.includes('no need')) {
      intent = 'Not Interested';
      reasoning = 'Client declined offer';
      suggestedReply = 'Understood. Thank you for your time and best wishes with your business.';
      recommendedStage = 'Closed Lost';
    } else if (lower.includes('how much') || lower.includes('cost') || lower.includes('price') || lower.includes('quote') || lower.includes('rate')) {
      intent = 'Price Request';
      reasoning = 'Inquiry about pricing structure';
      suggestedReply = 'Thank you for asking! Our project pricing typically ranges depending on requirements. I can share an itemized breakdown for your review.';
      recommendedStage = 'Interested';
    } else if (lower.includes('call') || lower.includes('zoom') || lower.includes('meet') || lower.includes('schedule') || lower.includes('time to chat')) {
      intent = 'Meeting Request';
      reasoning = 'Prospect requested a meeting or discovery call';
      suggestedReply = 'I would love to connect. What time works best for you this week?';
      recommendedStage = 'Meeting';
    } else if (lower.includes('interested') || lower.includes('sounds good') || lower.includes('tell me more') || lower.includes('send info')) {
      intent = 'Interested';
      reasoning = 'Positive commercial interest expressed';
      suggestedReply = 'Delighted to hear! I have prepared a preliminary proposal outlining scope and deliverables for your review.';
      recommendedStage = 'Interested';
    } else if (lower.includes('out of office') || lower.includes('auto-reply') || lower.includes('vacation') || lower.includes('away until')) {
      intent = 'Out of Office';
      reasoning = 'Automated absence responder';
      suggestedReply = '';
      recommendedStage = 'Contacted';
    }

    classification = {
      intent,
      confidence: 0.85,
      reasoning,
      suggestedReply,
      recommendedStage,
    };
  }

  return classification;
}

/**
 * Handles processing of a real or simulated inbound reply email
 */
export async function processInboundEmail({
  leadId,
  fromEmail,
  subject,
  bodyText,
  messageId = '',
}) {
  await connectDB();
  let lead = null;
  if (leadId) {
    lead = await Lead.findById(leadId);
  } else if (fromEmail) {
    lead = await Lead.findOne({ email: fromEmail.toLowerCase().trim() });
  }

  if (!lead) {
    throw new Error(`Cannot match reply to lead (from: ${fromEmail})`);
  }

  // 1. AI Classification
  const classification = await classifyInboundReply(bodyText, {
    name: lead.name,
    company: lead.companyName || lead.company,
  });

  // 2. Record Inbound Message in Thread
  await recordEmailMessage({
    organizationId: lead.organizationId,
    leadId: lead._id,
    direction: 'inbound',
    from: fromEmail || lead.email,
    to: process.env.EMAIL_FROM || 'sales@leadaipro.com',
    subject: subject || `Re: Outreach to ${lead.companyName}`,
    bodyText,
    status: 'replied',
    messageId,
    aiClassification: classification,
    receivedAt: new Date(),
  });

  // 3. Stop follow-up sequences immediately on any client reply
  await cancelFollowUpsForLead(lead._id, `Client replied: [${classification.intent}]`);

  // 4. Update CRM Pipeline Stage based on Intent
  const oldStage = lead.pipelineStatus;
  let newStage = oldStage;

  if (classification.intent === 'Unsubscribe') {
    newStage = 'Do Not Contact';
    lead.doNotContact = true;
    lead.unsubscribed = true;
    await SuppressionList.create({
      organizationId: lead.organizationId,
      email: lead.email,
      domain: lead.domain,
      reason: 'unsubscribed',
      source: 'Inbound Email Reply',
    });
  } else if (classification.intent === 'Not Interested' || classification.intent === 'Already Has Provider') {
    newStage = 'Closed Lost';
  } else if (['Interested', 'Price Request'].includes(classification.intent)) {
    newStage = 'Interested';
    lead.leadStatus = 'Hot';

    // Auto-prepare Proposal in DRAFT status (NO AUTO-SEND)
    try {
      await generateDraftProposal(lead);
    } catch (propErr) {
      console.warn('Proposal draft preparation note:', propErr.message);
    }
  } else if (classification.intent === 'Meeting Request') {
    newStage = 'Meeting';
    lead.leadStatus = 'Hot';
  } else if (classification.intent === 'Question' || classification.intent === 'Negotiation') {
    newStage = 'Replied';
  }

  lead.pipelineStatus = newStage;
  await lead.save();

  // 5. Activity Log & Notification
  await ActivityLog.create({
    organizationId: lead.organizationId,
    leadId: lead._id,
    action: 'email_replied',
    title: `📩 Inbound Reply: ${lead.companyName} (${classification.intent})`,
    description: `"${bodyText.slice(0, 120)}..." | Classified as ${classification.intent} (${classification.reasoning})`,
  });

  await Notification.create({
    organizationId: lead.organizationId,
    type: 'general',
    title: `💬 Reply Received: ${lead.companyName} [${classification.intent}]`,
    message: `${lead.name} replied. Stage updated to ${newStage}. Suggested reply prepared.`,
    link: `/leads/${lead._id}`,
  });

  return {
    lead,
    classification,
    oldStage,
    newStage,
  };
}
