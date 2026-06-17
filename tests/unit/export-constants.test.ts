import { describe, expect, it } from "vitest";
import {
  EXPORT_DIRECTORIES,
  EXPORT_FILENAMES,
  EXPORT_SOURCE_PATHS,
  PDF_OPTIONS,
  PDF_VIEWPORT
} from "../../src/export/export.constants.js";

describe("export constants", () => {
  it("keeps current output paths and source paths", () => {
    expect(EXPORT_DIRECTORIES.dist).toBe("dist");
    expect(EXPORT_FILENAMES).toEqual({
      legacyPdf: "sample-cv.pdf",
      legacyDocx: "sample-cv.docx",
      legacyHtml: "sample-cv.html",
      atsPdf: "sample-cv-ats.pdf",
      atsDocx: "sample-cv-ats.docx",
      atsHtml: "sample-cv-ats.html",
      polishedPdf: "sample-cv-polished.pdf",
      polishedDocx: "sample-cv-polished.docx",
      polishedHtml: "sample-cv-polished.html",
      referencesPdf: "sample-references.pdf",
      referencesDocx: "sample-references.docx",
      referencesHtml: "sample-references.html"
    });
    expect(EXPORT_SOURCE_PATHS).toEqual({
      legacyCss: "src/templates/polished/cv.css",
      atsCss: "src/templates/ats/cv.css",
      polishedCss: "src/templates/polished/cv.css",
      referencesCss: "src/templates/references/cv.css"
    });
  });

  it("keeps current PDF rendering options", () => {
    expect(PDF_VIEWPORT).toEqual({ width: 1240, height: 1754 });
    expect(PDF_OPTIONS).toEqual({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true
    });
  });
});
