import React, { useEffect, useMemo, useState } from 'react';
import { Card, Empty, Input, Spin, Table, Tag, Typography, message, Tooltip, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';
import employeeService from '~/modules/employee/services/employeeService';
import { renderResultTag } from '~/utils/renderTag';
import InspectionFormModal from '~/modules/new-model/components/modal/InspectionFormModal';

const { Text } = Typography;

const toDateValue = (value) => (value ? dayjs(value).valueOf() : Number.MAX_SAFE_INTEGER);

const renderInspectorResultCell = (checkerId, result, employeesById) => {
    const employee = employeesById[checkerId];
    const displayCode = employee ? employee.code : checkerId ? `ID: ${checkerId}` : '--';
    const displayName = employee ? employee.name : '';

    return (
        <div>
            <div className="text-sm text-gray-700">
                <Tooltip title={displayName || 'Không có thông tin'} placement="right">
                    <Tag className="cursor-help">{displayCode}</Tag>
                </Tooltip>
            </div>
            <div className="mt-1">{renderResultTag(result)}</div>
        </div>
    );
};

const buildDeadlineTag = (deadline) => {
    if (!deadline) {
        return <Tag color="default">Chưa có hạn</Tag>;
    }

    const today = dayjs().startOf('day');
    const dueDate = dayjs(deadline).startOf('day');
    const diff = dueDate.diff(today, 'day');

    if (diff < 0) {
        return <Tag color="red">Quá hạn {Math.abs(diff)} ngày</Tag>;
    }

    if (diff === 0) {
        return <Tag color="orange">Đến hạn hôm nay</Tag>;
    }

    return <Tag color="blue">Còn {diff} ngày</Tag>;
};

const QcqaPendingInspectionPlans = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [plans, setPlans] = useState([]);
    const [employeesById, setEmployeesById] = useState({});
    const [openInspectionModal, setOpenInspectionModal] = useState(false);
    const [selectedInspection, setSelectedInspection] = useState(null);
    const [reloadPlans, setReloadPlans] = useState(false);

    useEffect(() => {
        let mounted = true;

        const fetchEmployees = async () => {
            try {
                const employees = await employeeService.getAllEmployees();
                if (!mounted) {
                    return;
                }

                const mapById = (employees || []).reduce((acc, employee) => {
                    if (employee?.id != null) {
                        acc[employee.id] = employee;
                    }
                    return acc;
                }, {});

                setEmployeesById(mapById);
            } catch (error) {
                if (!mounted) {
                    return;
                }

                setEmployeesById({});
                message.error(error?.message || 'Không thể tải danh sách nhân viên');
            }
        };

        fetchEmployees();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const fetchPendingPlans = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get('/qcqa/statistics/approval-pending', {
                    params: { param: keyword },
                });

                if (!mounted) {
                    return;
                }

                const rows = response?.data?.data || [];
                setPlans(rows);
            } catch (error) {
                if (!mounted) {
                    return;
                }

                setPlans([]);
                message.error(error?.response?.data?.message || error?.message || 'Không thể tải danh sách QC pending');
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchPendingPlans();

        return () => {
            mounted = false;
        };
    }, [keyword, reloadPlans]);

    const dataSource = useMemo(
        () =>
            [...plans]
                .sort(
                    (a, b) =>
                        toDateValue(a?.productInspection?.inspectionDeadline) -
                        toDateValue(b?.productInspection?.inspectionDeadline),
                )
                .map((item, index) => ({
                    key: item?.planSummary?.id || `pending-${index}`,
                    index: index + 1,
                    modelId: item?.planSummary?.modelId || item?.modelId,
                    productId: item?.planSummary?.productId || item?.productId,
                    planId: item?.planSummary?.id,
                    planName: item?.planSummary?.name || '--',
                    modelCode: item?.planSummary?.modelCode || '--',
                    productCode: item?.planSummary?.productCode || '--',
                    status: item?.planSummary?.status || '--',
                    statusDescription: item?.planSummary?.statusDescription || item?.planSummary?.status || '--',
                    statusColor: item?.planSummary?.statusColor || 'default',
                    visualCheckedById: item?.productInspection?.visualCheckedById || null,
                    visualResult: item?.productInspection?.visualResult || null,
                    dimensionCheckedById: item?.productInspection?.dimensionCheckedById || null,
                    dimensionResult: item?.productInspection?.dimensionResult || null,
                    finalCheckedById: item?.productInspection?.finalCheckedById || null,
                    finalResult: item?.productInspection?.finalResult || null,
                    deadline: item?.productInspection?.inspectionDeadline || null,
                })),
        [plans],
    );

    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            width: 60,
            align: 'center',
        },
        {
            title: 'Kế hoạch',
            dataIndex: 'planName',
            render: (value, record) => (
                <div>
                    <div className="font-medium text-gray-800">
                        <span
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            onClick={() => {
                                if (!record.modelId || !record.productId || !record.planId) {
                                    return;
                                }
                                navigate(
                                    `/product-manager/models/${record.modelId}/products/${record.productId}/plan/${record.planId}`,
                                );
                            }}
                        >
                            {value}
                        </span>{' '}
                        -{' '}
                        <span
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            onClick={() => {
                                if (!record.modelId || !record.productId) {
                                    return;
                                }
                                navigate(`/product-manager/models/${record.modelId}/products/${record.productId}`);
                            }}
                        >
                            {record.productCode}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            title: 'KQ ngoại quan',
            width: 250,
            align: 'center',
            render: (_, record) =>
                renderInspectorResultCell(record.visualCheckedById, record.visualResult, employeesById),
        },
        {
            title: 'KQ kích thước',
            width: 250,
            align: 'center',
            render: (_, record) =>
                renderInspectorResultCell(record.dimensionCheckedById, record.dimensionResult, employeesById),
        },
        {
            title: 'KQ cuối cùng',
            width: 250,
            align: 'center',
            render: (_, record) =>
                renderInspectorResultCell(record.finalCheckedById, record.finalResult, employeesById),
        },
        {
            title: 'Hạn kiểm tra',
            dataIndex: 'deadline',
            width: 250,
            align: 'center',
            render: (deadline) => (
                <div>
                    <div className="text-sm text-gray-800">
                        {deadline ? dayjs(deadline).format('DD/MM/YYYY') : '--'}
                    </div>
                    <div className="mt-1">{buildDeadlineTag(deadline)}</div>
                </div>
            ),
            sorter: (a, b) => toDateValue(a.deadline) - toDateValue(b.deadline),
            defaultSortOrder: 'ascend',
        },
        {
            title: 'Trạng thái kế hoạch',
            dataIndex: 'statusDescription',
            width: 220,
            align: 'center',
            render: (statusDescription, record) => <Tag color={record.statusColor}>{statusDescription}</Tag>,
        },
        {
            title: 'Hành động',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Button
                    icon={<EditOutlined />}
                    onClick={() => {
                        setSelectedInspection(record);
                        setOpenInspectionModal(true);
                    }}
                >
                    Cập nhật
                </Button>
            ),
        },
    ];

    return (
        <>
            <InspectionFormModal
                open={openInspectionModal}
                onCancel={() => {
                    setOpenInspectionModal(false);
                    setSelectedInspection(null);
                }}
                initialValues={selectedInspection}
                trialPlanId={selectedInspection?.planId}
                trialPlanName={selectedInspection?.planName}
                onSuccess={() => {
                    setOpenInspectionModal(false);
                    setSelectedInspection(null);
                    setReloadPlans((prev) => !prev);
                }}
            />
            <Card
                title="Kế hoạch cần QC nhập kiểm tra mẫu"
                extra={
                    <Text className="text-sm text-gray-500">
                        Tổng số kế hoạch: <span className="font-semibold text-blue-600">{dataSource.length}</span>
                    </Text>
                }
            >
                <div className="mb-3">
                    <Input.Search
                        allowClear
                        placeholder="Tìm theo kế hoạch, model, product, khách hàng..."
                        onSearch={(value) => setKeyword(value || '')}
                        onChange={(event) => {
                            if (!event.target.value) {
                                setKeyword('');
                            }
                        }}
                        style={{ maxWidth: 420 }}
                    />
                </div>

                {loading ? (
                    <div className="h-[280px] flex items-center justify-center">
                        <Spin />
                    </div>
                ) : dataSource.length === 0 ? (
                    <Empty description="Không có kế hoạch cần QC nhập kiểm tra" />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={dataSource}
                        pagination={{ pageSize: 10, showSizeChanger: false }}
                        size="middle"
                    />
                )}
            </Card>
        </>
    );
};

export default QcqaPendingInspectionPlans;
