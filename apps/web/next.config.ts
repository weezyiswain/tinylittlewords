import type { NextConfig } from "next";
import withPWA from "next-pwa";

const withPWAFn = withPWA({
  dest: "public",
  disable: process.env.NEXT_PUBLIC_ENABLE_PWA !== "true",
});

const nextConfig: NextConfig = {};

export default withPWAFn(nextConfig);
