import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes không cần đăng nhập
const PUBLIC_ROUTES = ['/login', '/register'];

// Routes yêu cầu role OWNER
const OWNER_ONLY_ROUTES = ['/settings', '/reports', '/marketing'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua static files, API routes, Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Đọc token từ cookie (set khi login)
  const token = request.cookies.get('auth-token')?.value;
  const userRole = request.cookies.get('user-role')?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  // Chưa đăng nhập → redirect login (trừ public routes)
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Đã đăng nhập → không vào login/register nữa
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // RBAC: OWNER_ONLY routes
  if (token && OWNER_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    if (userRole !== 'OWNER') {
      return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
