import {
    CheckCircleOutlined,
    CheckOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    StopOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, Input, message, Modal, Space, Tag, Tooltip, Typography } from 'antd';
import { useState } from 'react';
import { useIsMobile } from '~/hook/useIsMobile';
import authService from '~/modules/auth/services/authService';

const { Text } = Typography;
const { TextArea } = Input;

const ApprovalCard = ({ approvals, onApprove, onReject }) => {
    const isMobile = useIsMobile();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [selectedApproval, setSelectedApproval] = useState(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'APPROVED':
                return {
                    color: '#52c41a',
                    backgroundColor: '#f6ffed',
                    borderColor: '#b7eb8f',
                    icon: <CheckCircleOutlined />,
                    text: 'Đã phê duyệt',
                };
            case 'REJECTED':
                return {
                    color: '#ff4d4f',
                    backgroundColor: '#fff2f0',
                    borderColor: '#ffccc7',
                    icon: <CloseCircleOutlined />,
                    text: 'Từ chối',
                };
            case 'PENDING':
            default:
                return {
                    color: '#faad14',
                    backgroundColor: '#fffbe6',
                    borderColor: '#ffe58f',
                    icon: <ClockCircleOutlined />,
                    text: 'Chờ phê duyệt',
                };
        }
    };

    const handleOpenModal = (approval, type) => {
        setSelectedApproval(approval);
        setModalType(type);
        setComment('');
        setIsModalVisible(true);
    };

    const handleConfirm = async () => {
        if (!selectedApproval) return;

        setLoading(true);
        try {
            if (modalType === 'approve') {
                await onApprove(selectedApproval.id, comment);
                message.success('Phê duyệt thành công');
            } else {
                await onReject(selectedApproval.id, comment);
                message.success('Từ chối thành công');
            }
            setIsModalVisible(false);
            setComment('');
        } catch (error) {
            message.error(error.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setComment('');
        setSelectedApproval(null);
    };

    if (!approvals || approvals.length === 0) {
        return null;
    }

    return (
        <>
            <Card
                title={
                    <Space>
                        <CheckCircleOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                        <Text strong>Trạng thái phê duyệt</Text>
                    </Space>
                }
                bordered={false}
                style={{
                    marginBottom: 16,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    borderRadius: 8,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        gap: 16,
                        overflowX: 'auto',
                        paddingBottom: 8,
                    }}
                >
                    {approvals.map((approval) => {
                        const statusConfig = getStatusConfig(approval.status);
                        const isPending = approval.status === 'PENDING';
                        const canApprove =
                            authService.hasPermission('NMD_PRODUCT_MP_CHECKLIST_APPROVAL') &&
                            (authService.hasRole('SUPERADMIN') ||
                                [approval.departmentCode].includes(
                                    authService.getParentDepartmentCode() ?? authService.getDepartmentCode(),
                                ));

                        return (
                            <Card
                                key={approval.id}
                                size="small"
                                style={{
                                    minWidth: isMobile ? 260 : 300,
                                    maxWidth: isMobile ? 260 : 300,
                                    borderLeft: `4px solid ${statusConfig.color}`,
                                    backgroundColor: statusConfig.backgroundColor,
                                    borderColor: statusConfig.borderColor,
                                    flexShrink: 0,
                                }}
                                bodyStyle={{ padding: isMobile ? 12 : 16 }}
                            >
                                <Space direction="vertical" style={{ width: '100%' }} size={8}>
                                    <Text
                                        strong
                                        style={{
                                            fontSize: isMobile ? 13 : 14,
                                            color: '#262626',
                                            display: 'block',
                                        }}
                                    >
                                        {approval.departmentName}
                                    </Text>

                                    <Tag
                                        icon={statusConfig.icon}
                                        color={statusConfig.color}
                                        style={{
                                            fontSize: isMobile ? 11 : 12,
                                            padding: '2px 8px',
                                            borderRadius: 4,
                                        }}
                                    >
                                        {statusConfig.text}
                                    </Tag>

                                    {approval.approvedByName && (
                                        <Space size={8} style={{ marginTop: 4 }}>
                                            <Avatar
                                                size={isMobile ? 20 : 24}
                                                icon={<UserOutlined />}
                                                style={{
                                                    backgroundColor: '#1890ff',
                                                    fontSize: isMobile ? 10 : 12,
                                                }}
                                            />
                                            <Text
                                                style={{
                                                    fontSize: isMobile ? 12 : 13,
                                                    color: '#595959',
                                                }}
                                            >
                                                {approval.approvedByName}
                                            </Text>
                                        </Space>
                                    )}

                                    {approval.comment && (
                                        <Tooltip title={approval.comment}>
                                            <Text
                                                type="secondary"
                                                style={{
                                                    fontSize: isMobile ? 11 : 12,
                                                    display: 'block',
                                                    marginTop: 4,
                                                }}
                                                ellipsis
                                            >
                                                Ghi chú: {approval.comment}
                                            </Text>
                                        </Tooltip>
                                    )}

                                    {isPending && canApprove && (
                                        <Space style={{ width: '100%', marginTop: 8 }} size={8}>
                                            <Button
                                                type="primary"
                                                size="small"
                                                icon={<CheckOutlined />}
                                                onClick={() => handleOpenModal(approval, 'approve')}
                                                style={{ flex: 1 }}
                                            >
                                                Duyệt
                                            </Button>
                                            <Button
                                                danger
                                                size="small"
                                                icon={<StopOutlined />}
                                                onClick={() => handleOpenModal(approval, 'reject')}
                                                style={{ flex: 1 }}
                                            >
                                                Từ chối
                                            </Button>
                                        </Space>
                                    )}
                                </Space>
                            </Card>
                        );
                    })}
                </div>
            </Card>

            <Modal
                title={modalType === 'approve' ? 'Xác nhận phê duyệt' : 'Xác nhận từ chối'}
                open={isModalVisible}
                onOk={handleConfirm}
                onCancel={handleCancel}
                confirmLoading={loading}
                okText={modalType === 'approve' ? 'Phê duyệt' : 'Từ chối'}
                cancelText="Hủy"
                okButtonProps={{
                    danger: modalType === 'reject',
                }}
            >
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                    <Text>
                        Bạn có chắc chắn muốn <Text strong>{modalType === 'approve' ? 'phê duyệt' : 'từ chối'}</Text>{' '}
                        cho <Text strong>{selectedApproval?.departmentName}</Text>?
                    </Text>
                    <TextArea
                        placeholder="Nhập ghi chú (không bắt buộc)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                    />
                </Space>
            </Modal>
        </>
    );
};

export default ApprovalCard;
