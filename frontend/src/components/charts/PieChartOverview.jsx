import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_COLORS } from '../../constants/colors';
import { PLAN_TYPES } from '../../constants/planTypes';
import nmdStatisticsService from '../../modules/dashboard/service/NMDStatisticsService';

const PieChartOverview = () => {
    const [overviewStatistics, setOverviewStatistics] = useState({
        moldTrialProductCount: 0,
        eventProductCount: 0,
        secondProcessProductCount: 0,
        mpProductCount: 0,
        totalProducts: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOverviewStatistics();
    }, []);

    const fetchOverviewStatistics = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await nmdStatisticsService.getOverviewStatistics();
            setOverviewStatistics(response);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = {
        Mold_Trial: CHART_COLORS.MOLD_TRIAL.primary,
        Event: CHART_COLORS.EVENT.primary,
        SECOND_PROCESS: CHART_COLORS.SECOND_PROCESS.primary,
        MP: CHART_COLORS.MP.primary,
        Khác: CHART_COLORS.OTHER.primary,
    };

    const response = overviewStatistics || {
        moldTrialProductCount: 0,
        eventProductCount: 0,
        secondProcessProductCount: 0,
        mpProductCount: 0,
        totalProducts: 0,
    };

    const otherCount =
        response.totalProducts -
        (response.moldTrialProductCount +
            response.eventProductCount +
            response.secondProcessProductCount +
            (response.mpProductCount || 0));

    const data = [
        {
            name: 'Thử khuôn',
            value: response.moldTrialProductCount,
            color: COLORS['Mold_Trial'],
            planType: PLAN_TYPES.MOLD_TRIAL,
        },
        {
            name: 'Event',
            value: response.eventProductCount,
            color: COLORS['Event'],
            planType: PLAN_TYPES.EVENT,
        },
        {
            name: 'SECOND_PROCESS',
            value: response.secondProcessProductCount,
            color: COLORS['SECOND_PROCESS'],
            planType: PLAN_TYPES.SECOND_PROCESS,
        },
        {
            name: 'MP',
            value: response.mpProductCount || 0,
            color: COLORS['MP'],
            planType: PLAN_TYPES.MP,
        },
    ];

    if (otherCount > 0) {
        data.push({
            name: 'Chưa có kế hoạch',
            value: otherCount,
            color: COLORS['Khác'],
            planType: null,
        });
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium">{data.name}</p>
                    <p className="text-blue-600">
                        Số lượng: <span className="font-bold">{data.value}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        if (percent < 0.05) return null;

        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={12}
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const handlePieClick = async (data, index) => {
        if (data && data.planType) {
            try {
                const response = await nmdStatisticsService.getProductsByPlanType(data.planType);
            } catch (error) {}
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-600 font-medium">Lỗi khi tải dữ liệu</p>
                    <p className="text-gray-500 text-sm mt-1">{error}</p>
                    <button
                        onClick={fetchOverviewStatistics}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-md h-full">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Tổng quan sản phẩm</h3>
                <p className="text-sm text-gray-600">Phân bổ sản phẩm theo loại kế hoạch</p>
            </div>

            <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 35 }}>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="45%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={80}
                            innerRadius={30}
                            fill="#8884d8"
                            dataKey="value"
                            onClick={handlePieClick}
                            style={{ cursor: 'pointer' }}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            height={30}
                            iconType="circle"
                            wrapperStyle={{
                                paddingTop: '10px',
                                fontSize: '12px',
                                textAlign: 'center',
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-2 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tổng:</span>
                    <span className="font-bold text-lg text-blue-600">
                        {data.reduce((sum, item) => sum + item.value, 0)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PieChartOverview;
