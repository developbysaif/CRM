import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import Notification from '@/models/Notification';
import ActivityLog from '@/models/ActivityLog';
import Settings from '@/models/Settings';
import { apiSuccess, apiError, paginate, buildSearchFilter } from '@/lib/api';
import { sendAutomatedEmail } from '@/lib/services/email/email.service';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 1;
    const limit = searchParams.get('limit') || 50;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const leadStatus = searchParams.get('leadStatus') || '';
    const businessType = searchParams.get('businessType') || '';
    const projectType = searchParams.get('projectType') || '';
    const country = searchParams.get('country') || '';
    const minScore = searchParams.get('minScore');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const { skip } = paginate(page, limit);

    let filter = {};
    if (search) {
      const searchFilter = buildSearchFilter(search, ['name', 'email', 'company', 'country', 'projectType', 'businessType']);
      filter = { ...filter, ...searchFilter };
    }
    if (status && status !== 'all') filter.pipelineStatus = status;
    if (leadStatus && leadStatus !== 'all') filter.leadStatus = leadStatus;
    if (businessType && businessType !== 'all') filter.businessType = businessType;
    if (projectType && projectType !== 'all') filter.projectType = projectType;
    if (country) filter.country = new RegExp(country, 'i');
    if (minScore) filter.leadScore = { $gte: Number(minScore) };

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('assignedTo', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Lead.countDocuments(filter),
    ]);

    return apiSuccess({
      leads,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get leads error:', error);
    return apiError('Failed to fetch leads: ' + error.message, 500);
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const lead = await Lead.create(body);

    await ActivityLog.create({
      leadId: lead._id,
      action: 'lead_created',
      title: '👤 New Lead Added',
      description: `${lead.name} (${lead.company || 'Direct'}) added to pipeline`,
    });

    await Notification.create({
      type: 'new_lead',
      title: 'New Lead Added',
      message: `${lead.name} (${lead.projectType || 'Software'} - ${lead.leadStatus || 'Warm'}) added to CRM`,
      link: `/leads/${lead._id}`,
      metadata: { leadId: lead._id },
    });

    // Auto-send Welcome Email if configured
    const settings = await Settings.findOne();
    if (settings?.automations?.sendWelcomeEmail !== false && lead.email) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        await sendAutomatedEmail({
          to: lead.email,
          template: 'welcome',
          variables: {
            clientName: lead.name,
            projectType: lead.projectType || 'Software Development',
            portalUrl: `${appUrl}/leads/${lead._id}`,
          },
          leadId: lead._id,
          dedupKey: `welcome_${lead._id}`,
        });
      } catch (mailErr) {
        console.warn('Welcome email dispatch notice:', mailErr.message);
      }
    }

    return apiSuccess(lead, 'Lead created successfully', 201);
  } catch (error) {
    console.error('Create lead error:', error);
    return apiError('Failed to create lead: ' + error.message, 500);
  }
}
