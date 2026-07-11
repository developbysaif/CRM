import connectDB from '@/lib/db';
import Notification from '@/models/Notification';
import { apiSuccess, apiError } from '@/lib/api';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error) return apiError(auth.error, auth.status);
    await connectDB();

    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({ isRead: false });

    return apiSuccess({ notifications, unreadCount });
  } catch (error) {
    return apiError('Failed to fetch notifications', 500);
  }
}

export async function PUT(request) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error) return apiError(auth.error, auth.status);
    await connectDB();

    await Notification.updateMany({ isRead: false }, { isRead: true });
    return apiSuccess(null, 'All notifications marked as read');
  } catch (error) {
    return apiError('Failed to update notifications', 500);
  }
}
