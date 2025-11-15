export interface Company {
  id: number;
  name: string;
  description: string;
  logo: string;
  email: string;
  website: string;
  address: string;
  phoneContact: string;
  status: number; // 1: Pending, 2: Approved, 3: Rejected
  taxCode: string;
  licenseFile: string;
}

// Helper để convert status number thành string để hiển thị
export const getStatusString = (status: number): 'Pending' | 'Approved' | 'Rejected' => {
  switch (status) {
    case 1:
      return 'Pending';
    case 2:
      return 'Approved';  
    case 3:
      return 'Rejected';
    default:
      return 'Pending';
  }
};

// Helper để convert status string thành number để gửi API
export const getStatusNumber = (status: 'Pending' | 'Approved' | 'Rejected'): number => {
  switch (status) {
    case 'Pending':
      return 1;
    case 'Approved':
      return 2;
    case 'Rejected':
      return 3;
    default:
      return 1;
  }
};