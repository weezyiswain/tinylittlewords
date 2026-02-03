"use client";

import { useEffect } from "react";

/**
 * Sets --app-height CSS variable to window.innerHeight for iOS PWA.
 * 100dvh fixes the mobile Safari 100vh bug in modern browsers, but older iOS
 * and some PWA contexts still show a white strip at the bottom. Using
 * window.innerHeight gives us the actual visible viewport height.
 * Runs on load, resize, and orientationchange.
 */
export function ViewportHeight() {
  useEffect(() => {
    const setHeight = () => {
      document.documentElement.style.setProperty(
        "--app-height",
        `${window.innerHeight}px`
      );
    };

    setHeight();
    window.addEventListener("resize", setHeight);
    window.addEventListener("orientationchange", setHeight);

    return () => {
      window.removeEventListener("resize", setHeight);
      window.removeEventListener("orientationchange", setHeight);
    };
  }, []);

  return null;
}
