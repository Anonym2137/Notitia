# 🎬 Notitia

A modern movie and show database built with Next.js. Browse trending movies, manage your watchlist, discover new films, rate & review, and follow your favourite actors and directors — all in one place.

## Tech Stack

| Layer            | Technology                                                    |
| ---------------- | ------------------------------------------------------------- |
| **Framework**    | [Next.js 15](https://nextjs.org/) (App Router)               |
| **Language**     | TypeScript                                                    |
| **Auth**         | [Supabase Auth](https://supabase.com/auth)                    |
| **Database**     | PostgreSQL via [Supabase](https://supabase.com/)              |
| **Object Storage** | S3-compatible (iDrive E2) — movie posters & user avatars   |
| **Movie Data**   | [TMDB API](https://www.themoviedb.org/documentation/api)      |
| **Styling**      | [Tailwind CSS v4](https://tailwindcss.com/)                   |
| **UI Components**| [shadcn/ui](https://ui.shadcn.com/)                           |

## Features

- 🔍 **Search** — Find movies, actors, directors, and users
- 🎭 **Movie Details** — Cast, crew, ratings, reviews, streaming availability
- 📝 **Ratings & Reviews** — Rate movies and leave reviews
- 📋 **Watchlist** — Save movies to watch later
- 👥 **Social** — Follow users, actors, and directors
- 🎬 **Discover** — Swipe through movie recommendations
- 📊 **Dashboard** — Personal stats, recommendations, and activity feed
- 🌙 **Dark Mode** — Sleek dark-themed UI with glassmorphism effects

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm (comes with Node.js)
- A [Supabase](https://supabase.com/) project
- A [TMDB](https://www.themoviedb.org/) API key
- An S3-compatible storage service (e.g. iDrive E2)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/notitia.git
cd notitia/web_app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials. See [`.env.example`](.env.example) for all required variables.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `npm run dev`    | Start development server           |
| `npm run build`  | Build for production                |
| `npm run start`  | Start production server             |
| `npm run lint`   | Run ESLint                          |

## Project Structure

```
src/
├── app/
│   ├── (pages)/          # All route pages
│   │   ├── auth/         # Auth callback handler
│   │   ├── create-account/
│   │   ├── discover/     # Movie discovery / swiper
│   │   ├── following/    # Followed people & their movies
│   │   ├── login/
│   │   ├── movies/       # Movie detail pages
│   │   ├── myactivity/   # Watched history
│   │   ├── people/       # Actor / director profiles
│   │   ├── profile/      # User profiles
│   │   ├── reviews/      # Movie reviews
│   │   ├── search/       # Search results
│   │   ├── settings/     # User settings & preferences
│   │   ├── watchlist/    # User's watchlist
│   │   ├── globals.css   # Design tokens & animations
│   │   ├── layout.tsx    # Pages layout (navbar, footer)
│   │   └── page.tsx      # Home page
│   ├── api/              # API routes
│   │   ├── movie/        # Movie data endpoints
│   │   └── user/         # User data endpoints
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # shadcn/ui primitives
│   └── *.tsx             # Feature components
├── lib/
│   ├── e2/               # S3 / E2 storage helpers
│   ├── supabase/         # Supabase client (browser, server, static)
│   └── utils.ts          # Utility functions
└── types/
    └── index.ts          # Shared TypeScript types
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Copy `.env.example` to `.env` and add your own keys
4. Make your changes
5. Run `npm run build` to verify there are no errors
6. Commit: `git commit -m "feat: add your feature"`
7. Push: `git push origin feature/your-feature`
8. Open a Pull Request

## License

This project is for educational and personal use.
