import { HeadingLevel, LevelFormat, Paragraph, TextRun, type ILevelsOptions } from "docx";
import { DOCX_PARAGRAPH_SPACING } from "./docx.constants.js";

export const CV_BULLET_NUMBERING_REFERENCE = "cv-bullet-list";

export const CV_BULLET_NUMBERING_CONFIG = [
  {
    reference: CV_BULLET_NUMBERING_REFERENCE,
    levels: [
      {
        level: 0,
        format: LevelFormat.BULLET,
        text: "\u2022",
        style: {
          paragraph: {
            indent: {
              left: 360,
              hanging: 180
            }
          }
        }
      }
    ] satisfies ILevelsOptions[]
  }
];

export const bullet = (text: string): Paragraph =>
  new Paragraph({
    indent: {
      left: 240,
      hanging: 120
    },
    spacing: DOCX_PARAGRAPH_SPACING.body,
    children: [new TextRun(`- ${text}`)]
  });

export const heading = (text: string): Paragraph =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: DOCX_PARAGRAPH_SPACING.heading,
    children: [new TextRun(text)]
  });

export const paragraph = (text: string): Paragraph =>
  new Paragraph({
    spacing: DOCX_PARAGRAPH_SPACING.body,
    children: [new TextRun(text)]
  });

export const itemHeading = (text: string): Paragraph =>
  new Paragraph({
    spacing: DOCX_PARAGRAPH_SPACING.itemHeading,
    children: [new TextRun({ text, bold: true })]
  });
