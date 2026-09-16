import connectDB from '@/lib/db';
import Task from '@/models/Task';
import Lead from '@/models/Lead';
import { apiSuccess, apiError } from '@/lib/api';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all | today | upcoming | overdue | completed
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // If task collection is completely empty, auto-seed with follow-up tasks from real leads
    const totalCount = await Task.countDocuments();
    if (totalCount === 0) {
      const realLeads = await Lead.find().limit(10).lean();
      const seedTasks = realLeads.map((l, idx) => {
        const priorities = ['High', 'Medium', 'Urgent', 'Low'];
        const types = ['Follow-up', 'Call', 'Email', 'Proposal', 'Audit'];
        const due = new Date();
        due.setDate(due.getDate() + (idx % 5) - 1); // some overdue, some today, some upcoming
        return {
          title: l.nextAction || `Follow up with ${l.companyName || l.company || l.name}`,
          description: `Evaluate website gaps and follow up on proposal for ${l.companyName || l.company || 'client'}.`,
          leadId: l._id,
          priority: priorities[idx % priorities.length],
          type: types[idx % types.length],
          status: idx === 0 ? 'completed' : 'pending',
          dueDate: due,
          completedAt: idx === 0 ? new Date() : null,
        };
      });
      if (seedTasks.length > 0) {
        await Task.insertMany(seedTasks);
      }
    }

    // Build Query
    const query = {};

    if (filter === 'completed') {
      query.status = 'completed';
    } else if (filter === 'today') {
      query.status = 'pending';
      query.dueDate = { $gte: todayStart, $lte: todayEnd };
    } else if (filter === 'upcoming') {
      query.status = 'pending';
      query.dueDate = { $gt: todayEnd };
    } else if (filter === 'overdue') {
      query.status = 'pending';
      query.dueDate = { $lt: todayStart };
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [tasks, totalPending, dueTodayCount, overdueCount, completedCount] = await Promise.all([
      Task.find(query)
        .populate('leadId', 'name company companyName email phone leadScore pipelineStatus')
        .sort({ dueDate: 1, priority: -1 })
        .lean(),
      Task.countDocuments({ status: 'pending' }),
      Task.countDocuments({ status: 'pending', dueDate: { $gte: todayStart, $lte: todayEnd } }),
      Task.countDocuments({ status: 'pending', dueDate: { $lt: todayStart } }),
      Task.countDocuments({ status: 'completed' }),
    ]);

    return apiSuccess({
      tasks,
      stats: {
        total: totalPending + completedCount,
        open: totalPending,
        today: dueTodayCount,
        overdue: overdueCount,
        completed: completedCount,
      },
    });
  } catch (err) {
    console.error('Tasks GET API Error:', err);
    return apiError('Failed to fetch tasks: ' + err.message, 500);
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.title) {
      return apiError('Task title is required', 400);
    }

    const task = await Task.create({
      title: body.title.trim(),
      description: body.description || '',
      leadId: body.leadId || null,
      priority: body.priority || 'Medium',
      dueDate: body.dueDate ? new Date(body.dueDate) : new Date(Date.now() + 24 * 60 * 60 * 1000),
      type: body.type || 'General',
      status: 'pending',
    });

    const populated = await Task.findById(task._id).populate('leadId', 'name company companyName email').lean();
    return apiSuccess(populated);
  } catch (err) {
    console.error('Tasks POST API Error:', err);
    return apiError('Failed to create task: ' + err.message, 500);
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, status, ...updates } = body;

    if (!id) return apiError('Task ID is required', 400);

    const updateFields = { ...updates };
    if (status) {
      updateFields.status = status;
      updateFields.completedAt = status === 'completed' ? new Date() : null;
    }

    const updated = await Task.findByIdAndUpdate(id, updateFields, { new: true })
      .populate('leadId', 'name company companyName email')
      .lean();

    if (!updated) return apiError('Task not found', 404);

    return apiSuccess(updated);
  } catch (err) {
    console.error('Tasks PUT API Error:', err);
    return apiError('Failed to update task: ' + err.message, 500);
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return apiError('Task ID is required', 400);

    await Task.findByIdAndDelete(id);
    return apiSuccess({ deleted: true, id });
  } catch (err) {
    console.error('Tasks DELETE API Error:', err);
    return apiError('Failed to delete task: ' + err.message, 500);
  }
}
