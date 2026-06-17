# DOCX Layout Research Spike

## Current repository state

- The project declares `docx` as `^9.5.0` in `package.json`.
- The installed and locked version is `docx@9.7.1` in `pnpm-lock.yaml` and `node_modules/docx/package.json`.
- The current default DOCX export entry point is `scripts/export-cv-docx.ts`.
- The public renderer at `src/render/render-docx.ts` delegates to the polished DOCX renderer.
- PDF and DOCX generation share the same validated CV data path: `src/data/cv.json` is parsed by `src/data/cv.ts` and transformed through the shared render model in `src/cv/render-model.ts`.

## Package support

The `docx` package is still a viable package for a modern editable DOCX spike. Its generated TypeScript declarations and public API documentation show support for the main layout primitives needed for comparison prototypes.

| Feature | Support | Notes |
| --- | --- | --- |
| Sections | Supported | `Document` accepts `sections`, and section properties are available. |
| Section margins | Supported | `properties.page.margin` accepts top, right, bottom, left, header, footer, and gutter values. |
| Word columns | Supported | Section properties accept `column`, and the package exposes `Column`, `ColumnBreak`, and column attributes. Use only for comparison because Word columns flow content sequentially rather than maintaining a persistent sidebar. |
| Tables | Supported | `Table`, `TableRow`, `TableCell`, fixed layout, table widths, borders, margins, and alignment are available. |
| Table cell widths | Supported | `Table.columnWidths` and `TableCell.width` support fixed twip widths. |
| Cell shading/backgrounds | Supported | `TableCell.shading` and paragraph/table shading are available. Use `ShadingType.CLEAR` with explicit fill colors. |
| Floating text boxes | Supported but risky | `Textbox` is available and emits VML textbox markup. This is editable in Word-like tools, but VML/floating behavior is more fragile across importers. |
| Page backgrounds | Supported | `Document` accepts `background`, but page-level color is not a good substitute for a stable sidebar because import behavior varies. |
| Headers/footers | Supported | Section options accept default, first, and even headers/footers. Not needed for the split-page prototype unless future designs need repeating page metadata. |
| Reusable TS layout components | Supported in repo | The spike adds reusable helpers under `src/docx/layout/` so production promotion can reuse the table approach without copying prototype code. |

References:

- `docx` API module overview: https://docx.js.org/api/modules.html
- `ITableOptions`: https://docx.js.org/api/types/ITableOptions.html
- `Columns`: https://docx.js.org/api/classes/Columns.html

## Prototypes

Generated with:

```bash
pnpm docx:prototype
```

Outputs:

- `output/prototypes/cv-table-layout.docx`
- `output/prototypes/cv-section-columns.docx`
- `output/prototypes/cv-textbox-layout.docx`

Validation performed:

- `pnpm typecheck` passed.
- `pnpm docx:prototype` generated all three files.
- XML inspection confirmed the table prototype contains table/grid/cell-width/shading markup.
- XML inspection confirmed the columns prototype contains section column markup and a column break.
- XML inspection confirmed the textbox prototype contains VML textbox markup.

## Recommended strategy

Use a borderless fixed-width table for the production split-page CV design.

Reasons:

- It produces editable DOCX content using ordinary Word table structures.
- Fixed table and cell widths give the sidebar/main layout a clearer page geometry than flowing Word columns.
- Cell shading gives the left sidebar a stable background without relying on page backgrounds or floating shapes.
- It is easier to generate from a shared render model and easier to test by inspecting `word/document.xml`.
- It should be easier for a user to edit than floating text boxes.

The recommended production shape is:

- A4 page with narrow margins.
- One borderless fixed-layout table spanning the writable page width.
- One row with two cells: shaded sidebar and plain main column.
- Sidebar cell for contact details, skills, links, certifications, and compact metadata.
- Main cell for profile, experience, projects, and education.
- Shared theme object for page dimensions, widths, colors, spacing, and text styles.

## Risks and limitations

- A single-row table can split across pages, but background continuation and row/page-break behavior still need manual review in target editors.
- Word columns are not a true sidebar layout. They flow from one column to the next and are likely unsuitable for production CV structure.
- Floating text boxes use VML markup and can be harder to edit, select, import, and convert reliably. Keep them experimental unless manual compatibility testing proves otherwise.
- Page backgrounds are document-level color settings, not a reliable way to create a sidebar region.
- Google Docs import may alter precise table widths, spacing, font substitutions, or textbox positioning.
- LibreOffice may preserve core table content but can differ in pagination and VML/floating object behavior.
- DOCX-to-PDF compatibility depends on the conversion engine, not just the DOCX file. It was not tested in this spike.

## Compatibility notes

| Target | Status | Notes |
| --- | --- | --- |
| Microsoft Word | Not tested manually | Expected to handle the table prototype best because it uses ordinary Word table markup. Manual review still required for pagination, editability, and sidebar shading across page breaks. |
| LibreOffice | Not tested manually | Expected to open table and section-column prototypes. Manual review needed for pagination and textbox behavior. |
| Google Docs import | Not tested manually | Table layout should be the first candidate to test. Textbox layout is the highest risk for import changes. |
| DOCX-to-PDF conversion | Not tested | The repo currently exports PDF through HTML/Playwright, not DOCX-to-PDF conversion. |

## Production promotion

The table layout has been promoted into the polished/default DOCX renderer. `pnpm cv:docx` and the polished DOCX generated by `pnpm cv:polished` now use the split-page table format.

The promoted renderer:

- Uses the shared CV render model and does not introduce placeholder production content.
- Places name, title, skills, and other available compact sidebar data in the left shaded column.
- Places profile, work, projects when present, education, and the references request note in the right column.
- Keeps ATS DOCX, references DOCX, and PDF/HTML exports unchanged.
- Includes component coverage that inspects generated DOCX XML for fixed table widths, sidebar shading, expected source CV strings, and omitted full reference contact details.

Remaining follow-up:

- Manually validate the generated polished DOCX in Microsoft Word and LibreOffice before treating cross-editor compatibility as confirmed.
- Treat Google Docs import as best-effort compatibility unless it becomes a stated target with manual acceptance criteria.
