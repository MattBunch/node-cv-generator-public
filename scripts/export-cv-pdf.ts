import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cvForExport as cv } from "../src/data/cv.js";
import {
  EXPORT_DIRECTORIES,
  EXPORT_FILENAMES,
  EXPORT_SOURCE_PATHS
} from "../src/export/export.constants.js";
import { writePdfExport } from "../src/export/write-exports.js";
import { renderPolishedHtml } from "../src/templates/polished/render-html.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(root, EXPORT_DIRECTORIES.dist, EXPORT_FILENAMES.legacyPdf);
const htmlOutputPath = resolve(root, EXPORT_DIRECTORIES.dist, EXPORT_FILENAMES.legacyHtml);
const cssPath = resolve(root, EXPORT_SOURCE_PATHS.legacyCss);

const exportPdf = async (): Promise<void> => {
  await writePdfExport({
    cssPath,
    htmlPath: htmlOutputPath,
    pdfPath: outputPath,
    renderHtml: (css) => renderPolishedHtml(cv, css)
  });

  console.log(`PDF exported to ${outputPath}`);
};

exportPdf().catch((error: unknown) => {
  console.error("Failed to export PDF");
  console.error(error);
  process.exitCode = 1;
});
