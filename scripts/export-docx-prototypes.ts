import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ColumnBreak,
  Paragraph,
  ShadingType,
  Textbox,
  TextRun
} from "docx";
import type { FileChild } from "docx";
import {
  createDocument,
  createDocumentWithSectionColumns,
  renderDocumentBuffer
} from "../src/docx/layout/createDocument.js";
import { createMainColumn, type MainColumnContent } from "../src/docx/layout/createMainColumn.js";
import { createSidebar, type SidebarContent } from "../src/docx/layout/createSidebar.js";
import { createSplitPageLayout } from "../src/docx/layout/createSplitPageLayout.js";
import { defaultSplitPageTheme } from "../src/docx/layout/theme.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = resolve(root, "output/prototypes");
const theme = defaultSplitPageTheme;

const sidebarContent: SidebarContent = {
  name: "Alex Morgan",
  title: "Principal Product Engineer",
  sections: [
    {
      heading: "Contact",
      items: [
        "alex.morgan@example.com",
        "+64 21 000 0000",
        "Auckland, New Zealand",
        "linkedin.com/in/alexmorgan"
      ]
    },
    {
      heading: "Skills",
      items: [
        "TypeScript, Node.js, React",
        "API design and platform architecture",
        "Document automation and reporting",
        "Testing strategy and CI/CD"
      ]
    },
    {
      heading: "Links",
      items: ["github.com/alexmorgan", "portfolio.example.com", "writing.example.com"]
    },
    {
      heading: "Certifications",
      items: ["Cloud Architecture Practitioner", "Agile Delivery Lead", "Accessibility Fundamentals"]
    },
    {
      heading: "Metadata",
      items: ["Available: 4 weeks", "Work rights: New Zealand", "Preferred: hybrid or remote"]
    }
  ]
};

const mainContent: MainColumnContent = {
  sections: [
    {
      type: "paragraph",
      heading: "Profile",
      content:
        "Senior software engineer with broad experience turning ambiguous product requirements into maintainable TypeScript systems. This placeholder profile is intentionally long enough to test wrapping across several lines, paragraph spacing, and the relationship between the sidebar and the main content column in editable DOCX viewers."
    },
    {
      type: "experience",
      heading: "Experience",
      items: [
        {
          title: "Principal Product Engineer",
          employer: "Northstar Platforms",
          date: "2022 - Present",
          overview:
            "Led the architecture of a document generation platform used by operations, finance, and customer success teams. Coordinated design reviews, implementation plans, and release readiness across multiple product squads.",
          bullets: [
            "Created reusable TypeScript rendering modules that reduced template duplication and made document output easier to test.",
            "Introduced regression coverage for generated artifacts, including ZIP/XML inspection for DOCX outputs and browser-driven PDF smoke tests.",
            "Partnered with design and support teams to improve editing ergonomics for long-form customer-facing documents."
          ]
        },
        {
          title: "Senior Full Stack Engineer",
          employer: "Harbour Analytics",
          date: "2019 - 2022",
          overview:
            "Built analytics workflows, integration services, and internal reporting tools for teams managing large operational datasets.",
          bullets: [
            "Designed a shared render model that powered web previews, PDF exports, and editable document output from one data source.",
            "Improved reliability of scheduled export jobs with typed configuration, deterministic formatting helpers, and focused unit tests.",
            "Documented compatibility constraints for downstream tools that imported generated Microsoft Office files."
          ]
        },
        {
          title: "Software Engineer",
          employer: "Civic Labs",
          date: "2016 - 2019",
          overview:
            "Delivered public-sector web applications with strong accessibility, maintainability, and audit requirements.",
          bullets: [
            "Built accessible form and review flows with progressive enhancement and robust validation.",
            "Maintained service integrations that transformed source records into user-facing documents and notifications.",
            "Supported production releases with incident follow-up, observability improvements, and concise technical documentation."
          ]
        }
      ]
    },
    {
      type: "projects",
      heading: "Projects",
      items: [
        {
          name: "Editable Report Builder",
          technologies: ["TypeScript", "DOCX", "Playwright", "Vitest"],
          bullets: [
            "Generated editable report documents from structured data while preserving content parity with browser-rendered previews.",
            "Tested pagination, table width behavior, and XML structure under long placeholder content."
          ]
        },
        {
          name: "Workflow Metrics Portal",
          technologies: ["React", "Node.js", "PostgreSQL"],
          bullets: [
            "Created dense operational dashboards for repeated daily use by support and management teams.",
            "Separated data transformation from presentation so metrics could be reused across screens and exports."
          ]
        }
      ]
    },
    {
      type: "list",
      heading: "Education",
      items: [
        "Bachelor of Engineering, Software Systems - Example University",
        "Postgraduate Certificate, Product Leadership - Example Institute"
      ]
    }
  ]
};

