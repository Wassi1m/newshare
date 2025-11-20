import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Routes publiques
  const publicRoutes = ["/", "/auth/login", "/auth/signup"];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith("/share/");

  // Routes protégées
  const protectedRoutes = ["/dashboard", "/files", "/admin", "/profile", "/settings"];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Rediriger les utilisateurs non connectés des routes protégées
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Rediriger les utilisateurs connectés de la page de connexion
  if (isLoggedIn && (pathname === "/auth/login" || pathname === "/auth/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

