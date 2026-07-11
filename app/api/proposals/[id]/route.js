import connectDB from '@/lib/db';
import Proposal from '@/models/Proposal';
import { apiSuccess, apiError } from '@/lib/api';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const proposal = await Proposal.findById(params.id).populate('leadId', 'name email company country phone');
    if (!proposal) return apiError('Proposal not found', 404);
    return apiSuccess(proposal);
  } catch (error) {
    return apiError('Failed to fetch proposal', 500);
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const proposal = await Proposal.findByIdAndUpdate(params.id, body, { new: true });
    if (!proposal) return apiError('Proposal not found', 404);
    return apiSuccess(proposal, 'Proposal updated');
  } catch (error) {
    return apiError('Failed to update proposal', 500);
  }
}
