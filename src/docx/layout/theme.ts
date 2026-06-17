export type Twips = number;

export type DocxTextStyle = {
  font: string;
  size: number;
  color: string;
};

export type DocxHeadingStyle = DocxTextStyle & {
  bold: boolean;
  spacingBefore: Twips;
  spacingAfter: Twips;
};

export type DocxLayoutTheme = {
  page: {
    width: Twips;
    height: Twips;
    margin: {
      top: Twips;
      right: Twips;
      bottom: Twips;
      left: Twips;
    };
  };
  layout: {
    tableWidth: Twips;
    sidebarWidth: Twips;
    mainWidth: Twips;
    tableCellPadding: Twips;
  };
  fonts: {
    body: string;
    heading: string;
  };
  colors: {
    pageBackground: string;
    sidebarBackground: string;
    sidebarText: string;
    sidebarMutedText: string;
    mainText: string;
    mainMutedText: string;
    accent: string;
    white: string;
  };
  spacing: {
    line: Twips;
    paragraphAfter: Twips;
    compactAfter: Twips;
    sectionBefore: Twips;
    sectionAfter: Twips;
    itemBefore: Twips;
    itemAfter: Twips;
  };
  text: {
    body: DocxTextStyle;
    small: DocxTextStyle;
    title: DocxTextStyle;
    subtitle: DocxTextStyle;
    sidebarTitle: DocxTextStyle;
    sidebarBody: DocxTextStyle;
  };
  headings: {
    mainSection: DocxHeadingStyle;
    sidebarSection: DocxHeadingStyle;
    item: DocxHeadingStyle;
  };
};

export const defaultSplitPageTheme: DocxLayoutTheme = {
  page: {
    width: 11906,
    height: 16838,
    margin: {
      top: 360,
      right: 420,
      bottom: 360,
      left: 420
    }
  },
  layout: {
    tableWidth: 10826,
    sidebarWidth: 3100,
    mainWidth: 7726,
    tableCellPadding: 160
  },
  fonts: {
    body: "Aptos",
    heading: "Aptos Display"
  },
  colors: {
    pageBackground: "FFFFFF",
    sidebarBackground: "243447",
    sidebarText: "FFFFFF",
    sidebarMutedText: "D6DEE8",
    mainText: "1F2933",
    mainMutedText: "52606D",
    accent: "156F7A",
    white: "FFFFFF"
  },
  spacing: {
    line: 220,
    paragraphAfter: 60,
    compactAfter: 30,
    sectionBefore: 120,
    sectionAfter: 50,
    itemBefore: 80,
    itemAfter: 35
  },
  text: {
    body: {
      font: "Aptos",
      size: 19,
      color: "1F2933"
    },
    small: {
      font: "Aptos",
      size: 16,
      color: "52606D"
    },
    title: {
      font: "Aptos Display",
      size: 34,
      color: "17202A"
    },
    subtitle: {
      font: "Aptos",
      size: 21,
      color: "52606D"
    },
    sidebarTitle: {
      font: "Aptos Display",
      size: 28,
      color: "FFFFFF"
    },
    sidebarBody: {
      font: "Aptos",
      size: 19,
      color: "FFFFFF"
    }
  },
  headings: {
    mainSection: {
      font: "Aptos Display",
      size: 22,
      color: "17202A",
      bold: true,
      spacingBefore: 120,
      spacingAfter: 45
    },
    sidebarSection: {
      font: "Aptos Display",
      size: 21,
      color: "FFFFFF",
      bold: true,
      spacingBefore: 240,
      spacingAfter: 90
    },
    item: {
      font: "Aptos",
      size: 20,
      color: "1F2933",
      bold: true,
      spacingBefore: 75,
      spacingAfter: 25
    }
  }
} as const;
