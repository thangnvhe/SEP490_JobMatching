import { BaseApiServices } from "./base-api.service";
import type {
  RecruiterDashboard,
  HiringManagerDashboard,
  CandidateDashboard,
  AdminDashboard,
} from "@/models/dashboard";

export const DashboardServices = {
  getRecruiterDashboard: (month?: number, year?: number) =>
    BaseApiServices.getAll<RecruiterDashboard>("/RecruiterDashboard", { month: month ?? 0, year: year ?? 0 }),

  getHiringManagerDashboard: () =>
    BaseApiServices.getAll<HiringManagerDashboard>("/HiringManagerDashboard", {}),

  getCandidateDashboard: () =>
    BaseApiServices.getAll<CandidateDashboard>("/CandidateDashboard", {}),

  getAdminDashboard: (month?: number, year?: number) =>
    BaseApiServices.getAll<AdminDashboard>("/AdminDashboard", { month: month ?? 0, year: year ?? 0 }),
};
