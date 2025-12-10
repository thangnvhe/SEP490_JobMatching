import { BaseApiServices } from "./base-api.service";
import { HighlightJob } from "@/models/highlight-job";

export const HighlightJobServices = {
  getMyHighlightJobs: () => BaseApiServices.getAll<HighlightJob[]>('/HighlightJob')
};
