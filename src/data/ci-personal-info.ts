import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cvDataSchema, type CvData } from "./cv.schema.js";
import {
  localContactDataSchema,
  type LocalContactData
} from "./contact-local.js";

const dataDir = dirname(fileURLToPath(import.meta.url));

export const CI_PERSONAL_INFO_PATH = resolve(
  dataDir,
  "../../fixtures/ci-personal-info.json"
);

const parseCiPersonalInfoJson = (content: string, filePath: string): LocalContactData => {
  try {
    return localContactDataSchema.parse(JSON.parse(content));
  } catch (error) {
    throw new Error(`Invalid CI personal info fixture in ${filePath}.`, { cause: error });
  }
};

export const loadCiPersonalInfoData = (
  filePath: string = CI_PERSONAL_INFO_PATH
): LocalContactData => parseCiPersonalInfoJson(readFileSync(filePath, "utf8"), filePath);

export const mergeCiPersonalInfoData = (
  baseCv: CvData,
  ciPersonalInfo: LocalContactData
): CvData => {
  const mergedCv = {
    ...baseCv,
    contact: baseCv.contact.length > 0 ? baseCv.contact : ciPersonalInfo.contact,
    links: baseCv.links.length > 0 ? baseCv.links : ciPersonalInfo.links,
    ...(!baseCv.location && ciPersonalInfo.location
      ? { location: ciPersonalInfo.location }
      : {})
  };

  return cvDataSchema.parse(mergedCv);
};
