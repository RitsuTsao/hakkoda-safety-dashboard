# Handoff Notes for Future Codex Sessions

If a new conversation starts, read these files first:

1. `README.md`
2. `docs/project-brief.md`
3. `docs/data-sources.md`
4. `docs/implementation-plan.md`

## Current State

This repo is an initial handoff skeleton. It should become a GitHub Pages PWA with a scheduled GitHub Actions update job.

## Important Decisions Already Made

- Use GitHub-first deployment for MVP.
- Avoid Cloudflare until the first working version exists.
- Treat the dashboard as risk decision support, not emergency alert replacement.
- Organize dashboard content by region: Hakodate, Aomori, Iwate.
- Put Kumamap in the dashboard as a manual link first; do not scrape it yet.
- Keep public repo privacy in mind.

## Suggested Next Conversation Prompt

Continue this project from the repo. Please read `README.md`, `docs/project-brief.md`, `docs/data-sources.md`, and `docs/implementation-plan.md`, then build the first working PWA dashboard and GitHub Actions scheduled updater.
