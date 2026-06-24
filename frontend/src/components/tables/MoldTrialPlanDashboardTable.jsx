import { Button, DatePicker, Input, Segmented, Select, Space, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { CalendarDays, ListChecks } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PLAN_TYPE_LABELS, PLAN_TYPES } from '~/constants/planTypes';
import productPlanService from '~/modules/new-model/services/productPlanService';
import { renderApprovedStatusTag } from '~/utils/renderTag';

dayjs.extend(weekOfYear);

const MoldTrialPlanDashboardTable = () => {
    const [viewMode, setViewMode] = useState('day');
    const [selectedDay, setSelectedDay] = useState(dayjs());
    const [selectedWeek, setSelectedWeek] = useState(dayjs());
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState(undefined);
    const [selectedPlanType, setSelectedPlanType] = useState(PLAN_TYPES.MOLD_TRIAL);

    const planTypeOptions = useMemo(
        () =>
            Object.values(PLAN_TYPES).map((value) => ({
                value,
                label: PLAN_TYPE_LABELS[value] || value,
            })),
        [],
    );

    const dateRange = useMemo(() => {
        if (viewMode === 'month') {
            return {
                fromDate: selectedMonth.startOf('month').startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
                toDate: selectedMonth.endOf('month').add(1, 'day').startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
            };
        }

        if (viewMode === 'week') {
            return {
                fromDate: selectedWeek.startOf('week').format('YYYY-MM-DDTHH:mm:ss'),
                toDate: selectedWeek.endOf('week').add(1, 'day').startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
            };
        }

        return {
            fromDate: selectedDay.startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
            toDate: selectedDay.add(1, 'day').startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
        };
    }, [viewMode, selectedDay, selectedWeek, selectedMonth]);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const data = await productPlanService.searchByRange(dateRange.fromDate, dateRange.toDate, selectedPlanType);
            setPlans(Array.isArray(data) ? data : []);
        } catch (error) {
            setPlans([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, [dateRange.fromDate, dateRange.toDate, selectedPlanType]);

    const statusOptions = useMemo(() => {
        const statusMap = new Map();
        plans.forEach((item) => {
            const value = item?.status;
            if (!value) return;
            statusMap.set(value, { label: value, value });
        });
        return Array.from(statusMap.values());
    }, [plans]);

    const filteredPlans = useMemo(() => {
        const normalizedKeyword = searchText.trim().toLowerCase();

        return plans.filter((item) => {
            if (statusFilter && item?.status !== statusFilter) {
                return false;
            }

            if (!normalizedKeyword) {
                return true;
            }

            const searchableValues = [
                item?.trialName,
                item?.modelCode,
                item?.productCode,
                item?.moldCode,
                item?.status,
                PLAN_TYPE_LABELS[item?.typePlan],
                item?.typePlan,
            ]
                .filter(Boolean)
                .map((value) => String(value).toLowerCase());

            return searchableValues.some((value) => value.includes(normalizedKeyword));
        });
    }, [plans, searchText, statusFilter]);

    const handleClearFilters = () => {
        setSearchText('');
        setStatusFilter(undefined);
    };

    const columns = [
        {
            title: 'STT',
            width: 60,
            align: 'center',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Tên kế hoạch',
            dataIndex: 'trialName',
            width: 150,
            render: (text, record) => {
                if (!text || !record.modelId || !record.productId || !record.trialId) return text || '-';
                return (
                    <a
                        className="font-semibold text-sky-700 hover:underline cursor-pointer"
                        href={`/product-manager/models/${record.modelId}/products/${record.productId}/plan/${record.trialId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {text}
                    </a>
                );
            },
        },
        {
            title: 'Mã Model',
            dataIndex: 'modelCode',
            width: 120,
            render: (text, record) => {
                if (!text || !record.modelId) return text || '-';
                return (
                    <a
                        className="font-semibold text-sky-700 hover:underline cursor-pointer"
                        href={`/product-manager/models/${record.modelId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {text}
                    </a>
                );
            },
        },
        {
            title: 'Mã Sản phẩm',
            dataIndex: 'productCode',
            width: 150,
            render: (text, record) => {
                if (!text || !record.modelId || !record.productId) return text || '-';
                return (
                    <a
                        className="font-semibold text-sky-700 hover:underline cursor-pointer"
                        href={`/product-manager/models/${record.modelId}/products/${record.productId}?kw=`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {text}
                    </a>
                );
            },
        },
        {
            title: 'Mã Khuôn',
            dataIndex: 'moldCode',
            width: 120,
            render: (text) => text || 'Không có',
        },
        {
            title: 'Ngày tạo kế hoạch',
            width: 130,
            render: (_, record) => {
                const rawDate = record?.createdAt;
                if (!rawDate) return '-';
                const d = dayjs(rawDate);
                return d.isValid() ? d.format('DD/MM/YYYY') : '-';
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 160,
            align: 'center',
            render: (status) => renderApprovedStatusTag(status),
        },
        {
            title: 'Loại kế hoạch',
            dataIndex: 'typePlan',
            width: 140,
            align: 'center',
            render: (typePlan) => <Tag color="blue">{PLAN_TYPE_LABELS[typePlan] || typePlan || '-'}</Tag>,
        },
    ];

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <ListChecks size={20} className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Thống kê kế hoạch</h3>
                </div>

                <Space wrap>
                    <Select
                        value={selectedPlanType}
                        onChange={setSelectedPlanType}
                        options={planTypeOptions}
                        style={{ width: 180 }}
                        placeholder="Chọn loại kế hoạch"
                    />

                    <Segmented
                        value={viewMode}
                        onChange={setViewMode}
                        options={[
                            { label: 'Theo ngày', value: 'day' },
                            { label: 'Theo tuần', value: 'week' },
                            { label: 'Theo tháng', value: 'month' },
                        ]}
                    />

                    {viewMode === 'day' ? (
                        <DatePicker
                            value={selectedDay}
                            onChange={(value) => setSelectedDay(value || dayjs())}
                            allowClear={false}
                            format="DD/MM/YYYY"
                        />
                    ) : viewMode === 'week' ? (
                        <div className="flex items-center gap-2">
                            <DatePicker
                                picker="week"
                                value={selectedWeek}
                                onChange={(value) => setSelectedWeek(value || dayjs())}
                                allowClear={false}
                                format={(value) => {
                                    const weekNum = value.week();
                                    const startDate = value.startOf('week').format('DD/MM');
                                    const endDate = value.endOf('week').format('DD/MM/YYYY');
                                    return `Tuần ${weekNum}: ${startDate} - ${endDate}`;
                                }}
                                style={{ minWidth: 240 }}
                            />
                        </div>
                    ) : (
                        <DatePicker
                            picker="month"
                            value={selectedMonth}
                            onChange={(value) => setSelectedMonth(value || dayjs())}
                            allowClear={false}
                            format="MM/YYYY"
                        />
                    )}

                    <Button icon={<CalendarDays size={16} />} onClick={fetchPlans}>
                        Làm mới
                    </Button>
                </Space>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
                <Input
                    allowClear
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Tìm theo tên kế hoạch, Model, Mã SP, Mã khuôn, trạng thái"
                    style={{ width: 360 }}
                />

                <Select
                    allowClear
                    placeholder="Lọc theo trạng thái"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={statusOptions}
                    style={{ width: 240 }}
                />

                <Button onClick={handleClearFilters}>Xóa lọc</Button>

                <span className="text-sm text-gray-500">
                    Hiển thị {filteredPlans.length}/{plans.length} kế hoạch
                </span>
            </div>

            <Table
                rowKey={(record) => `${record.trialId || record.id}-${record.productId || ''}`}
                loading={loading}
                columns={columns}
                dataSource={filteredPlans}
                size="small"
                bordered
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: (total) => `${total} kế hoạch`,
                }}
                locale={{
                    emptyText: 'Không có dữ liệu kế hoạch trong phạm vi thời gian đã chọn',
                }}
                scroll={{ x: 1100 }}
            />
        </div>
    );
};

export default MoldTrialPlanDashboardTable;
