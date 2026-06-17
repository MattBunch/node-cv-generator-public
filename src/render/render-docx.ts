import type { Document } from "docx";
import type { CvData } from "../data/cv.js";
import {
  buildPolishedDocxDocument,
  buildPolishedDocxDocumentFromModel,
  renderPolishedDocxBuffer
} from "../templates/polished/render-docx.js";

export const buildDocxDocumentFromModel = buildPolishedDocxDocumentFromModel;

export const buildDocxDocument = (cv: CvData): Document => buildPolishedDocxDocument(cv);

export const renderDocxBuffer = (cv: CvData): Promise<Buffer> => renderPolishedDocxBuffer(cv);
