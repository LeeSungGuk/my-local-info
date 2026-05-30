# AGENTS.md

## Project Summary
- This repository is a `Next.js` App Router project for organizing Seoul local information under the Seoulcity product direction.
- The app mixes two content sources:
  - structured JSON data under `public/data/events`, `public/data/benefits`, `public/data/food`, and `public/data/search`
  - Markdown blog posts in `src/content/posts`
- UI text is primarily Korean, so preserve existing tone and wording unless a change is explicitly requested.

## Working Principles
- Make focused changes. Do not refactor unrelated areas just because you notice cleanup opportunities.
- Prefer server-safe implementations for file reads. Existing data loading patterns use filesystem access from server contexts.
- Keep changes consistent with the current TypeScript, React, and Tailwind style already used in the repo.
- If you change user-facing copy, keep it concise and natural in Korean unless the task asks for another language.

## Key Structure
- `src/app`: App Router pages and layouts
- `src/components`: reusable UI components
- `src/lib/posts.ts`: Markdown post loading and parsing
- `src/content/posts`: blog post Markdown files with frontmatter
- `public/data/events`: Seoul event dataset rendered on event and home pages
- `public/data/benefits`: public benefit dataset rendered on benefit and home pages
- `public/data/food`: Seoul food place dataset rendered on food pages
- `scripts/generate-blog-post.js`: script for generating blog content from collected data

## Content Conventions
- Markdown posts should keep frontmatter fields aligned with `src/lib/posts.ts`:
  - `title`
  - `date`
  - `summary`
  - `category`
  - `tags`
- New blog posts must use the `.md` extension. `src/lib/posts.ts` currently loads only files ending in `.md`, so `.mdx` files will not appear unless the loader is updated too.
- Post filenames act as slugs. Do not rename existing post files unless the task explicitly requires slug changes.
- Keep date strings stable and sortable, ideally in `YYYY-MM-DD` format.

## Data and Safety Notes
- Treat `.env.local` and any API keys as sensitive. Never expose secrets in code, docs, or sample outputs.
- `scripts/fetch-seoul-events.js` and `scripts/fetch-seoul-food.js` require `SEOUL_OPEN_DATA_API_KEY`, `scripts/fetch-public-benefits.js` requires `PUBLIC_DATA_API_KEY`, and `scripts/generate-blog-post.js` requires `GEMINI_API_KEY`. Do not assume the data-generation scripts are runnable unless those environment variables are configured.
- Do not commit generated artifacts or dependency directories. Respect `.gitignore` and keep it updated if new generated output appears.
- Avoid changing `package-lock.json` unless dependency changes are necessary for the task.

## Commands
- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Lint: `npm run lint`
- Production build: `npm run build`
- Data scripts also require environment setup: `SEOUL_OPEN_DATA_API_KEY` for Seoul Open Data scripts, `PUBLIC_DATA_API_KEY` for public benefits, and `GEMINI_API_KEY` for `scripts/generate-blog-post.js`

## Agent Expectations
- Before larger changes, inspect the relevant route, component, and data source together so fixes address root cause.
- When touching content flow, verify whether the source of truth is JSON, Markdown, or a generation script before editing.
- If a task involves latest public information or policy details, verify freshness externally before updating content.

## Documentation Rules
- README is the project entry point. Keep it aligned with the current service purpose, commands, data sources, deployment flow, and document locations.
- PRDs live under `docs/prd/*_prd.md`. When product scope, target users, success criteria, or non-goals change, update the relevant PRD first.
- SRS documents live under `docs/srs/*_srs.md` and should trace requirements back to the relevant PRD sections.
- Agent-only reusable workflows live under `.agents/workflow/*_prompt.md`; keep workflow outputs out of `.omo/` and `.antigravitycli/`.
- Agent-only common rules live under `.agents/rules/*_RULES.md`.
- Product/user-facing documents live under `docs/`; do not store agent-only workflow prompts there.
- Use `.agents/workflow/prd_to_srs_prompt.md` when converting a PRD into an SRS for this project.
- Use `.agents/workflow/prd_to_srs_review_prompt.md` when reviewing whether a generated SRS satisfies its source PRD.
- Date-based work history lives under `history/YYYY-MM-DD.md`. Add new history entries only when the user asks for a work record or change summary.
- `history/README.md` should link to every dated history file.
- User-visible or release-level changes belong in `change_log.md`; do not use it for every small implementation detail.
- Data pipeline changes should be documented in a dedicated docs file, for example `docs/DATA_PIPELINE.md`, once that document exists.
- Operations and automation changes should be documented in a dedicated docs file, for example `docs/OPERATIONS.md`, once that document exists.
- Do not use `.omo/` or `.antigravitycli/` as source-of-truth documentation. Those folders are tool/session metadata.
- When updating docs, preserve concise Korean wording for user-facing explanations and avoid exposing `.env.local` values or API keys.
