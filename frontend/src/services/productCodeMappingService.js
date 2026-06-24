import axiosClient from '~/utils/axiosClient';

const API_URL = '/product-code-mappings';

class ProductCodeMappingService {
    async importFromExcel(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axiosClient.post(`${API_URL}/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data.message || 'Import mapping mã sản phẩm thành công';
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi import mapping mã sản phẩm';
            throw new Error(errorMessage);
        }
    }
}

export default new ProductCodeMappingService();
