import type { CvData } from "../../data/cv.js";
import {
  toCvRenderModel,
  type CvRenderModel,
  type CvRenderProject,
  type CvRenderSection
} from "../../cv/render-model.js";
import { escapeHtml, renderHtmlList } from "../../render/html-utils.js";

const renderContact = (contactLines: readonly string[]): string => {
  if (contactLines.length === 0) {
    return "";
  }

  return `<div class="contact">${contactLines
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("")}</div>`;
};

const renderProject = (project: CvRenderProject): string => `
  <article class="role">
    <h3>${escapeHtml(project.name)}</h3>
    ${project.url ? `<p class="company">${escapeHtml(project.url)}</p>` : ""}
    ${project.technologies.length > 0 ? `<p>${escapeHtml(project.technologies.join(", "))}</p>` : ""}
    ${renderHtmlList(project.bullets)}
  </article>`;

const renderSection = (section: CvRenderSection): string => {
  switch (section.id) {
    case "profile":
      return `<section class="section profile">
        <h2>${escapeHtml(section.label)}</h2>
        <p>${escapeHtml(section.content)}</p>
      </section>`;
    case "experience":
      return `<section class="section experience">
        <h2>${escapeHtml(section.label)}</h2>
        ${section.roles
          .map(
            (role) => `
            <article class="role">
              <div class="role-heading">
                <div>
                  <h3>${escapeHtml(role.title)}</h3>
                  <p class="company">${escapeHtml(role.employer)}</p>
                </div>
                <p class="date">${escapeHtml(role.date)}</p>
              </div>
              ${role.location ? `<p class="location">${escapeHtml(role.location)}</p>` : ""}
              <p>${escapeHtml(role.overview)}</p>
              ${renderHtmlList(role.bullets)}
            </article>`
          )
          .join("")}
      </section>`;
    case "skills":
      return `<section class="section skills-summary">
        <h2>${escapeHtml(section.label)}</h2>
        <div class="skills-grid">
          ${section.groups
            .map(
              (group) => `
              <article class="skill-group">
                <h3>${escapeHtml(group.name)}</h3>
                <p>${escapeHtml(group.items.join("; "))}</p>
              </article>`
            )
            .join("")}
        </div>
      </section>`;
    case "education":
    case "certifications":
      return `<section class="section">
        <h2>${escapeHtml(section.label)}</h2>
        ${renderHtmlList(section.items)}
      </section>`;
    case "projects":
      return `<section class="section">
        <h2>${escapeHtml(section.label)}</h2>
        ${section.projects.map(renderProject).join("")}
      </section>`;
    case "references":
      return `<section class="section references">
        <h2>${escapeHtml(section.label)}</h2>
        <p>${escapeHtml(section.note ?? "References available on request.")}</p>
      </section>`;
  }
};

export const renderPolishedHtmlFromModel = (model: CvRenderModel, css: string): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(model.documentTitle)}</title>
    <style>${css}</style>
  </head>
  <body>
    <main class="page">
      <header class="hero">
        <div>
          <p class="eyebrow">${escapeHtml(model.eyebrow)}</p>
          <h1>${escapeHtml(model.name)}</h1>
          <p class="title">${escapeHtml(model.title)}</p>
          ${renderContact(model.contactLines)}
        </div>
      </header>

      ${model.sections.map(renderSection).join("")}
    </main>
  </body>
</html>`;

export const renderPolishedHtml = (cv: CvData, css: string): string =>
  renderPolishedHtmlFromModel(
    toCvRenderModel(cv, {
      documentTitle: `${cv.name} Polished CV`,
      referencesMode: cv.outputOptions?.references.applicationMode ?? "omit"
    }),
    css
  );
