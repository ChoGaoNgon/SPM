import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Empty, Spin } from 'antd';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import axiosClient from '~/utils/axiosClient';

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) {
        return null;
    }

    const row = payload[0]?.payload;

    return (
        <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow">
            <p className="text-sm font-semibold text-gray-800">{row.customerName}</p>
            <p className="text-xs text-blue-600 mt-1">
                Số khuôn đang phát triển: <span className="font-semibold">{row.developingMolds}</span>
            </p>
        </div>
    );
};

const MoldDevelopingByCustomerChart = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statistics, setStatistics] = useState([]);

    const fetchStatistics = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axiosClient.get('/molds/developing-by-customer');
            setStatistics(response?.data?.data || []);
        } catch (fetchError) {
            setStatistics([]);
            setError(fetchError?.response?.data?.message || fetchError?.message || 'Không thể tải dữ liệu biểu đồ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, []);

    const chartData = useMemo(
        () =>
            statistics.map((item) => ({
                customerId: item.customerId,
                customerName: item.customerName || 'Chưa xác định',
                shortName:
                    (item.customerName || '').length > 18
                        ? `${item.customerName.slice(0, 18).trim()}...`
                        : item.customerName || 'Chưa xác định',
                developingMolds: Number(item.developingMolds || 0),
            })),
        [statistics],
    );

    const totalDevelopingMolds = useMemo(
        () => chartData.reduce((sum, item) => sum + item.developingMolds, 0),
        [chartData],
    );

    return (
        <Card
            size="small"
            title="Biểu đồ số khuôn đang phát triển theo khách hàng"
            extra={
                !loading && statistics.length > 0 ? (
                    <span className="text-xs text-gray-500">{statistics.length} khách hàng</span>
                ) : null
            }
        >
            {loading ? (
                <div className="h-[360px] flex items-center justify-center">
                    <Spin />
                </div>
            ) : error ? (
                <div className="space-y-3">
                    <Alert type="error" showIcon message="Không thể tải biểu đồ" description={error} />
                    <Button onClick={fetchStatistics}>Thử lại</Button>
                </div>
            ) : chartData.length === 0 ? (
                <Empty description="Chưa có dữ liệu khuôn đang phát triển" />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="rounded-md bg-blue-50 px-4 py-3">
                            <div className="text-xs text-gray-500">Tổng khuôn đang phát triển</div>
                            <div className="text-xl font-semibold text-blue-700">{totalDevelopingMolds}</div>
                        </div>
                        <div className="rounded-md bg-slate-50 px-4 py-3">
                            <div className="text-xs text-gray-500">Số khách hàng có dữ liệu</div>
                            <div className="text-xl font-semibold text-slate-700">{chartData.length}</div>
                        </div>
                    </div>

                    <div className="h-[360px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 12, right: 20, left: 0, bottom: 56 }}>
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
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37, 99, 235, 0.08)' }} />
                                <Bar
                                    dataKey="developingMolds"
                                    name="Số khuôn đang phát triển"
                                    fill="#2563eb"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={58}
                                >
                                    <LabelList
                                        dataKey="developingMolds"
                                        position="top"
                                        fill="#1e3a8a"
                                        fontSize={12}
                                        fontWeight={600}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </Card>
    );
};

export default MoldDevelopingByCustomerChart;
