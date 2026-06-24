import { message } from 'antd';
import { useCallback, useState } from 'react';
import employeeService from '~/modules/employee/services/employeeService';
import faInspectionService from '../services/faInspectionService';
import faDeliveryService from '../services/productDelivery';
import productMoldTrialPlanService from '../services/productPlanService';

export const usePlanData = (planId) => {
    const [plan, setPlan] = useState(null);
    const [inspection, setInspection] = useState(null);
    const [delivery, setDelivery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [employeeName, setEmployeeName] = useState('');

    const fetchPlan = useCallback(async () => {
        setLoading(true);
        try {
            const data = await productMoldTrialPlanService.getMoldTrialPlanById(planId);
            setPlan(data);

            if (data?.createdBy) {
                try {
                    const employee = await employeeService.getEmployeeByCode(data.createdBy);
                    setEmployeeName(employee?.name || 'Không rõ tên');
                } catch {
                    setEmployeeName('Không tìm thấy');
                }
            }
        } catch (error) {
            message.error(error?.message || 'Lỗi không xác định');
        } finally {
            setLoading(false);
        }
    }, [planId]);

    const fetchInspection = useCallback(async () => {
        try {
            if (!plan?.id) return;
            const data = await faInspectionService.getFaInspectionByMoldTrialPlanId(plan?.id);
            setInspection(data);
        } catch (error) {}
    }, [plan?.id]);

    const fetchDelivery = useCallback(async () => {
        try {
            if (!plan?.id) return;
            const data = await faDeliveryService.getFaDeliveryByMoldTrialPlanId(plan?.id);
            setDelivery(data);
        } catch (error) {}
    }, [plan?.id]);
    const approvePlan = useCallback(
        async (id, approvedPlan) => {
            setLoading(true);
            try {
                await productMoldTrialPlanService.approvePlan(id, approvedPlan);
                message.success('Phê duyệt kế hoạch thành công!');
                await fetchPlan();
            } catch (error) {
                message.error(error?.message || 'Phê duyệt kế hoạch thất bại');
            } finally {
                setLoading(false);
            }
        },
        [fetchPlan],
    );

    const cancelPlan = useCallback(
        async (id, req) => {
            setLoading(true);
            try {
                await productMoldTrialPlanService.cancelPlan(id, req);
                message.success('Hủy kế hoạch thành công!');
                await fetchPlan();
            } catch (error) {
                message.error(error?.message || 'Hủy kế hoạch thất bại');
            } finally {
                setLoading(false);
            }
        },
        [fetchPlan],
    );

    return {
        plan,
        inspection,
        delivery,
        loading,
        employeeName,
        fetchPlan,
        fetchInspection,
        fetchDelivery,
        approvePlan,
        cancelPlan,
    };
};
