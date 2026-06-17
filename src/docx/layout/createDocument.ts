import { Document, Packer, Paragraph, type FileChild } from "docx";
import type { DocxLayoutTheme } from "./theme.js";

export type CreateDocumentOptions = {
  title: string;
  children: readonly FileChild[];
  theme: DocxLayoutTheme;
  backgroundColor?: string;
};

export const createDocument = ({
  title,
  children,
  theme,
  backgroundColor
}: CreateDocumentOptions): Document =>
  new Document({
    background: backgroundColor ? { color: backgroundColor } : undefined,
    creator: "cv-generator",
    title,
    styles: {
      paragraphStyles: [
        {
          id: "Normal",
          name: "Normal",
          run: {
            font: theme.fonts.body,
            size: theme.text.body.size,
            color: theme.text.body.color
          },
          paragraph: {
            spacing: {
              line: theme.spacing.line
            }
          }
        }
      ]
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: theme.page.width,
              height: theme.page.height
            },
            margin: theme.page.margin
          }
        },
        children
      }
    ]
  });

export const createDocumentWithSectionColumns = ({
  title,
  children,
  theme,
  count,
  space
}: CreateDocumentOptions & { count: number; space: number }): Document =>
  new Document({
    creator: "cv-generator",
    title,
    styles: {
      paragraphStyles: [
        {
          id: "Normal",
          name: "Normal",
          run: {
            font: theme.fonts.body,
            size: theme.text.body.size,
            color: theme.text.body.color
          },
          paragraph: {
            spacing: {
              line: theme.spacing.line
            }
          }
        }
      ]
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: theme.page.width,
              height: theme.page.height
            },
            margin: theme.page.margin
          },
          column: {
            count,
            space,
            equalWidth: false
          }
        },
        children
      }
    ]
  });

export const createSpacerParagraph = (): Paragraph => new Paragraph({});

export const renderDocumentBuffer = (document: Document): Promise<Buffer> =>
  Packer.toBuffer(document);
