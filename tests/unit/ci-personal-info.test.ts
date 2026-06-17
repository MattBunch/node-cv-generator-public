import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { cv, cvForExport } from "../../src/data/cv.js";
import {
  loadCiPersonalInfoData,
  mergeCiPersonalInfoData
} from "../../src/data/ci-personal-info.js";

const fixturePath = (name: string): string => {
  const dir = resolve(tmpdir(), `cv-ci-personal-info-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });

  return resolve(dir, name);
};

describe("CI personal info fixture", () => {
  it("keeps default export data unchanged without the CI fixture flag", () => {
    expect(process.env.CV_USE_CI_FIXTURE_DATA).not.toBe("true");
    expect(cvForExport.contact).toEqual(cv.contact);
    expect(cvForExport.links).toEqual(cv.links);
    expect(cvForExport.location).toBe(cv.location);
  });

  it("loads structurally valid fixture data", () => {
    const path = fixturePath("ci-personal-info.json");
    writeFileSync(
      path,
      JSON.stringify({
        contact: [{ label: "Email", value: "matt@example.test" }],
        links: [{ label: "GitHub", value: "https://github.com/example" }],
        location: "Wellington, New Zealand"
      })
    );

    expect(loadCiPersonalInfoData(path)).toEqual({
      contact: [{ label: "Email", value: "matt@example.test" }],
      links: [{ label: "GitHub", value: "https://github.com/example" }],
      location: "Wellington, New Zealand"
    });
  });

  it("fills missing contact, links, and location", () => {
    const merged = mergeCiPersonalInfoData({ ...cv, contact: [], links: [], location: undefined }, {
      contact: [{ label: "Email", value: "matt@example.test" }],
      links: [{ label: "Portfolio", value: "https://example.test" }],
      location: "Wellington, New Zealand"
    });

    expect(merged.contact).toEqual([{ label: "Email", value: "matt@example.test" }]);
    expect(merged.links).toEqual([{ label: "Portfolio", value: "https://example.test" }]);
    expect(merged.location).toBe("Wellington, New Zealand");
  });

  it("does not override existing source values", () => {
    const merged = mergeCiPersonalInfoData(
      {
        ...cv,
        contact: [{ label: "Email", value: "real@example.test" }],
        links: [{ label: "GitHub", value: "https://github.com/real" }],
        location: "Real Location"
      },
      {
        contact: [{ label: "Email", value: "matt@example.test" }],
        links: [{ label: "GitHub", value: "https://github.com/example" }],
        location: "Wellington, New Zealand"
      }
    );

    expect(merged.contact).toEqual([{ label: "Email", value: "real@example.test" }]);
    expect(merged.links).toEqual([{ label: "GitHub", value: "https://github.com/real" }]);
    expect(merged.location).toBe("Real Location");
  });
});
