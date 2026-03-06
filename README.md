# Regly MVP — Deployment Guide

## What this is
A full web app with:
- Business owner login → phone lookup + member list
- Customer login → browse restaurants + subscribe via Stripe
- Supabase for database + authentication
- Stripe for payments

---

## STEP 1 — Set up Supabase (free)

1. Go to **supabase.com** and create a free account
2. Click "New Project" — name it "regly"
3. Save your database password somewhere safe
4. Go to **SQL Editor** in the left sidebar
5. Paste the entire contents of `supabase-schema.sql` and click Run
6. Go to **Settings → API** and copy:
   - Project URL
   - anon/public key

---

## STEP 2 — Set up Stripe (free until you earn)

1. Go to **stripe.com** and create an account
2. Go to **Products** → Add Product → "Regly Pizza Membership"
3. Add 3 prices (recurring, monthly):
   - Regular: $10/mo
   - Gold Regular: $20/mo
   - VIP Regular: $35/mo
4. Copy each **Price ID** (starts with `price_`)
5. Go to **Developers → API Keys** and copy:
   - Publishable key
   - Secret key

---

## STEP 3 — Configure environment variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app
```

---

## STEP 4 — Deploy to Vercel (free)

1. Go to **github.com** → New Repository → "regly-app" → upload this folder
2. Go to **vercel.com** → New Project → Import from GitHub
3. Add all environment variables from Step 3 in Vercel's settings
4. Click Deploy — you get a live URL in ~2 minutes

---

## STEP 5 — Add your first restaurant and tiers

After deploying:

1. Sign up on your live app as a **Business Owner**
2. Go to Supabase → Table Editor → restaurants → Insert Row:
   - name: Regly Pizza
   - description: Chicago's best slice, now with memberships
   - address: 123 N Michigan Ave
   - city: Chicago
   - owner_id: (paste your user ID from Supabase → Authentication → Users)

3. Go to membership_tiers → Insert 3 rows, one per tier:
   - restaurant_id: (paste the restaurant ID from step above)
   - name: Regular / Gold Regular / VIP Regular
   - price_monthly: 10 / 20 / 35
   - perks: (your perks text)
   - stripe_price_id: price_xxx (from Stripe)

---

## STEP 6 — Test it

1. Sign up as a **Customer** — browse restaurants, subscribe to a tier
2. Log in as the **Business Owner** — enter the customer's phone number, verify it shows up
3. Check the member list — the customer should appear

---

## Running locally (optional)

```bash
npm install
npm run dev
```
Open http://localhost:3000

---

## Support
hello@getregly.com
