import type { CvData, Reference } from "../../data/cv.js";
import { escapeHtml } from "../../render/html-utils.js";

const renderReference = (reference: Reference): string => `
  <article class="reference">
    <h3>${escapeHtml(reference.name)}</h3>
    ${reference.details.map((detail) => `<p>${escapeHtml(detail)}</p>`).join("")}
  </article>`;

export const renderReferencesHtml = (cv: CvData, css: string): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(cv.name)} References</title>
    <style>${css}</style>
  </head>
  <body>
    <main class="page">
      <header class="header">
        <h1>${escapeHtml(cv.name)}</h1>
        <p class="title">${escapeHtml(cv.title)}</p>
      </header>
      <section>
        <h2>References</h2>
        ${cv.references.map(renderReference).join("")}
      </section>
    </main>
  </body>
</html>`;
