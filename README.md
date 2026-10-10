# Mohammed Sawad — Interactive Portfolio

A portfolio of work across product engineering, cloud systems, and real-time 3D. Interactive case studies bring each project’s architecture, features, and outcomes into focus.

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

The AI-rendering scene uses D_U's [Toyota Corolla model](https://sketchfab.com/3d-models/low-poly-toyota-corolla-e80-sedan-6254cf268d9b46f79dd2a6511e153891), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); it has been scaled and repositioned.

## Project layout

- `src/App.tsx` — portfolio sections and project navigation
- `src/components/CaseStudyExplorer.tsx` — interactive project, architecture, and feature explainer
- `src/components/CaseStudyMap3D.tsx` — interactive Three.js case-study map
- `src/content/case-studies.ts` — project case studies and selectable system layers
