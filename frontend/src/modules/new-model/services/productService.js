import axiosClient from '~/utils/axiosClient';

const API_URL = '/products';

const buildProductMultipartFormData = ({
    modelId,
    data,
    uploadFiles = [],
    keptOldFiles = [],
    deletedOldFiles = [],
}) => {
    const formData = new FormData();

    if (modelId !== undefined && modelId !== null && modelId !== '') {
        formData.append('modelId', modelId);
    }

    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));

    uploadFiles.forEach((file) => {
        const actualFile = file?.originFileObj || file;
        if (actualFile instanceof Blob) {
            formData.append('uploadFiles', actualFile);
        }
    });

    formData.append('keptOldFiles', JSON.stringify(keptOldFiles));
    formData.append('deletedOldFiles', JSON.stringify(deletedOldFiles));

    return formData;
};

const normalizeProductAttachments = (product) => {
    if (!product) return product;

    let files = [];

    if (Array.isArray(product.files) && product.files.length > 0) {
        files = product.files;
    } else if (Array.isArray(product.fileUrls) && product.fileUrls.length > 0) {
        files = product.fileUrls.map((fileUrl) => ({
            filePath: fileUrl,
            remark: fileUrl?.split('/').pop(),
        }));
    } else if (product.fileUrl) {
        files = [
            {
                filePath: product.fileUrl,
                remark: product.fileUrl?.split('/').pop(),
            },
        ];
    }

    return {
        ...product,
        files,
    };
};

