import { Paragraph, TextRun } from "docx";
import { createExperienceItem, type DocxExperienceItem } from "./createExperienceItem.js";
import { createProjectItem, type DocxProjectItem } from "./createProjectItem.js";
import { createSectionHeading } from "./createSectionHeading.js";
import { createBulletList } from "./createBulletList.js";
import type { DocxLayoutTheme } from "./theme.js";
import type { CvRenderSkillGroup } from "../../cv/render-model.js";

export type MainColumnContent = {
  sections: readonly MainColumnSection[];
};

export type MainColumnSection =
  | {
      type: "paragraph";
      heading: string;
      content: string;
    }
  | {
      type: "experience";
      heading: string;
      items: readonly DocxExperienceItem[];
    }
  | {
      type: "projects";
      heading: string;
      items: readonly DocxProjectItem[];
    }
  | {
      type: "list";
      heading: string;
      items: readonly string[];
    }
  | {
      type: "grouped-list";
      heading: string;
      groups: readonly CvRenderSkillGroup[];
    };

export const paragraph = (text: string, theme: DocxLayoutTheme): Paragraph =>
  new Paragraph({
    spacing: {
      after: theme.spacing.paragraphAfter,
      line: theme.spacing.line
    },
    children: [
      new TextRun({
        text,
        color: theme.text.body.color,
        font: theme.text.body.font,
        size: theme.text.body.size
      })
    ]
  });

export const createMainColumn = (
  content: MainColumnContent,
  theme: DocxLayoutTheme
): Paragraph[] =>
  content.sections.flatMap((section) => {
    switch (section.type) {
      case "paragraph":
        return [createSectionHeading(section.heading, theme), paragraph(section.content, theme)];
      case "experience":
        return [
          createSectionHeading(section.heading, theme),
          ...section.items.flatMap((item) => createExperienceItem(item, theme))
        ];
      case "projects":
        return [
          createSectionHeading(section.heading, theme),
          ...section.items.flatMap((project) => createProjectItem(project, theme))
        ];
      case "list":
        return [
          createSectionHeading(section.heading, theme),
          ...createBulletList(section.items, theme)
        ];
      case "grouped-list":
        return [
          createSectionHeading(section.heading, theme),
          ...section.groups.flatMap((group) => [
            new Paragraph({
              spacing: {
                after: theme.spacing.compactAfter,
                before: theme.spacing.compactAfter
              },
              children: [
                new TextRun({
                  text: group.name,
                  color: theme.text.body.color,
                  font: theme.text.body.font,
                  size: theme.text.body.size,
                  bold: true
                })
              ]
            }),
            ...createBulletList(group.items, theme, { compact: true })
          ])
        ];
    }
  });
