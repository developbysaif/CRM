import connectDB from '@/lib/db';
import Contract from '@/models/Contract';
import { apiSuccess, apiError } from '@/lib/api';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const contract = await Contract.findById(params.id).populate('leadId', 'name email company country phone');
    if (!contract) return apiError('Contract not found', 404);
    return apiSuccess(contract);
  } catch (error) {
    return apiError('Failed to fetch contract', 500);
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const contract = await Contract.findByIdAndUpdate(params.id, body, { new: true });
    if (!contract) return apiError('Contract not found', 404);
    return apiSuccess(contract, 'Contract updated');
  } catch (error) {
    return apiError('Failed to update contract', 500);
  }
}
