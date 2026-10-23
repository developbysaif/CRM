import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { signToken, getCookieOptions } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api';
import { ensureAdminSeeded } from '@/lib/services/auth/seed-admin';

export async function POST(request) {
  try {
    await connectDB();
    // Auto-seed admin if database is fresh
    await ensureAdminSeeded();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return apiError('Email and password are required', 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return apiError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      return apiError('Account is deactivated. Contact your administrator.', 403);
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = signToken(tokenPayload);
    const userJson = user.toJSON();

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userJson,
      },
    });

    // Set HTTP-only session cookie
    const cookieOpts = getCookieOptions();
    response.cookies.set({
      name: cookieOpts.name,
      value: token,
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
      maxAge: cookieOpts.maxAge,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    const msg = error.message || 'Internal server error';
    if (msg.includes('ECONNREFUSED') || msg.includes('timed out') || msg.includes('Database connection failed')) {
      return apiError(
        'Database connection failed (connect ECONNREFUSED 127.0.0.1:27017). Please ensure MongoDB is running locally (run: net start MongoDB), or provide your cloud MongoDB Atlas URI in .env.local (MONGODB_URI).',
        503
      );
    }
    return apiError('Login failed: ' + msg, 500);
  }
}
