import dayjs from 'dayjs';
import axiosClient from '~/utils/axiosClient';

const API_URL = '/products';

const toDateTimeStart = (value) => {
    if (!value) return undefined;
    if (String(value).includes('T')) return value;
    return dayjs(value).startOf('day').format('YYYY-MM-DDTHH:mm:ss');
};

const toDateTimeEndExclusive = (value) => {
    if (!value) return undefined;
    if (String(value).includes('T')) return value;
    return dayjs(value).add(1, 'day').startOf('day').format('YYYY-MM-DDTHH:mm:ss');
};

const toDateTimePayload = (value) => {
    if (!value) return null;
    if (dayjs.isDayjs(value)) return value.format('YYYY-MM-DDTHH:mm:ss');
    if (String(value).includes('T')) return value;
    return dayjs(value).format('YYYY-MM-DDTHH:mm:ss');
};

class ProductPlanService {
    async createPlan(productId, req, typePlan) {
        try {
            const res = await axiosClient.post(`${API_URL}/${productId}/plans`, req, {
                params: { typePlan },
            });
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi';
            throw new Error(errorMessage);
        }
    }

    async updatePlan(id, req) {
        try {
            const res = await axiosClient.put(`${API_URL}/plans/${id}`, req);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi';
            throw new Error(errorMessage);
        }
    }

    async updateRequestTime(id, req) {
        try {
            const payload = {
                ...req,
                requestStartTime: toDateTimePayload(req?.requestStartTime),
                requestEndTime: toDateTimePayload(req?.requestEndTime),
            };
            const res = await axiosClient.patch(`${API_URL}/plans/${id}/request-time`, payload);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi cập nhật thời gian yêu cầu';
            throw new Error(errorMessage);
        }
    }

    async updateMoldTrialPlanForKT(id, req) {
        try {
            const res = await axiosClient.put(`${API_URL}/plans/${id}/kt`, req);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi';
            throw new Error(errorMessage);
        }
    }

    async updateMoldTrialPlanForSX(id, req) {
        try {
            const res = await axiosClient.put(`${API_URL}/plans/${id}/log`, req);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi';
            throw new Error(errorMessage);
        }
    }

    async approveResin(id, approvedResin) {
        try {
            const body = typeof approvedResin === 'boolean' ? { approveResin: approvedResin } : approvedResin || {};
            const res = await axiosClient.patch(`${API_URL}/plans/${id}/approve-resin`, body);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi';
            throw new Error(errorMessage);
        }
    }

    async approvePlan(id, approvedPlan) {
        try {
            const res = await axiosClient.patch(`${API_URL}/plans/${id}/approve-plan`, approvedPlan);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi';
            throw new Error(errorMessage);
        }
    }

    async cancelPlan(id, req) {
        try {
            const res = await axiosClient.put(`${API_URL}/plans/${id}/cancel`, req);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi hủy kế hoạch';
            throw new Error(errorMessage);
        }
    }

    async getMoldTrialPlanById(id) {
        try {
            const res = await axiosClient.get(`${API_URL}/plans/${id}`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi ';
            throw new Error(errorMessage);
        }
    }
    async getMoldTrialPlansByProductId(productId) {
        try {
            const response = await axiosClient.get(`${API_URL}/${productId}/plans`);
            return response.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi ';
            throw new Error(errorMessage);
        }
    }
    async deleteMoldTrialPlan(id) {
        try {
            const res = await axiosClient.delete(`${API_URL}/plans/${id}`);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi ';
            throw new Error(errorMessage);
        }
    }

    async getLatestMoldTrialPlanByHtmpResin(htmpResin) {
        try {
            const res = await axiosClient.get(`${API_URL}/plans/by-htmp-resin`, {
                params: { htmpResin },
            });
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi ';
            throw new Error(errorMessage);
        }
    }

    async getAllDistinctDryer() {
        try {
            const res = await axiosClient.get(`${API_URL}/plans/dryer-list`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi ';
            throw new Error(errorMessage);
        }
    }

    async getAllDistinctProcessStep() {
        try {
            const res = await axiosClient.get(`${API_URL}/plans/progress-step-list`);
            return res.data.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Lỗi ';
            throw new Error(errorMessage);
        }
    }

    async search(date, typePlan) {
        try {
            const res = await axiosClient.get(`${API_URL}/plans`, {
                params: {
                    fromDate: toDateTimeStart(date),
                    toDate: toDateTimeEndExclusive(date),
                    typePlan,
                },
            });
            return res.data.data;
        } catch (error) {
            throw new Error(error?.response?.data?.message || error.message);
        }
    }

    async searchByRange(fromDate, toDate, typePlan) {
        try {
            const res = await axiosClient.get(`${API_URL}/plans`, {
                params: {
                    fromDate: toDateTimeStart(fromDate),
                    toDate: toDateTimeEndExclusive(toDate),
                    typePlan,
                },
            });
            return res.data.data;
        } catch (error) {
            throw new Error(error?.response?.data?.message || error.message);
        }
    }

    async sendMoldTrialPlanMail(payload) {
        try {
            const res = await axiosClient.post(`${API_URL}/plans/send-mail`, payload);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Gửi mail thất bại';
            throw new Error(errorMessage);
        }
    }

    async approveProductPlanApproval(planId, data) {
        try {
            const res = await axiosClient.patch(`${API_URL}/plans/${planId}/approval`, data);
            return res.data;
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || 'Phê duyệt thất bại';
            throw new Error(errorMessage);
        }
    }
}

const productPlanService = new ProductPlanService();
export default productPlanService;
