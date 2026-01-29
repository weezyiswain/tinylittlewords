import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {};

const withPWAFn = withPWA({
  dest: "public",
  disable: process.env.NEXT_PUBLIC_ENABLE_PWA === "false",
});

// Only apply PWA webpack config in production. In dev, next-pwa can cause
// "Cannot read properties of undefined (reading 'call')" webpack runtime errors.
export default process.env.NODE_ENV === "production"
  ? withPWAFn(nextConfig)
  : nextConfig;
