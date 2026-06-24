import axiosClient from '~/utils/axiosClient';

const API_URL = '/audit';

class AuditService {
    async getAuditRequests(filters = {}, page = 0, size = 20, sort = 'createdAt', direction = 'desc') {
        try {
            const params = {
                page,
                size,
            };

            if (sort) {
                params.sort = `${sort},${direction}`;
            }
            if (filters.createdBy) {
                params.createdBy = filters.createdBy;
            }

            if (filters.tableName) {
                params.tableName = filters.tableName;
            }

            if (filters.startDate) {
                params.startDate =
                    filters.startDate instanceof Date ? filters.startDate.toISOString() : filters.startDate;
            }

            if (filters.endDate) {
                params.endDate = filters.endDate instanceof Date ? filters.endDate.toISOString() : filters.endDate;
            }

            const response = await axiosClient.get(`${API_URL}/requests`, { params });

            return (
                response.data?.data || {
                    content: [],
                    totalElements: 0,
                    totalPages: 0,
                }
            );
        } catch (error) {
            throw error;
        }
    }

    async getAuditDetailByRequestId(requestId) {
        try {
            const response = await axiosClient.get(`/audit/requests/${requestId}`);
            return response.data?.data || [];
        } catch (error) {
            throw error;
        }
    }
}

const auditService = new AuditService();
export default auditService;
