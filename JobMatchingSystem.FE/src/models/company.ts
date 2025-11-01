
export interface Company {
  CompanyId: string;
  CompanyName: string;
  Description: string;
  Logo: string;
  Email: string;
  Website: string;
  Address: string;
  PhoneContact: string;
  TaxCode: string;
  LicenseFile: string;
}

export type CompanyStatus = {
    ACTIVE: "active";
    INACTIVE: "inactive";
    PENDING: "pending";
}
