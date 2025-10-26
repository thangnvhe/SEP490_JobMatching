import type { Company } from "./company";

export interface Job {
    id: string;
    title: string;
    description: string;
    requirements: string;
    location: string;
    salary: number;
    jobType: string;
    status: JobStatus;
    companyId: string;
    company: Company;
    createdAt: string;
    updatedAt: string;
}

export type JobStatus = {
    ACTIVE: 'active',
    INACTIVE: "inactive";
    CLOSED: "closed";
    DRAFT: "draft";
}
