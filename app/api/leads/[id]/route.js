import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import { apiSuccess, apiError } from '@/lib/api';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error) return apiError(auth.error, auth.status);
    await connectDB();

    const lead = await Lead.findById(params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('proposalId')
      .populate('quotationId')
      .populate('contractId');

    if (!lead) return apiError('Lead not found', 404);
    return apiSuccess(lead);
  } catch (error) {
    return apiError('Failed to fetch lead', 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error) return apiError(auth.error, auth.status);
    await connectDB();

    const body = await request.json();
    const lead = await Lead.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });

    if (!lead) return apiError('Lead not found', 404);
    return apiSuccess(lead, 'Lead updated successfully');
  } catch (error) {
    return apiError('Failed to update lead', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error) return apiError(auth.error, auth.status);
    await connectDB();

    const lead = await Lead.findByIdAndDelete(params.id);
    if (!lead) return apiError('Lead not found', 404);
    return apiSuccess(null, 'Lead deleted successfully');
  } catch (error) {
    return apiError('Failed to delete lead', 500);
  }
}
