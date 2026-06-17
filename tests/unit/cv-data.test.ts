import { describe, expect, it } from "vitest";
import { cv } from "../../src/data/cv.js";

const allCvText = JSON.stringify(cv);

describe("cv data", () => {
  it("contains required top-level CV sections", () => {
    expect(cv.name).toBe("Alex Rivera");
    expect(cv.title).toBe("Node.js Developer");
    expect(cv.profile).toContain("document automation tools");
    expect(cv.experience).toHaveLength(1);
    expect(cv.skills.length).toBeGreaterThan(0);
    expect(cv.education).toHaveLength(3);
    expect(cv.projects).toHaveLength(1);
    expect(cv.references).toHaveLength(2);
  });

  it("preserves key source CV strings", () => {
    for (const text of [
      "Alex Rivera",
      "Node.js Developer",
      "Northstar Sample Labs",
      "Mar 2021 - Present",
      "Harbour City Institute - Graduate Diploma in Software Development",
      "Open Polytechnic Sample Campus - Bachelor of Information Systems",
      "North Coast High School - Digital Technologies Certificate",
      "Sample CV Generator",
      "Jordan Sample",
      "Phone: +64 4 555 0110",
      "Email: jordan.sample@example.test",
      "Priya Example",
      "Email: priya.example@example.test"
    ]) {
      expect(allCvText).toContain(text);
    }
  });

  it("does not use placeholder values in structured content", () => {
    expect(allCvText).not.toMatch(/\bTBD\b|\bLorem\b|example\.com/i);
  });
});
