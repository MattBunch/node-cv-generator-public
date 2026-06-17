import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { chromium } from "playwright";
import { PDF_OPTIONS, PDF_VIEWPORT } from "./export.constants.js";

export type PdfExportOptions = {
  cssPath: string;
  htmlPath: string;
  pdfPath: string;
  renderHtml: (css: string) => string;
};

export type DocxExportOptions = {
  docxPath: string;
  renderDocxBuffer: () => Promise<Buffer>;
};

export const writePdfExport = async (options: PdfExportOptions): Promise<void> => {
  const css = await readFile(options.cssPath, "utf8");
  const html = options.renderHtml(css);

  await mkdir(dirname(options.pdfPath), { recursive: true });
  await writeFile(options.htmlPath, html, "utf8");

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: PDF_VIEWPORT });
    await page.setContent(html, { waitUntil: "load" });
    await page.pdf({
      path: options.pdfPath,
      ...PDF_OPTIONS
    });
  } finally {
    await browser.close();
  }
};

export const writeDocxExport = async (options: DocxExportOptions): Promise<void> => {
  await mkdir(dirname(options.docxPath), { recursive: true });
  const buffer = await options.renderDocxBuffer();
  await writeFile(options.docxPath, buffer);
};
