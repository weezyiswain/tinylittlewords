# Supabase Setup for Tiny Little Words

## 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Go to Settings → API
3. Copy your:
   - **Project URL** (looks like `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 2. Create Environment File

Create `apps/web/.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Database Schema

Your `words` table should have these columns:
- `text` (VARCHAR) - the word itself
- `length` (INTEGER) - word length (3, 4, or 5)
- `enabled` (BOOLEAN) - whether the word is active
- `id` (UUID) - primary key

Optional columns:
- `difficulty` (VARCHAR) - for future use
- `created_at` (TIMESTAMP)

## 4. Packs Table (for word packs dropdown)

The app reads from a `packs` table. It works with **either** column name:

- **Option A:** `id` (UUID), `name` (VARCHAR), `enabled` (BOOLEAN)
- **Option B:** `id` (UUID), `title` (VARCHAR), `enabled` (BOOLEAN)

And a `pack_words` junction table:

- `pack_id` (UUID) - references packs.id
- `word_id` (UUID) - references words.id

(Other columns like `description`, `slug`, `created_at` are fine; the app only needs `id`, one of `name`/`title`, and `enabled`.)

## 5. Test the Connection

After setting up the environment variables, restart the dev server:

```bash
npm run dev
```

The app should now show "Live Supabase words" instead of "Offline backup words" in the game interface.

## 6. Live app (production)

For the **deployed app** (e.g. Vercel) to load word packs:

1. **Set environment variables** in your host’s dashboard (e.g. Vercel → Project → Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL (from Supabase → Settings → API)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon/public key (same place)

2. **Tables used for word packs only** (no auth required):
   - **`packs`** – at least: `id`, `enabled`, and either `name` or `title`
   - **`words`** – at least: `id`, `text`, `length`, `enabled` (and `difficulty` optional)
   - **`pack_words`** – at least: `pack_id`, `word_id` (links packs to words)

3. **Row Level Security (RLS):** Anonymous users must be able to **read** these tables. In Supabase SQL editor, ensure you have policies like:
   - `packs`: allow `SELECT` where `enabled = true`
   - `words`: allow `SELECT` where `enabled = true`
   - `pack_words`: allow `SELECT` (or `SELECT` where true)

   (See `supabase-schema.sql` for full policy examples.)

Other Supabase features (auth, `profiles`, `kid_profiles`, `feedback`) are only used by the Parents and feedback flows; word packs work with just the three tables above and the two env vars.

## 7. Sample Data

If you need sample words, here are some kid-friendly options:

**3-letter words:** SUN, CAT, DOG, BEE, HAT, PEN, RUN, FUN, BIG, RED

**4-letter words:** FROG, MOON, MILK, STAR, BOOK, TREE, JUMP, FISH, BIRD, CAKE

**5-letter words:** APPLE, SMILE, TRAIN, BREAD, HEART, PLANT, LIGHT, SWEET, HAPPY, SLEEP
