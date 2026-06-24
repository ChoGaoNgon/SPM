import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_COLORS } from '../../constants/colors';
import nmdStatisticsService from '../../modules/dashboard/service/NMDStatisticsService';

const LIMIT_OPTIONS = [5, 10, 15, 20];

const CATEGORY_SERIES = [
    {
        key: 'injectionCount',
        label: 'Hàng đúc',
        color: CHART_COLORS.EVENT.primary,
    },
    {
        key: 'secondProcessCount',
        label: '2nd process',
        color: '#D1D5DB',
    },
    {
        key: 'assemblyCount',
        label: 'Lắp ráp',
        color: '#FACC15',
    },
];

const STATUS_SERIES = [
    {
        key: 'runningCount',
        label: 'Đang chạy',
        color: '#3B82F6',
    },
    {
        key: 'mpCount',
        label: 'Đã MP',
        color: '#10B981',
    },
    {
        key: 'closedCount',
        label: 'Hủy',
        color: '#EF4444',
    },
];

const SERIES_META = [...CATEGORY_SERIES, ...STATUS_SERIES].reduce((accumulator, item) => {
    accumulator[item.key] = item;
    return accumulator;
}, {});

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) {
        return null;
    }

    const item = payload[0].payload;
    const visibleRows = payload.filter((entry) => SERIES_META[entry.dataKey]);

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
            <p className="text-sm font-semibold text-gray-800">{item.fullName}</p>
            <p className="mt-1 text-sm text-blue-600">
                Tổng mã hàng: <span className="font-bold">{item.totalProductCount}</span>
            </p>
            <p className="mt-1 text-sm text-emerald-600">
                Tổng kế hoạch: <span className="font-bold">{item.totalPlanCount}</span>
            </p>
            <div className="mt-2 space-y-1">
                {visibleRows.map((entry) => (
                    <p key={entry.dataKey} className="text-xs text-gray-600">
                        {SERIES_META[entry.dataKey]?.label}: <span className="font-semibold">{entry.value || 0}</span>
                    </p>
                ))}
            </div>
        </div>
    );
};

