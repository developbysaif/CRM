import connectDB from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return apiError('Name, email and password are required', 400);
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return apiError('Email already registered', 409);
    }

    const user = await User.create({ name, email, password, role: role || 'sales' });
    const token = signToken({ id: user._id, email: user.email, role: user.role });

    return apiSuccess({ token, user: user.toJSON() }, 'Registration successful', 201);
  } catch (error) {
    console.error('Register error:', error);
    return apiError('Registration failed', 500);
  }
}
