# Project Rules

This repo generates CV/resume documents from structured TypeScript data. Preserve the user's CV information exactly unless the task explicitly asks to rewrite, summarize, remove, reorder, or otherwise alter it.

- Do not rewrite, embellish, remove, reorder, or "improve" CV content unless the task specifically asks for content editing.
- Design and layout changes must keep the same factual information.
- Any content normalization should be limited to obvious formatting consistency unless requested otherwise.
- When unsure whether a change affects meaning, leave the content unchanged and mention it in the summary.
- Treat `src/data/cv.json` as the authoritative structured CV source unless the task states otherwise. `src/data/cv.ts` validates and exports that JSON for TypeScript callers.

# CV Export Goals

- Support PDF export.
- Support DOCX export.
- Keep content consistent between PDF and DOCX.
- Design and template changes should not cause content drift between formats.
- Use shared data, model, and types where practical so both export paths consume the same source information.

# Project Setup

- Install dependencies: `pnpm install`
- Export PDF: `pnpm cv:pdf`
- Export DOCX: `pnpm cv:docx`
- Export all formats: `pnpm cv:all`
- Run unit/component tests: `pnpm test`
- Run tests in watch mode: `pnpm test:watch`
- Run coverage: `pnpm test:coverage`
- Run export smoke tests: `pnpm test:e2e`
- Typecheck: `pnpm typecheck`
- Run the full project check: `pnpm check`

The repo does not currently provide `dev`, `build`, `lint`, or `format` scripts. Add those scripts if the repo needs them before documenting or relying on them.

# TypeScript Coding Style

- Prefer TypeScript for all implementation files.
- Always use curly braces for control structures, even for single-line bodies.
- Prefer `const` over `let`; only use `let` when reassignment is required.
- Never use `var`.
- Use explicit types at module boundaries, export boundaries, parser boundaries, and renderer/exporter boundaries.
- Avoid `any`; use `unknown` plus narrowing where needed.
- Prefer small named functions over large inline blocks.
- Prefer readable code over clever code.

# Functional TypeScript Guidance

- Prefer pure functions for data transformation, formatting, validation, section ordering, and export configuration.
- Keep functions deterministic where possible: the same input should produce the same output.
- Keep filesystem access, CLI handling, PDF generation, DOCX generation, date/time access, and other side effects at the edges.
- Separate "what to render" from "how to write the file."
- Avoid mutating CV data in place. Prefer returning new objects and arrays.
- Prefer `map`, `filter`, `reduce`, and small helper functions when they improve clarity.
- Do not force functional programming where it makes the code harder to read.
- Avoid hidden global state.
- Avoid mixing template rendering with data cleanup or business rules.
- Put reusable transformations in feature-scoped utility modules.
- Make pure functions easy to unit test.

Logic that should usually be pure includes:

- Converting CV data into a render model.
- Grouping skills or experience entries.
- Formatting dates.
- Generating section labels.
- Choosing layout variants.
- Building PDF/DOCX export options.

Side effects that should stay isolated include:

- Reading and writing files.
- Invoking PDF/DOCX libraries.
- Parsing CLI arguments.
- Logging.
- Loading environment variables.

# Constants and Encapsulation

- Put reusable constants and configuration values in feature-scoped constants files, such as `cv.constants.ts`, `export.constants.ts`, or the nearest equivalent.
- Avoid hidden magic numbers for spacing, font sizes, margins, section limits, and export settings.
- Keep template-specific constants near the template.
- Keep shared export constants in a shared module.
- Encapsulate layout calculations behind clear helper functions.

# Templates and Design

- Templates should be visually polished but conservative enough for professional CV use.
- Prioritize readability, spacing, hierarchy, ATS-friendly structure where applicable, and clean export output.
- Design changes must be checked in both PDF and DOCX outputs.
- Avoid duplicating template logic across PDF and DOCX paths when a shared render model would work better.
- Keep content and presentation separate where practical.

# Testing

- Add unit tests for pure functions, data transformation, formatting helpers, validation logic, and export configuration.
- Prefer testing the shared render model rather than duplicating tests for each output format.
- Add smoke tests for PDF and DOCX export where practical.
- Do not rely only on visual/manual testing.
- If adding a bug fix, add a regression test when practical.

# Linting and Formatting

Run the available checks after implementation:

```bash
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm check
```

Do not list lint, format, build, or dev commands as required workflow steps until the repo provides those scripts.

# Agent Workflow

- Inspect before editing.
- Make small, focused changes.
- Preserve existing behavior unless asked to change it.
- Summarize what changed.
- Mention any commands run and their results.
- Mention any commands that could not be run.
- Do not commit generated PDF/DOCX files unless the repo explicitly tracks them.
