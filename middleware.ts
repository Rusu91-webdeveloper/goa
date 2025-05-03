import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Define protected routes
const protectedRoutes = ["/admin", "/profile"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  if (isProtectedRoute) {
    const token = request.cookies.get("goa_auth_token")?.value;

    // If there's no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Basic JWT verification without database access
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || "your-secret-key"
      );
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error) {
      // If token is invalid, redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("goa_auth_token");
      return response;
    }
  }

  return NextResponse.next();
}

// Configure the middleware to run on protected routes
export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/profile"],
};
