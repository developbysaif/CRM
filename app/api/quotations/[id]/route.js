import connectDB from '@/lib/db';
import Quotation from '@/models/Quotation';
import { apiSuccess, apiError } from '@/lib/api';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const quotation = await Quotation.findById(id).populate('leadId', 'name email company country phone');
    if (!quotation) return apiError('Quotation not found', 404);
    return apiSuccess(quotation);
  } catch (error) {
    return apiError('Failed to fetch quotation: ' + error.message, 500);
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const quotation = await Quotation.findByIdAndUpdate(id, body, { new: true });
    if (!quotation) return apiError('Quotation not found', 404);
    return apiSuccess(quotation, 'Quotation updated');
  } catch (error) {
    return apiError('Failed to update quotation: ' + error.message, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    await Quotation.findByIdAndDelete(id);
    return apiSuccess(null, 'Quotation deleted');
  } catch (error) {
    return apiError('Failed to delete quotation: ' + error.message, 500);
  }
}
