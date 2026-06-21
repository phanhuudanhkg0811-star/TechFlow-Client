import { decodeJwt } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type UserRole = "ADMIN" | "COMPANY_ROOT" | "HR" | "CANDIDATE";

const defaultRouteByRole: Record<UserRole, string> = {
  ADMIN: "/admin/companies",
  COMPANY_ROOT: "/company/settings",
  HR: "/dashboard/jobs",
  CANDIDATE: "/tests",
};

const routeRules: Array<{ prefix: string; roles: UserRole[] }> = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/company/email-accounts", roles: ["HR"] },
  { prefix: "/company/hr", roles: ["COMPANY_ROOT"] },
  { prefix: "/company/settings", roles: ["COMPANY_ROOT"] },
  { prefix: "/company/templates", roles: ["COMPANY_ROOT"] },
  { prefix: "/company", roles: ["COMPANY_ROOT", "HR"] },
  { prefix: "/dashboard", roles: ["HR"] },
  { prefix: "/tests", roles: ["CANDIDATE"] },
];

const isKnownRole = (role: unknown): role is UserRole =>
  role === "ADMIN" ||
  role === "COMPANY_ROOT" ||
  role === "HR" ||
  role === "CANDIDATE";

const getRouteRule = (pathname: string) =>
  routeRules.find(
    (rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`),
  );

const redirectToLogin = (request: NextRequest, error = "unauthorized") => {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("error", error);
  return NextResponse.redirect(loginUrl);
};

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;
  const isAuthPage =
    pathname === "/login" || pathname.startsWith("/login/");
  const routeRule = getRouteRule(pathname);

  if (routeRule && !accessToken) {
    return redirectToLogin(request);
  }

  if (!accessToken) {
    return NextResponse.next();
  }

  try {
    const payload = decodeJwt(accessToken);
    const role = payload.role;

    if (!isKnownRole(role)) {
      const response = redirectToLogin(request, "invalid-role");
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      return response;
    }

    if (isAuthPage) {
      return NextResponse.redirect(
        new URL(defaultRouteByRole[role], request.url),
      );
    }

    if (routeRule && !routeRule.roles.includes(role)) {
      const fallbackUrl = new URL(defaultRouteByRole[role], request.url);
      fallbackUrl.searchParams.set("error", "forbidden");
      return NextResponse.redirect(fallbackUrl);
    }
  } catch {
    if (isAuthPage) return NextResponse.next();

    const response = redirectToLogin(request, "invalid-token");
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/login/:path*",
    "/admin",
    "/admin/:path*",
    "/company",
    "/company/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/tests",
    "/tests/:path*",
  ],
};
