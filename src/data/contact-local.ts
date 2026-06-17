import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { contactItemSchema, cvDataSchema, type CvData } from "./cv.schema.js";

const dataDir = dirname(fileURLToPath(import.meta.url));

export const LOCAL_CONTACT_PATH = resolve(dataDir, "contact.local.json");

export const localContactDataSchema = z
  .object({
    contact: z.array(contactItemSchema).default([]),
    links: z.array(contactItemSchema).default([]),
    location: z.string().optional()
  })
  .strict();

export type LocalContactData = z.infer<typeof localContactDataSchema>;

export const EMPTY_LOCAL_CONTACT_DATA: LocalContactData = {
  contact: [],
  links: []
};

const parseLocalContactJson = (content: string, filePath: string): LocalContactData => {
  try {
    return localContactDataSchema.parse(JSON.parse(content));
  } catch (error) {
    throw new Error(`Invalid local contact data in ${filePath}.`, { cause: error });
  }
};

export const loadLocalContactData = (filePath: string = LOCAL_CONTACT_PATH): LocalContactData => {
  if (!existsSync(filePath)) {
    return EMPTY_LOCAL_CONTACT_DATA;
  }

  return parseLocalContactJson(readFileSync(filePath, "utf8"), filePath);
};

export const mergeLocalContactData = (
  baseCv: CvData,
  localContact: LocalContactData
): CvData => {
  const mergedCv = {
    ...baseCv,
    contact: localContact.contact,
    links: localContact.links,
    ...(localContact.location ? { location: localContact.location } : {})
  };

  return cvDataSchema.parse(mergedCv);
};
