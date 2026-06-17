import type {
  CvRenderModel,
  CvRenderSection,
  CvRenderSkillGroup
} from "../../cv/render-model.js";
import type { MainColumnContent, MainColumnSection } from "../../docx/layout/createMainColumn.js";
import type {
  SidebarContent,
  SidebarGroupedSection,
  SidebarSection
} from "../../docx/layout/createSidebar.js";

export type PolishedDocxLayoutContent = {
  sidebar: SidebarContent;
  main: MainColumnContent;
};

const findSection = <TSection extends CvRenderSection["id"]>(
  model: CvRenderModel,
  id: TSection
): Extract<CvRenderSection, { id: TSection }> | undefined =>
  model.sections.find((section): section is Extract<CvRenderSection, { id: TSection }> => {
    return section.id === id;
  });

const buildSkillsSidebarSection = (
  groups: readonly CvRenderSkillGroup[],
  heading: string
): SidebarGroupedSection | undefined => {
  if (groups.length === 0) {
    return undefined;
  }

  return {
    heading,
    groups: groups.map((group) => ({
      heading: group.name,
      items: group.items
    }))
  };
};

const compactListSection = (heading: string, items: readonly string[]): SidebarSection | undefined => {
  if (items.length === 0) {
    return undefined;
  }

  return {
    heading,
    items
  };
};

const buildSidebarSections = (model: CvRenderModel): (SidebarSection | SidebarGroupedSection)[] => {
  const certificationSections = model.sections.flatMap((section): SidebarSection[] => {
    if (section.id !== "certifications") {
      return [];
    }

    const sidebarSection = compactListSection(section.label, section.items);
    return sidebarSection ? [sidebarSection] : [];
  });

  return [
    ...certificationSections
  ].flatMap((section) => (section ? [section] : []));
};

const buildMainSections = (model: CvRenderModel): MainColumnSection[] =>
  model.sections.flatMap((section): MainColumnSection[] => {
    switch (section.id) {
      case "profile":
        return section.content ? [{ type: "paragraph", heading: section.label, content: section.content }] : [];
      case "skills":
        return section.groups.length > 0
          ? [{ type: "grouped-list", heading: section.label, groups: section.groups }]
          : [];
      case "experience":
        return section.roles.length > 0
          ? [{ type: "experience", heading: section.label, items: section.roles }]
          : [];
      case "projects":
        return section.projects.length > 0
          ? [{ type: "projects", heading: section.label, items: section.projects }]
          : [];
      case "education":
        return section.items.length > 0
          ? [{ type: "list", heading: section.label, items: section.items }]
          : [];
      case "references":
        return section.note
          ? [{ type: "paragraph", heading: section.label, content: section.note }]
          : [];
      case "certifications":
        return [];
    }
  });

export const buildPolishedDocxLayoutContent = (
  model: CvRenderModel
): PolishedDocxLayoutContent => ({
  sidebar: {
    name: model.name,
    title: model.title,
    sections: buildSidebarSections(model)
  },
  main: {
    sections: buildMainSections(model)
  }
});
