import { describe, expect, it } from "vitest";
import { cv, type CvData } from "../../src/data/cv.js";
import {
  buildContactLines,
  buildRoleSubtitle,
  hasRenderableItems,
  toCvRenderModel
} from "../../src/cv/render-model.js";

describe("toCvRenderModel", () => {
  it("builds display-ready metadata without changing CV content", () => {
    const model = toCvRenderModel(cv);

    expect(model.name).toBe("Alex Rivera");
    expect(model.title).toBe("Node.js Developer");
    expect(model.documentTitle).toBe("Alex Rivera CV");
    expect(model.eyebrow).toBe("Curriculum Vitae");
    expect(model.contactLines).toEqual([
      "Email: alex.rivera@example.test",
      "Phone: +64 4 555 0101",
      "Location: Wellington, New Zealand",
      "LinkedIn: linkedin.com/in/alex-rivera-sample",
      "GitHub: github.com/example/alex-rivera-cv",
      "Portfolio: alex-rivera.example.test"
    ]);
  });

  it("keeps current section order and skips empty optional sections", () => {
    const model = toCvRenderModel(cv);

    expect(model.sections.map((section) => section.id)).toEqual([
      "profile",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications",
      "references"
    ]);
  });

  it("builds role display fields from existing source text", () => {
    const model = toCvRenderModel(cv);
    const experience = model.sections.find((section) => section.id === "experience");

    expect(experience?.id).toBe("experience");
    if (experience?.id !== "experience") {
      throw new Error("Expected experience section");
    }

    expect(experience.roles[0]).toMatchObject({
      title: "Node.js Developer",
      employer: "Northstar Sample Labs",
      date: "Mar 2021 - Present",
      subtitle: "Northstar Sample Labs | Mar 2021 - Present"
    });
  });

  it("includes optional list sections when they have items", () => {
    const data: CvData = {
      ...cv,
      certifications: ["Certification"]
    };
    const model = toCvRenderModel(data);

    expect(model.sections.map((section) => section.id)).toEqual([
      "profile",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications",
      "references"
    ]);
  });

  it("omits education entries excluded from application CVs", () => {
    const model = toCvRenderModel(cv);
    const education = model.sections.find((section) => section.id === "education");

    expect(education?.id).toBe("education");
    if (education?.id !== "education") {
      throw new Error("Expected education section");
    }

    expect(education.items).toEqual([
      "Harbour City Institute - Graduate Diploma in Software Development",
      "Open Polytechnic Sample Campus - Bachelor of Information Systems"
    ]);
    expect(education.items.join("\n")).not.toContain("NCEA");
  });

  it("can render request-only references for application CVs", () => {
    const model = toCvRenderModel(cv, { referencesMode: "request" });
    const references = model.sections.find((section) => section.id === "references");

    expect(references?.id).toBe("references");
    if (references?.id !== "references") {
      throw new Error("Expected references section");
    }

    expect(references.references).toEqual([]);
    expect(references.note).toBe("References available on request.");
  });

  it("can omit references for application CVs", () => {
    const model = toCvRenderModel(cv, { referencesMode: "omit" });

    expect(model.sections.map((section) => section.id)).not.toContain("references");
  });
});

describe("render model helpers", () => {
  it("builds contact lines in the existing display order", () => {
    expect(
      buildContactLines({
        ...cv,
        contact: [{ label: "Email", value: "person@example.com" }],
        location: "Wellington",
        links: [{ label: "LinkedIn", value: "linkedin.example" }]
      })
    ).toEqual(["Email: person@example.com", "Location: Wellington", "LinkedIn: linkedin.example"]);
  });

  it("builds the current DOCX role subtitle format", () => {
    expect(buildRoleSubtitle({ employer: "Northstar Sample Labs", date: "Mar 2021 - Present" })).toBe(
      "Northstar Sample Labs | Mar 2021 - Present"
    );
  });

  it("detects renderable item arrays", () => {
    expect(hasRenderableItems([])).toBe(false);
    expect(hasRenderableItems(["item"])).toBe(true);
  });
});
