import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminArea = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/onboardings") || pathname.startsWith("/api/arquivos");
  const hasSessionCookie = Boolean(request.cookies.get("highsoft_session")?.value);

  if ((isAdminArea || isAdminApi) && !hasSessionCookie) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/onboardings/:path*", "/api/arquivos/:path*"]
};
