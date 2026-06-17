export const CV_SECTION_IDS = [
  "profile",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "references"
] as const;

export type CvSectionId = (typeof CV_SECTION_IDS)[number];

export const CV_SECTION_LABELS: Record<CvSectionId, string> = {
  profile: "Profile",
  experience: "Experience",
  skills: "Technical Skills",
  education: "Education",
  certifications: "Certifications",
  projects: "Projects",
  references: "References"
};

export const getOrderedSectionIds = (): CvSectionId[] => [...CV_SECTION_IDS];
