import connectDB from '@/lib/db';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api';
import { ensureAdminSeeded } from '@/lib/services/auth/seed-admin';

export async function GET(request) {
  try {
    await connectDB();
    await ensureAdminSeeded();

    const auth = await authenticateRequest(request);
    if (auth.error) {
      return apiError(auth.error, auth.status || 401);
    }

    const user = await User.findById(auth.user.id);
    if (!user || !user.isActive) {
      return apiError('User not found or inactive', 401);
    }

    return apiSuccess({ user: user.toJSON() }, 'User session active');
  } catch (error) {
    console.error('Session retrieval error:', error);
    return apiError('Failed to retrieve user session', 500);
  }
}
