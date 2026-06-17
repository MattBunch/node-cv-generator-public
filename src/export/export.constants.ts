export const EXPORT_FILENAMES = {
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
} as const;

export const EXPORT_DIRECTORIES = {
  dist: "dist"
} as const;

export const EXPORT_SOURCE_PATHS = {
  legacyCss: "src/templates/polished/cv.css",
  atsCss: "src/templates/ats/cv.css",
  polishedCss: "src/templates/polished/cv.css",
  referencesCss: "src/templates/references/cv.css"
} as const;

export const PDF_VIEWPORT = {
  width: 1240,
  height: 1754
} as const;

export const PDF_OPTIONS = {
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true
} as const;
