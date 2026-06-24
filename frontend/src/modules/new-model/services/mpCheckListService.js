import axiosClient from '~/utils/axiosClient';

const API_URL = '/mp-checklists';

class MpCheckListService {
    async getByProductId(productId) {
        try {
            const response = await axiosClient.get(`${API_URL}/product/${productId}`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi lấy danh sách kiểm tra MP';
            throw new Error(errorMessage);
        }
    }

    async createMpCheckList(productId, delayReason = '') {
        try {
            const response = await axiosClient.post(`${API_URL}/product/${productId}`, null, {
                params: { delayReason },
            });
            return response.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi thêm kiểm tra MP';
            throw new Error(errorMessage);
        }
    }

    async deleteByProductId(productId) {
        try {
            const response = await axiosClient.delete(`${API_URL}/product/${productId}`);
            return response.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi xóa danh sách kiểm tra MP';
            throw new Error(errorMessage);
        }
    }

    async updateItem(checkItemId, data, uploadFiles = [], keptOldFiles = [], deletedOldFiles = []) {
        try {
            const formData = new FormData();

            formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));

            if (uploadFiles && uploadFiles.length > 0) {
                uploadFiles.forEach((file) => {
                    formData.append('uploadFiles', file);
                });
            }

            if (keptOldFiles && keptOldFiles.length > 0) {
                formData.append('keptOldFiles', JSON.stringify(keptOldFiles));
            }

            if (deletedOldFiles && deletedOldFiles.length > 0) {
                formData.append('deletedOldFiles', JSON.stringify(deletedOldFiles));
            }

            const response = await axiosClient.put(`${API_URL}/item/${checkItemId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi cập nhật mục kiểm tra MP';
            throw new Error(errorMessage);
        }
    }

    async approveCheckList(approvalId, comment) {
        try {
            const response = await axiosClient.put(`${API_URL}/approval/${approvalId}/approve`, {
                comment: comment || null,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi phê duyệt';
            throw new Error(errorMessage);
        }
    }

    async rejectCheckList(approvalId, comment) {
        try {
            const response = await axiosClient.put(`${API_URL}/approval/${approvalId}/reject`, {
                comment: comment || null,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi khi từ chối';
            throw new Error(errorMessage);
        }
    }
}

export default new MpCheckListService();
