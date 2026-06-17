---
theme: default
title: CV Generator Developer Onboarding
info: Developer onboarding for the Node CV Generator Public repository.
class: text-left
transition: fade
mdc: true
fonts:
  sans: Inter
  mono: JetBrains Mono
defaults:
  layout: default
---

<style>
:root {
  --slidev-theme-primary: #25636f;
  --cv-muted: #52616b;
  --cv-border: #d8e0e4;
  --cv-surface: #f7fafb;
}

.slidev-layout {
  color: #17252b;
  font-size: 1rem;
  line-height: 1.45;
}

.slidev-layout h1 {
  color: #14343c;
  font-weight: 700;
  letter-spacing: 0;
}

.slidev-layout h2 {
  color: #1d4650;
  font-weight: 650;
  letter-spacing: 0;
}

.slidev-layout ul {
  color: #243941;
}

.slidev-layout li + li {
  margin-top: 0.35rem;
}

.slidev-layout code {
  color: #12343b;
  background: #edf4f6;
  border: 1px solid var(--cv-border);
  border-radius: 4px;
  padding: 0.05rem 0.25rem;
}

.slidev-layout pre code {
  border: 0;
  background: transparent;
}

.deck-note {
  color: var(--cv-muted);
  border-left: 4px solid var(--slidev-theme-primary);
  padding-left: 1rem;
}

.pipeline {
  display: grid;
  gap: 0.5rem;
  margin-top: 1rem;
}

.pipeline div {
  background: var(--cv-surface);
  border: 1px solid var(--cv-border);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
}

.compact-list li {
  margin-top: 0.2rem;
}
</style>

# CV Generator Developer Onboarding

Developer map for maintaining the public CV export pipeline.

<p class="deck-note">
Use this deck to understand the data boundary, renderer flow, output contracts, and safe contribution path before changing CV generation behavior.
</p>

---

# What This Repository Does

- Generates sample CV and resume documents from one structured JSON data source.
- Produces application CVs for ATS and polished review workflows.
- Produces a separate references sheet.
- Keeps PDF, DOCX, and generated HTML aligned through shared data and renderer modules.
- Treats files in `dist/` as generated outputs; do not edit them by hand.

---

# Single Source Of Truth

- Public CV content lives in `src/data/cv.json`.
- `src/data/cv.schema.ts` defines the Zod schema for the source shape.
- `src/data/cv.ts` parses JSON through `cvDataSchema.parse(...)`.
- TypeScript callers import typed data from `src/data/cv.ts`, not from ad hoc JSON reads.
- Templates should render existing data; they should not rewrite or normalize CV meaning.

```ts
export const cv = cvDataSchema.parse(cvJson);
```

---

# Data Boundary

`src/data/cv.ts` exports three useful boundaries:

- `cv`: parsed public sample data.
- `cvWithLocalContact`: public data plus optional ignored local contact details.
- `cvForExport`: the export-facing data object selected by environment flags.

Environment flags:

- `CV_INCLUDE_LOCAL_CONTACT=true` merges `src/data/contact.local.json`.
- `CV_USE_CI_FIXTURE_DATA=true` fills missing personal fields for CI export checks.

---

# Public Versus Local Contact

- This public repository uses fictional sample data.
- Private local overrides belong in ignored `src/data/contact.local.json`.
- `src/data/contact.local.example.json` documents the local shape.
- Local-contact commands write to the same `dist/` filenames as public commands.
- After local previews, rerun public export commands before committing generated files.

<p class="deck-note">
Do not add private email, phone, location, links, or reference contact details to tracked source or generated artifacts.
</p>

---

# Output Contract

Application CVs:

- ATS: plain structure for job portals.
- Polished: professional layout for recruiters, hiring managers, email, and portfolio use.
- References are omitted by default from ATS and polished outputs.

References sheet:

- Separate export path.
- Renders full reference details from the same source data.

Generated formats:

- PDF through Playwright-backed HTML rendering.
- DOCX through `docx`.
- HTML as intermediate/generated output for export and validation.

---

# Generation Pipeline

<div class="pipeline">
  <div><code>src/data/cv.json</code></div>
  <div><code>cvDataSchema.parse(...)</code> in <code>src/data/cv.ts</code></div>
  <div>Optional local or CI fixture overlay</div>
  <div>Shared render model in <code>src/cv/render-model.ts</code></div>
  <div>Template renderers in <code>src/templates/{ats,polished,references}</code></div>
  <div><code>writePdfExport</code> and <code>writeDocxExport</code></div>
  <div>Generated files in <code>dist/</code></div>
</div>

---

# Renderer Responsibilities

- Shared render model prepares display-ready sections and labels.
- Section ordering comes from `src/cv/section-order.ts`.
- HTML renderers escape text and compose template-specific markup.
- DOCX renderers build document buffers without changing CV content.
- PDF exports render template HTML with CSS and print to A4.
- Export constants centralize filenames, source CSS paths, output directory, and PDF settings.

---

# Repository Map

- `src/data/`: source JSON, schema, local contact loader, CI fixture overlay.
- `src/cv/`: pure formatting, validation, section ordering, render-model helpers.
- `src/templates/`: ATS, polished, and references HTML/DOCX renderers.
- `src/export/`: export constants and file-writing helpers.
- `scripts/`: CLI entrypoints for CV generation and linting.
- `tests/`: unit, component, and export smoke coverage.
- `docs/`: supporting developer notes and this onboarding deck.

---

# Common Commands

```sh
pnpm install
pnpm cv:ats
pnpm cv:polished
pnpm cv:references
pnpm cv:all
pnpm cv:lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm check
```

Local-contact previews:

```sh
pnpm cv:ats:local
pnpm cv:polished:local
pnpm cv:references:local
pnpm cv:all:local
```

---

# Onboarding Deck Commands

```sh
pnpm onboarding
pnpm onboarding:build
pnpm onboarding:pdf
```

- `onboarding` starts the interactive Slidev deck.
- `onboarding:build` verifies static deck generation.
- `onboarding:pdf` exports a local PDF artifact.
- Generated deck artifacts are ignored by Git.

---

# Testing And Validation

- `pnpm typecheck` checks TypeScript boundaries.
- `pnpm test` covers schema, render model, HTML, DOCX, validation, and constants.
- `pnpm test:e2e` regenerates exports and checks PDF/DOCX expectations.
- `pnpm cv:validate` checks source quality, output presence, heading requirements, reference leakage, section order, and page constraints.
- `pnpm check` is the all-up local validation path.

---

# Safe Contribution Workflow

1. Inspect the existing source and tests before editing.
2. Change data, render model, templates, or export scripts at the correct boundary.
3. Keep factual CV content unchanged unless the task explicitly asks for content edits.
4. Add or update focused tests for behavior changes.
5. Regenerate outputs when export behavior changes.
6. Run the relevant commands, then `pnpm check`.
7. Confirm local/private contact details are not present in tracked source or generated artifacts.

---

# Contribution Guardrails

- Prefer shared render-model changes over duplicating template logic.
- Keep ATS output simple: no sidebars, icons, tables, images, or decorative layout markers.
- Keep polished output restrained and readable.
- Keep references out of application CVs unless `applicationMode` requests a note.
- Do not commit generated local-contact previews.
- Do not document commands that do not exist in `package.json`.

---

# Before You Open A PR

- Review the diff for unintended CV content changes.
- Check generated outputs if rendering changed.
- Confirm `dist/*.html` and onboarding build artifacts stay untracked.
- Mention commands run and any commands that could not be run.
- Call out any validation warnings separately from hard failures.
