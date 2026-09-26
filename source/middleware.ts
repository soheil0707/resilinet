import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE_NAME = 'resilinet_session';
const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'resilinet-hana-first-enterprise-secret-key-2026-secure'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Static assets and internal paths bypass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/resilinet-logo.png') ||
    pathname.startsWith('/sw.js') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Auth routes and public auth API endpoints bypass
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/signup' ||
    pathname === '/verify-email';

  const isPublicApi =
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/register') ||
    pathname.startsWith('/api/auth/logout') ||
    pathname.startsWith('/api/auth/verify-email') ||
    pathname.startsWith('/api/auth/resend-verification');

  if (isPublicApi) {
    return NextResponse.next();
  }

  // 3. Verify HANA session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
      if (payload && payload.userId && payload.email) {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // 4. If authenticated and accessing auth pages (/login, /register, /signup), redirect to Executive Dashboard
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 5. If unauthenticated and accessing protected routes
  if (!isAuthenticated && !isAuthPage) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Active HANA session required' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and icons
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
