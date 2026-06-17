import type { CvData } from "../data/cv.js";
import { escapeHtml } from "./html-utils.js";
import {
  renderPolishedHtml,
  renderPolishedHtmlFromModel
} from "../templates/polished/render-html.js";

export const renderHtmlFromModel = renderPolishedHtmlFromModel;

export const renderHtml = (cv: CvData, css: string): string => renderPolishedHtml(cv, css);

export const htmlTestUtils = {
  escapeHtml
};
