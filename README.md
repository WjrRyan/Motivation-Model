# Motivation Model Coach

A local-first coaching workspace that turns a fuzzy goal into a motivation model you can actually act on.

Instead of stopping at a pretty diagram, the app generates a full coaching session:

- `DO`: concrete behaviors
- `BE`: identity shifts
- `FEEL`: emotional rewards
- likely obstacles
- the smallest first action
- a short why-now statement
- a reflection prompt for later

## Screenshot

![Motivation Model Coach screenshot](./assets/motivation-model-vnext.png)

## What It Does

- Generates a structured motivation session from a single prompt
- Visualizes the session as a supporting diagram instead of making the diagram the whole product
- Lets you edit every part of the session manually
- Supports section-level regeneration for weak areas like `obstacles` or `firstAction`
- Saves sessions locally in the browser with no account required
- Reopens, updates, duplicates, and deletes saved sessions

## Why This Version Exists

The original project was an AI Studio style demo: prompt in, Do/Be/Feel diagram out.

This version turns that into a reusable product loop:

1. Enter a goal
2. Generate a structured session
3. Edit and refine it
4. Save it locally
5. Revisit it later

That makes the app more useful for real personal workflows without taking on backend scope too early.

## Tech Stack

- React 19
- TypeScript
- Vite
- `@google/genai`
- `framer-motion`
- `lucide-react`
- Tailwind via CDN config in `index.html`

## Project Structure

```text
.
├── App.tsx
├── components/
│   ├── DiagramView.tsx
│   ├── EditPanel.tsx
│   ├── HistoryPanel.tsx
│   └── Icons.tsx
├── lib/
│   ├── session-storage.ts
│   └── session-utils.ts
├── services/
│   └── geminiService.ts
├── tests/
│   ├── index-html.test.ts
│   ├── session-storage.test.ts
│   └── session-utils.test.ts
├── types.ts
└── assets/
    └── motivation-model-vnext.png
```

## Local Development

### Prerequisites

- Node.js 20+
- A Gemini API key

### Setup

```bash
npm install
```

Create `.env.local`:

```bash
GEMINI_API_KEY=your_key_here
```

Start the dev server:

```bash
npm run dev
```

By default Vite will print the local URL in the terminal.

## Available Scripts

```bash
npm run dev
npm test
npm run typecheck
npm run build
```

## Data Model

Each saved session contains:

- `topic`
- `sourcePrompt`
- `doItems`
- `beItems`
- `feelItems`
- `obstacles`
- `firstAction`
- `whyNow`
- `reflectionPrompt`
- `updatedAt`

All persistence is browser-local through `localStorage`.

## Testing

The current automated coverage focuses on the highest-risk logic:

- session normalization from Gemini JSON
- local storage loading, updating, and deletion
- bootstrapping check that `index.html` actually mounts the React app

Run the suite with:

```bash
npm test
```

## Important Limitation

This app currently injects the Gemini API key into the client for local-only use.

That is acceptable for personal use or a small trusted circle, but it is **not** appropriate for a public deployment. Before exposing this app more broadly, move Gemini calls behind a server or edge function.

## Roadmap Ideas

- server-side proxy for Gemini requests
- export/share card generation
- better mobile layout tuning
- richer journaling and review flows
- side-by-side comparison between saved sessions

## License

No license file is currently included in this repository. Add one before broader distribution if you want explicit reuse terms.
