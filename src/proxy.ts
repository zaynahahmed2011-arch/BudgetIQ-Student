import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/transactions",
  "/assistant",
  "/goals",
  "/reports",
  "/settings",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected && !req.auth) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if ((pathname === "/sign-in" || pathname === "/sign-up") && req.auth) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/assistant/:path*",
    "/goals/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
