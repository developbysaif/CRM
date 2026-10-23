import connectDB from '@/lib/db';
import User from '@/models/User';
import Lead from '@/models/Lead';
import { apiSuccess, apiError } from '@/lib/api';
import { requireRole } from '@/lib/auth';
import { ensureAdminSeeded } from '@/lib/services/auth/seed-admin';

export async function GET(request) {
  try {
    await connectDB();
    await ensureAdminSeeded();

    // Authenticate request (any authenticated team member can view team)
    const auth = await requireRole(request, ['admin', 'manager', 'sales', 'agent']);
    if (auth.error) {
      return apiError(auth.error, auth.status || 401);
    }

    const users = await User.find({ isActive: true })
      .select('name email role monthlyQuota createdAt')
      .lean();

    // For each user, aggregate live deal stats
    const teamMembers = await Promise.all(
      users.map(async (u) => {
        const [assignedLeads, wonDeals] = await Promise.all([
          Lead.find({
            $or: [{ assignedTo: u._id }, { assignedUser: u._id }, { assignedToName: u.name }],
          }).lean(),
          Lead.find({
            status: 'Closed Won',
            $or: [{ assignedTo: u._id }, { assignedUser: u._id }, { assignedToName: u.name }],
          }).lean(),
        ]);

        const totalLeads = assignedLeads.length;
        const wonCount = wonDeals.length;
        const revenue = wonDeals.reduce((sum, d) => sum + (Number(d.dealValue) || 0), 0);
        const quota = u.monthlyQuota || 50000;
        const attainment = quota > 0 ? Math.round((revenue / quota) * 100) : 0;

        return {
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role,
          monthlyQuota: quota,
          leads: totalLeads,
          deals: wonCount,
          revenue,
          attainment,
          status: 'Active',
        };
      })
    );

    // Aggregate team totals
    const totalRevenue = teamMembers.reduce((sum, m) => sum + m.revenue, 0);
    const totalWonDeals = teamMembers.reduce((sum, m) => sum + m.deals, 0);
    const totalQuotas = teamMembers.reduce((sum, m) => sum + m.monthlyQuota, 0);
    const overallAttainment = totalQuotas > 0 ? Math.round((totalRevenue / totalQuotas) * 100) : 0;

    return apiSuccess({
      members: teamMembers,
      summary: {
        totalRevenue,
        totalWonDeals,
        totalQuotas,
        overallAttainment,
        memberCount: teamMembers.length,
      },
    }, 'Team data retrieved');
  } catch (error) {
    console.error('Team API error:', error);
    return apiError('Failed to load team data: ' + error.message, 500);
  }
}

export async function POST(request) {
  try {
    await connectDB();
    // Server-side role guard: only admin or manager can add team members
    const auth = await requireRole(request, ['admin', 'manager']);
    if (auth.error) {
      return apiError(auth.error, auth.status || 403);
    }

    const body = await request.json();
    const { name, email, role, monthlyQuota } = body;

    if (!name || !email) {
      return apiError('Name and email are required', 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return apiError('A user with this email already exists', 400);
    }

    const temporaryPassword = 'UserTemp' + Math.floor(1000 + Math.random() * 9000) + '!';
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: temporaryPassword,
      role: role || 'sales',
      monthlyQuota: Number(monthlyQuota) || 50000,
      isActive: true,
    });

    return apiSuccess({
      user: newUser.toJSON(),
      temporaryPassword,
    }, 'Team member created successfully', 201);
  } catch (error) {
    console.error('Create team member error:', error);
    return apiError('Failed to create team member: ' + error.message, 500);
  }
}
