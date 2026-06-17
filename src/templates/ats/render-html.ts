import type { CvData } from "../../data/cv.js";
import {
  toCvRenderModel,
  type CvRenderModel,
  type CvRenderProject,
  type CvRenderSection
} from "../../cv/render-model.js";
import { escapeHtml, renderHtmlList } from "../../render/html-utils.js";

export const ATS_SECTION_LABELS = {
  profile: "Profile",
  skills: "Technical Skills",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  references: "References"
} as const;

const renderContact = (contactLines: readonly string[]): string => {
  if (contactLines.length === 0) {
    return "";
  }

  return `<p class="contact">${contactLines
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("")}</p>`;
};

const renderProject = (project: CvRenderProject): string => `
  <article>
    <h3>${escapeHtml(project.name)}</h3>
    ${project.url ? `<p>${escapeHtml(project.url)}</p>` : ""}
    ${project.technologies.length > 0 ? `<p>${escapeHtml(project.technologies.join(", "))}</p>` : ""}
    ${renderHtmlList(project.bullets)}
  </article>`;

const renderSection = (section: CvRenderSection): string => {
  switch (section.id) {
    case "profile":
      return `<section class="section">
        <h2>${escapeHtml(section.label)}</h2>
        <p>${escapeHtml(section.content)}</p>
      </section>`;
    case "experience":
      return `<section class="section">
        <h2>${escapeHtml(section.label)}</h2>
        ${section.roles
          .map(
            (role) => `
            <article>
              <h3>${escapeHtml(role.title)}</h3>
              <p class="meta">${escapeHtml(role.subtitle)}</p>
              ${role.location ? `<p class="meta">${escapeHtml(role.location)}</p>` : ""}
              <p>${escapeHtml(role.overview)}</p>
              ${renderHtmlList(role.bullets)}
            </article>`
          )
          .join("")}
      </section>`;
    case "skills":
      return `<section class="section">
        <h2>${escapeHtml(section.label)}</h2>
        ${section.groups
          .map(
            (group) => `
            <article>
              <h3>${escapeHtml(group.name)}</h3>
              ${renderHtmlList(group.items)}
            </article>`
          )
          .join("")}
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
      return `<section class="section">
        <h2>${escapeHtml(section.label)}</h2>
        <p>${escapeHtml(section.note ?? "References available on request.")}</p>
      </section>`;
  }
};

export const buildAtsRenderModel = (cv: CvData): CvRenderModel =>
  toCvRenderModel(cv, {
    documentTitle: `${cv.name} ATS CV`,
    eyebrow: "Curriculum Vitae",
    referencesMode: cv.outputOptions?.references.applicationMode ?? "omit",
    labels: ATS_SECTION_LABELS
  });

export const renderAtsHtmlFromModel = (model: CvRenderModel, css: string): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(model.documentTitle)}</title>
    <style>${css}</style>
  </head>
  <body>
    <main class="page">
      <header>
        <h1>${escapeHtml(model.name)}</h1>
        <p class="title">${escapeHtml(model.title)}</p>
        ${renderContact(model.contactLines)}
      </header>
      ${model.sections.map(renderSection).join("")}
    </main>
  </body>
</html>`;

export const renderAtsHtml = (cv: CvData, css: string): string =>
  renderAtsHtmlFromModel(buildAtsRenderModel(cv), css);
