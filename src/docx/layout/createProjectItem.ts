import { Paragraph, TextRun } from "docx";
import { createBulletList } from "./createBulletList.js";
import { createSectionHeading } from "./createSectionHeading.js";
import type { DocxLayoutTheme } from "./theme.js";

export type DocxProjectItem = {
  name: string;
  url?: string;
  technologies: readonly string[];
  bullets: readonly string[];
};

export const createProjectItem = (
  project: DocxProjectItem,
  theme: DocxLayoutTheme
): Paragraph[] => [
  createSectionHeading(project.name, theme, "item"),
  ...(project.url || project.technologies.length > 0
    ? [
        new Paragraph({
          spacing: {
            after: theme.spacing.compactAfter,
            line: theme.spacing.line
          },
          children: [
            new TextRun({
              text: [project.url, project.technologies.join(", ")].filter(Boolean).join(" | "),
              color: theme.colors.mainMutedText,
              font: theme.text.small.font,
              size: theme.text.small.size
            })
          ]
        })
      ]
    : []),
  ...createBulletList(project.bullets, theme)
];
