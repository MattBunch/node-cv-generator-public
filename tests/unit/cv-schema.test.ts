import { describe, expect, it } from "vitest";
import cvJson from "../../src/data/cv.json" with { type: "json" };
import { cvDataSchema } from "../../src/data/cv.schema.js";

describe("cvDataSchema", () => {
  it("parses the committed CV JSON data", () => {
    expect(cvDataSchema.safeParse(cvJson).success).toBe(true);
  });

  it("rejects missing required top-level fields", () => {
    const { name: _name, ...dataWithoutName } = cvJson;

    const result = cvDataSchema.safeParse(dataWithoutName);

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected schema parse failure");
    }
    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["name"]
        })
      ])
    );
  });

  it("rejects invalid nested field types", () => {
    const result = cvDataSchema.safeParse({
      ...cvJson,
      experience: [
        {
          ...cvJson.experience[0],
          bullets: "Built a verified project."
        }
      ]
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected schema parse failure");
    }
    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["experience", 0, "bullets"]
        })
      ])
    );
  });
});
