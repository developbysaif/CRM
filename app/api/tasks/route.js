import connectDB from '@/lib/db';
import Task from '@/models/Task';
import Lead from '@/models/Lead';
import { apiSuccess, apiError } from '@/lib/api';
import { authenticateRequest } from '@/lib/auth';

/**
 * Computes dynamic relative due label and category from dueDate
 */
export function computeTaskTiming(dueDate, status) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(dueDate);
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  const diffTime = dueDay.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let category = 'upcoming';
  let dueLabel = 'Upcoming';

  if (status === 'completed') {
    category = 'completed';
    dueLabel = diffDays === 0 ? 'Today' : diffDays < 0 ? `${Math.abs(diffDays)}d ago` : `In ${diffDays}d`;
  } else if (diffDays < 0) {
    category = 'overdue';
    dueLabel = diffDays === -1 ? 'Yesterday' : `${Math.abs(diffDays)} days overdue`;
  } else if (diffDays === 0) {
    category = 'today';
    dueLabel = 'Today';
  } else if (diffDays === 1) {
    category = 'upcoming';
    dueLabel = 'Tomorrow';
  } else {
    category = 'upcoming';
    dueLabel = `In ${diffDays} days`;
  }

  return { category, dueLabel };
}

export async function GET(request) {
  try {
    await connectDB();
    const tasks = await Task.find()
      .populate('leadId', 'name company companyName email')
      .sort({ dueDate: 1 })
      .lean();

    const formattedTasks = tasks.map((t) => {
      const { category, dueLabel } = computeTaskTiming(t.dueDate, t.status);
      return {
        id: t._id.toString(),
        title: t.title,
        description: t.description || '',
        lead: t.leadName || t.leadId?.companyName || t.leadId?.company || t.leadId?.name || t.companyName || 'General Account',
        leadId: t.leadId?._id?.toString() || null,
        priority: t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : 'Medium',
        status: t.status,
        completed: t.status === 'completed',
        dueDate: t.dueDate,
        dueLabel,
        category,
        assignedTo: t.assignedToName || 'Unassigned',
      };
    });

    const counts = {
      all: formattedTasks.length,
      today: formattedTasks.filter((t) => !t.completed && t.category === 'today').length,
      upcoming: formattedTasks.filter((t) => !t.completed && t.category === 'upcoming').length,
      overdue: formattedTasks.filter((t) => !t.completed && t.category === 'overdue').length,
      completed: formattedTasks.filter((t) => t.completed).length,
    };

    return apiSuccess({ tasks: formattedTasks, counts }, 'Tasks retrieved');
  } catch (error) {
    console.error('Tasks API error:', error);
    return apiError('Failed to load tasks: ' + error.message, 500);
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const auth = await authenticateRequest(request);
    const body = await request.json();
    const { title, description, priority, dueDate, leadId, leadName, companyName, category } = body;

    if (!title) {
      return apiError('Task title is required', 400);
    }

    let resolvedLeadName = leadName || companyName || '';
    if (leadId) {
      const lead = await Lead.findById(leadId).select('name company companyName');
      if (lead) {
        resolvedLeadName = lead.companyName || lead.company || lead.name;
      }
    }

    const task = await Task.create({
      title: title.trim(),
      description: description || '',
      priority: (priority || 'medium').toLowerCase(),
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      leadId: leadId || null,
      leadName: resolvedLeadName,
      companyName: resolvedLeadName,
      assignedTo: auth.user?.id || null,
      assignedToName: auth.user?.name || 'Admin User',
      category: category || 'Follow-up',
      status: 'pending',
    });

    return apiSuccess({ task }, 'Task created', 201);
  } catch (error) {
    console.error('Create task error:', error);
    return apiError('Failed to create task: ' + error.message, 500);
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, status, completed } = body;

    if (!id) {
      return apiError('Task ID is required', 400);
    }

    const nextStatus = status || (completed ? 'completed' : 'pending');
    const task = await Task.findByIdAndUpdate(
      id,
      { status: nextStatus },
      { new: true }
    );

    return apiSuccess({ task }, 'Task status updated');
  } catch (error) {
    console.error('Update task error:', error);
    return apiError('Failed to update task: ' + error.message, 500);
  }
}
