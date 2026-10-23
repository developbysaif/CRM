import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'fallback_secret_leadai_pro_2026';
const secretKey = new TextEncoder().encode(JWT_SECRET);

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/automation/cron',
  '/api/email/inbound',
  '/api/unsubscribe',
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Bypass static files, internal Next.js requests, and favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Bypass public paths
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));

  // 3. Extract token from Cookie or Authorization header
  let token = request.cookies.get('token')?.value;
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  let sessionUser = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      sessionUser = payload;
    } catch (err) {
      sessionUser = null;
    }
  }

  // 4. If visiting /login or /register while already authenticated, redirect to /dashboard
  if (pathname === '/login' || pathname === '/register') {
    if (sessionUser) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // If path is public, proceed
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 5. Protected paths check
  if (!sessionUser) {
    // If it's an API request, return 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required. Please sign in to LeadAI Pro.',
        },
        { status: 401 }
      );
    }

    // For pages, redirect to /login with callbackUrl
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
