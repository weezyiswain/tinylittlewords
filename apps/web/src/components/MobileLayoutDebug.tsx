"use client";

import { useEffect } from "react";

/**
 * Dev-only: Logs mobile layout debug info to console.
 * Helps verify root cause of white bar, safe-area, and viewport issues.
 * Disabled in production.
 */
export function MobileLayoutDebug() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const log = () => {
      const html = document.documentElement;
      const body = document.body;
      const htmlStyles = window.getComputedStyle(html);
      const bodyStyles = window.getComputedStyle(body);

      console.log("[MobileLayoutDebug]", {
        html: {
          backgroundColor: htmlStyles.backgroundColor,
          minHeight: htmlStyles.minHeight,
          height: htmlStyles.height,
          overflowX: htmlStyles.overflowX,
        },
        body: {
          backgroundColor: bodyStyles.backgroundColor,
          minHeight: bodyStyles.minHeight,
          backgroundSize: bodyStyles.backgroundSize,
          overflowX: bodyStyles.overflowX,
        },
        viewport: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          visualViewportHeight: window.visualViewport?.height,
        },
        note: "env(safe-area-inset-*) resolves at paint time; check Device Toolbar in DevTools for iOS simulation",
      });
    };

    log();
    window.addEventListener("resize", log);
    return () => window.removeEventListener("resize", log);
  }, []);

  return null;
}
