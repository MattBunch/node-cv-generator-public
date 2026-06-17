import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cvForExport as cv } from "../src/data/cv.js";
import { EXPORT_DIRECTORIES, EXPORT_FILENAMES } from "../src/export/export.constants.js";
import { writeDocxExport } from "../src/export/write-exports.js";
import { renderPolishedDocxBuffer } from "../src/templates/polished/render-docx.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(root, EXPORT_DIRECTORIES.dist, EXPORT_FILENAMES.legacyDocx);

const exportDocx = async (): Promise<void> => {
  await writeDocxExport({
    docxPath: outputPath,
    renderDocxBuffer: () => renderPolishedDocxBuffer(cv)
  });

  console.log(`DOCX exported to ${outputPath}`);
};

exportDocx().catch((error: unknown) => {
  console.error("Failed to export DOCX");
  console.error(error);
  process.exitCode = 1;
});
