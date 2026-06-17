import { Paragraph, TextRun } from "docx";
import { createBulletList } from "./createBulletList.js";
import { createSectionHeading } from "./createSectionHeading.js";
import type { DocxLayoutTheme } from "./theme.js";

export type SidebarSection = {
  heading: string;
  items: readonly string[];
};

export type SidebarGroupedSection = {
  heading: string;
  groups: readonly {
    heading: string;
    items: readonly string[];
  }[];
};

export type SidebarContent = {
  name: string;
  title: string;
  sections: readonly (SidebarSection | SidebarGroupedSection)[];
};

const sidebarParagraph = (text: string, theme: DocxLayoutTheme): Paragraph =>
  new Paragraph({
    spacing: {
      after: theme.spacing.compactAfter,
      line: theme.spacing.line
    },
    children: [
      new TextRun({
        text,
        color: theme.colors.sidebarText,
        font: theme.text.sidebarBody.font,
        size: theme.text.sidebarBody.size
      })
    ]
  });

export const createSidebar = (content: SidebarContent, theme: DocxLayoutTheme): Paragraph[] => [
  new Paragraph({
    spacing: {
      after: theme.spacing.compactAfter,
      line: theme.spacing.line
    },
    children: [
      new TextRun({
        text: content.name,
        color: theme.text.sidebarTitle.color,
        font: theme.text.sidebarTitle.font,
        size: theme.text.sidebarTitle.size,
        bold: true
      })
    ]
  }),
  sidebarParagraph(content.title, theme),
  ...content.sections.flatMap((section) => {
    if ("groups" in section) {
      return [
        createSectionHeading(section.heading, theme, "sidebar"),
        ...section.groups.flatMap((group) => [
          sidebarParagraph(group.heading, theme),
          ...createBulletList(group.items, theme, {
            color: theme.colors.sidebarText,
            font: theme.text.sidebarBody.font,
            size: theme.text.sidebarBody.size,
            compact: true
          })
        ])
      ];
    }

    return [
      createSectionHeading(section.heading, theme, "sidebar"),
      ...createBulletList(section.items, theme, {
        color: theme.colors.sidebarText,
        font: theme.text.sidebarBody.font,
        size: theme.text.sidebarBody.size,
        compact: true
      })
    ];
  })
];
