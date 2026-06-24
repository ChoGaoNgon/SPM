import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, Space, Steps, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text, Title, Paragraph } = Typography;

const PlanApprovalProgress = ({ approvals = [], onApprove, hasPermission }) => {
    const currentApprovalIndex = approvals.findIndex((a) => a.status === 'PENDING');

    const getStepStatus = (approval, index) => {
        if (approval.status === 'APPROVED') return 'finish';
        if (approval.status === 'REJECTED') return 'error';
        if (index === currentApprovalIndex) return 'process';
        return 'wait';
    };

    const getStatusTag = (status) => {
        const statusMap = {
            PENDING: {
                color: 'default',
                icon: <ClockCircleOutlined />,
                text: 'Chờ duyệt',
            },
            APPROVED: {
                color: 'success',
                icon: <CheckCircleOutlined />,
                text: 'Đã duyệt',
            },
            REJECTED: {
                color: 'error',
                icon: <CloseCircleOutlined />,
                text: 'Từ chối',
            },
        };

        const status_info = statusMap[status] || statusMap.PENDING;
        return (
            <Tag icon={status_info.icon} color={status_info.color}>
                {status_info.text}
            </Tag>
        );
    };

    const renderStepDescription = (approval, index) => {
        const canApprove = hasPermission ? hasPermission(approval.requiredPermission) : true;
        const isCurrentPending = approval.status === 'PENDING' && index === currentApprovalIndex;

        return (
            <div style={{ marginTop: 4 }}>
                {approval.status === 'PENDING' && (
                    <Space direction="vertical" size={4}>
                        <Space>{getStatusTag(approval.status)}</Space>
                        {onApprove && canApprove && isCurrentPending && (
                            <Button type="primary" size="small" onClick={() => onApprove(approval)}>
                                Phê duyệt
                            </Button>
                        )}
                    </Space>
                )}

                {approval.status === 'APPROVED' && (
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        {getStatusTag(approval.status)}
                        {approval.approvedByName && (
                            <Space>
                                <Avatar size="small" icon={<UserOutlined />} />
                                <Text type="secondary">{approval.approvedByName}</Text>
                            </Space>
                        )}
                        {approval.approvedAt && (
                            <Space>
                                <CalendarOutlined style={{ color: '#1890ff' }} />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {dayjs(approval.approvedAt).format('DD/MM/YYYY HH:mm')}
                                    <Text type="secondary"> ({dayjs(approval.approvedAt).fromNow()})</Text>
                                </Text>
                            </Space>
                        )}
                        {approval.remark && (
                            <Paragraph
                                style={{
                                    fontSize: '12px',
                                    color: '#666',
                                    margin: 0,
                                    fontStyle: 'italic',
                                }}
                            >
                                "{approval.remark}"
                            </Paragraph>
                        )}
                    </Space>
                )}

                {approval.status === 'REJECTED' && (
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        {getStatusTag(approval.status)}
                        {approval.approvedByName && (
                            <Space>
                                <Avatar size="small" icon={<UserOutlined />} />
                                <Text type="secondary">{approval.approvedByName}</Text>
                            </Space>
                        )}
                        {approval.approvedAt && (
                            <Space>
                                <CalendarOutlined style={{ color: '#ff4d4f' }} />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {dayjs(approval.approvedAt).format('DD/MM/YYYY HH:mm')}
                                </Text>
                            </Space>
                        )}
                        {approval.remark && (
                            <Paragraph
                                style={{
                                    fontSize: '12px',
                                    color: '#ff4d4f',
                                    margin: 0,
                                    fontStyle: 'italic',
                                }}
                            >
                                "{approval.remark}"
                            </Paragraph>
                        )}
                    </Space>
                )}
            </div>
        );
    };

    const stepsItems = approvals.map((approval, index) => ({
        title: (
            <Space size={4}>
                <Text strong style={{ fontSize: '13px' }}>
                    {approval.approvalTypeName}
                </Text>
                {approval.required && (
                    <Tag color="red" style={{ fontSize: '10px', padding: '0 4px', lineHeight: '16px' }}>
                        *
                    </Tag>
                )}
            </Space>
        ),
        description: renderStepDescription(approval, index),
        status: getStepStatus(approval, index),
    }));

    const totalSteps = approvals.length;
    const completedSteps = approvals.filter((a) => a.status === 'APPROVED').length;
    const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return (
        <Card
            title={
                <Space size={8}>
                    <Title level={5} style={{ margin: 0, fontSize: '15px' }}>
                        Tiến trình phê duyệt
                    </Title>
                </Space>
            }
        >
            {approvals.length === 0 ? (
                <Text type="secondary">Chưa có quy trình phê duyệt</Text>
            ) : (
                <>
                    <Steps
                        direction="horizontal"
                        current={currentApprovalIndex >= 0 ? currentApprovalIndex : approvals.length}
                        items={stepsItems}
                        style={{ marginTop: 8 }}
                    />
                </>
            )}
        </Card>
    );
};

export default PlanApprovalProgress;
