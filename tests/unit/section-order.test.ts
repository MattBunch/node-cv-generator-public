import { describe, expect, it } from "vitest";
import { CV_SECTION_LABELS, getOrderedSectionIds } from "../../src/cv/section-order.js";

describe("section order", () => {
  it("keeps the current CV section order", () => {
    expect(getOrderedSectionIds()).toEqual([
      "profile",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications",
      "references"
    ]);
  });

  it("keeps current public section labels", () => {
    expect(CV_SECTION_LABELS).toMatchObject({
      profile: "Profile",
      experience: "Experience",
      skills: "Technical Skills",
      education: "Education",
      certifications: "Certifications",
      projects: "Projects",
      references: "References"
    });
  });
});
