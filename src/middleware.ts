// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_DOMAIN = process.env.PRODUCTION_HOST; // optional
const SECRET_KEY   = process.env.SECURE_KEY!;

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const providedKey = searchParams.get("key");
  const keyOk        = providedKey === SECRET_KEY;

  // detect same-origin browser or app calls:
  const referer = request.headers.get("referer") || "";
  const isSameOriginFetch = referer.startsWith(request.nextUrl.origin);

  // Protect `/join`
  if (pathname.startsWith("/join")) {
    if (!keyOk) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search   = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Protect `/api/*`
  if (pathname.startsWith("/api/")) {
    // allow internal same-origin fetches through
    if (isSameOriginFetch) {
      return NextResponse.next();
    }

    // otherwise enforce key
    if (!keyOk) {
      return new NextResponse(
        JSON.stringify({ error: "Missing or invalid key" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // enforce host only when PUBLIC_DOMAIN is set
    const host = request.headers.get("host")!;
    if (PUBLIC_DOMAIN && host !== PUBLIC_DOMAIN) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized origin" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/join/:path*", "/api/:path*"],
};