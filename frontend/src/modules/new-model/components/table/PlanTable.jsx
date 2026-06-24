import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    FileOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Divider, List, message, Popconfirm, Row, Space, Spin, Table, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { ExternalLink } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '~/hook/useIsMobile';
import authService from '~/modules/auth/services/authService';
import { renderHtmpStatus, renderResultTag } from '~/utils/renderTag';
import { renderSingleTime, renderTimeRange } from '~/utils/renderTime';
import productMoldTrialPlanService from '../../services/productPlanService';

const PlanTable = ({ productId, reloadTrigger, onEdit, onEditKT, onEditLOG }) => {
    const isMobile = useIsMobile();
    const canEditTrialPlan = authService.hasPermission('NMD_PRODUCT_PLAN_UPDATE');
    const canDeleteTrialPlan = authService.hasPermission('NMD_PRODUCT_PLAN_DELETE');
    const canUpdateKT = authService.hasPermission('NMD_PRODUCT_MOLD_TRIAL_PLAN_UPDATE_KT');
    const canUpdateLOG = authService.hasPermission('NMD_PRODUCT_MOLD_TRIAL_PLAN_UPDATE_LOG');
    const isSuperAdmin = authService.getRole('SUPPERADMIN');

    const [moldTrialPlans, setMoldTrialPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const columns = [
        {
            title: 'Tên',
            key: 'name',
            dataIndex: 'name',
            align: 'center',
            width: '120px',
            fixed: 'left',
            render: (name, record) => (
                <a
                    className={`font-semibold inline-flex items-center gap-1.5 hover:gap-2 transition-all ${record.status === 'CANCELLED' ? 'text-red-600' : 'text-blue-600'} ${record.status === 'CANCELLED' ? 'hover:text-red-800' : 'hover:text-blue-800'}`}
                    onClick={() => navigate(`plan/${record.id}`)}
                >
                    <span>{name}</span>
                    <ExternalLink size={14} className="flex-shrink-0" />
                </a>
            ),
        },
        {
            title: 'Loại',
            key: 'typePlan',
            dataIndex: 'typePlan',
            align: 'center',
            width: '100px',
            filters: [
                { text: 'Thử khuôn', value: 'MOLD_TRIAL' },
                { text: 'Event', value: 'EVENT' },
                { text: '2nd Process', value: 'SECOND_PROCESS' },
            ],
            onFilter: (value, record) => record.typePlan === value,
            render: (value) => {
                if (value === 'MOLD_TRIAL') return 'Thử khuôn';
                if (value === 'EVENT') return 'Event';
                if (value === 'SECOND_PROCESS') return '2nd Process';
                return '---';
            },
        },

        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            width: '220px',
            align: 'center',
            filters: [
                { text: 'Đã hủy', value: 'CANCELLED' },
                { text: 'Chậm', value: 'DELAYED' },
                { text: 'Đã lên kế hoạch', value: 'PLANNED' },
                { text: 'Đang chạy', value: 'RUNNING' },
                { text: 'Trễ kế hoạch', value: 'DELAYED' },
                { text: 'Đã hoàn thành', value: 'COMPLETED' },
                { text: 'Chờ quản lý duyệt', value: 'WAITTINGAPPROVALCHEKER' },
                { text: 'Chờ Trưởng/Phó phòng duyệt', value: 'WAITTINGAPPROVALHEAD' },
                { text: 'Chờ duyệt nhựa', value: 'WAITTINGAPPROVALRESIN' },
                { text: 'Chờ duyệt kế hoạch', value: 'WAITTINGAPPROVALPLAN' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (value, record) => {
                const statusTag = (
                    <Tag color={record.statusColor || 'default'}>{record.statusDescription || value || '--'}</Tag>
                );

                return statusTag;
            },
        },
        {
            title: 'Người tạo',
            key: 'createdByName',
            dataIndex: 'createdByName',
            width: '150px',
            align: 'center',
            render: (_, record) => {
                const code = record.createdByCode || '---';
                const fullName = record.createdByName || 'Chưa có tên';

                return (
                    <>
                        <Tooltip title={fullName} placement="right">
                            <Tag color="default" style={{ cursor: 'pointer' }}>
                                {code}
                            </Tag>{' '}
                        </Tooltip>
                        <div className="text-xs text-gray-500">
                            {record.createdAt ? renderSingleTime(record.createdAt) : 'Chưa có ngày tạo'}
                        </div>
                    </>
                );
            },
        },
        {
            title: 'Kế hoạch bất thường',
            key: 'isUnusual',
            dataIndex: 'isUnusual',
            width: '150px',
            align: 'center',
            render: (isUnusual) => {
                if (isUnusual) {
                    return (
                        <Tooltip title="Kế hoạch tạo sau thời gian yêu cầu">
                            <CheckCircleOutlined style={{ color: '#ff7875', fontSize: '18px' }} />
                        </Tooltip>
                    );
                }
                return <span style={{ color: '#999' }}>Không có</span>;
            },
        },

        {
            title: 'Thời gian yêu cầu',
            key: 'requestTime',
            align: 'center',
            width: 220,
            render: (_, record) => renderTimeRange(record.requestStartTime, record.requestEndTime),
        },
        {
            title: 'Thời gian thực tế',
            key: 'actualTime',
            align: 'center',
            width: 220,
            render: (_, record) => renderTimeRange(record.actualStartTime, record.actualEndTime),
        },
        {
            title: 'Ngày gửi FA',
            key: 'expectedFaSubmitDate',
            dataIndex: 'expectedFaSubmitDate',
            width: '250px',

            align: 'center',
            render: (value) => (value ? renderSingleTime(value) : <span style={{ color: '#999' }}>Chưa có</span>),
        },
        {
            title: 'Công đoạn',
            key: 'processStep',
            dataIndex: 'processStep',
            align: 'center',
            width: '250px',
        },
        {
            title: 'Nhựa / Linh kiện sử dụng',
            key: 'plastics',
            dataIndex: 'plastics',
            align: 'left',
            width: '250px',
            render: (plastics, record) => {
                if (record.typePlan !== 'SECOND_PROCESS') {
                    if (!plastics || plastics.length === 0) {
                        return <span style={{ color: '#999' }}>Chưa có</span>;
                    }
                    return (
                        <div style={{ fontSize: '12px' }}>
                            {plastics.map((plastic, index) => {
                                const resinCode = plastic?.ProductResinMapping?.code || 'N/A';
                                const isRecycle = plastic?.isRecycle;

                                return (
                                    <div key={index} style={{ marginBottom: index < plastics.length - 1 ? '4px' : 0 }}>
                                        <span style={{ fontWeight: 500 }}>{resinCode}</span>
                                        <Tag
                                            color={isRecycle ? 'blue' : 'green'}
                                            style={{ marginLeft: '6px', fontSize: '11px' }}
                                        >
                                            {isRecycle ? 'Tái sinh' : 'Nguyên chất'}
                                        </Tag>
                                    </div>
                                );
                            })}
                        </div>
                    );
                }

                const inserts = record.inserts;
                if (!inserts || inserts.length === 0) {
                    return <span style={{ color: '#999' }}>Chưa có</span>;
                }
                return (
                    <div style={{ fontSize: '12px' }}>
                        {inserts.map((insert, index) => (
                            <div key={index} style={{ marginBottom: index < inserts.length - 1 ? '4px' : 0 }}>
                                <span style={{ fontWeight: 500 }}>{insert.name || 'N/A'}</span>
                                {insert.quantityExpected && (
                                    <Tag color="blue" style={{ marginLeft: '6px', fontSize: '11px' }}>
                                        {insert.quantityExpected} cái
                                    </Tag>
                                )}
                            </div>
                        ))}
                    </div>
                );
            },
        },
        {
            title: 'Số lượng',
            key: 'sampleQuantity',
            dataIndex: 'sampleQuantity',
            align: 'center',
            width: '150px',
            render: (value, record) => {
                let label = 'mẫu thử';
                if (record.typePlan === 'EVENT') label = 'sản xuất';
                if (record.typePlan === 'SECOND_PROCESS') label = 'gia công';
                return value ? `${value} pcs` : '---';
            },
        },
        {
            title: 'Nhân viên chịu trách nhiệm',
            key: 'responsibleEmployeeName',
            dataIndex: 'responsibleEmployeeName',
            width: '150px',
            align: 'center',
            render: (_, record) => {
                const code = record.responsibleEmployeeCode || '---';
                const fullName = record.responsibleEmployeeName || 'Chưa có tên';

                return (
                    <Tooltip title={fullName} placement="right">
                        <Tag color="default" style={{ cursor: 'pointer' }}>
                            {code}
                        </Tag>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Điều kiện đúc',
            key: 'attachedConditionFile',
            dataIndex: 'attachedConditionFile',
            width: '250px',
            align: 'center',
            render: (value) =>
                value ? <a href={`${process.env.REACT_APP_UPLOAD_URL}/${value}`}>{value.split('/').pop()}</a> : 'Không',
        },
    ];

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await productMoldTrialPlanService.deleteMoldTrialPlan(id);
            await fetchMoldTrialPlans();
        } catch (error) {
            message.error(error?.message || 'Xóa kế hoạch thất bại');
        } finally {
            setLoading(false);
        }
    };

    const fetchMoldTrialPlans = useCallback(async () => {
        setLoading(true);
        try {
            const data = await productMoldTrialPlanService.getMoldTrialPlansByProductId(productId);
            setMoldTrialPlans(Array.isArray(data) ? data : []);
        } catch (error) {
            message.error(error?.message || String(error));
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchMoldTrialPlans();
    }, [fetchMoldTrialPlans, reloadTrigger]);

    const renderMobileList = () => (
        <Spin spinning={loading}>
            <List
                dataSource={moldTrialPlans}
                renderItem={(record) => (
                    <Card
                        key={record.id}
                        style={{ marginBottom: 12 }}
                        size="small"
                        title={
                            <div
                                onClick={() => navigate(`mold-trial-plan/${record.id}`)}
                                style={{ cursor: 'pointer', color: '#1890ff' }}
                            >
                                <strong>{record.name}</strong>
                                <ExternalLink size={14} style={{ marginLeft: 8 }} />
                            </div>
                        }
                        extra={
                            <Space>
                                {renderHtmpStatus(record.status)}
                                {renderResultTag(record.result)}
                            </Space>
                        }
                    >
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                            <div>
                                <ClockCircleOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                                <strong>YC:</strong>{' '}
                                {record.requestTrialTime && record.requestTrialEndTime ? (
                                    <>
                                        <div style={{ marginLeft: 20, marginTop: 4 }}>
                                            <strong>TỪ</strong>{' '}
                                            {dayjs(record.requestTrialTime).format('HH:mm DD/MM/YYYY')}
                                        </div>
                                        <div style={{ marginLeft: 20 }}>
                                            <strong>ĐẾN</strong>{' '}
                                            {dayjs(record.requestTrialEndTime).format('HH:mm DD/MM/YYYY')}
                                        </div>
                                    </>
                                ) : record.requestTrialTime ? (
                                    <div style={{ marginLeft: 20, marginTop: 4 }}>
                                        <strong>TỪ</strong> {dayjs(record.requestTrialTime).format('HH:mm DD/MM/YYYY')}
                                    </div>
                                ) : (
                                    <span style={{ color: '#999' }}>Chưa có</span>
                                )}
                            </div>

                            {record.actualStartTrialTime && (
                                <div>
                                    <ClockCircleOutlined style={{ marginRight: 4, color: '#52c41a' }} />
                                    <strong>Thực tế bắt đầu:</strong>{' '}
                                    {dayjs(record.actualStartTrialTime).format('HH:mm DD/MM/YYYY')}
                                </div>
                            )}

                            {record.actualEndTrialTime && (
                                <div>
                                    <ClockCircleOutlined style={{ marginRight: 4, color: '#52c41a' }} />
                                    <strong>Thực tế kết thúc:</strong>{' '}
                                    {dayjs(record.actualEndTrialTime).format('HH:mm DD/MM/YYYY')}
                                </div>
                            )}

                            {record.expectedFaSubmitDate && (
                                <div>
                                    <FileOutlined style={{ marginRight: 4, color: '#fa8c16' }} />
                                    <strong>Ngày gửi FA:</strong>{' '}
                                    {dayjs(record.expectedFaSubmitDate).format('HH:mm DD/MM/YYYY')}
                                </div>
                            )}

                            <Divider style={{ margin: '8px 0' }} />

                            <Row gutter={[8, 8]}>
                                <Col span={12}>
                                    <div style={{ fontSize: 12 }}>
                                        <strong>Công đoạn:</strong>
                                        <br />
                                        {record.processStep || 'N/A'}
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div style={{ fontSize: 12 }}>
                                        <strong>Số lượng:</strong>
                                        <br />
                                        {record.sampleQuantity
                                            ? `${record.sampleQuantity} PCS (${record.typePlan === 'EVENT' ? 'sản xuất' : record.typePlan === 'SECOND_PROCESS' ? 'gia công' : 'mẫu thử'})`
                                            : 'N/A'}
                                    </div>
                                </Col>
                                <Col span={24}>
                                    <div style={{ fontSize: 12 }}>
                                        <strong>
                                            {record.typePlan === 'SECOND_PROCESS'
                                                ? 'Linh kiện/NVL sử dụng:'
                                                : 'Nhựa sử dụng:'}
                                        </strong>
                                        <br />
                                        {record.typePlan !== 'SECOND_PROCESS' ? (
                                            record.plastics && record.plastics.length > 0 ? (
                                                record.plastics.map((plastic, index) => {
                                                    const resinCode = plastic?.ProductResinMapping?.code || 'N/A';
                                                    const isRecycle = plastic?.isRecycle;

                                                    return (
                                                        <div
                                                            key={index}
                                                            style={{ marginTop: index > 0 ? '4px' : '4px' }}
                                                        >
                                                            <span style={{ fontWeight: 500 }}>{resinCode}</span>
                                                            <Tag
                                                                color={isRecycle ? 'blue' : 'green'}
                                                                style={{ marginLeft: '6px', fontSize: '11px' }}
                                                            >
                                                                {isRecycle ? 'Tái sinh' : 'Nguyên chất'}
                                                            </Tag>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <span style={{ color: '#999' }}>Chưa có</span>
                                            )
                                        ) : record.inserts && record.inserts.length > 0 ? (
                                            record.inserts.map((insert, index) => (
                                                <div key={index} style={{ marginTop: index > 0 ? '4px' : '4px' }}>
                                                    <span style={{ fontWeight: 500 }}>{insert.name || 'N/A'}</span>
                                                    {insert.quantityExpected && (
                                                        <Tag
                                                            color="blue"
                                                            style={{ marginLeft: '6px', fontSize: '11px' }}
                                                        >
                                                            {insert.quantityExpected} cái
                                                        </Tag>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <span style={{ color: '#999' }}>Chưa có</span>
                                        )}
                                    </div>
                                </Col>
                                <Col span={24}>
                                    <div style={{ fontSize: 12 }}>
                                        <UserOutlined style={{ marginRight: 4 }} />
                                        <strong>NV chịu trách nhiệm:</strong>{' '}
                                        <Tag color="default" style={{ margin: 0 }}>
                                            {record.responsibleEmployeeCode || '---'}
                                        </Tag>
                                        {record.responsibleEmployeeName && (
                                            <span style={{ marginLeft: 4 }}>({record.responsibleEmployeeName})</span>
                                        )}
                                    </div>
                                </Col>
                                {record.attachedConditionFile && (
                                    <Col span={24}>
                                        <div style={{ fontSize: 12 }}>
                                            <FileOutlined style={{ marginRight: 4 }} />
                                            <strong>Điều kiện đúc:</strong>{' '}
                                            <a
                                                href={`${process.env.REACT_APP_UPLOAD_URL}/${record.attachedConditionFile}`}
                                            >
                                                {record.attachedConditionFile.split('/').pop()}
                                            </a>
                                        </div>
                                    </Col>
                                )}
                            </Row>

                            {(canDeleteTrialPlan || canEditTrialPlan || canUpdateKT || canUpdateLOG) && (
                                <>
                                    <Divider style={{ margin: '8px 0' }} />
                                    <Space size="small" style={{ width: '100%', justifyContent: 'flex-end' }}>
                                        {(isSuperAdmin || canEditTrialPlan) && (
                                            <Tooltip title="Chỉnh sửa kế hoạch">
                                                <Button
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    onClick={() => onEdit && onEdit(record)}
                                                >
                                                    Sửa
                                                </Button>
                                            </Tooltip>
                                        )}
                                        {(isSuperAdmin || canUpdateKT) && (
                                            <Tooltip title="Cập nhật thực tế">
                                                <Button
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    onClick={() => onEditKT && onEditKT(record)}
                                                >
                                                    KT
                                                </Button>
                                            </Tooltip>
                                        )}
                                        {(isSuperAdmin || canUpdateLOG) && (
                                            <Tooltip title="Cập nhật NVL">
                                                <Button
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    onClick={() => onEditLOG && onEditLOG(record)}
                                                >
                                                    LOG
                                                </Button>
                                            </Tooltip>
                                        )}
                                        {canDeleteTrialPlan && (
                                            <Popconfirm
                                                title={`Xóa "${record.name}"?`}
                                                okText="Xóa"
                                                cancelText="Hủy"
                                                okButtonProps={{ danger: true }}
                                                onConfirm={() => handleDelete(record.id)}
                                            >
                                                <Button size="small" danger icon={<DeleteOutlined />} />
                                            </Popconfirm>
                                        )}
                                    </Space>
                                </>
                            )}
                        </Space>
                    </Card>
                )}
            />
        </Spin>
    );

    if (isMobile) {
        return renderMobileList();
    }

    return (
        <Table
            dataSource={moldTrialPlans}
            rowKey="id"
            columns={columns}
            loading={loading}
            rowClassName={(record) => (record.status === 'CANCELLED' ? 'row-cancelled' : '')}
            bordered
            scroll={{ y: 'calc(100vh - 300px)', x: 1000 }}
            pagination={false}
        />
    );
};

export default PlanTable;
