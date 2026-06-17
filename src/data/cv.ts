import cvJson from "./cv.json" with { type: "json" };
import {
  loadCiPersonalInfoData,
  mergeCiPersonalInfoData
} from "./ci-personal-info.js";
import { cvDataSchema } from "./cv.schema.js";
import { loadLocalContactData, mergeLocalContactData } from "./contact-local.js";

export type {
  ContactItem,
  CvData,
  EducationItem,
  Project,
  Reference,
  SkillGroup,
  WorkExperience
} from "./cv.schema.js";

export const cv = cvDataSchema.parse(cvJson);
export const cvWithLocalContact = mergeLocalContactData(cv, loadLocalContactData());
const cvWithOptionalLocalContact =
  process.env.CV_INCLUDE_LOCAL_CONTACT === "true" ? cvWithLocalContact : cv;

export const cvForExport =
  process.env.CV_USE_CI_FIXTURE_DATA === "true"
    ? mergeCiPersonalInfoData(cvWithOptionalLocalContact, loadCiPersonalInfoData())
    : cvWithOptionalLocalContact;
