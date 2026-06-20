# 🎬 TranscriptAI — YouTube Video to Text Converter

> **Stack:** Next.js 14 · Tailwind CSS · shadcn/ui · Kinde Auth · Supabase · Render · Vercel

## Quick Start

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in your env vars
npm run dev
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your env vars
npm run dev
```

## Setup Checklist

1. **Kinde** — Create app at `kinde.com`, enable Google OAuth + Magic Link
2. **Supabase** — Create project, run `supabase/schema.sql` in SQL Editor
3. **Render** — Deploy backend folder as a Web Service (Node)
4. **Vercel** — Deploy frontend folder, add env vars

See the full project plan: `YT-TO-TEXT-PROJECT-PLAN.md`

## Project Structure

```
yt-to-text/
├── frontend/     # Next.js 14 app → deploy to Vercel
├── backend/      # Express API → deploy to Render
└── supabase/     # Database schema
```
