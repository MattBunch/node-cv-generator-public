import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cvForExport as cv } from "../src/data/cv.js";
import { EXPORT_DIRECTORIES } from "../src/export/export.constants.js";
import { lintCv, type CvLintIssue } from "../src/lint/cv-lint.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const printIssues = (title: string, issues: CvLintIssue[]): void => {
  console.log(`${title}: ${issues.length}`);

  for (const issue of issues) {
    console.log(`- [${issue.code}] ${issue.path}: ${issue.message}`);
  }
};

const run = (): void => {
  const result = lintCv(cv, {
    distPath: resolve(root, EXPORT_DIRECTORIES.dist),
    validateDocxPageCount: process.env.CV_VALIDATE_DOCX_PAGES !== "false"
  });

  printIssues("Errors", result.errors);
  printIssues("Warnings", result.warnings);

  if (result.errors.length > 0) {
    process.exitCode = 1;
  }
};

run();
