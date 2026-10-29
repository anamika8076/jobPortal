import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/register", "/forgot-password"];
const PROTECTED_PAGES = ["/profile", "/dashboard", "/applications", "/ai", "/account"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));
  const isProtectedPage = PROTECTED_PAGES.some((page) => pathname.startsWith(page));

  // If user is already logged in and attempts to access login/register/forgot-password
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is unauthenticated and attempts to access protected routes
  if (!token && isProtectedPage) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/profile/:path*",
    "/dashboard/:path*",
    "/applications/:path*",
    "/ai/:path*",
    "/account/:path*",
  ],
};
