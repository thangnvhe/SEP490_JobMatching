
export interface Company {
    id: string;
    name: string;
    description: string;
    website: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    status: CompanyStatus;
    createdAt: string;
    updatedAt: string;
}

export type CompanyStatus = {
    ACTIVE: "active";
    INACTIVE: "inactive";
    PENDING: "pending";
}
