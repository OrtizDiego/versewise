# VerseWise - Gemini Context

## Project Overview
**VerseWise** is a modern Bible study application built with Next.js 15. It focuses on providing a feature-rich environment for scripture analysis, featuring side-by-side translation comparisons (including original languages), AI-assisted study, and interactive lexicon lookups.

## Architecture & Tech Stack
*   **Frontend Framework:** [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [Radix UI](https://www.radix-ui.com/) (using Shadcn UI component patterns)
*   **AI Engine:** [Google Genkit](https://firebase.google.com/docs/genkit) using the `googleAI` plugin (Gemini models)
*   **Backend Services:** [Supabase](https://supabase.com/) (for vector search/embeddings and data)
*   **State Management:** React `useState`/`useEffect` hooks, local component state.
*   **Bible Data Sources:**
    *   `bible-api.com` (KJV, WEB, etc.)
    *   `api.esv.org` (ESV)
    *   `api.lsm.org` (Recovery Version)
    *   `bolls.life` (Greek Septuagint, Greek NT, Hebrew WLC, and Lexicons like BDBT/LSJ)

## Project Structure
*   `src/app`: Application entry point (`page.tsx`) and layout. Uses `SidebarProvider` for navigation.
*   `src/components`:
    *   `bible-viewer.tsx`: Core component for reading scripture. Supports multi-column view and word-click lexicon lookup.
    *   `lexicon-modal.tsx`: Displays word definitions from BDBT (Hebrew) or LSJ (Greek).
    *   `ai-assistant.tsx`: Interface for interacting with Genkit flows.
    *   `ui/`: Base UI components (Button, Dialog, Sidebar, etc.) from Shadcn UI.
*   `src/lib`:
    *   `bible-data.ts`: Central logic for fetching and processing scripture and definitions.
    *   `supabase.ts`: Supabase client configuration for database and vector operations.
*   `src/ai`:
    *   `genkit.ts`: Main Genkit configuration.
    *   `flows/`: AI workflows (e.g., `interpret-verse.ts`).
*   `scripts`: Node/Python scripts for data processing and embedding generation.

## Development Workflows
### Commands
*   `npm run dev`: Start Next.js in dev mode (Turbopack enabled).
*   `npm run genkit:dev`: Start Genkit developer UI.
*   `npm run typecheck`: Run TypeScript compiler check (noEmit).
*   `npm run test`: Execute Jest tests.

### Testing Conventions
*   Tests are located alongside source files (e.g., `*.test.ts`).
*   Mocks are used for external API calls (`global.fetch`).
*   Focus on logical units (like `bible-data.ts`) and component rendering.

### Code Style
*   Functional React components with TypeScript.
*   Lucide icons for UI elements.
*   Tailwind classes for styling, with Radix UI for accessibility.
*   **Important:** Build errors and linting are currently ignored in `next.config.ts` (`ignoreBuildErrors: true`), indicating a focus on rapid iteration or experimental features.

## Known Configurations
*   **Bible API Keys:** Requires `NEXT_PUBLIC_ESV_API_KEY`, `NEXT_PUBLIC_RV_APP_ID`, and `NEXT_PUBLIC_RV_TOKEN` in `.env.local`.
*   **AI Keys:** Requires `GOOGLE_API_KEY` for Genkit.
*   **Supabase:** Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.