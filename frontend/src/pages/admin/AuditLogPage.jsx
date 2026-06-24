import React, { useEffect, useState } from 'react';
import {
    Card,
    Tag,
    Spin,
    Typography,
    message,
    Row,
    Col,
    DatePicker,
    Button,
    Input,
    Pagination,
} from 'antd';
import dayjs from 'dayjs';
import auditService from '~/services/auditService';
import PageHeader from '~/components/PageHeader';
import { ClipboardClock } from 'lucide-react';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const AuditLogPage = () => {
    const [list, setList] = useState([]);
    const [selected, setSelected] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detail, setDetail] = useState([]);

    const [loadingList, setLoadingList] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const [pagination, setPagination] = useState({
        page: 0,
        size: 20,
        total: 0,
        sort: 'createdAt',
        direction: 'DESC',
    });

    const [filters, setFilters] = useState({
        createdBy: '',
        tableName: '',
        dateRange: null,
    });

    const loadList = async (customFilters = filters, customPagination = pagination) => {
        try {
            setLoadingList(true);

            const params = {
                createdBy: customFilters.createdBy || undefined,
                tableName: customFilters.tableName || undefined,
            };

            if (customFilters.dateRange) {
                params.startDate = customFilters.dateRange[0]?.startOf('day').format('YYYY-MM-DDTHH:mm:ss');
                params.endDate = customFilters.dateRange[1]?.endOf('day').format('YYYY-MM-DDTHH:mm:ss');
            }

            const res = await auditService.getAuditRequests(
                params,
                customPagination.page,
                customPagination.size,
                customPagination.sort,
                customPagination.direction,
            );

            setList(res.content || []);
            setPagination((prev) => ({
                ...prev,
                total: res.totalElements || 0,
            }));
        } catch (e) {
            message.error('Load danh sách thất bại');
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        loadList();
    }, []);

    const loadDetail = async (item) => {
        try {
            setSelected(item.requestId);
            setSelectedRequest(item);
            setDetail([]);
            setLoadingDetail(true);

            const res = await auditService.getAuditDetailByRequestId(item.requestId);
            setDetail(res || []);
        } catch (e) {
            message.error('Load chi tiết thất bại');
        } finally {
            setLoadingDetail(false);
        }
    };

    const groupedDetail = detail.reduce((acc, cur) => {
        if (!acc[cur.tableName]) acc[cur.tableName] = {};

        if (!acc[cur.tableName][cur.recordId]) {
            acc[cur.tableName][cur.recordId] = {
                action: cur.action,
                fields: [],
            };
        }

        acc[cur.tableName][cur.recordId].fields.push(cur);
        return acc;
    }, {});

    const actionConfig = {
        INSERT: { color: 'green', label: 'Thêm' },
        UPDATE: { color: 'blue', label: 'Cập nhật' },
        DELETE: { color: 'red', label: 'Xóa' },
    };

    const renderDetail = () => {
        if (loadingDetail) {
            return (
                <div className="text-center p-10">
                    <Spin />
                </div>
            );
        }

        if (!selected) {
            return (
                <div className="text-center text-gray-400 p-10">
                    Chọn một request để xem chi tiết
                </div>
            );
        }

        return Object.keys(groupedDetail).map((table) => (
            <Card key={table} size="small" className="mb-3">
                <div className="mb-3">
                    <Tag color="purple">{table}</Tag>
                </div>

                <Row gutter={[16, 16]}>
                    {Object.entries(groupedDetail[table]).map(([recordId, record]) => {
                        const { action, fields } = record;
                        const config = actionConfig[action] || {
                            color: 'default',
                            label: action,
                        };

                        return (
                            <Col xs={24} sm={12} md={8} key={recordId}>
                                <Card size="small" bodyStyle={{ padding: 10 }}>
                                    <div className="flex justify-between mb-2">
                                        <Text code className="text-xs">
                                            {recordId}
                                        </Text>
                                        <Tag color={config.color}>{config.label}</Tag>
                                    </div>

                                    <div className="space-y-1">
                                        {fields.map((item, index) => {
                                            const isInsert = item.action === 'INSERT';
                                            const isDelete = item.action === 'DELETE';
                                            const isUpdate = item.action === 'UPDATE';

                                            return (
                                                <div key={index} className="text-xs flex gap-2">
                                                    <span className="text-gray-400 w-24 truncate">
                                                        {item.fieldName}
                                                    </span>

                                                    <div className="flex-1 flex gap-1 flex-wrap">
                                                        {isInsert && (
                                                            <span className="text-green-600">
                                                                + {item.newValue || '(null)'}
                                                            </span>
                                                        )}

                                                        {isDelete && (
                                                            <span className="line-through text-gray-400">
                                                                {item.oldValue || '(null)'}
                                                            </span>
                                                        )}

                                                        {isUpdate && (
                                                            <>
                                                                <span className="line-through text-gray-400">
                                                                    {item.oldValue || '(null)'}
                                                                </span>
                                                                <span className="text-green-600">
                                                                    → {item.newValue || '(null)'}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            </Card>
        ));
    };

    return (
        <>
            <PageHeader
                icon={ClipboardClock}
                title="Nhật ký thao tác"
                description="Xem lại lịch sử thao tác"
            />

            <Row gutter={16}>
                <Col span={8}>
                    <Card title="Requests" size="small">
                        <div className="mb-3 space-y-2">
                            <Input
                                placeholder="Người thực hiện..."
                                size="small"
                                value={filters.createdBy}
                                onChange={(e) =>
                                    setFilters((p) => ({ ...p, createdBy: e.target.value }))
                                }
                                allowClear
                            />

                            <Input
                                placeholder="Tên bảng..."
                                size="small"
                                value={filters.tableName}
                                onChange={(e) =>
                                    setFilters((p) => ({ ...p, tableName: e.target.value }))
                                }
                                allowClear
                            />

                            <RangePicker
                                size="small"
                                className="w-full"
                                value={filters.dateRange}
                                onChange={(dates) =>
                                    setFilters((p) => ({ ...p, dateRange: dates }))
                                }
                                format="DD/MM/YYYY"
                            />

                            <div className="flex gap-2">
                                <Button
                                    type="primary"
                                    size="small"
                                    onClick={() =>
                                        loadList(filters, { ...pagination, page: 0 })
                                    }
                                >
                                    Tìm
                                </Button>

                                <Button
                                    size="small"
                                    onClick={() => {
                                        const reset = {
                                            createdBy: '',
                                            tableName: '',
                                            dateRange: null,
                                        };

                                        const newPagination = {
                                            ...pagination,
                                            page: 0,
                                        };

                                        setFilters(reset);
                                        setPagination(newPagination);
                                        loadList(reset, newPagination);
                                    }}
                                >
                                    Reset
                                </Button>
                            </div>
                        </div>

                        {loadingList ? (
                            <div className="text-center p-5">
                                <Spin />
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                                {list.map((item) => {
                                    const isActive = item.requestId === selected;

                                    return (
                                        <Card
                                            key={item.requestId}
                                            size="small"
                                            hoverable
                                            onClick={() => loadDetail(item)}
                                            className={`cursor-pointer ${
                                                isActive ? 'border-blue-500 bg-blue-50' : ''
                                            }`}
                                        >
                                            <Text code>{item.requestId}</Text>

                                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                <span>{item.createdBy || 'SYSTEM'}</span>
                                                <span>
                                                    {dayjs(item.createdAt).format(
                                                        'DD/MM/YYYY HH:mm',
                                                    )}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {item.tableNames?.map((t) => (
                                                    <Tag key={t} color="blue">
                                                        {t}
                                                    </Tag>
                                                ))}
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}

                        <Pagination
                            className="mt-3 text-center"
                            current={pagination.page + 1}
                            pageSize={pagination.size}
                            total={pagination.total}
                            showSizeChanger
                            pageSizeOptions={[10, 20, 50, 100]}
                            onChange={(page, size) => {
                                const newPagination = {
                                    ...pagination,
                                    page: page - 1,
                                    size,
                                };

                                setPagination(newPagination);
                                loadList(filters, newPagination);
                            }}
                        />
                    </Card>
                </Col>

                <Col span={16}>
                    <Card title="Detail" size="small">
                        {selectedRequest && (
                            <div className="mb-3 pb-3 border-b border-gray-200">
                                <div className="flex justify-between text-sm">
                                    <div>
                                        <Text type="secondary">Request ID</Text>
                                        <br />
                                        <Text code>{selectedRequest.requestId}</Text>

                                        <div className="mt-2">
                                            <Text type="secondary">Người thao tác</Text>
                                            <br />
                                            <Text>
                                                {selectedRequest.createdBy} -{' '}
                                                {selectedRequest.employeeName}
                                            </Text>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div>
                                            <Text type="secondary">Thời gian</Text>
                                            <br />
                                            <Text>
                                                {dayjs(
                                                    selectedRequest.createdAt,
                                                ).format('DD/MM/YYYY HH:mm:ss')}
                                            </Text>
                                        </div>

                                        <div>
                                            <Text type="secondary">
                                                Phòng ban / Bộ phận
                                            </Text>
                                            <br />
                                            <Text>
                                                {selectedRequest.departmentName}
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {renderDetail()}
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default AuditLogPage;