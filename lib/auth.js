import jwt from 'jsonwebtoken';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'fallback_secret_leadai_pro_2026';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Edge-compatible JWT verification for Next.js middleware using jose
 */
export async function verifyTokenEdge(token) {
  try {
    if (!token) return null;
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from either Authorization header or cookies
 */
export function getTokenFromRequest(request) {
  // 1. Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. Check cookies
  if (request.cookies) {
    if (typeof request.cookies.get === 'function') {
      const cookie = request.cookies.get('token');
      if (cookie) return typeof cookie === 'string' ? cookie : cookie.value;
    } else if (typeof request.cookies === 'object' && request.cookies.token) {
      return request.cookies.token;
    }
  }

  // 3. Check Cookie header string
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }

  return null;
}

/**
 * Authenticates request and returns the decoded token payload
 */
export async function authenticateRequest(request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return { error: 'Authentication required. No token provided.', status: 401 };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return { error: 'Invalid or expired session token.', status: 401 };
  }

  return { user: decoded };
}

/**
 * Role-based authorization guard
 * allowedRoles: e.g. ['admin'], ['admin', 'manager'], ['admin', 'sales', 'manager', 'agent']
 */
export async function requireRole(request, allowedRoles = ['admin']) {
  const authResult = await authenticateRequest(request);
  if (authResult.error) return authResult;

  const { user } = authResult;
  if (!user.role || !allowedRoles.includes(user.role)) {
    return {
      error: `Access denied. Requires one of [${allowedRoles.join(', ')}] roles.`,
      status: 403,
      user,
    };
  }

  return { user };
}

export const AUTH_COOKIE_NAME = 'token';

export function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    name: AUTH_COOKIE_NAME,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  };
}
