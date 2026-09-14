import connectDB from '@/lib/db';
import Contract from '@/models/Contract';
import Lead from '@/models/Lead';
import { apiSuccess, apiError } from '@/lib/api';
import { generateDraftContract } from '@/lib/services/contracts/contract.service';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { leadId, totalAmount, currency = 'USD' } = body;

    if (!leadId) return apiError('Lead ID is required', 400);

    const lead = await Lead.findById(leadId);
    if (!lead) return apiError('Lead not found', 404);

    const { contract, queueItem } = await generateDraftContract(leadId, { totalAmount, currency });

    return apiSuccess(
      contract,
      `Contract ${contract.contractNumber} generated in DRAFT status. Owner alert created. Review in Approval Center.`,
      201
    );
  } catch (error) {
    console.error('Contract POST error:', error);
    return apiError('Failed to generate contract: ' + error.message, 500);
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    const filter = leadId ? { leadId } : {};
    const contracts = await Contract.find(filter)
      .populate('leadId', 'name email company companyName')
      .sort({ createdAt: -1 });

    return apiSuccess(contracts);
  } catch (error) {
    return apiError('Failed to fetch contracts: ' + error.message, 500);
  }
}
