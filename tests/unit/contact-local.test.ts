import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { cv } from "../../src/data/cv.js";
import { loadLocalContactData, mergeLocalContactData } from "../../src/data/contact-local.js";

const fixturePath = (name: string): string => {
  const dir = resolve(tmpdir(), `cv-contact-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });

  return resolve(dir, name);
};

describe("local contact data", () => {
  it("returns empty contact data when the local file is missing", () => {
    expect(loadLocalContactData(fixturePath("missing.json"))).toEqual({
      contact: [],
      links: []
    });
  });

  it("loads and merges local contact data", () => {
    const path = fixturePath("contact.local.json");
    writeFileSync(
      path,
      JSON.stringify({
        contact: [{ label: "Email", value: "person@example.com" }],
        links: [{ label: "Portfolio", value: "portfolio.example.com" }],
        location: "Wellington, New Zealand"
      })
    );

    const merged = mergeLocalContactData(cv, loadLocalContactData(path));

    expect(merged.contact).toEqual([{ label: "Email", value: "person@example.com" }]);
    expect(merged.links).toEqual([{ label: "Portfolio", value: "portfolio.example.com" }]);
    expect(merged.location).toBe("Wellington, New Zealand");
  });

  it("fails when local contact data is invalid", () => {
    const path = fixturePath("invalid-contact.local.json");
    writeFileSync(path, JSON.stringify({ contact: [{ label: "Email", value: 123 }] }));

    expect(() => loadLocalContactData(path)).toThrow(`Invalid local contact data in ${path}.`);
  });
});
