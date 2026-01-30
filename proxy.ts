// middleware.ts - Route Protection
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/auth/signin") ||
      req.nextUrl.pathname.startsWith("/auth/signup");
    const isAdminPage = req.nextUrl.pathname.startsWith("/admin");
    const isCheckoutPage = req.nextUrl.pathname.startsWith("/checkout");

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Protect checkout page
    if (isCheckoutPage && !isAuth) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    // Protect admin pages
    if (isAdminPage) {
      if (!isAuth) {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Handle auth in middleware function
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/checkout/:path*", "/auth/:path*", "/profile/:path*"],
};
