import axiosClient from '~/utils/axiosClient';

const API_URL = '/db3/oee-report';

class OeeReportService {
    async exportReport(file, date) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('date', date);

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

    async debugExport(date) {
        try {
            const response = await axiosClient.get(`${API_URL}/debug-export`, {
                params: { date },
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

    downloadFile(blob, filename = 'oee-report.xlsx') {
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

export default new OeeReportService();
