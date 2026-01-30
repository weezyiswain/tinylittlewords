#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const pkgPath = path.join(__dirname, "..", "package.json");
const outPath = path.join(__dirname, "..", "src", "lib", "app-version.ts");

let majorMinor = "1.0";
let usePackageVersion = false;
try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  if (typeof pkg.version === "string" && /^\d+\.\d+/.test(pkg.version)) {
    const parts = pkg.version.split(".");
    majorMinor = `${parts[0]}.${parts[1]}`;
    // If package.json has full semver (e.g. 1.0.2), use it as the app version
    if (parts.length >= 3 && /^\d+$/.test(parts[2])) {
      usePackageVersion = true;
    }
  }
} catch {
  // keep default
}

let patch = "0";

// 1) Explicit env (CI can set APP_VERSION_PATCH or VERCEL_GIT_COMMIT_COUNT)
if (process.env.APP_VERSION_PATCH != null && process.env.APP_VERSION_PATCH !== "") {
  patch = String(process.env.APP_VERSION_PATCH).trim();
} else if (process.env.VERCEL_GIT_COMMIT_COUNT != null && process.env.VERCEL_GIT_COMMIT_COUNT !== "") {
  patch = String(process.env.VERCEL_GIT_COMMIT_COUNT).trim();
} else {
  try {
    const root = execSync("git rev-parse --show-toplevel", { encoding: "utf-8" }).trim();
    const count = execSync("git rev-list --count HEAD", { cwd: root, encoding: "utf-8" }).trim();
    // Vercel uses shallow clone (depth=1), so count is often "1". Use SHA-based patch when on Vercel and count looks shallow.
    const onVercel = process.env.VERCEL === "1";
    const sha = process.env.VERCEL_GIT_COMMIT_SHA;
    if (onVercel && sha && (count === "1" || count === "0")) {
      // Deterministic number from commit SHA so each deploy gets a unique version (0–999999)
      const hex = sha.slice(0, 6);
      patch = String(parseInt(hex, 16) % 1000000);
    } else {
      patch = count;
    }
  } catch {
    if (process.env.VERCEL_GIT_COMMIT_SHA) {
      const hex = process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 6);
      const n = parseInt(hex, 16) % 1000000;
      patch = Number.isNaN(n) ? "1" : String(n);
    } else {
      patch = "1";
    }
  }
}

const version = packageVersion != null ? packageVersion : `${majorMinor}.${patch}`;

const content = `/** App version: major.minor from package.json + git commit count (X.X.X). Auto-updates on deploy. */
export const APP_VERSION = "${version}";
`;

fs.writeFileSync(outPath, content, "utf-8");
console.log("Wrote APP_VERSION:", version);
