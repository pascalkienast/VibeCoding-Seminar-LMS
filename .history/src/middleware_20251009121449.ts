import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// No-op middleware; auth gating is handled client-side for now
export function middleware(_: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api|manifest.json|icon|images|.*\\.png$|.*\\.jpg$).*)",
  ],
};


