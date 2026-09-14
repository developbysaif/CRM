import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import Proposal from '@/models/Proposal';
import { apiSuccess, apiError } from '@/lib/api';
import { generateDraftProposal } from '@/lib/services/proposals/proposal.service';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { leadId } = body;

    if (!leadId) return apiError('Lead ID is required', 400);

    const lead = await Lead.findById(leadId);
    if (!lead) return apiError('Lead not found', 404);

    const { proposal, queueItem } = await generateDraftProposal(lead);

    return apiSuccess(
      proposal,
      `Proposal ${proposal.proposalNumber} generated in DRAFT status and submitted to Approval Center.`,
      201
    );
  } catch (error) {
    console.error('Proposal POST error:', error);
    return apiError('Failed to generate proposal: ' + error.message, 500);
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    const filter = leadId ? { leadId } : {};
    const proposals = await Proposal.find(filter)
      .populate('leadId', 'name email company companyName')
      .sort({ createdAt: -1 });

    return apiSuccess(proposals);
  } catch (error) {
    return apiError('Failed to fetch proposals: ' + error.message, 500);
  }
}
