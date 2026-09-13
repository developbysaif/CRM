import connectDB from '@/lib/db';
import Contract from '@/models/Contract';
import Lead from '@/models/Lead';
import ActivityLog from '@/models/ActivityLog';
import Notification from '@/models/Notification';
import { apiSuccess, apiError } from '@/lib/api';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const contract = await Contract.findById(id).populate('leadId', 'name email company country phone');
    if (!contract) return apiError('Contract not found', 404);
    return apiSuccess(contract);
  } catch (error) {
    return apiError('Failed to fetch contract: ' + error.message, 500);
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const contract = await Contract.findById(id);
    if (!contract) return apiError('Contract not found', 404);

    // If signing
    if (body.signContract) {
      contract.clientSignature = body.signature || body.clientSignature || 'Signed Digitally';
      contract.clientSignedAt = new Date();
      contract.status = 'Signed';
      contract.signedAt = new Date();
      await contract.save();

      if (contract.leadId) {
        await Lead.findByIdAndUpdate(contract.leadId, { pipelineStatus: 'Contract Signed' });
        await ActivityLog.create({
          leadId: contract.leadId,
          action: 'contract_signed',
          title: `✍️ Contract Signed: ${contract.contractNumber}`,
          description: `Signed digitally by ${contract.clientName}`,
        });
        await Notification.create({
          type: 'contract_signed',
          title: `✍️ Contract Signed: ${contract.contractNumber}`,
          message: `${contract.clientName} has signed the service agreement!`,
          link: `/contracts/${contract._id}`,
        });
      }

      return apiSuccess(contract, 'Contract signed successfully');
    }

    Object.assign(contract, body);
    await contract.save();

    return apiSuccess(contract, 'Contract updated');
  } catch (error) {
    return apiError('Failed to update contract: ' + error.message, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    await Contract.findByIdAndDelete(id);
    return apiSuccess(null, 'Contract deleted');
  } catch (error) {
    return apiError('Failed to delete contract: ' + error.message, 500);
  }
}
