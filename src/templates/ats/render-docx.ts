import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import {
  type CvRenderModel,
  type CvRenderProject,
  type CvRenderSection
} from "../../cv/render-model.js";
import type { CvData } from "../../data/cv.js";
import {
  bullet,
  heading,
  itemHeading,
  paragraph
} from "../../render/docx-utils.js";
import {
  DOCX_PAGE_MARGIN,
  DOCX_PARAGRAPH_SPACING
} from "../../render/docx.constants.js";
import { buildAtsRenderModel } from "./render-html.js";

const ATS_DOCX_FONT = {
  family: "Aptos",
  normalSize: 22,
  titleSize: 34,
  subtitleSize: 24
} as const;

const renderProjectParagraphs = (project: CvRenderProject): Paragraph[] => [
  itemHeading(project.name),
  ...(project.url ? [paragraph(project.url)] : []),
  ...(project.technologies.length > 0 ? [paragraph(project.technologies.join(", "))] : []),
  ...project.bullets.map(bullet)
];

const renderSectionParagraphs = (section: CvRenderSection): Paragraph[] => {
  switch (section.id) {
    case "profile":
      return [heading(section.label), paragraph(section.content)];
    case "experience":
      return [
        heading(section.label),
        ...section.roles.flatMap((role) => [
          itemHeading(role.title),
          paragraph(role.subtitle),
          ...(role.location ? [paragraph(role.location)] : []),
          paragraph(role.overview),
          ...role.bullets.map(bullet)
        ])
      ];
    case "skills":
      return [
        heading(section.label),
        ...section.groups.flatMap((group) => [itemHeading(group.name), ...group.items.map(bullet)])
      ];
    case "education":
    case "certifications":
      return [heading(section.label), ...section.items.map(bullet)];
    case "projects":
      return [heading(section.label), ...section.projects.flatMap(renderProjectParagraphs)];
    case "references":
      return [heading(section.label), paragraph(section.note ?? "References available on request.")];
  }
};

export const buildAtsDocxDocumentFromModel = (model: CvRenderModel): Document => {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: model.name, bold: true, size: ATS_DOCX_FONT.titleSize })]
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: DOCX_PARAGRAPH_SPACING.title,
      children: [new TextRun({ text: model.title, size: ATS_DOCX_FONT.subtitleSize })]
    })
  ];

  if (model.contactLines.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: DOCX_PARAGRAPH_SPACING.title,
        children: [new TextRun(model.contactLines.join(" | "))]
      })
    );
  }

  children.push(...model.sections.flatMap(renderSectionParagraphs));

  return new Document({
    styles: {
      paragraphStyles: [
        {
          id: "Normal",
          name: "Normal",
          run: {
            font: ATS_DOCX_FONT.family,
            size: ATS_DOCX_FONT.normalSize
          },
          paragraph: {
            spacing: { line: DOCX_PARAGRAPH_SPACING.normalLine }
          }
        }
      ]
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

export const buildAtsDocxDocument = (cv: CvData): Document =>
  buildAtsDocxDocumentFromModel(buildAtsRenderModel(cv));

export const renderAtsDocxBuffer = (cv: CvData): Promise<Buffer> =>
  Packer.toBuffer(buildAtsDocxDocument(cv));
