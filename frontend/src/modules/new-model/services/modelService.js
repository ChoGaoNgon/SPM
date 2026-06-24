import fileDownload from 'js-file-download';
import axiosClient from '~/utils/axiosClient';

const API_URL = '/models';

class ModelService {
    async createModel(modelRequest) {
        try {
            const response = await axiosClient.post(API_URL, modelRequest);
            return response.data.message || 'Tạo mới model thành công';
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi tạo mới model';
            throw new Error(errorMessage);
        }
    }

    async updateModel(modelId, modelRequest) {
        try {
            const response = await axiosClient.put(`${API_URL}/${modelId}`, modelRequest);
            return response.data.message || 'Cập nhật model thành công';
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi cập nhật model';
            throw new Error(errorMessage);
        }
    }

    async getModelById(modelId) {
        try {
            const response = await axiosClient.get(`${API_URL}/${modelId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi lấy thông tin model';
            throw new Error(errorMessage);
        }
    }

    async getAllModels(pageable = {}) {
        try {
            const { page = 0, size = 20, sort } = pageable;
            const params = { page, size };
            if (sort) params.sort = sort;

            const response = await axiosClient.get(API_URL, { params });
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi lấy danh sách model';
            throw new Error(errorMessage);
        }
    }

    async deleteModel(modelId) {
        try {
            const response = await axiosClient.delete(`${API_URL}/${modelId}`);
            return response.data.message || 'Xóa model thành công';
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định khi xóa model';
            throw new Error(errorMessage);
        }
    }

    async searchModels(keyword, pageable = {}) {
        try {
            const { page = 0, size = 20, sort } = pageable;
            const params = { keyword, page, size };
            if (sort) params.sort = sort;

            const response = await axiosClient.get(`${API_URL}/search-models`, { params });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi tìm kiếm model nâng cao';
            throw new Error(errorMessage);
        }
    }

    async searchByProductCodeOrMoldCode(keyword, pageable = {}) {
        try {
            const { page = 0, size = 20, sort } = pageable;
            const params = { keyword, page, size };
            if (sort) params.sort = sort;

            const response = await axiosClient.get(`${API_URL}/search`, {
                params,
            });
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi tìm kiếm theo mã sản phẩm hoặc khuôn';
            throw new Error(errorMessage);
        }
    }

    async importModelsFromExcel(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axiosClient.post(`${API_URL}/import-from-excel`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data.message || 'Import sản phẩm từ file Excel thành công';
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi import từ file Excel';
            throw new Error(errorMessage);
        }
    }

    async approveAndSendMail(payload) {
        try {
            const response = await axiosClient.post(`${API_URL}/approve-and-send-mail`, payload);
            return response.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi phê duyệt và gửi mail';
            throw new Error(errorMessage);
        }
    }

    async downloadTemplate() {
        try {
            const response = await axiosClient.get(`${API_URL}/template`, {
                responseType: 'blob',
            });

            const contentDisposition = response.headers['content-disposition'];
            const fileNameMatch = contentDisposition?.match(/filename="?(.+)"?/);
            const fileName = fileNameMatch ? fileNameMatch[1] : 'new-model-template.xlsx';

            fileDownload(response.data, fileName);
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi tải file mẫu Excel';
            throw new Error(errorMessage);
        }
    }

    async getProductByModelId(modelId) {
        try {
            const response = await axiosClient.get(`${API_URL}/${modelId}/products`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi lấy danh sách sản phẩm theo model';
            throw new Error(errorMessage);
        }
    }
}

const modelService = new ModelService();
export default modelService;
