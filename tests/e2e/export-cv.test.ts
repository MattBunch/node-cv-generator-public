import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";
import AdmZip from "adm-zip";

const execFileAsync = promisify(execFile);
const root = resolve(new URL("../..", import.meta.url).pathname);

const outputs = {
  atsPdf: resolve(root, "dist/sample-cv-ats.pdf"),
  atsDocx: resolve(root, "dist/sample-cv-ats.docx"),
  polishedPdf: resolve(root, "dist/sample-cv-polished.pdf"),
  polishedDocx: resolve(root, "dist/sample-cv-polished.docx"),
  referencesPdf: resolve(root, "dist/sample-references.pdf"),
  referencesDocx: resolve(root, "dist/sample-references.docx")
} as const;

const assert = (condition: unknown, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const commandExists = async (command: string): Promise<boolean> => {
  try {
    await execFileAsync("which", [command]);
    return true;
  } catch {
    return false;
  }
};

const readDocxText = async (path: string): Promise<string> => {
  const buffer = await readFile(path);
  const zip = new AdmZip(buffer);
  const entry = zip.getEntry("word/document.xml");

  if (!entry) {
    throw new Error("DOCX is missing word/document.xml");
  }

  return entry.getData().toString("utf8");
};

const decodeXmlText = (text: string): string =>
  text
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const readDocxPlainText = async (path: string): Promise<string> =>
  [...(await readDocxText(path)).matchAll(/<w:t(?: [^>]*)?>(.*?)<\/w:t>/g)]
    .map((match) => decodeXmlText(match[1] ?? ""))
    .join("\n");

const assertGenerated = async (path: string): Promise<void> => {
  assert(existsSync(path), `Output was not generated: ${path}`);
  assert((await stat(path)).size > 1000, `Output is unexpectedly small: ${path}`);
};

const assertContainsCoreCvText = (text: string, label: string): void => {
  for (const expected of ["Alex Rivera", "Node.js Developer", "Northstar Sample Labs"]) {
    assert(text.includes(expected), `${label} is missing: ${expected}`);
  }
};

const assertDoesNotContainReferenceContacts = (text: string, label: string): void => {
  for (const forbidden of ["+64 4 555 0110", "jordan.sample@example.test", "priya.example@example.test"]) {
    assert(!text.includes(forbidden), `${label} leaked reference contact detail: ${forbidden}`);
  }
};

const assertDoesNotContainApplicationReferences = (text: string, label: string): void => {
  assert(!text.includes("References available on request"), `${label} includes application references note`);
  assert(!text.includes("Jordan Sample"), `${label} includes full reference section`);
};

const assertIncludesText = (text: string, expected: string, message: string): void => {
  assert(text.toLowerCase().includes(expected.toLowerCase()), message);
};

const assertProjectsBeforeEducation = (text: string, label: string): void => {
  const normalizedText = text.toLowerCase();
  const projectsIndex = normalizedText.indexOf("projects");
  const educationIndex = normalizedText.indexOf("education");

  assert(projectsIndex >= 0, `${label} is missing Projects`);
  assert(educationIndex >= 0, `${label} is missing Education`);
  assert(projectsIndex < educationIndex, `${label} renders Projects after Education`);
};

const assertNoNumberedListArtifacts = (text: string, label: string): void => {
  const numberedArtifacts = text.match(/(?:^|\n)\s*1\.\s+/g) ?? [];
  assert(numberedArtifacts.length <= 1, `${label} contains repeated numbered-list artifacts`);
};

const readPdfPageCount = async (path: string): Promise<number | undefined> => {
  if (!(await commandExists("pdfinfo"))) {
    return undefined;
  }

  const output = (await execFileAsync("pdfinfo", [path])).stdout;
  const pages = /^Pages:\s+(\d+)$/m.exec(output)?.[1];
  return pages ? Number.parseInt(pages, 10) : undefined;
};

const run = async (): Promise<void> => {
  await execFileAsync("pnpm", ["cv:all"], { cwd: root });

  for (const path of Object.values(outputs)) {
    await assertGenerated(path);
  }

  const atsDocxText = await readDocxText(outputs.atsDocx);
  const polishedDocxText = await readDocxText(outputs.polishedDocx);
  const atsDocxPlainText = await readDocxPlainText(outputs.atsDocx);
  const polishedDocxPlainText = await readDocxPlainText(outputs.polishedDocx);
  const referencesDocxText = await readDocxText(outputs.referencesDocx);

  assertContainsCoreCvText(atsDocxText, "ATS DOCX");
  assertContainsCoreCvText(polishedDocxText, "polished DOCX");
  assertProjectsBeforeEducation(atsDocxPlainText, "ATS DOCX");
  assertProjectsBeforeEducation(polishedDocxPlainText, "polished DOCX");
  assertNoNumberedListArtifacts(atsDocxPlainText, "ATS DOCX");
  assertNoNumberedListArtifacts(polishedDocxPlainText, "polished DOCX");
  assert(!polishedDocxText.includes("<w:numPr>"), "polished DOCX uses Word numbering");
  assert(referencesDocxText.includes("Jordan Sample"), "References DOCX is missing reference data");
  assert(referencesDocxText.includes("jordan.sample@example.test"), "References DOCX is missing email");
  assertDoesNotContainApplicationReferences(atsDocxText, "ATS DOCX");
  assertDoesNotContainApplicationReferences(polishedDocxText, "polished DOCX");
  assertDoesNotContainReferenceContacts(atsDocxText, "ATS DOCX");
  assertDoesNotContainReferenceContacts(polishedDocxText, "polished DOCX");

  if (await commandExists("pdftotext")) {
    const polishedPdfPageCount = await readPdfPageCount(outputs.polishedPdf);
    assert(
      polishedPdfPageCount === undefined || polishedPdfPageCount === 1,
      `polished PDF should be one page; found ${polishedPdfPageCount}`
    );

    const atsPdfText = (await execFileAsync("pdftotext", [outputs.atsPdf, "-"])).stdout;
    const polishedPdfText = (await execFileAsync("pdftotext", [outputs.polishedPdf, "-"])).stdout;
    const polishedPdfPageOneText = (
      await execFileAsync("pdftotext", ["-layout", "-f", "1", "-l", "1", outputs.polishedPdf, "-"])
    ).stdout;
    const referencesPdfText = (await execFileAsync("pdftotext", [outputs.referencesPdf, "-"])).stdout;

    assertContainsCoreCvText(atsPdfText, "ATS PDF");
    assertContainsCoreCvText(polishedPdfText, "polished PDF");
    assert(referencesPdfText.includes("Jordan Sample"), "References PDF is missing reference data");
    assert(referencesPdfText.includes("jordan.sample@example.test"), "References PDF is missing email");
    assertDoesNotContainApplicationReferences(atsPdfText, "ATS PDF");
    assertDoesNotContainApplicationReferences(polishedPdfText, "polished PDF");
    assertDoesNotContainReferenceContacts(atsPdfText, "ATS PDF");
    assertDoesNotContainReferenceContacts(polishedPdfText, "polished PDF");
    assertProjectsBeforeEducation(polishedPdfText, "polished PDF");

    for (const expected of [
      "Profile",
      "Technical Skills",
      "Experience",
      "Projects",
      "Education",
      "Node.js Developer",
      "Northstar Sample Labs"
    ]) {
      assertIncludesText(polishedPdfPageOneText, expected, `polished PDF page 1 is missing: ${expected}`);
    }
  } else {
    console.warn("Skipping PDF text extraction check because pdftotext is unavailable");
  }

  console.log("E2E export checks passed");
};

run().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
