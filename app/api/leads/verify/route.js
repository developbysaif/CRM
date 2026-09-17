import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import ActivityLog from '@/models/ActivityLog';
import { apiSuccess, apiError } from '@/lib/api';
import { verifyLeadData } from '@/lib/services/verification/lead-verification.service';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { leadId, leadIds, allUnverified = false } = body;

    let targets = [];

    if (leadId) {
      const lead = await Lead.findById(leadId);
      if (!lead) return apiError('Lead not found', 404);
      targets = [lead];
    } else if (Array.isArray(leadIds) && leadIds.length > 0) {
      targets = await Lead.find({ _id: { $in: leadIds } });
    } else if (allUnverified) {
      targets = await Lead.find({
        $or: [
          { 'verification.status': 'unverified' },
          { 'verification.status': { $exists: false } },
          { verification: null },
        ],
      }).limit(50);
    } else {
      return apiError('Please provide leadId, leadIds array, or allUnverified: true', 400);
    }

    if (targets.length === 0) {
      return apiSuccess({ verifiedCount: 0, results: [] }, 'No eligible leads found for verification.');
    }

    const results = [];
    let validCount = 0;
    let riskyCount = 0;
    let invalidCount = 0;

    for (const lead of targets) {
      const report = await verifyLeadData(lead);

      lead.verification = {
        status: report.status,
        emailValid: report.emailValid,
        mxValid: report.mxValid,
        isDisposable: report.isDisposable,
        isRoleAccount: report.isRoleAccount,
        phoneValid: report.phoneValid,
        websiteValid: report.websiteValid,
        verifiedAt: report.verifiedAt,
        details: report.details,
      };

      await lead.save();

      if (report.status === 'valid') validCount++;
      else if (report.status === 'risky') riskyCount++;
      else invalidCount++;

      results.push({
        leadId: lead._id,
        name: lead.name,
        email: lead.email,
        status: report.status,
        details: report.details,
      });

      // Log activity
      await ActivityLog.create({
        leadId: lead._id,
        action: 'lead_verified',
        title: `🛡️ Lead Verification: ${report.status.toUpperCase()}`,
        description: report.details,
        metadata: { status: report.status, mxValid: report.mxValid },
      });
    }

    return apiSuccess({
      verifiedCount: targets.length,
      validCount,
      riskyCount,
      invalidCount,
      results,
    }, `Successfully verified ${targets.length} lead(s). (${validCount} valid, ${riskyCount} risky, ${invalidCount} invalid)`);
  } catch (error) {
    console.error('Lead Verification API Error:', error);
    return apiError(error.message || 'Failed to verify lead(s)', 500);
  }
}
