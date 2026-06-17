import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename } from "node:path";
import AdmZip from "adm-zip";
import { validateCvData } from "../cv/validation.js";
import type { CvData, SkillGroup, WorkExperience } from "../data/cv.js";

export type CvLintSeverity = "error" | "warning";

export type CvLintIssue = {
  severity: CvLintSeverity;
  code: string;
  path: string;
  message: string;
};

export type CvLintOptions = {
  distPath: string;
  validateDocxPageCount?: boolean;
};

export type CvLintResult = {
  errors: CvLintIssue[];
  warnings: CvLintIssue[];
};

const REQUIRED_ATS_HEADINGS = [
  "Profile",
  "Technical Skills",
  "Experience",
  "Projects",
  "Education"
] as const;

const GENERATED_OUTPUTS = [
  "sample-cv-ats.pdf",
  "sample-cv-ats.docx",
  "sample-cv-ats.html",
  "sample-cv-polished.pdf",
  "sample-cv-polished.docx",
  "sample-cv-polished.html",
  "sample-references.pdf",
  "sample-references.docx"
] as const;

const FORBIDDEN_ATS_HTML_PATTERNS = [
  /two-column/i,
  /<aside\b/i,
  /\bgrid\b/i,
  /reference-grid/i,
  /<table\b/i,
  /<img\b/i,
  /\bicon[-_a-z0-9]*\b/i
] as const;

const SUSPICIOUS_WORDING = [
  "Testing Automation using the Cypress JavaScript",
  "AWS Infrastructure including EC2, Parameter Store CloudWatch, and Lambda"
] as const;

const UNCLEAR_CASING = [
  { text: "Opensearch", preferred: "OpenSearch" },
  { text: "Powershell", preferred: "PowerShell" }
] as const;

const wordCount = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;

const hasMeasurableResult = (text: string): boolean =>
  /\d[\d,.]*\s?(%|percent|ms|seconds?|minutes?|hours?|days?|users?|requests?|queries|pages?|applications?|metrics?|times?)/i.test(
    text
  );

const addIssue = (issues: CvLintIssue[], issue: CvLintIssue): void => {
  issues.push(issue);
};

const flattenCvText = (cv: CvData): string[] => [
  cv.name,
  cv.title,
  cv.profile,
  ...cv.contact.flatMap((item) => [item.label, item.value]),
  ...(cv.location ? [cv.location] : []),
  ...cv.links.flatMap((item) => [item.label, item.value]),
  ...cv.experience.flatMap((role) => [
    role.title,
    role.employer,
    role.date,
    role.location ?? "",
    role.overview,
    ...role.bullets
  ]),
  ...cv.skills.flatMap((group) => [group.name, ...group.items]),
  ...cv.education.map((item) => item.name),
  ...cv.certifications,
  ...cv.projects.flatMap((project) => [
    project.name,
    project.url ?? "",
    ...project.technologies,
    ...project.bullets
  ]),
  ...cv.references.flatMap((reference) => [reference.name, ...reference.details])
];

const hasAnyLinkLabel = (cv: CvData, labels: readonly string[]): boolean =>
  cv.links.some((link) => labels.some((label) => link.label.toLowerCase().includes(label)));

