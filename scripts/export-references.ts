import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cvForExport as cv } from "../src/data/cv.js";
import {
  EXPORT_DIRECTORIES,
  EXPORT_FILENAMES,
  EXPORT_SOURCE_PATHS
} from "../src/export/export.constants.js";
import { writeDocxExport, writePdfExport } from "../src/export/write-exports.js";
import { renderReferencesDocxBuffer } from "../src/templates/references/render-docx.js";
import { renderReferencesHtml } from "../src/templates/references/render-html.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, EXPORT_DIRECTORIES.dist);

const exportReferences = async (): Promise<void> => {
  const pdfPath = resolve(dist, EXPORT_FILENAMES.referencesPdf);
  const docxPath = resolve(dist, EXPORT_FILENAMES.referencesDocx);

  await writePdfExport({
    cssPath: resolve(root, EXPORT_SOURCE_PATHS.referencesCss),
    htmlPath: resolve(dist, EXPORT_FILENAMES.referencesHtml),
    pdfPath,
    renderHtml: (css) => renderReferencesHtml(cv, css)
  });
  await writeDocxExport({
    docxPath,
    renderDocxBuffer: () => renderReferencesDocxBuffer(cv)
  });

  console.log(`References exported to ${pdfPath} and ${docxPath}`);
};

exportReferences().catch((error: unknown) => {
  console.error("Failed to export references");
  console.error(error);
  process.exitCode = 1;
});
