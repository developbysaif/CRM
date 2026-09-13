import connectDB from '@/lib/db';
import Proposal from '@/models/Proposal';
import { apiSuccess, apiError } from '@/lib/api';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const proposal = await Proposal.findById(id).populate('leadId', 'name email company country phone');
    if (!proposal) return apiError('Proposal not found', 404);
    return apiSuccess(proposal);
  } catch (error) {
    return apiError('Failed to fetch proposal: ' + error.message, 500);
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const proposal = await Proposal.findByIdAndUpdate(id, body, { new: true });
    if (!proposal) return apiError('Proposal not found', 404);
    return apiSuccess(proposal, 'Proposal updated');
  } catch (error) {
    return apiError('Failed to update proposal: ' + error.message, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    await Proposal.findByIdAndDelete(id);
    return apiSuccess(null, 'Proposal deleted');
  } catch (error) {
    return apiError('Failed to delete proposal: ' + error.message, 500);
  }
}
