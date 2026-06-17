import AdmZip from "adm-zip";
import { describe, expect, it } from "vitest";
import { cv } from "../../src/data/cv.js";
import { buildDocxDocument, renderDocxBuffer } from "../../src/render/render-docx.js";
import { renderAtsDocxBuffer } from "../../src/templates/ats/render-docx.js";
import { buildPolishedDocxLayoutContent } from "../../src/templates/polished/docx-layout.js";
import { renderReferencesDocxBuffer } from "../../src/templates/references/render-docx.js";
import { toCvRenderModel } from "../../src/cv/render-model.js";

const readDocumentXml = (buffer: Buffer): string => {
  const zip = new AdmZip(buffer);
  const entry = zip.getEntry("word/document.xml");

  if (!entry) {
    throw new Error("DOCX is missing word/document.xml");
  }

  return entry.getData().toString("utf8");
};

describe("renderDocx", () => {
  it("builds a DOCX document object", () => {
    const document = buildDocxDocument(cv);

    expect(document).toBeDefined();
  });

  it("renders a non-empty DOCX buffer", async () => {
    const buffer = await renderDocxBuffer(cv);

    expect(buffer.byteLength).toBeGreaterThan(1000);
    expect(buffer.subarray(0, 2).toString()).toBe("PK");
  });

  it("maps polished DOCX content into sidebar and main columns", () => {
    const layout = buildPolishedDocxLayoutContent(
      toCvRenderModel(cv, {
        documentTitle: `${cv.name} Polished CV`,
        referencesMode: "omit"
      })
    );

    expect(layout.sidebar.name).toBe("Alex Rivera");
    expect(layout.sidebar.title).toBe("Node.js Developer");
    expect(layout.sidebar.sections.map((section) => section.heading)).toEqual(["Certifications"]);
    expect(layout.main.sections.map((section) => section.heading)).toEqual([
      "Profile",
      "Technical Skills",
      "Experience",
      "Projects",
      "Education"
    ]);
  });

  it("renders the polished DOCX without a sidebar table", async () => {
    const xml = readDocumentXml(await renderDocxBuffer(cv));

    expect(xml).not.toContain("<w:tbl>");
    expect(xml).not.toContain('<w:shd w:fill="243447"');
    expect(xml).toContain("Technical Skills");
    expect(xml).toContain("Experience");
  });

  it("keeps core CV content and omits full reference contact details in polished DOCX", async () => {
    const xml = readDocumentXml(await renderDocxBuffer(cv));

    for (const expected of ["Alex Rivera", "Node.js Developer", "Northstar Sample Labs"]) {
      expect(xml).toContain(expected);
    }

    expect(xml).not.toContain("References available on request.");

    for (const forbidden of ["+64 4 555 0110", "jordan.sample@example.test", "priya.example@example.test"]) {
      expect(xml).not.toContain(forbidden);
    }
  });

  it("uses plain bullet text instead of DOCX numbering in ATS and polished DOCX", async () => {
    const atsBuffer = await renderAtsDocxBuffer(cv);
    const polishedBuffer = await renderDocxBuffer(cv);
    const atsXml = readDocumentXml(atsBuffer);
    const polishedXml = readDocumentXml(polishedBuffer);

    expect(atsXml).not.toContain("<w:numPr>");
    expect(polishedXml).not.toContain("<w:numPr>");
    expect(atsXml).toContain("- Built a TypeScript export service");
    expect(polishedXml).toContain("• Built a TypeScript export service");
    expect(atsXml).not.toContain("<w:numFmt");
    expect(polishedXml).not.toContain("<w:numFmt");
  });

  it("renders ATS and references DOCX buffers", async () => {
    const atsBuffer = await renderAtsDocxBuffer(cv);
    const referencesBuffer = await renderReferencesDocxBuffer(cv);

    expect(atsBuffer.byteLength).toBeGreaterThan(1000);
    expect(referencesBuffer.byteLength).toBeGreaterThan(1000);
    expect(atsBuffer.subarray(0, 2).toString()).toBe("PK");
    expect(referencesBuffer.subarray(0, 2).toString()).toBe("PK");
  });
});
