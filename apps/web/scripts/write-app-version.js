#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const pkgPath = path.join(__dirname, "..", "package.json");
const outPath = path.join(__dirname, "..", "src", "lib", "app-version.ts");

let majorMinor = "1.0";
try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  if (typeof pkg.version === "string" && /^\d+\.\d+/.test(pkg.version)) {
    const parts = pkg.version.split(".");
    majorMinor = `${parts[0]}.${parts[1]}`;
  }
} catch {
  // keep default
}

let commitCount = "0";
try {
  const root = execSync("git rev-parse --show-toplevel", { encoding: "utf-8" }).trim();
  commitCount = execSync("git rev-list --count HEAD", { cwd: root, encoding: "utf-8" }).trim();
} catch {
  if (process.env.VERCEL_GIT_COMMIT_SHA) commitCount = "1";
}

const version = `${majorMinor}.${commitCount}`;

const content = `/** App version: major.minor from package.json + git commit count (X.X.X). Auto-updates on deploy. */
export const APP_VERSION = "${version}";
`;

fs.writeFileSync(outPath, content, "utf-8");
console.log("Wrote APP_VERSION:", version);
