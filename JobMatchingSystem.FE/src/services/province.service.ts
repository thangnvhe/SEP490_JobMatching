// Service để lấy danh sách tỉnh thành Việt Nam từ API public
export interface Province {
  id: string;
  name: string;
  code: string;
}

export const ProvinceService = {
  // Lấy danh sách tỉnh thành từ API provinces.open-api.vn
  getProvinces: async (): Promise<Province[]> => {
    try {
      const response = await fetch('https://provinces.open-api.vn/api/p/');
      if (!response.ok) {
        throw new Error('Failed to fetch provinces');
      }
      const data = await response.json();
      
      // Map data thành format cần thiết
      return data.map((province: any) => ({
        id: province.code,
        name: province.name,
        code: province.code,
      }));
    } catch (error) {
      console.error('Error fetching provinces:', error);
      // Fallback data nếu API không hoạt động
      return [
        { id: "01", name: "Hà Nội", code: "01" },
        { id: "79", name: "Hồ Chí Minh", code: "79" },
        { id: "48", name: "Đà Nẵng", code: "48" },
        { id: "92", name: "Cần Thơ", code: "92" },
        { id: "31", name: "Hải Phòng", code: "31" },
        // Thêm một số tỉnh phổ biến khác
        { id: "35", name: "Hà Nam", code: "35" },
        { id: "40", name: "Hưng Yên", code: "40" },
        { id: "36", name: "Hà Tĩnh", code: "36" },
        { id: "38", name: "Thanh Hóa", code: "38" },
        { id: "37", name: "Nghệ An", code: "37" },
      ];
    }
  },
};