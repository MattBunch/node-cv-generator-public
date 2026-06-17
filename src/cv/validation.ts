import type { CvData, Project, WorkExperience } from "../data/cv.js";

export type CvValidationIssue = {
  path: string;
  message: string;
};

const isBlank = (value: string): boolean => value.trim().length === 0;

const requiredText = (issues: CvValidationIssue[], path: string, value: string): void => {
  if (isBlank(value)) {
    issues.push({ path, message: "Required text is empty." });
  }
};

const validateRole = (
  issues: CvValidationIssue[],
  role: WorkExperience,
  index: number
): void => {
  const path = `experience[${index}]`;

  requiredText(issues, `${path}.title`, role.title);
  requiredText(issues, `${path}.employer`, role.employer);
  requiredText(issues, `${path}.date`, role.date);
  requiredText(issues, `${path}.overview`, role.overview);

  if (role.bullets.length === 0) {
    issues.push({ path: `${path}.bullets`, message: "Expected at least one bullet." });
  }
};

const validateProject = (issues: CvValidationIssue[], project: Project, index: number): void => {
  const path = `projects[${index}]`;

  requiredText(issues, `${path}.name`, project.name);

  if (project.bullets.length === 0) {
    issues.push({ path: `${path}.bullets`, message: "Expected at least one bullet." });
  }
};

export const validateCvData = (cv: CvData): CvValidationIssue[] => {
  const issues: CvValidationIssue[] = [];

  requiredText(issues, "name", cv.name);
  requiredText(issues, "title", cv.title);
  requiredText(issues, "profile", cv.profile);

  if (cv.experience.length === 0) {
    issues.push({ path: "experience", message: "Expected at least one role." });
  }

  if (cv.skills.length === 0) {
    issues.push({ path: "skills", message: "Expected at least one skill group." });
  }

  if (cv.education.length === 0) {
    issues.push({ path: "education", message: "Expected at least one education item." });
  }

  if (cv.references.length === 0) {
    issues.push({ path: "references", message: "Expected at least one reference." });
  }

  cv.experience.forEach((role, index) => {
    validateRole(issues, role, index);
  });

  cv.skills.forEach((group, index) => {
    const path = `skills[${index}]`;
    requiredText(issues, `${path}.name`, group.name);
  });

  cv.education.forEach((item, index) => {
    requiredText(issues, `education[${index}].name`, item.name);
  });

  cv.projects.forEach((project, index) => {
    validateProject(issues, project, index);
  });

  cv.references.forEach((reference, index) => {
    const path = `references[${index}]`;
    requiredText(issues, `${path}.name`, reference.name);

    if (reference.details.length === 0) {
      issues.push({ path: `${path}.details`, message: "Expected at least one detail." });
    }
  });

  return issues;
};
