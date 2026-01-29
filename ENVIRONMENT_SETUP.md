# Environment Setup for Tiny Little Words

## Your Database Structure ✅

Perfect! Your Supabase database has exactly what the app needs:

- **`words` table**: `id`, `text`, `length`, `enabled`, `difficulty`, `language_code`, `phonics`, `part_of_speech`, `extra`, `created_at`
- **`packs` table**: `id`, `title`, `slug`, `description`, `kind`, `language_code`, `is_premium`, `enabled`, `extra`, `created_at`  
- **`pack_words` table**: `pack_id`, `word_id`, `position`, `weight`
- **`tags` table**: `id`, `slug`, `label`, `kind`, `description`
- **`word_tags` table**: `word_id`, `tag_id`
- **`user_entitlements` table**: `user_id`, `pack_id`, `granted_at`

## Setup Steps

### 1. Create Environment File

Create `apps/web/.env.local` with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**To get these values:**
1. Go to your Supabase project dashboard
2. Go to Settings → API  
3. Copy your Project URL and anon/public key

### 2. Test the Connection

After creating the `.env.local` file, restart the dev server:

```bash
# Stop current server (Ctrl+C), then:
npm run dev
```

### 3. Verify It's Working

1. Open http://localhost:3001
2. The app should show "Live Supabase words" instead of "Offline backup words"
3. You should see your packs (Colors Pack, Shapes Pack, School Pack) in the dropdown
4. Words should load from your Supabase database

## What the App Will Do

- **Load words** from your `words` table (filtered by `enabled = true`)
- **Load packs** from your `packs` table (filtered by `enabled = true`) 
- **Filter words by pack** using the `pack_words` junction table
- **Use your existing data** - no need to add sample data!

## Troubleshooting

If you see "Offline backup words":
- Check that `.env.local` exists in `apps/web/`
- Verify the environment variable names are exactly as shown
- Restart the dev server after making changes
- Check the browser console for any error messages

Your database structure is perfect - the app should work immediately once you add the environment variables!

## Parents area (optional)

The **For parents** page uses `profiles` and `kid_profiles` tables. Run `supabase-parents-schema.sql` in the Supabase SQL editor to create them.

For **Google** or **Facebook** sign-in, enable those providers in Supabase (Authentication → Providers) and add your app’s redirect URL to **Redirect URLs**, e.g.:

- `http://localhost:3001/auth/callback` (local)
- `https://yourdomain.com/auth/callback` (production)

## In‑app feedback (optional)

The **Give feedback** flow (Parents page only) stores submissions in Supabase. Run `supabase-feedback-schema.sql` in the SQL editor (after `supabase-parents-schema.sql`, since it references `profiles`). View submissions in the **Table Editor** → `feedback`.

If you already have the `feedback` table, run `supabase-feedback-monetization-migration.sql` to add `pricing_preference` and `features_valued` columns.
