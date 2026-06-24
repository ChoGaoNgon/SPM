import { Calendar, ChevronRight, Package, Settings, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CHART_COLORS, getPlanTypeClasses } from '../../constants/colors';
import { PLAN_TYPES } from '../../constants/planTypes';
import nmdStatisticsService from '../../modules/dashboard/service/NMDStatisticsService';

const StatisticsSummary = ({ onShowDetail }) => {
    const [statistics, setStatistics] = useState({
        moldTrialProductCount: 0,
        eventProductCount: 0,
        secondProcessProductCount: 0,
        mpProductCount: 0,
        totalProducts: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await nmdStatisticsService.getOverviewStatistics();
            setStatistics(response);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const safeStatistics = statistics || {
        moldTrialProductCount: 0,
        eventProductCount: 0,
        secondProcessProductCount: 0,
        mpProductCount: 0,
    };

    const statisticsData = [
        {
            key: PLAN_TYPES.EVENT,
            title: 'Event',
            count: safeStatistics.eventProductCount,
            planType: PLAN_TYPES.EVENT,
            icon: <Calendar className="w-5 h-5" style={{ color: CHART_COLORS.EVENT.text }} />,
            ...getPlanTypeClasses(PLAN_TYPES.EVENT),
        },
        {
            key: PLAN_TYPES.MOLD_TRIAL,
            title: 'Thử khuôn',
            count: safeStatistics.moldTrialProductCount,
            planType: PLAN_TYPES.MOLD_TRIAL,
            icon: <Package className="w-5 h-5" style={{ color: CHART_COLORS.MOLD_TRIAL.text }} />,
            ...getPlanTypeClasses(PLAN_TYPES.MOLD_TRIAL),
        },
        {
            key: PLAN_TYPES.SECOND_PROCESS,
            title: 'Second Process',
            count: safeStatistics.secondProcessProductCount,
            planType: PLAN_TYPES.SECOND_PROCESS,
            icon: <Settings className="w-5 h-5" style={{ color: CHART_COLORS.SECOND_PROCESS.text }} />,
            ...getPlanTypeClasses(PLAN_TYPES.SECOND_PROCESS),
        },
        {
            key: PLAN_TYPES.MP,
            title: 'MP',
            count: safeStatistics.mpProductCount || 0,
            planType: PLAN_TYPES.MP,
            icon: <Wrench className="w-5 h-5" style={{ color: CHART_COLORS.MP.text }} />,
            ...getPlanTypeClasses(PLAN_TYPES.MP),
        },
    ];

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md h-full">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-100 rounded">
                                <div className="flex items-center space-x-3">
                                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                                </div>
                                <div className="h-6 bg-gray-300 rounded w-8"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-full">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Thống kê sản phẩm theo kế hoạch</h3>
                <p className="text-sm text-gray-600">Số lượng sản phẩm đang thực hiện các kế hoạch</p>
            </div>

            <div className="space-y-4">
                {statisticsData.map((item) => (
                    <div
                        key={item.key}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all ${item.hoverColor} cursor-pointer ${item.bgColor} ${item.borderColor}`}
                        onClick={() => onShowDetail && onShowDetail(item.planType, item.title)}
                    >
                        <div className="flex items-center space-x-3">
                            {item.icon}
                            <div>
                                <h4 className={`font-semibold ${item.textColor}`}>{item.title}</h4>
                                <p className="text-sm text-gray-600">
                                    Số lượng sản phẩm đang chạy {item.title.toLowerCase()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <span className={`text-2xl font-bold ${item.textColor}`}>{item.count}</span>
                            <ChevronRight className={`w-4 h-4 ${item.textColor}`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Tổng sản phẩm có kế hoạch:</span>
                    <span className="font-bold text-lg text-gray-800">
                        {safeStatistics.moldTrialProductCount +
                            safeStatistics.eventProductCount +
                            safeStatistics.secondProcessProductCount +
                            (safeStatistics.mpProductCount || 0)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default StatisticsSummary;
