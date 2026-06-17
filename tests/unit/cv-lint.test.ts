import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { Packer } from "docx";
import { cv } from "../../src/data/cv.js";
import { lintCv } from "../../src/lint/cv-lint.js";
import { buildAtsDocxDocument } from "../../src/templates/ats/render-docx.js";
import { renderAtsHtml } from "../../src/templates/ats/render-html.js";
import { buildPolishedDocxDocument } from "../../src/templates/polished/render-docx.js";
import { renderPolishedHtml } from "../../src/templates/polished/render-html.js";

const writeFixtureOutputs = async (): Promise<string> => {
  const distPath = resolve(tmpdir(), `cv-lint-${randomUUID()}`);
  mkdirSync(distPath, { recursive: true });

  writeFileSync(resolve(distPath, "sample-cv-ats.pdf"), "pdf");
  writeFileSync(resolve(distPath, "sample-cv-polished.pdf"), "pdf");
  writeFileSync(resolve(distPath, "sample-references.pdf"), "pdf");
  writeFileSync(resolve(distPath, "sample-cv-ats.html"), renderAtsHtml(cv, ""));
  writeFileSync(resolve(distPath, "sample-cv-polished.html"), renderPolishedHtml(cv, ""));
  writeFileSync(resolve(distPath, "sample-cv-ats.docx"), await Packer.toBuffer(buildAtsDocxDocument(cv)));
  writeFileSync(
    resolve(distPath, "sample-cv-polished.docx"),
    await Packer.toBuffer(buildPolishedDocxDocument(cv))
  );
  writeFileSync(resolve(distPath, "sample-references.docx"), "docx");

  return distPath;
};

describe("lintCv", () => {
  it("accepts the sample CV without generated output errors", async () => {
    const result = lintCv(cv, { distPath: await writeFixtureOutputs() });

    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it("reports missing generated outputs as errors", () => {
    const result = lintCv(cv, { distPath: resolve(tmpdir(), `missing-${randomUUID()}`) });

    expect(result.errors.map((issue) => issue.code)).toContain("output.missing");
  });

  it("reports ATS forbidden layout and reference leakage", async () => {
    const distPath = await writeFixtureOutputs();
    writeFileSync(
      resolve(distPath, "sample-cv-ats.html"),
      '<main class="two-column">jordan.sample@example.test</main>'
    );

    const result = lintCv(cv, { distPath });

    expect(result.errors.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["ats.html.forbidden-layout", "references.leak"])
    );
  });
});
