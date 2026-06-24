import axiosClient from '~/utils/axiosClient';

const API_URL = '/machines-downtime';

class MachineDowntimeService {
    async getDailyDowntime(date) {
        try {
            const response = await axiosClient.get(API_URL, {
                params: { date },
            });

            return response?.data?.data ?? response?.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Không tải được dữ liệu dừng máy';
            throw new Error(errorMessage);
        }
    }
}

const machineDowntimeService = new MachineDowntimeService();

export default machineDowntimeService;
