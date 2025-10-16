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

## 4. Packs Table (Optional)

If you want word categories, create a `packs` table:
- `id` (UUID) - primary key
- `name` (VARCHAR) - pack name like "Animals", "Food"
- `enabled` (BOOLEAN) - whether pack is active

And a `pack_words` junction table:
- `pack_id` (UUID) - references packs.id
- `word_id` (UUID) - references words.id

## 5. Test the Connection

After setting up the environment variables, restart the dev server:

```bash
npm run dev
```

The app should now show "Live Supabase words" instead of "Offline backup words" in the game interface.

## 6. Sample Data

If you need sample words, here are some kid-friendly options:

**3-letter words:** SUN, CAT, DOG, BEE, HAT, PEN, RUN, FUN, BIG, RED

**4-letter words:** FROG, MOON, MILK, STAR, BOOK, TREE, JUMP, FISH, BIRD, CAKE

**5-letter words:** APPLE, SMILE, TRAIN, BREAD, HEART, PLANT, LIGHT, SWEET, HAPPY, SLEEP
