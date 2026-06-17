import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { cv } from "../../src/data/cv.js";
import { htmlTestUtils, renderHtml } from "../../src/render/render-html.js";
import { renderAtsHtml } from "../../src/templates/ats/render-html.js";
import { renderReferencesHtml } from "../../src/templates/references/render-html.js";

describe("renderHtml", () => {
  it("renders a complete CV document", () => {
    const html = renderHtml(cv, "body { color: black; }");
    const dom = new JSDOM(html);
    const document = dom.window.document;

    expect(document.querySelector("title")?.textContent).toBe("Alex Rivera Polished CV");
    expect(document.querySelector("h1")?.textContent).toBe("Alex Rivera");
    expect(document.body.textContent).toContain("Profile");
    expect(document.body.textContent).toContain("Experience");
    expect(document.body.textContent).toContain("Technical Skills");
    expect(document.body.textContent).toContain("Projects");
    expect(document.body.textContent).toContain("Education");
    expect(document.body.textContent).not.toContain("References");
    expect(document.body.textContent).not.toContain("References available on request.");
    expect(document.body.textContent).not.toContain("jordan.sample@example.test");
    expect(document.body.textContent).not.toContain("NCEA Level 3");
    expect(document.body.textContent).toContain("Built a TypeScript export service");
    expect(document.body.textContent).toContain("Sample CV Generator");
    expect(document.body.textContent).toContain("Collaboration");
  });

  it("renders ATS-safe HTML without polished layout markers", () => {
    const html = renderAtsHtml(cv, "body { color: black; }");
    const dom = new JSDOM(html);
    const text = dom.window.document.body.textContent ?? "";

    expect(text).toContain("Profile");
    expect(text).toContain("Technical Skills");
    expect(text).toContain("Experience");
    expect(text).toContain("Projects");
    expect(text).not.toContain("References available on request.");
    expect(text).not.toContain("jordan.sample@example.test");
    expect(text).not.toContain("NCEA Level 3");
    expect(html).not.toMatch(/two-column|<aside\b|\bgrid\b|reference-grid|<table\b|<img\b/i);
  });

  it("renders local contact fields when provided", () => {
    const html = renderAtsHtml(
      {
        ...cv,
        contact: [
          { label: "Email", value: "person@example.com" },
          { label: "Phone", value: "+64 21 000 0000" }
        ],
        location: "Lower Hutt / Wellington, NZ",
        links: [
          { label: "LinkedIn", value: "linkedin.com/in/sample-person" },
          { label: "GitHub", value: "github.com/example/alex-rivera-cv" },
          { label: "Portfolio", value: "portfolio.example.test" }
        ]
      },
      "body { color: black; }"
    );
    const text = new JSDOM(html).window.document.body.textContent ?? "";

    expect(text).toContain("Email: person@example.com");
    expect(text).toContain("Phone: +64 21 000 0000");
    expect(text).toContain("Location: Lower Hutt / Wellington, NZ");
    expect(text).toContain("LinkedIn: linkedin.com/in/sample-person");
    expect(text).toContain("GitHub: github.com/example/alex-rivera-cv");
    expect(text).toContain("Portfolio: portfolio.example.test");
  });

  it("renders full reference details only in the references sheet", () => {
    const html = renderReferencesHtml(cv, "body { color: black; }");
    const text = new JSDOM(html).window.document.body.textContent ?? "";

    expect(text).toContain("Alex Rivera");
    expect(text).toContain("References");
    expect(text).toContain("Jordan Sample");
    expect(text).toContain("jordan.sample@example.test");
  });

  it("escapes unsafe HTML text", () => {
    expect(htmlTestUtils.escapeHtml(`<script>"x" & 'y'</script>`)).toBe(
      "&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;"
    );
  });
});
