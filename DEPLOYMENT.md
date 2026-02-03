# Deployment & Preview Workflow

This project is deployed on **Vercel**. Use the staging branch to test changes on a private preview URL before shipping to production.

## Quick Reference

| Branch   | Vercel deployment      | URL pattern                          |
|----------|------------------------|--------------------------------------|
| `main`   | Production             | Your production domain               |
| `staging`| Preview (private URL)  | `tinylittlewords-git-staging-*.vercel.app` |

## Test on iPhone Before Production

1. **Commit your changes on `staging`:**
   ```bash
   git checkout staging
   git add <files>
   git commit -m "Your message"
   git push origin staging
   ```

2. **Get the preview URL:**
   - Open [Vercel Dashboard](https://vercel.com/dashboard) → your project
   - Find the deployment for the `staging` branch
   - Or check the GitHub PR (if you opened one) for the Vercel bot comment with the preview link

3. **Test on iPhone:**
   - Open the preview URL in Safari
   - Optionally: Add to Home Screen for full PWA experience

4. **When satisfied, merge to production:**
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

## Create a One-Off Preview Branch

For a quick test without affecting `staging`:

```bash
git checkout -b mobile-layout-test
git add apps/web/src/app/play/page.tsx
git commit -m "Test: mobile layout tweaks"
git push -u origin mobile-layout-test
```

Vercel will deploy it to a unique URL (e.g. `tinylittlewords-git-mobile-layout-test-*.vercel.app`).
