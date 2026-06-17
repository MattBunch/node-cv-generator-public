import { z } from "zod";

export const contactItemSchema = z.object({
  label: z.string(),
  value: z.string()
});

export const workExperienceSchema = z.object({
  title: z.string(),
  employer: z.string(),
  date: z.string(),
  location: z.string().optional(),
  overview: z.string(),
  bullets: z.array(z.string())
});

export const skillGroupSchema = z.object({
  name: z.string(),
  items: z.array(z.string())
});

export const educationItemSchema = z.object({
  name: z.string(),
  includeInApplicationCv: z.boolean().default(true)
});

export const referenceSchema = z.object({
  name: z.string(),
  details: z.array(z.string())
});

export const projectSchema = z.object({
  name: z.string(),
  url: z.string().optional(),
  technologies: z.array(z.string()),
  bullets: z.array(z.string())
});

export const applicationReferencesModeSchema = z.enum(["omit", "request"]);

export const outputOptionsSchema = z
  .object({
    references: z
      .object({
        applicationMode: applicationReferencesModeSchema.default("omit")
      })
      .default({ applicationMode: "omit" })
  })
  .default({ references: { applicationMode: "omit" } });

export const cvDataSchema = z.object({
  name: z.string(),
  title: z.string(),
  contact: z.array(contactItemSchema),
  location: z.string().optional(),
  links: z.array(contactItemSchema),
  profile: z.string(),
  experience: z.array(workExperienceSchema),
  skills: z.array(skillGroupSchema),
  education: z.array(educationItemSchema),
  certifications: z.array(z.string()),
  projects: z.array(projectSchema),
  references: z.array(referenceSchema),
  outputOptions: outputOptionsSchema
});

export type ContactItem = z.infer<typeof contactItemSchema>;
export type ApplicationReferencesMode = z.infer<typeof applicationReferencesModeSchema>;
export type WorkExperience = z.infer<typeof workExperienceSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type Reference = z.infer<typeof referenceSchema>;
export type Project = z.infer<typeof projectSchema>;
export type CvData = z.infer<typeof cvDataSchema>;
