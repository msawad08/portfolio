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

## Content and privacy

The AI-rendering scene uses D_U's [Toyota Corolla model](https://sketchfab.com/3d-models/low-poly-toyota-corolla-e80-sedan-6254cf268d9b46f79dd2a6511e153891), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); it has been scaled and repositioned. The supplied camera and Eiffel Tower models have no license metadata, so confirm redistribution rights before public use.

## Project layout

- `src/App.tsx` — portfolio sections and project navigation
- `src/components/CaseStudyExplorer.tsx` — interactive project, architecture, and feature explainer
- `src/components/CaseStudyMap3D.tsx` — interactive Three.js case-study map
- `src/content/case-studies.ts` — resume-backed case study copy and selectable system layers
