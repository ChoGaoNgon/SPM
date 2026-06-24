import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Space, message, Alert, Spin, Modal } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import toolPreparationService from '../services/toolPreparationService';

const ToolPreparationList = ({ productId, onEdit, onCreate, reload, canCreate, canEdit, canDelete }) => {
    const [loading, setLoading] = useState(false);
    const [preparations, setPreparations] = useState([]);

    useEffect(() => {
        if (productId) {
            fetchToolPreparations();
        }
    }, [productId, reload]);

    const fetchToolPreparations = async () => {
        setLoading(true);
        try {
            const response = await toolPreparationService.getByProduct(productId);
            if (response?.status === 200 || response?.code === 200) {
                setPreparations(Array.isArray(response?.data) ? response.data : []);
            } else {
                setPreparations([]);
            }
        } catch (error) {
            message.error('Không thể tải danh sách chuẩn bị dụng cụ: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const deriveStatus = (assignedDate, completionDate) => {
        if (!assignedDate) {
            return 'NOT_STARTED';
        }
        if (completionDate) {
            return 'COMPLETED';
        }
        return 'IN_PROGRESS';
    };

    const getStatusTag = (status) => {
        const statusMap = {
            NOT_STARTED: { color: 'default', text: 'Chưa bắt đầu', icon: <ClockCircleOutlined /> },
            IN_PROGRESS: { color: 'processing', text: 'Đang thực hiện', icon: <ClockCircleOutlined /> },
            COMPLETED: { color: 'success', text: 'Đã hoàn thành', icon: <CheckCircleOutlined /> },
            CANCELLED: { color: 'error', text: 'Đã hủy', icon: null },
        };
        const config = statusMap[status] || statusMap.NOT_STARTED;
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        );
    };

    const getProcessTypeLabel = (type) => {
        return type === 'FIRST_PROCESS' ? 'First Process' : 'Second Process';
    };

    const getProcessTypeDescription = (type) => {
        return type === 'FIRST_PROCESS' ? '(Tay gá + Bàn cắt)' : '(JIG)';
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Xóa dụng cụ',
            content: `Bạn có chắc muốn xóa dụng cụ ${record.toolName || ''}?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    const response = await toolPreparationService.delete(record.id);
                    if (response?.status === 200 || response?.code === 200) {
                        message.success('Xóa dụng cụ thành công!');
                        fetchToolPreparations();
                    } else {
                        message.error(response?.message || 'Xóa dụng cụ thất bại!');
                    }
                } catch (error) {
                    message.error('Không thể xóa dụng cụ: ' + error.message);
                }
            },
        });
    };

    const toolItems = preparations.flatMap((preparation) =>
        (preparation.items || []).map((item) => ({
            ...item,
            processType: item.processType || preparation.processType,
            parentPreparation: preparation,
        })),
    );

    const itemColumns = [
        {
            title: 'Quy trình',
            dataIndex: 'processType',
            key: 'processType',
            render: (type) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{getProcessTypeLabel(type)}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{getProcessTypeDescription(type)}</div>
                </div>
            ),
        },
        {
            title: 'Tên dụng cụ',
            dataIndex: 'toolName',
            key: 'toolName',
            render: (text) => <strong>{text || '-'}</strong>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) =>
                getStatusTag(
                    deriveStatus(
                        record.assignedDate,
                        record.completionDate || record.actualCompletionDate || record.expectedCompletionDate,
                    ),
                ),
        },
        {
            title: 'SL yêu cầu',
            dataIndex: 'quantityRequired',
            key: 'quantityRequired',
            render: (qty) => qty || '-',
        },
        {
            title: 'SL đã có',
            dataIndex: 'quantityAvailable',
            key: 'quantityAvailable',
            render: (qty) => qty || '-',
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            render: (note) => note || '-',
        },
        {
            title: 'PIC',
            dataIndex: 'responsibleEmployeeName',
            key: 'responsibleEmployeeName',
            render: (name, record) =>
                name ? `${name}${record.responsibleEmployeeCode ? ` (${record.responsibleEmployeeCode})` : ''}` : '-',
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => {
                const isCompleted =
                    deriveStatus(
                        record.assignedDate,
                        record.completionDate || record.actualCompletionDate || record.expectedCompletionDate,
                    ) === 'COMPLETED';

                if (!canEdit && !canDelete) {
                    return null;
                }

                return (
                    <Space>
                        {canEdit && (
                            <Button
                                type="link"
                                icon={<EditOutlined />}
                                onClick={() => onEdit(record)}
                                disabled={isCompleted}
                            >
                                Cập nhật
                            </Button>
                        )}
                        {canDelete && (
                            <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
                                Xóa
                            </Button>
                        )}
                    </Space>
                );
            },
        },
    ];

    if (loading) {
        return (
            <Card title="Chuẩn bị dụng cụ" bordered={false}>
                <Spin />
            </Card>
        );
    }

    return (
        <Card
            title="Chuẩn bị dụng cụ"
            bordered={false}
            extra={
                <Space>
                    {canCreate && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate} disabled={!productId}>
                            Tạo mới
                        </Button>
                    )}
                </Space>
            }
        >
            {toolItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Alert
                        message="Chưa có dụng cụ"
                        description="Nhấn nút Tạo mới để thêm từng dụng cụ cho sản phẩm này."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                    {canCreate && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="large"
                            onClick={onCreate}
                            disabled={!productId}
                        >
                            Tạo mới dụng cụ
                        </Button>
                    )}
                </div>
            ) : (
                <Table
                    columns={itemColumns}
                    dataSource={toolItems}
                    rowKey={(record, index) => record.id || `${record.toolName}_${index}`}
                    pagination={false}
                />
            )}
        </Card>
    );
};

export default ToolPreparationList;
