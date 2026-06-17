import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cvForExport as cv } from "../src/data/cv.js";
import {
  EXPORT_DIRECTORIES,
  EXPORT_FILENAMES,
  EXPORT_SOURCE_PATHS
} from "../src/export/export.constants.js";
import { writeDocxExport, writePdfExport } from "../src/export/write-exports.js";
import { renderPolishedDocxBuffer } from "../src/templates/polished/render-docx.js";
import { renderPolishedHtml } from "../src/templates/polished/render-html.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, EXPORT_DIRECTORIES.dist);

const exportPolished = async (): Promise<void> => {
  const pdfPath = resolve(dist, EXPORT_FILENAMES.polishedPdf);
  const docxPath = resolve(dist, EXPORT_FILENAMES.polishedDocx);

  await writePdfExport({
    cssPath: resolve(root, EXPORT_SOURCE_PATHS.polishedCss),
    htmlPath: resolve(dist, EXPORT_FILENAMES.polishedHtml),
    pdfPath,
    renderHtml: (css) => renderPolishedHtml(cv, css)
  });
  await writeDocxExport({
    docxPath,
    renderDocxBuffer: () => renderPolishedDocxBuffer(cv)
  });

  console.log(`Polished CV exported to ${pdfPath} and ${docxPath}`);
};

exportPolished().catch((error: unknown) => {
  console.error("Failed to export polished CV");
  console.error(error);
  process.exitCode = 1;
});