const addSourceDataIssues = (cv: CvData, issues: CvLintIssue[]): void => {
  for (const validationIssue of validateCvData(cv)) {
    addIssue(issues, {
      severity: "error",
      code: "source.invalid",
      path: validationIssue.path,
      message: validationIssue.message
    });
  }

  if (cv.contact.length === 0) {
    addIssue(issues, {
      severity: "warning",
      code: "market.contact.empty",
      path: "contact",
      message: "Contact array is empty; verify whether email and phone are available."
    });
  }

  if (!cv.location) {
    addIssue(issues, {
      severity: "warning",
      code: "market.location.missing",
      path: "location",
      message: "Location is missing from the source CV data."
    });
  }

  if (cv.links.length === 0) {
    addIssue(issues, {
      severity: "warning",
      code: "market.links.empty",
      path: "links",
      message: "Links array is empty; verify LinkedIn, GitHub, or portfolio URLs before adding them."
    });
  }

  if (cv.projects.length === 0) {
    addIssue(issues, {
      severity: "warning",
      code: "market.projects.empty",
      path: "projects",
      message: "Projects array is empty for a software developer CV."
    });
  }

  if (cv.certifications.length === 0) {
    addIssue(issues, {
      severity: "warning",
      code: "market.certifications.empty",
      path: "certifications",
      message: "Certifications are empty; leave empty unless verified certifications are supplied."
    });
  }

  cv.skills.forEach((group: SkillGroup, index: number) => {
    if (group.items.length === 0) {
      addIssue(issues, {
        severity: "warning",
        code: "market.skill-group.empty",
        path: `skills[${index}].items`,
        message: `Skill group "${group.name}" has no items.`
      });
    }
  });

  const allText = flattenCvText(cv).join("\n");
  for (const wording of SUSPICIOUS_WORDING) {
    if (allText.includes(wording)) {
      addIssue(issues, {
        severity: "warning",
        code: "content.suspicious-wording",
        path: "skills",
        message: `Suspicious extracted wording is present: "${wording}".`
      });
    }
  }

  for (const casing of UNCLEAR_CASING) {
    if (allText.includes(casing.text)) {
      addIssue(issues, {
        severity: "warning",
        code: "content.skill-casing",
        path: "skills",
        message: `Skill casing may need review: "${casing.text}" versus "${casing.preferred}".`
      });
    }
  }

  cv.experience.forEach((role: WorkExperience, roleIndex: number) => {
    if (!/^\w{3} \d{4} - (\w{3} \d{4}|Present)$/.test(role.date)) {
      addIssue(issues, {
        severity: "warning",
        code: "content.date-format",
        path: `experience[${roleIndex}].date`,
        message: `Date range "${role.date}" should be reviewed for consistent formatting.`
      });
    }

    role.bullets.forEach((bullet, bulletIndex) => {
      if (wordCount(bullet) > 32) {
        addIssue(issues, {
          severity: "warning",
          code: "content.bullet.long",
          path: `experience[${roleIndex}].bullets[${bulletIndex}]`,
          message: "Bullet is longer than 32 words."
        });
      }
    });
  });

  if (wordCount(cv.profile) > 70) {
    addIssue(issues, {
      severity: "warning",
      code: "content.summary.long",
      path: "profile",
      message: "Summary is longer than 70 words."
    });
  }

  if (!cv.experience.some((role) => role.bullets.some(hasMeasurableResult))) {
    addIssue(issues, {
      severity: "warning",
      code: "market.achievements.no-measures",
      path: "experience",
      message: "No measurable achievements were found in experience bullets."
    });
  }

  for (const linkType of ["linkedin", "github", "portfolio"] as const) {
    if (!hasAnyLinkLabel(cv, [linkType])) {
      addIssue(issues, {
        severity: "warning",
        code: `market.links.${linkType}.missing`,
        path: "links",
        message: `No ${linkType} link is present in source CV data.`
      });
    }
  }
};

const readDocxText = (path: string): string => {
  const zip = new AdmZip(readFileSync(path));
  const entry = zip.getEntry("word/document.xml");

  if (!entry) {
    return "";
  }

  return entry.getData().toString("utf8");
};

const decodeXmlText = (text: string): string =>
  text
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const readDocxPlainText = (path: string): string =>
  [...readDocxText(path).matchAll(/<w:t(?: [^>]*)?>(.*?)<\/w:t>/g)]
    .map((match) => decodeXmlText(match[1] ?? ""))
    .join("\n");

