# Biogas-Production-Simulator

## GitHub Pages

This repo deploys the Vue+Vite app (`apps/simulator-vue`) to GitHub Pages via GitHub Actions.

- Workflow: `.github/workflows/pages.yml`
- Trigger: pushes to `develop` (and `main`) or manual `workflow_dispatch`
- CI steps: `npm ci` -> `npm test` (core Vitest) -> `npm run build --workspace=apps/simulator-vue`
- Deploy artifact: `apps/simulator-vue/dist`
- Custom domain: if a root `CNAME` file exists (e.g. `bslab.tech`), the workflow copies it into the deployed artifact.
