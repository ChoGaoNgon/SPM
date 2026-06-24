import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import nmdStatisticsService from '../../modules/dashboard/service/NMDStatisticsService';

const ClickHintTooltip = ({ active, payload, label, statusMetaMap }) => {
    if (!active || !payload?.length) {
        return null;
    }

    const visibleRows = payload.filter((item) => Number(item.value) > 0);

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
            <p className="text-sm font-semibold text-gray-800">EVENT {label}</p>
            <div className="mt-2 space-y-1">
                {visibleRows.length ? (
                    visibleRows.map((item) => (
                        <p key={`${item.dataKey}`} className="text-xs text-gray-700">
                            <span className="font-medium">
                                {statusMetaMap[item.dataKey]?.description || item.dataKey}:
                            </span>{' '}
                            {item.value}
                        </p>
                    ))
                ) : (
                    <p className="text-xs text-gray-500">Khong co du lieu</p>
                )}
            </div>
            <p className="mt-2 text-[11px] text-blue-600">Click vao tung mau trong cot de mo detail.</p>
        </div>
    );
};

const EventStatusStatisticsTable = ({ planType = 'EVENT' }) => {
    const navigate = useNavigate();
    const [eventData, setEventData] = useState([]);
    const [maxEventNo, setMaxEventNo] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reloadCount, setReloadCount] = useState(0);
    const [selectedCell, setSelectedCell] = useState(null);

    useEffect(() => {
        const fetchEventStatusStatistics = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await nmdStatisticsService.getEventStatusStatistics(planType);
                setEventData(response?.events || []);
                setMaxEventNo(response?.maxEventNo || 0);
            } catch (fetchError) {
                setError(fetchError.message);
                setEventData([]);
                setMaxEventNo(0);
            } finally {
                setLoading(false);
            }
        };

        fetchEventStatusStatistics();
    }, [reloadCount, planType]);

    const eventNos = useMemo(() => {
        if (!maxEventNo || maxEventNo < 1) {
            return [];
        }
        return Array.from({ length: maxEventNo }, (_, index) => index + 1);
    }, [maxEventNo]);

    const statusOrder = useMemo(() => {
        if (!eventData.length) {
            return [];
        }

        const firstEventStatuses = eventData[0]?.statuses || [];
        if (!firstEventStatuses.length) {
            return [];
        }

        return firstEventStatuses.map((item) => item.status);
    }, [eventData]);

    const statusMetaMap = useMemo(() => {
        const map = {};
        eventData.forEach((eventItem) => {
            (eventItem.statuses || []).forEach((statusItem) => {
                if (!statusItem?.status) {
                    return;
                }
                if (!map[statusItem.status]) {
                    map[statusItem.status] = {
                        description: statusItem.statusDescription || statusItem.status,
                        color: statusItem.statusColor || '#94a3b8',
                    };
                }
            });
        });
        return map;
    }, [eventData]);

    const eventMap = useMemo(() => {
        return eventData.reduce((accumulator, eventItem) => {
            accumulator[eventItem.eventNo] = eventItem;
            return accumulator;
        }, {});
    }, [eventData]);

    const chartData = useMemo(() => {
        return eventNos.map((eventNo) => {
            const eventItem = eventMap[eventNo];
            const row = { eventNo };

            statusOrder.forEach((status) => {
                const statusItem = eventItem?.statuses?.find((item) => item.status === status);
                row[status] = statusItem?.totalProducts || 0;
            });

            return row;
        });
    }, [eventNos, eventMap, statusOrder]);

    const getCellData = (eventNo, status) => {
        const eventItem = eventMap[eventNo];
        if (!eventItem?.statuses?.length) {
            return { totalProducts: 0, totalPlans: 0, details: [] };
        }

        const statusItem = eventItem.statuses.find((item) => item.status === status);
        if (!statusItem) {
            return { totalProducts: 0, totalPlans: 0, details: [] };
        }

        return {
            totalProducts: statusItem.totalProducts || 0,
            totalPlans: statusItem.totalPlans || 0,
            details: statusItem.details || [],
        };
    };

    const handleNavigateToPlan = (detail) => {
        if (!detail?.modelId || !detail?.productId || !detail?.planId) {
            return;
        }

        navigate(`/product-manager/models/${detail.modelId}/products/${detail.productId}/plan/${detail.planId}`);
    };

    const handleBarClick = (payload, status) => {
        const eventNo = payload?.eventNo;
        if (!eventNo || !status) {
            return;
        }

        const cellData = getCellData(eventNo, status);
        if (!cellData.details.length) {
            setSelectedCell(null);
            return;
        }

        setSelectedCell({
            eventNo,
            status,
            ...cellData,
        });
    };

    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 border-b border-gray-100 pb-4">
                <h3 className="text-lg font-semibold text-gray-800">Thống kê kế hoạch Event</h3>
                <p className="text-sm text-gray-600">
                    Di chuột vào từng cột để xem chi tiết và click vào dòng để mở kế hoạch chi tiết.
                </p>
            </div>

            {loading ? (
                <div className="flex min-h-[220px] items-center justify-center gap-3 text-gray-600">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span>Dang tai thong ke event...</span>
                </div>
            ) : error ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                    <div>
                        <p className="font-medium text-red-600">Khong the tai thong ke event</p>
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
            ) : eventNos.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center text-sm text-gray-500">
                    Chưa có dữ liệu thống kê
                </div>
            ) : (
                <div>
                    <div className="h-[360px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="eventNo"
                                    tick={{ fontSize: 12, fill: '#4b5563' }}
                                    tickFormatter={(value) => `EVENT ${value}`}
                                />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#4b5563' }} />
                                <Tooltip content={<ClickHintTooltip statusMetaMap={statusMetaMap} />} />
                                <Legend
                                    formatter={(value) => statusMetaMap[value]?.description || value}
                                    wrapperStyle={{ fontSize: 12 }}
                                />

                                {statusOrder.map((status) => (
                                    <Bar
                                        key={status}
                                        dataKey={status}
                                        name={status}
                                        stackId="event-status"
                                        fill={statusMetaMap[status]?.color || '#94a3b8'}
                                        onClick={(barData) => handleBarClick(barData?.payload, status)}
                                        cursor="pointer"
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 rounded-lg border border-gray-200 bg-slate-50 p-3">
                        {selectedCell ? (
                            <>
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-800">
                                        Thông tin EVENT {selectedCell.eventNo}
                                    </span>
                                    <span
                                        className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                                        style={{
                                            color: statusMetaMap[selectedCell.status]?.color || '#334155',
                                            backgroundColor: `${statusMetaMap[selectedCell.status]?.color || '#94a3b8'}1f`,
                                        }}
                                    >
                                        {statusMetaMap[selectedCell.status]?.description || selectedCell.status}
                                    </span>
                                    <span className="text-xs text-gray-600">
                                        {selectedCell.totalProducts} sản phẩm, {selectedCell.totalPlans} kế hoạch
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCell(null)}
                                        className="ml-auto rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                                    >
                                        Đóng
                                    </button>
                                </div>

                                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                                    {selectedCell.details.map((detail) => (
                                        <button
                                            key={`${detail.planId}-${detail.productId}`}
                                            type="button"
                                            onClick={() => handleNavigateToPlan(detail)}
                                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-xs transition hover:border-blue-300 hover:bg-blue-50"
                                        >
                                            <p className="font-semibold text-blue-700">Plan: {detail.planCode}</p>
                                            <p className="text-gray-700">
                                                Product: {detail.productCode} - {detail.productName}
                                            </p>
                                            <p className="text-gray-600">
                                                Model: {detail.modelCode || '-'} (ID: {detail.modelId || '-'})
                                            </p>
                                            <p className="text-gray-600">Customer: {detail.customerName || '-'}</p>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-gray-600">
                                Di chuột vào từng cột để xem chi tiết và click vào dòng để mở kế hoạch chi tiết.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventStatusStatisticsTable;
