import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import Notification from '@/models/Notification';
import { apiSuccess, apiError, paginate, buildSearchFilter } from '@/lib/api';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error) return apiError(auth.error, auth.status);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 1;
    const limit = searchParams.get('limit') || 20;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const leadStatus = searchParams.get('leadStatus') || '';
    const businessType = searchParams.get('businessType') || '';
    const country = searchParams.get('country') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const { skip } = paginate(page, limit);

    let filter = {};
    if (search) {
      const searchFilter = buildSearchFilter(search, ['name', 'email', 'company', 'country']);
      filter = { ...filter, ...searchFilter };
    }
    if (status) filter.pipelineStatus = status;
    if (leadStatus) filter.leadStatus = leadStatus;
    if (businessType) filter.businessType = businessType;
    if (country) filter.country = new RegExp(country, 'i');

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('assignedTo', 'name email avatar')
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
    return apiError('Failed to fetch leads', 500);
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const lead = await Lead.create(body);

    // Create notification for new lead
    await Notification.create({
      type: 'new_lead',
      title: 'New Lead Received',
      message: `${body.name || 'Someone'} from ${body.country || 'Unknown'} submitted a lead inquiry`,
      link: `/leads/${lead._id}`,
      metadata: { leadId: lead._id },
    });

    return apiSuccess(lead, 'Lead created successfully', 201);
  } catch (error) {
    console.error('Create lead error:', error);
    return apiError('Failed to create lead', 500);
  }
}
