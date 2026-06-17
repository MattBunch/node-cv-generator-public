import { BorderStyle, Paragraph, TextRun } from "docx";
import type { DocxHeadingStyle, DocxLayoutTheme } from "./theme.js";

export type SectionHeadingVariant = "main" | "sidebar" | "item";

const getHeadingStyle = (
  theme: DocxLayoutTheme,
  variant: SectionHeadingVariant
): DocxHeadingStyle => {
  switch (variant) {
    case "main":
      return theme.headings.mainSection;
    case "sidebar":
      return theme.headings.sidebarSection;
    case "item":
      return theme.headings.item;
  }
};

export const createSectionHeading = (
  text: string,
  theme: DocxLayoutTheme,
  variant: SectionHeadingVariant = "main"
): Paragraph => {
  const style = getHeadingStyle(theme, variant);
  const borderColor = variant === "sidebar" ? theme.colors.sidebarMutedText : theme.colors.accent;

  return new Paragraph({
    spacing: {
      before: style.spacingBefore,
      after: style.spacingAfter
    },
    border:
      variant === "item"
        ? undefined
        : {
            bottom: {
              color: borderColor,
              size: 6,
              style: BorderStyle.SINGLE
            }
          },
    children: [
      new TextRun({
        text,
        bold: style.bold,
        font: style.font,
        size: style.size,
        color: style.color
      })
    ]
  });
};
