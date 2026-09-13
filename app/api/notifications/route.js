import connectDB from '@/lib/db';
import Notification from '@/models/Notification';
import { apiSuccess, apiError } from '@/lib/api';

export async function GET() {
  try {
    await connectDB();

    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({ isRead: false });

    return apiSuccess({ notifications, unreadCount });
  } catch (error) {
    return apiError('Failed to fetch notifications: ' + error.message, 500);
  }
}

export async function PUT() {
  try {
    await connectDB();
    await Notification.updateMany({ isRead: false }, { isRead: true });
    return apiSuccess(null, 'All notifications marked as read');
  } catch (error) {
    return apiError('Failed to update notifications: ' + error.message, 500);
  }
}