const writePrototype = async (fileName: string, buffer: Buffer): Promise<void> => {
  const outputPath = resolve(outputDir, fileName);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, buffer);
  console.log(`DOCX prototype exported to ${outputPath}`);
};

const createTablePrototype = async (): Promise<void> => {
  const document = createDocument({
    title: "DOCX table layout prototype",
    theme,
    children: [
      createSplitPageLayout({
        sidebarChildren: createSidebar(sidebarContent, theme),
        mainChildren: createMainColumn(mainContent, theme),
        theme
      })
    ]
  });

  await writePrototype("cv-table-layout.docx", await renderDocumentBuffer(document));
};

const createSectionColumnsPrototype = async (): Promise<void> => {
  const sidebarChildren = createSidebar(sidebarContent, theme);
  const mainChildren = createMainColumn(mainContent, theme);
  const document = createDocumentWithSectionColumns({
    title: "DOCX section columns prototype",
    theme,
    count: 2,
    space: 420,
    children: [
      ...sidebarChildren,
      new Paragraph({
        children: [new ColumnBreak()]
      }),
      ...mainChildren
    ]
  });

  await writePrototype("cv-section-columns.docx", await renderDocumentBuffer(document));
};

const createTextboxPrototype = async (): Promise<void> => {
  const textboxSidebarRuns = [
    new TextRun({
      text: sidebarContent.name,
      bold: true,
      break: 1,
      font: theme.text.sidebarTitle.font,
      size: theme.text.sidebarTitle.size,
      color: theme.colors.sidebarText
    }),
    new TextRun({
      text: sidebarContent.title,
      break: 1,
      font: theme.text.sidebarBody.font,
      size: theme.text.sidebarBody.size,
      color: theme.colors.sidebarText
    }),
    ...sidebarContent.sections.flatMap((section) => {
      const items =
        "groups" in section
          ? section.groups.flatMap((group) => [group.heading, ...group.items])
          : section.items;

      return [
        new TextRun({
          text: section.heading.toUpperCase(),
          bold: true,
          break: 2,
          font: theme.text.sidebarBody.font,
          size: theme.text.sidebarBody.size,
          color: theme.colors.sidebarText
        }),
        ...items.map(
          (item) =>
            new TextRun({
              text: `- ${item}`,
              break: 1,
              font: theme.text.sidebarBody.font,
              size: theme.text.sidebarBody.size,
              color: theme.colors.sidebarText
            })
        )
      ];
    })
  ];

  const mainChildren: FileChild[] = [
    new Paragraph({
      indent: { left: theme.layout.sidebarWidth + 420 },
      spacing: { after: theme.spacing.compactAfter },
      children: [
        new TextRun({
          text: "Textbox prototype",
          bold: true,
          font: theme.text.title.font,
          size: theme.text.title.size,
          color: theme.text.title.color
        })
      ]
    }),
    ...["Profile", "Experience", "Projects", "Education"].flatMap((heading, index) => [
      new Paragraph({
        indent: { left: theme.layout.sidebarWidth + 420 },
        spacing: {
          before: theme.spacing.sectionBefore,
          after: theme.spacing.sectionAfter
        },
        children: [
          new TextRun({
            text: heading,
            bold: true,
            font: theme.headings.mainSection.font,
            size: theme.headings.mainSection.size,
            color: theme.headings.mainSection.color
          })
        ]
      }),
      new Paragraph({
        indent: { left: theme.layout.sidebarWidth + 420 },
        spacing: {
          after: theme.spacing.paragraphAfter,
          line: theme.spacing.line
        },
        children: [
          new TextRun({
            text:
              index === 0 && mainContent.sections[0]?.type === "paragraph"
                ? mainContent.sections[0].content
                : "Placeholder content for the floating textbox comparison. This paragraph is intentionally verbose so wrapping, overlap behavior, and editability can be checked across DOCX viewers.",
            font: theme.text.body.font,
            size: theme.text.body.size,
            color: theme.text.body.color
          })
        ]
      })
    ])
  ];

  const document = createDocument({
    title: "DOCX textbox layout prototype",
    theme,
    children: [
      new Textbox({
        style: {
          width: "2.35in",
          height: "10.2in",
          position: "absolute",
          left: "0.35in",
          top: "0.35in",
          wrapStyle: "square",
          positionHorizontalRelative: "page",
          positionVerticalRelative: "page"
        },
        shading: {
          type: ShadingType.CLEAR,
          fill: theme.colors.sidebarBackground,
          color: theme.colors.sidebarBackground
        },
        children: textboxSidebarRuns
      }),
      ...mainChildren
    ]
  });

  await writePrototype("cv-textbox-layout.docx", await renderDocumentBuffer(document));
};

const exportPrototypes = async (): Promise<void> => {
  await createTablePrototype();
  await createSectionColumnsPrototype();
  await createTextboxPrototype();
};

exportPrototypes().catch((error: unknown) => {
  console.error("Failed to export DOCX layout prototypes");
  console.error(error);
  process.exitCode = 1;
});
