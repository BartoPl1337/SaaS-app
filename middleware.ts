import { NextRequest, NextResponse } from "next/server";

const caseInsensitiveRoutes: Record<string, string> = {
  "/signup": "/signUp",
  "/login" : "/signIn",
  "/signin" : "/signIn",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const canonical = caseInsensitiveRoutes[pathname.toLowerCase()];

  if (canonical && pathname !== canonical) {
    return NextResponse.redirect(new URL(canonical, request.url));
  }
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
