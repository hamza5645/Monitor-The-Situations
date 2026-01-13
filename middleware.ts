import { NextResponse } from 'next/server';

export function middleware() {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy
  // - default-src 'self': Only allow resources from same origin by default
  // - script-src: Allow inline scripts (needed for Next.js) and self
  // - style-src: Allow inline styles (needed for Tailwind) and self
  // - img-src: Allow images from self, data URIs, and HTTPS sources
  // - frame-src: Only allow ADS-B Exchange iframe
  // - connect-src: Allow API calls to external services
  // - font-src: Allow fonts from self and Google Fonts
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "frame-src https://globe.adsbexchange.com",
    "connect-src 'self' https://query1.finance.yahoo.com https://www.defconlevel.com https://feeds.bbci.co.uk https://feeds.npr.org https://www.theguardian.com https://rsshub.app https://xcancel.com https://nitter.poast.org https://cloudflareinsights.com",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Strict Transport Security (HSTS)
  // Only enable in production - tells browsers to only use HTTPS
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
