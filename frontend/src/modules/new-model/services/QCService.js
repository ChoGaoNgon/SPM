import axiosClient from '~/utils/axiosClient';

const API_URL = '/product-defect-codes';

class DefectCodeService {
    async getAllDefectCodes() {
        try {
            const response = await axiosClient.get(API_URL);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi lấy danh sách mã lỗi';
            throw new Error(errorMessage);
        }
    }
}

const defectCodeService = new DefectCodeService();
export default defectCodeService;
