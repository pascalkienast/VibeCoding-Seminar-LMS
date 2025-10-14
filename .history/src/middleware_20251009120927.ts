import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Gate all non-auth routes behind login. Allow /, /login, /register to be public.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // public paths
  const publicPaths = ["/", "/login", "/register", "/manifest.json"]; 
  const isPublic = publicPaths.some((p) => pathname === p);

  if (isPublic) return NextResponse.next();

  const supabaseToken = req.cookies.get("sb-access-token") || req.cookies.get("sb:token");
  if (!supabaseToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/(.*)"],
};


