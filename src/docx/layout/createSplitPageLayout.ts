import {
  Paragraph,
  ShadingType,
  Table,
  TableBorders,
  TableCell,
  TableLayoutType,
  TableRow,
  VerticalAlignTable,
  WidthType
} from "docx";
import type { DocxLayoutTheme } from "./theme.js";

export type SplitPageLayoutOptions = {
  sidebarChildren: readonly Paragraph[];
  mainChildren: readonly Paragraph[];
  theme: DocxLayoutTheme;
};

export const createSplitPageLayout = ({
  sidebarChildren,
  mainChildren,
  theme
}: SplitPageLayoutOptions): Table =>
  new Table({
    width: {
      size: theme.layout.tableWidth,
      type: WidthType.DXA
    },
    columnWidths: [theme.layout.sidebarWidth, theme.layout.mainWidth],
    layout: TableLayoutType.FIXED,
    borders: TableBorders.NONE,
    margins: {
      top: theme.layout.tableCellPadding,
      right: theme.layout.tableCellPadding,
      bottom: theme.layout.tableCellPadding,
      left: theme.layout.tableCellPadding
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: {
              size: theme.layout.sidebarWidth,
              type: WidthType.DXA
            },
            verticalAlign: VerticalAlignTable.TOP,
            shading: {
              type: ShadingType.CLEAR,
              fill: theme.colors.sidebarBackground,
              color: theme.colors.sidebarBackground
            },
            children: sidebarChildren
          }),
          new TableCell({
            width: {
              size: theme.layout.mainWidth,
              type: WidthType.DXA
            },
            verticalAlign: VerticalAlignTable.TOP,
            children: mainChildren
          })
        ]
      })
    ]
  });
