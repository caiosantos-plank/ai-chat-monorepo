## AI Chat Web (Next.js app)

The web UI for the AI Chat application. See the root `README.md` for a full overview and monorepo setup.

### Environment variables

Create a `.env.local` file in this directory with:

```bash
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

NEXT_PUBLIC_GROQ_API_KEY=YOUR_GROQ_API_KEY

# Optional tools
NEXT_PUBLIC_OPEN_WEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY
NEXT_PUBLIC_OPEN_WEATHER_URL=https://api.openweathermap.org

NEXT_PUBLIC_NEWS_API_KEY=YOUR_NEWSAPI_KEY
NEXT_PUBLIC_NEWS_API_URL=https://newsapi.org/v2
```

### Develop

From the repo root:

```bash
pnpm --filter ai-chat-web dev
```

Or from this folder:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

### Build & Start

```bash
pnpm build
pnpm start
```

### Deploy

Deploy to your preferred platform (e.g., Vercel). Make sure to set the same environment variables in the hosting provider.

