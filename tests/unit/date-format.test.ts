import { describe, expect, it } from "vitest";
import { formatDateRangeLabel } from "../../src/cv/date-format.js";

describe("formatDateRangeLabel", () => {
  it("preserves existing display date ranges", () => {
    expect(formatDateRangeLabel("Mar 2021 - Present")).toBe("Mar 2021 - Present");
  });
});
