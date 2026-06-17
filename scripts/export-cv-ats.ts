import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cvForExport as cv } from "../src/data/cv.js";
import {
  EXPORT_DIRECTORIES,
  EXPORT_FILENAMES,
  EXPORT_SOURCE_PATHS
} from "../src/export/export.constants.js";
import { writeDocxExport, writePdfExport } from "../src/export/write-exports.js";
import { renderAtsDocxBuffer } from "../src/templates/ats/render-docx.js";
import { renderAtsHtml } from "../src/templates/ats/render-html.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, EXPORT_DIRECTORIES.dist);

const exportAts = async (): Promise<void> => {
  const pdfPath = resolve(dist, EXPORT_FILENAMES.atsPdf);
  const docxPath = resolve(dist, EXPORT_FILENAMES.atsDocx);

  await writePdfExport({
    cssPath: resolve(root, EXPORT_SOURCE_PATHS.atsCss),
    htmlPath: resolve(dist, EXPORT_FILENAMES.atsHtml),
    pdfPath,
    renderHtml: (css) => renderAtsHtml(cv, css)
  });
  await writeDocxExport({
    docxPath,
    renderDocxBuffer: () => renderAtsDocxBuffer(cv)
  });

  console.log(`ATS CV exported to ${pdfPath} and ${docxPath}`);
};

exportAts().catch((error: unknown) => {
  console.error("Failed to export ATS CV");
  console.error(error);
  process.exitCode = 1;
});
