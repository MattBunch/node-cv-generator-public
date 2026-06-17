import { Paragraph, TextRun } from "docx";
import { createBulletList } from "./createBulletList.js";
import { createSectionHeading } from "./createSectionHeading.js";
import type { DocxLayoutTheme } from "./theme.js";

export type DocxExperienceItem = {
  title: string;
  employer: string;
  date: string;
  location?: string;
  overview: string;
  bullets: readonly string[];
};

export const createExperienceItem = (
  item: DocxExperienceItem,
  theme: DocxLayoutTheme
): Paragraph[] => [
  createSectionHeading(item.title, theme, "item"),
  new Paragraph({
    spacing: {
      after: theme.spacing.itemAfter,
      line: theme.spacing.line
    },
    children: [
      new TextRun({
        text: [item.employer, item.date, item.location].filter(Boolean).join(" | "),
        color: theme.colors.mainMutedText,
        font: theme.text.small.font,
        size: theme.text.small.size
      })
    ]
  }),
  new Paragraph({
    spacing: {
      after: theme.spacing.paragraphAfter,
      line: theme.spacing.line
    },
    children: [
      new TextRun({
        text: item.overview,
        color: theme.text.body.color,
        font: theme.text.body.font,
        size: theme.text.body.size
      })
    ]
  }),
  ...createBulletList(item.bullets, theme)
];
