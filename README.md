## AI Chat Monorepo

An AI-powered chat application built with Next.js and LangGraph that supports text and voice messages, tool-augmented responses (weather and news), and persistent chat history via Supabase.

### Features

- **Conversational AI**: Orchestrated multi-agent workflow with LangGraph (router, domain experts, summarizer).
- **Voice input**: Audio recording and transcription via GROQ Whisper.
- **Tool usage**: Weather (OpenWeather) and News (NewsAPI) lookups routed automatically by the orchestrator.
- **Authentication**: Email/password auth with Supabase.
- **Chat persistence**: Chats and message history stored in Supabase, with threaded sessions.
- **Modern stack**: Next.js App Router, React 19, TypeScript, Turborepo, ESLint, Prettier.

### Monorepo layout

- `apps/ai-chat-web`: Next.js web app
- `packages/ui`: Shared UI components
- `packages/eslint-config`, `packages/typescript-config`: Shared configs

### Prerequisites

- Node.js >= 18
- `pnpm` (repo uses `pnpm@9`)  
  Install: `npm i -g pnpm@9`

### Environment variables

Create `apps/ai-chat-web/.env.local` with the following values:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# GROQ (required for chat + audio transcription)
NEXT_PUBLIC_GROQ_API_KEY=YOUR_GROQ_API_KEY

# OpenWeather (optional, enables weather tool)
NEXT_PUBLIC_OPEN_WEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY
NEXT_PUBLIC_OPEN_WEATHER_URL=https://api.openweathermap.org

# NewsAPI (optional, enables news tool)
NEXT_PUBLIC_NEWS_API_KEY=YOUR_NEWSAPI_KEY
NEXT_PUBLIC_NEWS_API_URL=https://newsapi.org/v2
```

Notes:
- All variables are referenced with `NEXT_PUBLIC_*` and used client/server where appropriate.
- Weather and News features are optional; the app still runs without them.

### Setup

```bash
pnpm install

# Run the web app only
pnpm --filter ai-chat-web dev

# Or run all dev tasks via turbo
pnpm dev
```

Open `http://localhost:3000`.

### Supabase database

This app uses three main tables: `user` (managed by Supabase Auth), `chat`, and `chat_history`.

- SQL migrations live in `apps/ai-chat-web/supabase/migrations/`.
- To apply them, open the Supabase SQL editor for your project and run the migration files in order.

### How it works (high level)

- User sends text or audio → Input Processor optionally transcribes audio with GROQ Whisper.
- Orchestrator routes the intent to a domain agent: Weather, News, or Chat (general conversation).
- Agents can call tools (e.g., OpenWeather, NewsAPI) when needed.
- Summarizer condenses long histories; final messages are stored in Supabase.

### Scripts

Root:
- `pnpm dev`: run dev tasks via turbo
- `pnpm build`: build all packages/apps
- `pnpm lint`: lint all
- `pnpm check-types`: typecheck all

App (`apps/ai-chat-web`):
- `pnpm dev`: Next.js dev server
- `pnpm build`: Next.js build
- `pnpm start`: Next.js start
- `pnpm lint`: Next.js lint

### Deployment

- Deploy the `apps/ai-chat-web` app (e.g., Vercel).  
- Set the same environment variables in your hosting provider.  
- Ensure Supabase URL and anon key are production values.

### Troubleshooting

- **401/403 from Supabase**: verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Weather/News not responding**: set the corresponding API keys and base URLs.
- **Audio transcription fails**: check `NEXT_PUBLIC_GROQ_API_KEY` and file permissions.

