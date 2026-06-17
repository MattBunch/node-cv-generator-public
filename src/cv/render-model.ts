import type { CvData, EducationItem, Project } from "../data/cv.js";
import { formatDateRangeLabel } from "./date-format.js";
import { CV_SECTION_LABELS, getOrderedSectionIds, type CvSectionId } from "./section-order.js";

export type CvRenderListSection = {
  id: Extract<CvSectionId, "education" | "certifications">;
  label: string;
  items: string[];
};

export type CvRenderRole = {
  title: string;
  employer: string;
  date: string;
  subtitle: string;
  location?: string;
  overview: string;
  bullets: string[];
};

export type CvRenderSkillGroup = {
  name: string;
  items: string[];
};

export type CvRenderReference = {
  name: string;
  details: string[];
};

export type CvRenderProject = {
  name: string;
  url?: string;
  technologies: string[];
  bullets: string[];
};

export type CvRenderSection =
  | {
      id: "profile";
      label: string;
      content: string;
    }
  | {
      id: "experience";
      label: string;
      roles: CvRenderRole[];
    }
  | {
      id: "skills";
      label: string;
      groups: CvRenderSkillGroup[];
    }
  | CvRenderListSection
  | {
      id: "projects";
      label: string;
      projects: CvRenderProject[];
    }
  | {
      id: "references";
      label: string;
      references: CvRenderReference[];
      note?: string;
    };

export type CvRenderReferenceMode = "full" | "request" | "omit";

export type CvRenderModelOptions = {
  documentTitle?: string;
  eyebrow?: string;
  labels?: Partial<Record<CvSectionId, string>>;
  referencesMode?: CvRenderReferenceMode;
};

export type CvRenderModel = {
  name: string;
  title: string;
  documentTitle: string;
  eyebrow: string;
  contactLines: string[];
  sections: CvRenderSection[];
};

export const hasRenderableItems = (items: readonly unknown[]): boolean => items.length > 0;

export const buildContactLines = (cv: CvData): string[] => [
  ...cv.contact.map((item) => `${item.label}: ${item.value}`),
  ...(cv.location ? [`Location: ${cv.location}`] : []),
  ...cv.links.map((item) => `${item.label}: ${item.value}`)
];

export const buildRoleSubtitle = (role: Pick<CvRenderRole, "employer" | "date">): string =>
  `${role.employer} | ${role.date}`;

const buildExperienceRoles = (cv: CvData): CvRenderRole[] =>
  cv.experience.map((role) => {
    const date = formatDateRangeLabel(role.date);

    return {
      title: role.title,
      employer: role.employer,
      date,
      subtitle: buildRoleSubtitle({ employer: role.employer, date }),
      location: role.location,
      overview: role.overview,
      bullets: [...role.bullets]
    };
  });

const buildListSection = (
  id: CvRenderListSection["id"],
  items: string[]
): CvRenderListSection | undefined => {
  if (!hasRenderableItems(items)) {
    return undefined;
  }

  return {
    id,
    label: CV_SECTION_LABELS[id],
    items: [...items]
  };
};

const buildApplicationEducationItems = (education: readonly EducationItem[]): string[] =>
  education
    .filter((item) => item.includeInApplicationCv)
    .map((item) => item.name);

const buildProjectSection = (
  projects: Project[],
  label: string
): Extract<CvRenderSection, { id: "projects" }> | undefined => {
  if (!hasRenderableItems(projects)) {
    return undefined;
  }

  return {
    id: "projects",
    label,
    projects: projects.map((project) => ({
      name: project.name,
      url: project.url,
      technologies: [...project.technologies],
      bullets: [...project.bullets]
    }))
  };
};

const buildSection = (
  cv: CvData,
  id: CvSectionId,
  options: Required<Pick<CvRenderModelOptions, "referencesMode">> &
    Pick<CvRenderModelOptions, "labels">
): CvRenderSection | undefined => {
  const label = options.labels?.[id] ?? CV_SECTION_LABELS[id];

  switch (id) {
    case "profile":
      return {
        id,
        label,
        content: cv.profile
      };
    case "experience":
      return {
        id,
        label,
        roles: buildExperienceRoles(cv)
      };
    case "skills":
      return {
        id,
        label,
        groups: cv.skills.map((group) => ({
          name: group.name,
          items: [...group.items]
        }))
      };
    case "education":
      {
        const section = buildListSection(id, buildApplicationEducationItems(cv.education));
        return section ? { ...section, label } : undefined;
      }
    case "certifications":
      {
        const section = buildListSection(id, cv.certifications);
        return section ? { ...section, label } : undefined;
      }
    case "projects":
      return buildProjectSection(cv.projects, label);
    case "references":
      if (options.referencesMode === "omit") {
        return undefined;
      }

      return {
        id,
        label,
        references:
          options.referencesMode === "full"
            ? cv.references.map((reference) => ({
                name: reference.name,
                details: [...reference.details]
              }))
            : [],
        note:
          options.referencesMode === "request" ? "References available on request." : undefined
      };
  }
};

export const toCvRenderModel = (cv: CvData, options: CvRenderModelOptions = {}): CvRenderModel => ({
  name: cv.name,
  title: cv.title,
  documentTitle: options.documentTitle ?? `${cv.name} CV`,
  eyebrow: options.eyebrow ?? "Curriculum Vitae",
  contactLines: buildContactLines(cv),
  sections: getOrderedSectionIds().flatMap((id) => {
    const section = buildSection(cv, id, {
      labels: options.labels,
      referencesMode: options.referencesMode ?? "full"
    });
    return section ? [section] : [];
  })
});
