import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, AlertCircle, CheckCircle, Loader2, RefreshCw, FileClock } from 'lucide-react';
import nmdStatisticsService from '../../modules/dashboard/service/NMDStatisticsService';

const PlansPendingApproval = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPlansPendingApproval();
    }, []);

    const fetchPlansPendingApproval = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await nmdStatisticsService.getPlansPendingApproval();
            setPlans(Array.isArray(response) ? response : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const totalPending = plans.length;

    const handlePlanClick = (plan) => {
        if (!plan?.modelId || !plan?.productId || !plan?.id) {
            return;
        }

        navigate(`/product-manager/models/${plan.modelId}/products/${plan.productId}/plan/${plan.id}`);
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md h-full">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                    <span className="ml-2 text-gray-600">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md h-full">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                        <p className="text-red-600 font-medium">Lỗi khi tải dữ liệu</p>
                        <p className="text-gray-500 text-sm mt-1">{error}</p>
                        <button
                            onClick={fetchPlansPendingApproval}
                            className="mt-2 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4 inline mr-2" />
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                        <ClipboardList className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Kế hoạch chờ duyệt</h3>
                        <p className="text-sm text-gray-600">Danh sách kế hoạch cần phê duyệt</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {totalPending} kế hoạch
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                {totalPending === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-800 mb-2">Tuyệt vời!</h4>
                            <p className="text-gray-600">Không có kế hoạch nào cần duyệt</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="max-h-[360px] overflow-y-auto space-y-3 mb-4 pr-2">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-300 transition-colors cursor-pointer"
                                    onClick={() => handlePlanClick(plan)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-teal-100 rounded">
                                            <FileClock className="h-4 w-4 text-teal-700" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-800">
                                                {plan.name || `Plan #${plan.id}`}
                                            </h4>
                                            <p className="text-sm text-gray-600">{plan.typePlan || 'N/A'}</p>
                                            <p className="text-xs text-gray-500">
                                                SP: {plan.productCode || 'N/A'} | Model: {plan.modelCode || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end space-y-2">
                                        <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
                                            {plan.status || 'Chờ duyệt'}
                                        </span>
                                        {plan.createdBy && (
                                            <div className="text-right text-xs text-gray-500">
                                                Tạo bởi: {plan.createdBy}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPending > 3 && (
                            <div className="text-center text-xs text-gray-500 mb-4">
                                Cuộn để xem thêm {totalPending - 3} kế hoạch
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PlansPendingApproval;
