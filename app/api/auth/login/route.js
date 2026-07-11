import connectDB from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return apiError('Email and password are required', 400);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return apiError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      return apiError('Account is deactivated', 403);
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const token = signToken({ id: user._id, email: user.email, role: user.role });

    return apiSuccess({ token, user: user.toJSON() }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return apiError('Login failed', 500);
  }
}
