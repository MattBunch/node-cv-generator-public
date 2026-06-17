import { Paragraph, TextRun } from "docx";
import type { DocxLayoutTheme } from "./theme.js";

export type BulletListOptions = {
  color?: string;
  font?: string;
  size?: number;
  compact?: boolean;
  marker?: string;
};

export const createBulletList = (
  items: readonly string[],
  theme: DocxLayoutTheme,
  options: BulletListOptions = {}
): Paragraph[] => {
  const color = options.color ?? theme.text.body.color;
  const font = options.font ?? theme.text.body.font;
  const size = options.size ?? theme.text.body.size;
  const after = options.compact ? theme.spacing.compactAfter : theme.spacing.paragraphAfter;
  const marker = options.marker ?? "•";

  return items.map(
    (item) =>
      new Paragraph({
        indent: {
          left: 260,
          hanging: 130
        },
        spacing: {
          after,
          line: theme.spacing.line
        },
        children: [
          new TextRun({
            text: `${marker} ${item}`,
            color,
            font,
            size
          })
        ]
      })
  );
};
