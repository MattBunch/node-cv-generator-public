import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import type { CvData } from "../../data/cv.js";
import {
  DOCX_FONT,
  DOCX_PAGE_MARGIN,
  DOCX_PARAGRAPH_SPACING
} from "../../render/docx.constants.js";
import { CV_BULLET_NUMBERING_CONFIG, heading, itemHeading, paragraph } from "../../render/docx-utils.js";

export const buildReferencesDocxDocument = (cv: CvData): Document => {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: cv.name, bold: true, size: DOCX_FONT.titleSize })]
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: DOCX_PARAGRAPH_SPACING.title,
      children: [new TextRun({ text: cv.title, size: DOCX_FONT.subtitleSize })]
    }),
    heading("References"),
    ...cv.references.flatMap((reference) => [
      itemHeading(reference.name),
      ...reference.details.map(paragraph)
    ])
  ];

  return new Document({
    styles: {
      paragraphStyles: [
        {
          id: "Normal",
          name: "Normal",
          run: {
            font: DOCX_FONT.family,
            size: DOCX_FONT.normalSize
          },
          paragraph: {
            spacing: { line: DOCX_PARAGRAPH_SPACING.normalLine }
          }
        }
      ]
    },
    numbering: {
      config: CV_BULLET_NUMBERING_CONFIG
    },
    sections: [
      {
        properties: {
          page: {
            margin: DOCX_PAGE_MARGIN
          }
        },
        children
      }
    ]
  });
};

export const renderReferencesDocxBuffer = (cv: CvData): Promise<Buffer> =>
  Packer.toBuffer(buildReferencesDocxDocument(cv));
