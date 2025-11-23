import axios, { AxiosInstance } from 'axios';

// Base URL cho API tỉnh thành Việt Nam (sử dụng API v2)
const PROVINCES_API_BASE_URL = 'https://provinces.open-api.vn/api/v2';

// Tạo axios instance riêng cho API external (không dùng interceptor của backend)
const provincesApiClient: AxiosInstance = axios.create({
  baseURL: PROVINCES_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface cho Tỉnh/Thành phố
export interface Province {
  code: string;
  name: string;
  nameEn: string;
  fullName: string;
  fullNameEn: string;
  codeName: string;
  administrativeUnitId: number;
  administrativeRegionId: number;
  // Các trường này chỉ có khi depth > 1
  districts?: District[];
}

// Interface mở rộng cho Province với districts (khi depth = 2)
export interface ProvinceWithDistricts extends Province {
  districts: District[];
}

// Interface mở rộng cho District với wards (khi depth = 2)
export interface DistrictWithWards extends District {
  wards: Ward[];
}

// Interface cho Quận/Huyện
export interface District {
  code: string;
  name: string;
  nameEn: string;
  fullName: string;
  fullNameEn: string;
  codeName: string;
  provinceCode: string;
  administrativeUnitId: number;
}

// Interface cho Phường/Xã
export interface Ward {
  code: string;
  name: string;
  nameEn: string;
  fullName: string;
  fullNameEn: string;
  codeName: string;
  districtCode: string;
  administrativeUnitId: number;
}

export const ProvincesService = {
  /**
   * Lấy danh sách tất cả tỉnh/thành phố
   * Endpoint: GET /api/v2/p
   * @param depth - Độ sâu dữ liệu (1: chỉ tỉnh, 2: tỉnh + quận/huyện, 3: tỉnh + quận/huyện + phường/xã)
   */
  getAllProvinces: async (depth: 1 | 2 | 3 = 1): Promise<Province[]> => {
    try {
      const response = await provincesApiClient.get<Province[]>('/p', {
        params: depth > 1 ? { depth } : undefined,
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết một tỉnh/thành phố theo mã
   * Endpoint: GET /api/v2/p/{code}
   * @param code - Mã tỉnh/thành phố
   * @param depth - Độ sâu dữ liệu (1: chỉ tỉnh, 2: tỉnh + quận/huyện, 3: tỉnh + quận/huyện + phường/xã)
   */
  getProvinceByCode: async (code: string, depth: 1 | 2 | 3 = 1): Promise<Province> => {
    try {
      const response = await provincesApiClient.get<Province>(`/p/${code}`, {
        params: depth > 1 ? { depth } : undefined,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching province with code ${code}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách quận/huyện theo mã tỉnh/thành phố
   * Endpoint: GET /api/v2/p/{provinceCode}?depth=2
   */
  getDistrictsByProvinceCode: async (provinceCode: string): Promise<District[]> => {
    try {
      const response = await provincesApiClient.get<ProvinceWithDistricts>(`/p/${provinceCode}`, {
        params: { depth: 2 },
      });
      // Response sẽ có districts khi depth = 2
      return response.data.districts || [];
    } catch (error) {
      console.error(`Error fetching districts for province ${provinceCode}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách tất cả quận/huyện
   * Endpoint: GET /api/v2/d
   */
  getAllDistricts: async (): Promise<District[]> => {
    try {
      const response = await provincesApiClient.get<District[]>('/d');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết một quận/huyện theo mã
   * Endpoint: GET /api/v2/d/{code}
   */
  getDistrictByCode: async (code: string): Promise<District> => {
    try {
      const response = await provincesApiClient.get<District>(`/d/${code}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching district with code ${code}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phường/xã theo mã quận/huyện
   * Endpoint: GET /api/v2/d/{districtCode}?depth=2
   */
  getWardsByDistrictCode: async (districtCode: string): Promise<Ward[]> => {
    try {
      const response = await provincesApiClient.get<DistrictWithWards>(`/d/${districtCode}`, {
        params: { depth: 2 },
      });
      // Response sẽ có wards khi depth = 2
      return response.data.wards || [];
    } catch (error) {
      console.error(`Error fetching wards for district ${districtCode}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách tất cả phường/xã
   * Endpoint: GET /api/v2/w
   */
  getAllWards: async (): Promise<Ward[]> => {
    try {
      const response = await provincesApiClient.get<Ward[]>('/w');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching wards:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết một phường/xã theo mã
   * Endpoint: GET /api/v2/w/{code}
   */
  getWardByCode: async (code: string): Promise<Ward> => {
    try {
      const response = await provincesApiClient.get<Ward>(`/w/${code}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ward with code ${code}:`, error);
      throw error;
    }
  },
};
