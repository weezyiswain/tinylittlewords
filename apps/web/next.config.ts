import type { NextConfig } from "next";
import withPWA from "next-pwa";

const withPWAFn = withPWA({
  dest: "public",
  // Disable in dev to avoid refresh loops from SW updates
  // Set NEXT_PUBLIC_ENABLE_PWA=false to disable in production
  // Disable on Vercel so build passes (next-pwa can break /_not-found prerender with "undefined reading 'call'").
  // Remove the VERCEL check to re-enable PWA on Vercel once next-pwa is fixed.
  disable:
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_ENABLE_PWA === "false" ||
    process.env.VERCEL === "1",
});

const nextConfig: NextConfig = {};

export default withPWAFn(nextConfig);
