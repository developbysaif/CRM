import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import Proposal from '@/models/Proposal';
import Contract from '@/models/Contract';
import EmailThread from '@/models/EmailThread';
import Settings from '@/models/Settings';
import { apiSuccess, apiError } from '@/lib/api';
import { executeLeadDiscovery } from '@/lib/services/discovery/discovery.service';
import { generateDraftProposal } from '@/lib/services/proposals/proposal.service';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return apiError('Command message is required', 400);
    }

    const trimmed = message.trim();
    const lower = trimmed.toLowerCase();

    // 1. Check for Lead Discovery intent
    if (lower.startsWith('find') || lower.includes('search for') || lower.includes('discover')) {
      // Extract parameters using regex or heuristics
      let quantity = 10;
      const numMatch = lower.match(/\b(\d+)\b/);
      if (numMatch) quantity = Math.min(parseInt(numMatch[1], 10), 25);

      let location = 'London, UK';
      const inMatch = trimmed.match(/\bin\s+([A-Za-z\s,]+?)(?:\s+without|\s+with|$)/i);
      if (inMatch) location = inMatch[1].trim();

      let industry = 'Restaurants';
      if (lower.includes('restaurant')) industry = 'Restaurant';
      else if (lower.includes('dental') || lower.includes('dentist')) industry = 'Dental clinic';
      else if (lower.includes('law')) industry = 'Law firm';
      else if (lower.includes('real estate')) industry = 'Real estate agency';
      else if (lower.includes('hotel')) industry = 'Hotel';
      else if (lower.includes('saas')) industry = 'SaaS company';
      else if (lower.includes('construction')) industry = 'Construction company';
      else if (lower.includes('e-commerce') || lower.includes('shopify')) industry = 'Ecommerce';

      const filters = {};
      if (lower.includes('without website') || lower.includes('no website')) {
        filters.noWebsite = true;
      } else if (lower.includes('poor website') || lower.includes('outdated website')) {
        filters.poorWebsite = true;
      }

      try {
        const result = await executeLeadDiscovery({
          industry,
          location,
          quantity,
          filters,
        });

        return apiSuccess({
          action: 'lead_discovery',
          response: `⚡ Executed Lead Discovery for **${industry}** in **${location}**.\n\n* **${result.savedCount}** verified prospects saved to CRM.\n* **${result.hotLeadsCount}** classified as Hot Leads.\n* **${result.duplicatesDetected}** duplicates filtered.`,
          data: result,
        });
      } catch (discErr) {
        return apiSuccess({
          action: 'error',
          response: `⚠️ Discovery could not complete: ${discErr.message}. Make sure API keys are configured in Settings.`,
        });
      }
    }

    // 2. Show Hot Leads
    if (lower.includes('hot lead') || lower.includes('best opportunit')) {
      const hotLeads = await Lead.find({ leadStatus: 'Hot' })
        .sort({ leadScore: -1 })
        .limit(6)
        .select('name company companyName leadScore leadStatus pipelineStatus phone website whyValuable')
        .lean();

      return apiSuccess({
        action: 'hot_leads',
        response: `Found **${hotLeads.length} Hot Leads** with top commercial viability:`,
        data: hotLeads,
      });
    }

    // 3. Generate Proposal for Company
    if (lower.includes('generate proposal') || lower.includes('create proposal')) {
      const targetCompany = trimmed.replace(/.*(?:generate|create)\s+proposal\s+(?:for\s+)?/i, '').replace(/[\.!?]+$/, '').trim();

      const lead = await Lead.findOne({
        $or: [
          { company: new RegExp(targetCompany, 'i') },
          { companyName: new RegExp(targetCompany, 'i') },
          { name: new RegExp(targetCompany, 'i') },
        ],
      });

      if (!lead) {
        return apiSuccess({
          action: 'not_found',
          response: `Could not find a lead matching "${targetCompany}". Please verify the company name in your Leads Directory.`,
        });
      }

      const { proposal } = await generateDraftProposal(lead);
      return apiSuccess({
        action: 'proposal_generated',
        response: `📄 Generated proposal **${proposal.proposalNumber}** for **${lead.companyName || lead.name}** in DRAFT status.\n\nTotal value: **$${(proposal.pricing?.total || 0).toLocaleString()}**. It has been placed in the [Approval Center](/approvals) for your review.`,
        data: proposal,
      });
    }

    // 4. Inquiries / Pending Proposals
    if (lower.includes('proposal') && (lower.includes('pending') || lower.includes('how many'))) {
      const pendingCount = await Proposal.countDocuments({ status: { $in: ['Draft', 'Approval Required'] } });
      const totalVal = await Proposal.aggregate([
        { $match: { status: { $in: ['Draft', 'Approval Required', 'Sent'] } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } },
      ]);

      return apiSuccess({
        action: 'stats',
        response: `You currently have **${pendingCount} proposals pending approval** with a combined pipeline value of **$${(totalVal[0]?.total || 0).toLocaleString()}**.`,
      });
    }

    // 5. General AI CRM Advisory
    let apiKey = process.env.OPENAI_API_KEY;
    try {
      const settings = await Settings.findOne();
      if (settings?.openaiApiKey) apiKey = settings.openaiApiKey;
    } catch {}

    if (apiKey && apiKey.startsWith('sk-')) {
      try {
        const openai = new OpenAI({ apiKey });
        const summaryCount = await Lead.countDocuments();
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are the LeadAI Pro Executive Sales Assistant. Help the user navigate their CRM with ${summaryCount} total leads. Give clear, concise, actionable responses. Format with Markdown.`,
            },
            { role: 'user', content: trimmed },
          ],
          temperature: 0.4,
          max_tokens: 300,
        });

        return apiSuccess({
          action: 'ai_response',
          response: completion.choices[0].message.content,
        });
      } catch (err) {
        console.warn('Command center AI notice:', err.message);
      }
    }

    return apiSuccess({
      action: 'help',
      response: `I am your AI Sales Employee. You can command me with actions like:\n\n* **"Find 15 restaurants in London without websites"**\n* **"Show me all hot leads"**\n* **"Generate proposal for [Company Name]"**\n* **"How many proposals are pending?"**`,
    });
  } catch (error) {
    console.error('Command Center Error:', error);
    return apiError('Failed to execute command: ' + error.message, 500);
  }
}
