export const DOCX_PARAGRAPH_SPACING = {
  heading: {
    before: 280,
    after: 120
  },
  body: {
    after: 120
  },
  title: {
    after: 160
  },
  itemHeading: {
    before: 120,
    after: 40
  },
  normalLine: 276
} as const;

export const DOCX_FONT = {
  family: "Arial",
  normalSize: 22,
  titleSize: 36,
  subtitleSize: 24
} as const;

export const DOCX_PAGE_MARGIN = {
  top: 720,
  right: 720,
  bottom: 720,
  left: 720
} as const;
