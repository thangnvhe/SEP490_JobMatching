export interface Company {
  id: number;
  name: string;
  description: string;
  logo: string;
  email: string;
  website: string;
  address: string;
  phoneContact: string;
  status: number; // 0: Pending, 1: Approved, 3: Rejected
  taxCode: string;
  licenseFile: string;
  isActive: boolean; 
  score: number;
  rejectReason: string | null;
  createdAt: string;
  jobCount?: number; // Số tin tuyển dụng
  teamMembersCount?: number; // Số thành viên công ty
  recruitsCount?: number; // Số người đã tuyển
}

// Helper để convert status number thành string để hiển thị
export const getStatusString = (status: number): 'Pending' | 'Approved' | 'Rejected' => {
  switch (status) {
    case 0:
      return 'Pending';
    case 1:
      return 'Approved';  
    case 2:
      return 'Rejected';
    default:
      return 'Pending';
  }
};

// Helper để convert status string thành number để gửi API
export const getStatusNumber = (status: 'Pending' | 'Approved' | 'Rejected'): number => {
  switch (status) {
    case 'Pending':
      return 0;
    case 'Approved':
      return 1;
    case 'Rejected':
      return 2;
    default:
      return 0;
  }
};