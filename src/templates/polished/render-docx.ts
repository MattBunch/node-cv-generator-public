import { AlignmentType, Document, HeadingLevel, Paragraph, TextRun } from "docx";
import { toCvRenderModel, type CvRenderModel } from "../../cv/render-model.js";
import type { CvData } from "../../data/cv.js";
import { createDocument, renderDocumentBuffer } from "../../docx/layout/createDocument.js";
import { createMainColumn } from "../../docx/layout/createMainColumn.js";
import { defaultSplitPageTheme } from "../../docx/layout/theme.js";
import { buildPolishedDocxLayoutContent } from "./docx-layout.js";

const createHeader = (model: CvRenderModel): Paragraph[] => [
  new Paragraph({
    alignment: AlignmentType.LEFT,
    heading: HeadingLevel.TITLE,
    spacing: {
      after: 40
    },
    children: [
      new TextRun({
        text: model.name,
        bold: true,
        size: defaultSplitPageTheme.text.title.size,
        font: defaultSplitPageTheme.fonts.heading,
        color: defaultSplitPageTheme.text.title.color
      })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: {
      after: model.contactLines.length > 0 ? 35 : 80
    },
    children: [
      new TextRun({
        text: model.title,
        size: defaultSplitPageTheme.text.subtitle.size,
        font: defaultSplitPageTheme.fonts.body,
        color: defaultSplitPageTheme.colors.mainMutedText
      })
    ]
  }),
  ...(model.contactLines.length > 0
    ? [
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: {
            after: 80
          },
          children: [
            new TextRun({
              text: model.contactLines.join(" | "),
              size: defaultSplitPageTheme.text.small.size,
              font: defaultSplitPageTheme.fonts.body,
              color: defaultSplitPageTheme.colors.mainMutedText
            })
          ]
        })
      ]
    : [])
];

export const buildPolishedDocxDocumentFromModel = (model: CvRenderModel): Document => {
  const layout = buildPolishedDocxLayoutContent(model);
  const theme = defaultSplitPageTheme;

  return createDocument({
    title: model.documentTitle,
    theme,
    children: [...createHeader(model), ...createMainColumn(layout.main, theme)]
  });
};

export const buildPolishedDocxDocument = (cv: CvData): Document =>
  buildPolishedDocxDocumentFromModel(
    toCvRenderModel(cv, {
      documentTitle: `${cv.name} Polished CV`,
      referencesMode: cv.outputOptions?.references.applicationMode ?? "omit"
    })
  );

export const renderPolishedDocxBuffer = (cv: CvData): Promise<Buffer> =>
  renderDocumentBuffer(buildPolishedDocxDocument(cv));