const commandExists = (command: string): boolean => {
  try {
    execFileSync("which", [command], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

const readPdfText = (path: string): string | undefined => {
  if (!commandExists("pdftotext")) {
    return undefined;
  }

  try {
    return execFileSync("pdftotext", ["-layout", path, "-"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
  } catch {
    return undefined;
  }
};

const readPdfPageCount = (path: string): number | undefined => {
  if (!commandExists("pdfinfo")) {
    return undefined;
  }

  try {
    const output = execFileSync("pdfinfo", [path], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    const pages = /^Pages:\s+(\d+)$/m.exec(output)?.[1];
    return pages ? Number.parseInt(pages, 10) : undefined;
  } catch {
    return undefined;
  }
};

const convertDocxToPdf = (docxPath: string): string => {
  const outdir = mkdtempSync(`${tmpdir()}/cv-generator-validate-`);
  const profileDir = mkdtempSync(`${tmpdir()}/cv-generator-libreoffice-`);

  execFileSync(
    "soffice",
    [
      `-env:UserInstallation=file://${profileDir}`,
      "--headless",
      "--convert-to",
      "pdf",
      "--outdir",
      outdir,
      docxPath
    ],
    { stdio: "pipe" }
  );

  return `${outdir}/${basename(docxPath).replace(/\.docx$/i, ".pdf")}`;
};

const assertReferencesAbsent = (
  cv: CvData,
  text: string,
  path: string,
  issues: CvLintIssue[]
): void => {
  if (text.includes("References available on request")) {
    addIssue(issues, {
      severity: "error",
      code: "references.request-note",
      path,
      message: "Main CV output includes the application references note."
    });
  }

  for (const needle of referenceLeakNeedles(cv)) {
    if (needle.length > 0 && text.includes(needle)) {
      addIssue(issues, {
        severity: "error",
        code: "references.leak",
        path,
        message: `Main CV output includes full reference detail: "${needle}".`
      });
    }
  }
};

const assertProjectsBeforeEducation = (
  text: string,
  path: string,
  issues: CvLintIssue[]
): void => {
  const normalizedText = text.toLowerCase();
  const projectsIndex = normalizedText.indexOf("projects");
  const educationIndex = normalizedText.indexOf("education");

  if (projectsIndex === -1 || educationIndex === -1 || projectsIndex > educationIndex) {
    addIssue(issues, {
      severity: "error",
      code: "sections.order",
      path,
      message: "Projects must appear before Education."
    });
  }
};

const assertNoNumberedListArtifacts = (
  text: string,
  path: string,
  issues: CvLintIssue[]
): void => {
  const repeatedNumberedBullets = text.match(/(?:^|\n)\s*1\.\s+/g) ?? [];

  if (repeatedNumberedBullets.length > 1) {
    addIssue(issues, {
      severity: "error",
      code: "docx.numbered-list-artifact",
      path,
      message: "DOCX text contains repeated numbered-list artifacts."
    });
  }
};

const referenceLeakNeedles = (cv: CvData): string[] =>
  cv.references.flatMap((reference) => [
    reference.name,
    ...reference.details.flatMap((detail) => {
      if (!/phone:|email:|@|\d{3}/i.test(detail)) {
        return [];
      }

      const [, value] = detail.split(":");
      return value ? [detail, value.trim()] : [detail];
    })
  ]);

const addGeneratedOutputIssues = (
  cv: CvData,
  options: CvLintOptions,
  issues: CvLintIssue[]
): void => {
  for (const filename of GENERATED_OUTPUTS) {
    const path = `${options.distPath}/${filename}`;
    if (!existsSync(path)) {
      addIssue(issues, {
        severity: "error",
        code: "output.missing",
        path,
        message: "Generated output is missing."
      });
    }
  }

  const atsHtmlPath = `${options.distPath}/sample-cv-ats.html`;
  if (existsSync(atsHtmlPath)) {
    const atsHtml = readFileSync(atsHtmlPath, "utf8");

    for (const pattern of FORBIDDEN_ATS_HTML_PATTERNS) {
      if (pattern.test(atsHtml)) {
        addIssue(issues, {
          severity: "error",
          code: "ats.html.forbidden-layout",
          path: atsHtmlPath,
          message: `ATS HTML matches forbidden pattern ${pattern.toString()}.`
        });
      }
    }

    for (const heading of REQUIRED_ATS_HEADINGS) {
      if (!atsHtml.includes(heading)) {
        addIssue(issues, {
          severity: "error",
          code: "ats.html.heading-missing",
          path: atsHtmlPath,
          message: `ATS HTML is missing required heading "${heading}".`
        });
      }
    }
  }

  const atsDocxPath = `${options.distPath}/sample-cv-ats.docx`;
  if (existsSync(atsDocxPath)) {
    const atsDocxText = readDocxText(atsDocxPath);
    const atsDocxPlainText = readDocxPlainText(atsDocxPath);
    for (const heading of REQUIRED_ATS_HEADINGS) {
      if (!atsDocxText.includes(heading)) {
        addIssue(issues, {
          severity: "error",
          code: "ats.docx.heading-missing",
          path: atsDocxPath,
          message: `ATS DOCX is missing required heading "${heading}".`
        });
      }
    }

    assertProjectsBeforeEducation(atsDocxPlainText, atsDocxPath, issues);
    assertNoNumberedListArtifacts(atsDocxPlainText, atsDocxPath, issues);
  }

  for (const filename of [
    "sample-cv-ats.html",
    "sample-cv-ats.docx",
    "sample-cv-polished.html",
    "sample-cv-polished.docx"
  ]) {
    const path = `${options.distPath}/${filename}`;
    if (!existsSync(path)) {
      continue;
    }

    const text = filename.endsWith(".docx") ? readDocxText(path) : readFileSync(path, "utf8");
    assertReferencesAbsent(cv, text, path, issues);
  }

  const polishedPdfPath = `${options.distPath}/sample-cv-polished.pdf`;
  if (existsSync(polishedPdfPath)) {
    const pageCount = readPdfPageCount(polishedPdfPath);
    if (pageCount !== undefined && pageCount !== 1) {
      addIssue(issues, {
        severity: "error",
        code: "polished.pdf.page-count",
        path: polishedPdfPath,
        message: `Polished PDF should be one page; found ${pageCount}.`
      });
    }

    const polishedPdfText = readPdfText(polishedPdfPath);
    if (polishedPdfText) {
      assertReferencesAbsent(cv, polishedPdfText, polishedPdfPath, issues);
      assertProjectsBeforeEducation(polishedPdfText, polishedPdfPath, issues);
    }
  }

  const polishedDocxPath = `${options.distPath}/sample-cv-polished.docx`;
  if (existsSync(polishedDocxPath)) {
    const polishedDocxXml = readDocxText(polishedDocxPath);
    const polishedDocxPlainText = readDocxPlainText(polishedDocxPath);

    assertReferencesAbsent(cv, polishedDocxXml, polishedDocxPath, issues);
    assertProjectsBeforeEducation(polishedDocxPlainText, polishedDocxPath, issues);
    assertNoNumberedListArtifacts(polishedDocxPlainText, polishedDocxPath, issues);

    if (polishedDocxXml.includes("<w:numPr>")) {
      addIssue(issues, {
        severity: "error",
        code: "docx.numbering",
        path: polishedDocxPath,
        message: "Polished DOCX should use plain visual bullets, not Word numbering."
      });
    }

    if (options.validateDocxPageCount && commandExists("soffice") && commandExists("pdfinfo")) {
      try {
        const convertedPdfPath = convertDocxToPdf(polishedDocxPath);
        const pageCount = readPdfPageCount(convertedPdfPath);
        if (pageCount !== 1) {
          addIssue(issues, {
            severity: "error",
            code: "polished.docx.page-count",
            path: polishedDocxPath,
            message: `Polished DOCX should render as one page; converted PDF has ${pageCount ?? "unknown"} pages.`
          });
        }
      } catch (error: unknown) {
        addIssue(issues, {
          severity: "error",
          code: "polished.docx.page-count-unavailable",
          path: polishedDocxPath,
          message: `Could not convert polished DOCX for page-count validation: ${String(error)}`
        });
      }
    }
  }
};

export const lintCv = (cv: CvData, options: CvLintOptions): CvLintResult => {
  const issues: CvLintIssue[] = [];

  addSourceDataIssues(cv, issues);
  addGeneratedOutputIssues(cv, options, issues);

  return {
    errors: issues.filter((issue) => issue.severity === "error"),
    warnings: issues.filter((issue) => issue.severity === "warning")
  };
};
