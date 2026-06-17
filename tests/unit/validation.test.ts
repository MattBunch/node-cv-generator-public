import { describe, expect, it } from "vitest";
import { validateCvData } from "../../src/cv/validation.js";
import { cv, type CvData } from "../../src/data/cv.js";

describe("validateCvData", () => {
  it("accepts the current CV data", () => {
    expect(validateCvData(cv)).toEqual([]);
  });

  it("reports missing required top-level fields without changing data", () => {
    const data: CvData = {
      ...cv,
      name: "",
      experience: []
    };

    expect(validateCvData(data)).toEqual([
      { path: "name", message: "Required text is empty." },
      { path: "experience", message: "Expected at least one role." }
    ]);
    expect(data.name).toBe("");
  });

  it("reports missing role fields", () => {
    const data: CvData = {
      ...cv,
      experience: [
        {
          title: "",
          employer: "",
          date: "",
          overview: "",
          bullets: []
        }
      ]
    };

    expect(validateCvData(data)).toEqual([
      { path: "experience[0].title", message: "Required text is empty." },
      { path: "experience[0].employer", message: "Required text is empty." },
      { path: "experience[0].date", message: "Required text is empty." },
      { path: "experience[0].overview", message: "Required text is empty." },
      { path: "experience[0].bullets", message: "Expected at least one bullet." }
    ]);
  });

  it("allows currently empty optional sections", () => {
    const data: CvData = {
      ...cv,
      contact: [],
      links: [],
      certifications: [],
      projects: []
    };

    expect(validateCvData(data)).toEqual([]);
  });
});
