# Release checklist

## Before the first public release

- [ ] Confirm exact profile headline, project claims, role dates, and source resume wording.
- [ ] Confirm which professional project details and employer/client references may be disclosed.
- [ ] Configure `VITE_RESUME_URL` as a repository Actions variable with a direct, public-download-approved resume PDF URL; do not add the PDF to this repository.
- [ ] Confirm contact email, Timesheet AI repository/demo, and any public project links.
- [ ] Verify app-store links, client attribution, and asset permissions before adding them.
- [ ] Push to GitHub and configure Pages to use GitHub Actions.
- [ ] Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.
- [ ] Check keyboard navigation, reduced motion, mobile layout, direct profile links, and 3D case-study component selection.
- [ ] Confirm the deployed Pages URL, base path, metadata, and direct refresh behavior.
