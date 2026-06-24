import axiosClient from '~/utils/axiosClient';

const API_URL = '/report/plan-downtime';

class ProductionPlanDowntimeService {
    async exportReport(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axiosClient.post(`${API_URL}/export`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                responseType: 'blob',
            });

            return response.data;
        } catch (error) {
            let errorMessage = 'Lỗi không xác định';

            if (error?.response?.data instanceof Blob) {
                try {
                    const jsonData = JSON.parse(await error.response.data.text());
                    errorMessage = jsonData?.message || error.message || 'Lỗi không xác định';
                } catch {
                    errorMessage = error.message || 'Lỗi không xác định';
                }
            } else {
                errorMessage = error?.response?.data?.message || error.message || 'Lỗi không xác định';
            }

            throw new Error(errorMessage);
        }
    }

    downloadFile(blob, filename = 'plan-downtime.xlsx') {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}

const productionPlanDowntimeService = new ProductionPlanDowntimeService();

export default productionPlanDowntimeService;
