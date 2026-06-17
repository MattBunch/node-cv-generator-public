# Content Parity

This public repository uses fictional sample CV content rather than a private source CV.

The project still keeps parity between output formats by rendering ATS, polished, and references documents from the same structured data source at `src/data/cv.json`.

## Current Checks

- `pnpm test` covers shared render-model behavior, HTML rendering, DOCX rendering, validation, and export constants.
- `pnpm test:e2e` regenerates PDF and DOCX exports and checks for expected sample text.
- `pnpm cv:validate` checks generated outputs for required headings and reference leakage in application CVs.
