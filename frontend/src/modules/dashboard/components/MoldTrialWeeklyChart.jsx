import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Empty, Spin } from 'antd';
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import axiosClient from '~/utils/axiosClient';
import StatisticsPeriodFilter from './StatisticsPeriodFilter';
import {
    PERIOD_TYPES,
    buildPeriodParams,
    buildYearOptions,
    getCurrentISOWeek,
    getCurrentISOWeekYear,
} from '../utils/statisticsPeriod';

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) {
        return null;
    }

    const item = payload[0]?.payload;

    return (
        <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow">
            <div className="text-sm font-semibold text-gray-800">{item.customerName}</div>
            <div className="text-xs text-gray-600 mt-1">Tổng khuôn thử: {item.totalMoldTrials}</div>
            <div className="text-xs text-green-600">Khuôn thử OK: {item.okMoldTrials}</div>
            <div className="text-xs text-orange-600">Khuôn thử NG: {item.ngMoldTrials}</div>
        </div>
    );
};

const MoldTrialWeeklyChart = () => {
    const currentDate = useMemo(() => new Date(), []);
    const [periodType, setPeriodType] = useState(PERIOD_TYPES.WEEK);
    const [year, setYear] = useState(getCurrentISOWeekYear(currentDate));
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [week, setWeek] = useState(getCurrentISOWeek(currentDate));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statistics, setStatistics] = useState(null);
    const yearOptions = useMemo(() => buildYearOptions(2020, new Date().getFullYear() + 1), []);

    const fetchStatistics = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axiosClient.get('/products/plans/mold-trial-statistics', {
                params: buildPeriodParams({ periodType, year, month, week }),
            });
            setStatistics(response?.data?.data || null);
        } catch (fetchError) {
            setStatistics(null);
            setError(fetchError?.response?.data?.message || fetchError?.message || 'Không thể tải dữ liệu biểu đồ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, [periodType, year, month, week]);

    const chartData = useMemo(() => {
        const customers = statistics?.customers || [];
        return customers.map((item) => ({
            customerName: item.customerName || 'Chưa xác định',
            shortName:
                (item.customerName || '').length > 14
                    ? `${item.customerName.slice(0, 14).trim()}...`
                    : item.customerName || 'Chưa xác định',
            totalMoldTrials: Number(item.totalMoldTrials || 0),
            okMoldTrials: Number(item.okMoldTrials || 0),
            ngMoldTrials: Number(item.ngMoldTrials || 0),
        }));
    }, [statistics]);

    const periodLabel = useMemo(() => {
        const fromDate = statistics?.fromDate;
        const toDate = statistics?.toDate;
        if (!fromDate || !toDate) {
            return '';
        }
        return `${fromDate} đến ${toDate}`;
    }, [statistics]);

    return (
        <Card
            size="small"
            title="Khuôn thử trong tuần (MOLD_TRIAL)"
            extra={
                <div className="flex items-center gap-2">
                    {periodLabel ? <span className="text-xs text-gray-500">{periodLabel}</span> : null}
                    <StatisticsPeriodFilter
                        periodType={periodType}
                        year={year}
                        month={month}
                        week={week}
                        yearOptions={yearOptions}
                        onPeriodTypeChange={(value) => setPeriodType(value)}
                        onYearChange={(value) => setYear(value)}
                        onMonthChange={(value) => setMonth(value)}
                        onWeekChange={(value) => setWeek(value)}
                    />
                </div>
            }
        >
            {loading ? (
                <div className="h-[380px] flex items-center justify-center">
                    <Spin />
                </div>
            ) : error ? (
                <div className="space-y-3">
                    <Alert type="error" showIcon message="Không thể tải biểu đồ" description={error} />
                    <Button onClick={fetchStatistics}>Thử lại</Button>
                </div>
            ) : chartData.length === 0 ? (
                <Empty description="Không có dữ liệu khuôn thử trong tuần" />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <div className="rounded-md bg-blue-50 px-4 py-3">
                            <div className="text-xs text-gray-500">Tổng số khuôn thử</div>
                            <div className="text-xl font-semibold text-blue-700">
                                {statistics?.totalMoldTrials || 0}
                            </div>
                        </div>
                        <div className="rounded-md bg-green-50 px-4 py-3">
                            <div className="text-xs text-gray-500">Khuôn thử OK</div>
                            <div className="text-xl font-semibold text-green-700">
                                {statistics?.totalOkMoldTrials || 0}
                            </div>
                        </div>
                        <div className="rounded-md bg-orange-50 px-4 py-3">
                            <div className="text-xs text-gray-500">Khuôn thử NG</div>
                            <div className="text-xl font-semibold text-orange-700">
                                {statistics?.totalNgMoldTrials || 0}
                            </div>
                        </div>
                    </div>

                    <div className="h-[380px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 24, right: 20, left: 0, bottom: 56 }} barGap={8}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="shortName"
                                    angle={-22}
                                    textAnchor="end"
                                    height={70}
                                    interval={0}
                                    tick={{ fontSize: 12, fill: '#4b5563' }}
                                />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#4b5563' }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }} />
                                <Legend />

                                <Bar
                                    dataKey="totalMoldTrials"
                                    name="Khuôn thử trong tuần"
                                    fill="#3b82f6"
                                    maxBarSize={40}
                                >
                                    <LabelList dataKey="totalMoldTrials" position="top" fontSize={11} />
                                </Bar>
                                <Bar dataKey="okMoldTrials" name="Khuôn thử OK" fill="#f97316" maxBarSize={40}>
                                    <LabelList dataKey="okMoldTrials" position="top" fontSize={11} />
                                </Bar>
                                <Bar dataKey="ngMoldTrials" name="Khuôn thử NG" fill="#a3a3a3" maxBarSize={40}>
                                    <LabelList dataKey="ngMoldTrials" position="top" fontSize={11} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </Card>
    );
};

export default MoldTrialWeeklyChart;
