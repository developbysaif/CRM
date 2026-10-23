import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { signToken, getCookieOptions } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, password, role = 'sales' } = body;

    if (!name || !email || !password) {
      return apiError('Name, work email, and password are required', 400);
    }

    if (password.length < 6) {
      return apiError('Password must be at least 6 characters long', 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return apiError('An account with this email already exists. Please sign in.', 409);
    }

    // If this is the first user in the system, promote to admin automatically
    const totalUsers = await User.countDocuments();
    const resolvedRole = totalUsers === 0 ? 'admin' : (['admin', 'manager', 'sales', 'agent'].includes(role) ? role : 'sales');

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: resolvedRole,
      monthlyQuota: 50000,
      isActive: true,
      lastLogin: new Date(),
    });

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
      message: 'Account registered successfully',
      data: {
        token,
        user: userJson,
      },
    }, { status: 201 });

    // Set HTTP-only session cookie so the user is immediately logged in
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
    console.error('Registration error:', error);
    return apiError(error.message || 'Registration failed', 500);
  }
}
