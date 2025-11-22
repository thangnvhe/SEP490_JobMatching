export interface HiringManager {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
  department: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  companyId: number;
  avatar?: string;
}

export interface CreateHiringManagerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
  department: string;
  password: string;
  companyId: number;
}

// Sample data for development
export const sampleHiringManagers: HiringManager[] = [
  {
    id: 1,
    firstName: "Nguyễn",
    lastName: "Văn An",
    email: "an.nguyen@company.com",
    phoneNumber: "0901234567",
    position: "Senior HR Manager",
    department: "Nhân sự",
    isActive: true,
    createdAt: "2024-01-15T08:00:00Z",
    lastLoginAt: "2024-11-22T10:30:00Z",
    companyId: 1,
    avatar: ""
  },
  {
    id: 2,
    firstName: "Trần",
    lastName: "Thị Bình",
    email: "binh.tran@company.com",
    phoneNumber: "0912345678",
    position: "Recruitment Specialist",
    department: "Nhân sự",
    isActive: true,
    createdAt: "2024-02-20T09:00:00Z",
    lastLoginAt: "2024-11-22T09:15:00Z",
    companyId: 1
  },
  {
    id: 3,
    firstName: "Lê",
    lastName: "Minh Cường",
    email: "cuong.le@company.com",
    phoneNumber: "0923456789",
    position: "HR Business Partner",
    department: "Nhân sự",
    isActive: false,
    createdAt: "2024-03-10T10:00:00Z",
    lastLoginAt: "2024-11-20T14:20:00Z",
    companyId: 1
  },
  {
    id: 4,
    firstName: "Phạm",
    lastName: "Thị Dung",
    email: "dung.pham@company.com",
    phoneNumber: "0934567890",
    position: "Talent Acquisition Manager",
    department: "Nhân sự",
    isActive: true,
    createdAt: "2024-04-05T11:00:00Z",
    lastLoginAt: "2024-11-22T08:45:00Z",
    companyId: 1
  },
  {
    id: 5,
    firstName: "Hoàng",
    lastName: "Văn Em",
    email: "em.hoang@company.com",
    phoneNumber: "0945678901",
    position: "Junior HR Specialist",
    department: "Nhân sự",
    isActive: true,
    createdAt: "2024-05-12T12:00:00Z",
    lastLoginAt: "2024-11-21T16:30:00Z",
    companyId: 1
  },
  {
    id: 6,
    firstName: "Võ",
    lastName: "Thị Giang",
    email: "giang.vo@company.com",
    phoneNumber: "0956789012",
    position: "HR Manager",
    department: "Nhân sự",
    isActive: false,
    createdAt: "2024-06-18T13:00:00Z",
    lastLoginAt: "2024-11-18T12:00:00Z",
    companyId: 1
  }
];