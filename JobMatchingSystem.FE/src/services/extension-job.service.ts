import type { ExtensionJob } from "@/models/extension-job";
import { BaseApiServices } from "./base-api.service";

export const ExtensionJobServices = {
  getMyExtensionJobs: () => BaseApiServices.getAll<ExtensionJob[]>('/ExtensionJob')
};
