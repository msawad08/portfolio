# Mohammed Sawad — Interactive Portfolio

A responsive portfolio built with Vite, React, TypeScript, and Three.js. Interactive 3D case-study maps let readers orbit a project’s system areas and select components to explore resume-backed features, contributions, and outcomes. The site explains professional work rather than imitating an employer product.

## Requirements

- Node.js 22 or newer
- npm

## Local development

```sh
npm ci
npm run dev
```

## Quality checks

```sh
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Run `npm run format` to format the maintained application, configuration, and documentation files.

`npm run preview` serves the production build locally.

## GitHub Pages deployment

The workflow in `.github/workflows/deploy.yml` runs lint, type checks, tests, and a production build for pull requests and pushes. A push to the repository's default branch also deploys the build to GitHub Pages.

1. Push this project to the GitHub repository that should host the site.
2. In **Settings → Pages**, set the build and deployment source to **GitHub Actions**.
3. Ensure Actions are allowed to read repository contents and deploy Pages.
4. Push to the default branch; the workflow publishes the site.

The Vite base path is selected from the GitHub Actions repository context: project sites use `/<repository>/`, while a `<user>.github.io` site uses `/`. No custom domain is assumed; configure one in GitHub Pages if desired.

To enable the **Download Resume** link without storing a resume PDF in Git, add a repository Actions variable named `VITE_RESUME_URL` with the direct URL to a publicly downloadable PDF. The workflow includes the link only when that variable is set. The file must be hosted separately and approved for public access; for cross-origin downloads, configure its host to serve it as an attachment.

## Content and privacy

The supplied resume is the source for the initial project selection, experience timeline, and supported metrics. The source resume and original portfolio plan are excluded from Git. No resume file is stored in or deployed from this repository.

Timesheet AI details, direct email, older role dates, employer/client permissions, and any project-specific media must be verified before they are added. Unsupported facts are intentionally marked as pending in the UI. See [`docs/content-sources.md`](docs/content-sources.md), [`docs/asset-licenses.md`](docs/asset-licenses.md), and [`docs/release-checklist.md`](docs/release-checklist.md).

## Project layout

- `src/App.tsx` — portfolio sections and project navigation
- `src/components/CaseStudyExplorer.tsx` — interactive project, architecture, and feature explainer
- `src/components/CaseStudyMap3D.tsx` — interactive Three.js case-study map
- `src/content/case-studies.ts` — resume-backed case study copy and selectable system layers
- `docs/` — claim sources, asset provenance, and release checks
- `.github/workflows/deploy.yml` — CI and GitHub Pages deployment

## Deployment limits

This workspace is not connected to a Git repository or remote, so deployment cannot be triggered from here. The Actions workflow is ready once the repository is pushed and Pages is configured.
