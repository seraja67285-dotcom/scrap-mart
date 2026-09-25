# ScrapMart

Mobile-friendly scrap catalog with WhatsApp enquiry flow.

## What is included
- Home page: scrap catalog with WhatsApp "Enquiry" buttons
- /buy/[slug]: buyer details form (name, phone, quantity) → opens WhatsApp with full details
- /sell page: seller details form → opens WhatsApp with full details
- Enquiries are saved in DB → admin sees full order/lead history with status (New → Contacted → Done)
- /admin: password-protected dashboard — add/hide/delete products, change WhatsApp number, one-click DB setup
- PostgreSQL via Prisma, Next.js 15 (App Router)

## Phone se live karne ke steps (no computer needed)

### 1. Code GitHub par daalo
1. Phone ke browser me **github.com** kholo (Chrome me "Desktop site" on karo).
2. New repository banao — naam: `scrapmart` (Private rakho).
3. **Add file → Upload files** — apne phone ki Files app me ScrapMart zip **extract** karo,
   phir saari files ek saath select karke upload karo (folder structure same rehna chahiye: app/, lib/, prisma/...).
   *Tip: 20 files ek saath select karne ke liye file picker me long-press se multi-select karo.*
   (Agar upload mushkil lage to yeh step cyber cafe / kisi bhi computer se 5 minute me ho jata hai.)

### 2. Free database banao — Neon
1. **neon.tech** kholo → Sign up (free) → New Project → naam `scrapmart`.
2. Connection string copy karo (format: `postgresql://...`).

### 3. Vercel par deploy
1. **vercel.com** kholo → Continue with GitHub.
2. **Add New → Project → Import** `scrapmart` repo.
3. Environment Variables me yeh daalo:
   - `DATABASE_URL` = Neon wali string
   - `ADMIN_EMAIL` = tumhara email (admin login ke liye)
   - `ADMIN_PASSWORD` = ek strong password (yahi admin login password hai)
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` = `91` + tumhara WhatsApp number
4. Build command override karo:
   `npx prisma generate && npx prisma db push --accept-data-loss && next build`
5. **Deploy** dabao. 2-3 minute me site live: `https://scrapmart-xxxx.vercel.app`

### 4. Pehli baar setup
1. `your-site.vercel.app/admin/login` kholo → login karo.
2. **Setup Demo Data** dabao (categories + settings ban jayenge).
3. Products add karo, WhatsApp number confirm karo. Done!

### 5. Google par aane ke liye (Search Console)
1. **search.google.com/search-console** kholo → apna Google account se login.
2. "URL prefix" me apna Vercel URL daalo.
3. Verification method: **HTML tag** → tag ka `content="..."` wala code copy karo
   → Vercel → Settings → Environment Variables → `GOOGLE_SITE_VERIFICATION` = woh code → **Redeploy**.
4. Verification ke baad **Request Indexing** dabao. 1-7 din me Google par aa jayegi.
5. (Optional) Apna custom domain (e.g. scrapmart.in) lene ke liye Vercel → Settings → Domains.

## Security note
- `ADMIN_PASSWORD` strong rakho aur kabhi share mat karo.
- Repo private rakho (`.env` gitignore me hai, safe hai).
