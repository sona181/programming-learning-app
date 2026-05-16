# UniLearn — Programming Learning Platform

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma 7
- **Auth**: Custom HMAC session tokens
- **AI**: OpenAI, Judge0 (code execution)

---

## Local Setup

### 1. Clone and install
```bash
git clone https://github.com/sona181/programming-learning-app
cd programming-learning-app
npm install
```

### 2. Create your `.env` file
```bash
cp .env.example .env
```
Then fill in your values (see below for where to get them).

### 3. Generate the Prisma client
```bash
npm run db:generate
```

### 4. Set up the database
Since we use a **shared Supabase database**, do NOT run `migrate dev` or `db push` without checking with the team first — it affects everyone.

- **First time only (schema already exists on Supabase)**:
  ```bash
  npm run db:generate
  ```
  That's it — the schema is already deployed on Supabase.

- **If you need to apply new migrations**:
  ```bash
  npm run db:deploy
  ```

- **If starting a brand new Supabase project**:
  ```bash
  npm run db:push
  ```

### 5. Run the dev server
```bash
npm run dev
```
App runs at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Get these from **Supabase Dashboard → Project Settings → Database → Connection string**.

| Variable | Description |
|---|---|
| `DATABASE_URL` | Transaction Pooler URL (port **6543**) — used by the app |
| `DIRECT_URL` | Direct Connection URL (port **5432**) — used by Prisma migrations |
| `AUTH_SECRET` | Any random string (e.g. `openssl rand -hex 32`) |
| `OPENAI_API_KEY` | Get from Elisona |
| `JUDGE0_API_KEY` | Get from Elisona |
| `ADMIN_SECRET` | Any string |

> Ask **Elisona** for the Supabase project URL and keys.

---

## Database Scripts

```bash
npm run db:generate   # regenerate Prisma client after schema changes
npm run db:push       # push schema to DB without migrations (first setup)
npm run db:migrate    # create a new migration (dev only)
npm run db:deploy     # apply existing migrations (safe for shared DB)
npm run db:studio     # open Prisma Studio to browse data
npm run db:seed       # seed the database with initial data
```

---

## Health Check

Visit [`/api/health`](http://localhost:3000/api/health) to verify the database connection:
```json
{ "status": "ok", "database": "connected" }
```

---

## Supabase Warnings

- Always use the **Transaction Pooler** URL (port 6543) for `DATABASE_URL` — this is what the app uses at runtime.
- Always use the **Direct Connection** URL (port 5432) for `DIRECT_URL` — Prisma needs this to run migrations.
- Never run `prisma migrate reset` — it **drops the entire database**.
- The shared Supabase DB has no shadow database — use `db push` for prototyping or `migrate deploy` for applying existing migrations.
- Add `?pgbouncer=true` to `DATABASE_URL` when using the pooler.
