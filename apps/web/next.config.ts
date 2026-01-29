import type { NextConfig } from "next";
import withPWA from "next-pwa";

const withPWAFn = withPWA({
  dest: "public",
  // Disable in dev to avoid refresh loops from SW updates; enable for production/testing
  // Set NEXT_PUBLIC_ENABLE_PWA=false to disable even in production
  disable:
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_ENABLE_PWA === "false",
});

const nextConfig: NextConfig = {};

export default withPWAFn(nextConfig);
