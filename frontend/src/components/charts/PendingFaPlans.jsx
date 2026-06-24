import { AlertCircle, CheckCircle, ClipboardList, FileClock, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import nmdStatisticsService from '~/modules/dashboard/service/NMDStatisticsService';

const PendingFaPlans = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPlansPendingFaSubmit();
    }, []);

    const fetchPlansPendingFaSubmit = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await nmdStatisticsService.getProductPlansWithNullActualFaSubmitDate();
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
            <div className="bg-amber-50/30 p-6 rounded-lg shadow-sm h-full border border-amber-100">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                    <span className="ml-2 text-stone-600 font-medium">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md h-full border border-red-100">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                        <p className="text-red-600 font-medium">Lỗi khi tải dữ liệu</p>
                        <p className="text-stone-500 text-sm mt-1">{error}</p>
                        <button
                            onClick={fetchPlansPendingFaSubmit}
                            className="mt-4 px-4 py-2 bg-amber-500 text-stone-950 font-medium rounded-md hover:bg-amber-600 transition-colors shadow-sm"
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
        <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col border border-stone-100">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                        <ClipboardList className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-stone-800">Kế hoạch cần gửi mẫu</h3>
                        <p className="text-sm text-stone-500">7 ngày trước ngày yêu cầu </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="bg-amber-500 text-stone-950 px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                        {totalPending} kế hoạch
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                {totalPending === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <CheckCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-stone-800 mb-2">Tuyệt vời!</h4>
                            <p className="text-stone-500">Không có kế hoạch nào cần nộp FA</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="max-h-[360px] overflow-y-auto space-y-3 mb-4 pr-2">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className="flex items-center justify-between p-4 border border-stone-200 rounded-lg hover:bg-amber-50/60 hover:border-amber-300 transition-colors cursor-pointer"
                                    onClick={() => handlePlanClick(plan)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-amber-100/70 rounded">
                                            <FileClock className="h-4 w-4 text-amber-700" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-stone-800">
                                                {plan.name || `Plan #${plan.id}`}
                                            </h4>
                                            <p className="text-sm text-stone-600">{plan.typePlan || 'N/A'}</p>
                                            <p className="text-xs text-stone-400 font-medium">
                                                SP: {plan.productCode || 'N/A'} | Model: {plan.modelCode || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end space-y-2">
                                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-full border border-amber-200">
                                            {plan.status || 'Chờ duyệt'}
                                        </span>
                                        {plan.createdBy && (
                                            <div className="text-right text-xs text-stone-400">
                                                Tạo bởi: {plan.createdBy}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPending > 3 && (
                            <div className="text-center text-xs text-stone-400 font-medium mb-4">
                                Cuộn để xem thêm {totalPending - 3} kế hoạch
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PendingFaPlans;