class ProductService {
    async createProduct(payloadOrFormData) {
        try {
            const formData =
                payloadOrFormData instanceof FormData
                    ? payloadOrFormData
                    : buildProductMultipartFormData(payloadOrFormData || {});

            const response = await axiosClient.post('/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            throw new Error(error?.response?.data?.message);
        }
    }

    async createManyProducts(requests) {
        try {
            const response = await axiosClient.post('/products/many', requests);
            return response.data;
        } catch (error) {
            throw new Error(error?.response?.data?.message);
        }
    }

    async updateProduct(payloadOrFormData, id) {
        try {
            const formData =
                payloadOrFormData instanceof FormData
                    ? payloadOrFormData
                    : buildProductMultipartFormData(payloadOrFormData || {});

            const res = await axiosClient.put(`products/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            return res.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Lỗi chỉnh sửa sản phẩm');
        }
    }

    async updateNmdInfoStatus(id, payload) {
        try {
            const res = await axiosClient.put(`products/${id}/nmd-info`, payload);
            return res.data;
        } catch (error) {
            throw new Error(error?.response?.data?.message || 'Lỗi cập nhật trạng thái NMD');
        }
    }

    async approveProduct(id) {
        try {
            const res = await axiosClient.patch(`products/${id}/approve-by-head-kd`);
            return res.data;
        } catch (error) {
            throw new Error(error?.response?.data?.message || 'Lỗi duyệt thông tin sản phẩm');
        }
    }

    async deleteProduct(id) {
        try {
            const response = await axiosClient.delete(`${API_URL}/${id}`);
            return response.data.message;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi xóa sản phẩm';
            throw new Error(errorMessage);
        }
    }

    async duplicateProduct(id) {
        try {
            const response = await axiosClient.post(`${API_URL}/${id}/duplicate`);
            return response.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi sao chép sản phẩm';
            throw new Error(errorMessage);
        }
    }

    async getProductsByModelId(modelId) {
        try {
            const response = await axiosClient.get(`${API_URL}/by-model`, {
                params: { modelId },
            });
            return (response.data.data || []).map(normalizeProductAttachments);
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi tải sản phẩm';
            throw new Error(errorMessage);
        }
    }

    async getProductsByCustomer(customerId) {
        try {
            const response = await axiosClient.get(`${API_URL}/by-customer`, {
                params: { customerId },
            });
            return (response.data.data || []).map(normalizeProductAttachments);
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error.message ||
                'Lỗi không xác định khi tải sản phẩm theo khách hàng';
            throw new Error(errorMessage);
        }
    }

    async getProductsByDelayMp() {
        try {
            const response = await axiosClient.get(`${API_URL}/by-delay-mp`);
            return (response.data.data || []).map(normalizeProductAttachments);
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi tải sản phẩm bị delay MP';
            throw new Error(errorMessage);
        }
    }

    async getAllProducts() {
        try {
            const response = await axiosClient.get(`${API_URL}`);
            return (response.data.data || []).map(normalizeProductAttachments);
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi tải toàn bộ sản phẩm';
            throw new Error(errorMessage);
        }
    }

    async getProductsByPage(page = 0, size = 20, search = '') {
        try {
            const response = await axiosClient.get(`${API_URL}/page`, {
                params: {
                    page,
                    size,
                    search: search || undefined,
                },
            });
            return {
                content: (response.data.data?.content || []).map(normalizeProductAttachments),
                totalElements: response.data.data?.totalElements || 0,
                totalPages: response.data.data?.totalPages || 0,
                currentPage: response.data.data?.number || page,
                pageSize: response.data.data?.size || size,
            };
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi tải sản phẩm theo trang';
            throw new Error(errorMessage);
        }
    }

    async getProductById(id, isDetail = false) {
        try {
            const response = await axiosClient.get(`${API_URL}/${id}`, {
                params: { isDetail },
            });
            return normalizeProductAttachments(response.data.data);
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi tải sản phẩm';
            throw new Error(errorMessage);
        }
    }

    async getProductStatisticsByProgress(id) {
        try {
            const response = await axiosClient.get(`${API_URL}/${id}/progress`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error.message ||
                'Lỗi không xác định khi tải thống kê tiến độ sản phẩm';
            throw new Error(errorMessage);
        }
    }

    async submitHandover(formData) {
        try {
            const response = await axiosClient.post(`/products/handover`, formData, {
                responseType: 'blob',
            });

            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);

            return fileURL;
        } catch (error) {
            const msg = error?.response?.data?.message || error.message;
            throw new Error('Lỗi tạo biên bản: ' + msg);
        }
    }

    async getProductStatuses() {
        try {
            const response = await axiosClient.get(`${API_URL}/statuses`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi tải lên ảnh sản phẩm';
            throw new Error(errorMessage);
        }
    }

    async getProductCategories() {
        try {
            const response = await axiosClient.get(`${API_URL}/categories`);
            return response.data.data || [];
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi không xác định khi tải loại sản phẩm';
            throw new Error(errorMessage);
        }
    }

    async getProductSummary(params = {}) {
        try {
            let url = `${API_URL}/summary`;

            const response = await axiosClient.get(url, { params });
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi tải tổng hợp sản phẩm';
            throw new Error(errorMessage);
        }
    }

    async getQuantityProductByStagesIsBeingDone() {
        try {
            const response = await axiosClient.get(`${API_URL}/summary-being-done`);
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi lấy số lượng sản phẩm theo giai đoạn';
            throw new Error(errorMessage);
        }
    }

    async getProductTestSummaryByEmployee(startDate, endDate) {
        try {
            const response = await axiosClient.get(`${API_URL}/test-summary-by-employee`, {
                params: {
                    startDate,
                    endDate,
                },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi lấy tổng hợp thử nghiệm theo nhân viên';
            throw new Error(errorMessage);
        }
    }

    async getProductProgressByModel(modelId) {
        try {
            const response = await axiosClient.get(`${API_URL}/progress-by-model`, {
                params: { modelId },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi lấy tiến độ sản phẩm theo mẫu';
            throw new Error(errorMessage);
        }
    }

    async getProductHistory(productId, fieldName) {
        try {
            const response = await axiosClient.get(`${API_URL}/${productId}/history`, {
                params: { fieldName },
            });
            return response.data.data;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || error.message || 'Lỗi khi lấy lịch sử chỉnh sửa sản phẩm';
            throw new Error(errorMessage);
        }
    }
}

const productService = new ProductService();
export default productService;
