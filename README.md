# Story Spine

A writing tool for the Story Spine by Kenn Adams. Switch between the shortened and full-length checklists, then turn on Writing mode to draft each beat. Drafts stay in this browser through IndexedDB.

Pushing `main` builds the Vite+ app and deploys it to GitHub Pages at [https://tamb.github.io/story-spine/](https://tamb.github.io/story-spine/). In the repository settings, set Pages to **GitHub Actions** before the first deploy.

```bash
pnpm install
pnpm exec vp dev
pnpm exec vp check
pnpm exec vp test
pnpm exec vp build
```