const CustomerPlanStatisticsChart = ({ defaultLimit = 10 }) => {
    const [selectedLimit, setSelectedLimit] = useState(defaultLimit);
    const [statistics, setStatistics] = useState([]);
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reloadCount, setReloadCount] = useState(0);

    useEffect(() => {
        const fetchCustomerPlanStatistics = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await nmdStatisticsService.getCustomerPlanStatistics(selectedLimit);

                const customers = response?.customers || [];
                const mappedData = customers.map((item, index) => {
                    return {
                        id: item.customerId || item.customer?.id || `customer-${index}`,
                        fullName: item.customerName || item.customer?.name || 'Chưa xác định',
                        shortName: item.customerName || item.customer?.name || 'Chưa xác định',
                        injectionCount: item.injectionCount || 0,
                        secondProcessCount: item.secondProcessCount || 0,
                        assemblyCount: item.finishedCount || item.assemblyCount || 0,
                        totalProducts: item.totalProducts || 0,
                    };
                });

                setStatistics(mappedData);
                setOverview({
                    totalCustomers: customers.length,
                    totalGlobalProducts: response?.totalGlobalProducts || 0,
                    limit: response?.limit || selectedLimit,
                });
            } catch (fetchError) {
                setError(fetchError.message);
                setStatistics([]);
                setOverview(null);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerPlanStatistics();
    }, [selectedLimit, reloadCount]);

    const chartData = statistics;

    const activeSeries = CATEGORY_SERIES;
    const description = 'Lắp ráp là thành phẩm, hàng đúc là injection, các nhóm còn lại được gộp vào 2nd process.';
    const totalCards = [
        {
            label: 'Tổng sản phẩm',
            value: overview?.totalGlobalProducts || 0,
            className: 'rounded-lg bg-blue-50 px-4 py-3',
            valueClassName: 'mt-1 text-xl font-semibold text-blue-700',
        },
        {
            label: 'Lắp ráp',
            value: statistics.reduce((sum, item) => sum + (item.assemblyCount || 0), 0),
            className: 'rounded-lg px-4 py-3',
            style: { backgroundColor: CATEGORY_SERIES[2].color + '22' },
            valueClassName: 'mt-1 text-xl font-semibold',
            valueStyle: { color: CATEGORY_SERIES[2].color },
        },
        {
            label: '2nd process',
            value: statistics.reduce((sum, item) => sum + (item.secondProcessCount || 0), 0),
            className: 'rounded-lg px-4 py-3',
            style: { backgroundColor: CATEGORY_SERIES[1].color + '22' },
            valueClassName: 'mt-1 text-xl font-semibold',
            valueStyle: { color: CATEGORY_SERIES[1].color },
        },
        {
            label: 'Hàng đúc',
            value: statistics.reduce((sum, item) => sum + (item.injectionCount || 0), 0),
            className: 'rounded-lg px-4 py-3',
            style: { backgroundColor: CATEGORY_SERIES[0].color + '22' },
            valueClassName: 'mt-1 text-xl font-semibold',
            valueStyle: { color: CATEGORY_SERIES[0].color },
        },
    ];

    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Tổng quan khách hàng</h3>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                        <span>Hiển thị</span>
                        <select
                            value={selectedLimit}
                            onChange={(event) => setSelectedLimit(Number(event.target.value))}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        >
                            {LIMIT_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                    Top {option}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>

            {loading ? (
                <div className="flex min-h-[280px] max-h-[420px] h-[50vh] items-center justify-center gap-3 text-gray-600">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span>Đang tải thống kê khách hàng...</span>
                </div>
            ) : error ? (
                <div className="flex min-h-[280px] max-h-[420px] h-[50vh] flex-col items-center justify-center gap-3 text-center">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                    <div>
                        <p className="font-medium text-red-600">Không thể tải thống kê khách hàng</p>
                        <p className="mt-1 text-sm text-gray-500">{error}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setReloadCount((currentCount) => currentCount + 1)}
                        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
                    >
                        Thử lại
                    </button>
                </div>
            ) : statistics.length === 0 ? (
                <div className="flex min-h-[280px] max-h-[420px] h-[50vh] items-center justify-center text-sm text-gray-500">
                    Chưa có dữ liệu thống kê khách hàng
                </div>
            ) : (
                <>
                    <div className="min-h-[280px] max-h-[420px] h-[50vh]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 70 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="shortName"
                                    angle={-20}
                                    textAnchor="end"
                                    height={70}
                                    interval={0}
                                    tick={{ fontSize: 12, fill: '#4b5563' }}
                                    tickFormatter={(value) =>
                                        value.length > 16 ? `${value.slice(0, 16).trim()}...` : value
                                    }
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#4b5563' }}
                                    tickFormatter={(value) => Math.round(value)}
                                    allowDecimals={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }} />
                                <Legend verticalAlign="bottom" height={32} />
                                {activeSeries.map((series, index) => (
                                    <Bar
                                        key={series.key}
                                        dataKey={series.key}
                                        name={series.label}
                                        fill={series.color}
                                        stackId="customer-total"
                                        radius={index === activeSeries.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                                        maxBarSize={48}
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2 xl:grid-cols-5">
                        <div className="rounded-lg bg-slate-50 px-4 py-3">
                            <p className="text-sm text-gray-500">Khách hàng hiển thị</p>
                            <p className="mt-1 text-xl font-semibold text-gray-800">
                                {overview?.totalCustomers || statistics.length}
                            </p>
                        </div>
                        <div className="rounded-lg bg-blue-50 px-4 py-3">
                            <p className="text-sm text-gray-500">Tổng kế hoạch</p>
                            <p className="mt-1 text-xl font-semibold text-blue-700">{overview?.totalPlanCount || 0}</p>
                        </div>
                        {totalCards.map((card) => (
                            <div key={card.label} className={card.className} style={card.style}>
                                <p className="text-sm text-gray-500">{card.label}</p>
                                <p className={card.valueClassName} style={card.valueStyle}>
                                    {card.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default CustomerPlanStatisticsChart;
