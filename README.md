# Node CV Generator Public

Generate sample CV and resume documents from one structured JSON data source.

The public source of truth is `src/data/cv.json`. `src/data/cv.ts` validates that JSON and exports typed CV data for the renderers. Generated files in `dist/` should not be edited by hand.

## Outputs

- ATS-safe CV for job portals:
  - `dist/sample-cv-ats.pdf`
  - `dist/sample-cv-ats.docx`
- Polished developer CV for recruiter, hiring-manager, email, and portfolio use:
  - `dist/sample-cv-polished.pdf`
  - `dist/sample-cv-polished.docx`
  - `dist/sample-cv-polished.html`
- Sample references sheet:
  - `dist/sample-references.pdf`
  - `dist/sample-references.docx`

The ATS and polished CVs omit references by default. Full reference details are only generated in the references sheet.

Legacy commands still generate:

- `dist/sample-cv.pdf`
- `dist/sample-cv.docx`

## Requirements

- Node.js
- pnpm

## Install

```sh
pnpm install
```

## Developer Onboarding

Slidev is the developer onboarding path for this repository. Start the local onboarding deck with:

```sh
pnpm onboarding
```

Build or export the deck when you need a static artifact:

```sh
pnpm onboarding:build
pnpm onboarding:pdf
```

## Generate Documents

```sh
pnpm cv:ats
pnpm cv:polished
pnpm cv:references
pnpm cv:all
```

To preview exports with local contact details merged in:

```sh
pnpm cv:ats:local
pnpm cv:polished:local
pnpm cv:references:local
pnpm cv:all:local
```

Local-contact commands write to the same `dist/` filenames as the public commands. They merge `src/data/contact.local.json` into the rendered outputs, including email, phone, links, and location. Do not commit local-contact generated files if they contain private details; rerun `pnpm cv:all` to restore sample outputs.

Compatibility commands:

```sh
pnpm cv:pdf
pnpm cv:docx
pnpm cv:pdf:local
pnpm cv:docx:local
```

## Lint, Test, And Check

```sh
pnpm cv:lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm check
```

`pnpm cv:lint` reports CV quality warnings and hard errors. Warnings do not fail the command. Errors fail the command.

## Editing CV Content

Edit public sample CV content in `src/data/cv.json`. PDF and DOCX exports use that same validated data source.

Keep private local overrides in `src/data/contact.local.json`. That file is ignored by Git. Use `src/data/contact.local.example.json` as the shape reference. If the local file is missing, local-contact exports still run and render no contact details.

Application CV reference behavior is controlled by `outputOptions.references.applicationMode` in `src/data/cv.json`:

- `omit` excludes References from ATS and polished CVs.
- `request` renders only `References available on request.` in ATS and polished CVs.

The separate references export always renders full reference details.

Projects are structured as:

```ts
{
  name: string;
  url?: string;
  technologies: string[];
  bullets: string[];
}
```

## Public Sample Data

This repository uses fictional sample CV data. It does not include a private source CV or real reference contact details.
