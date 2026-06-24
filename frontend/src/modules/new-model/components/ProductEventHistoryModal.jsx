import { ClockCircleOutlined } from '@ant-design/icons';
import { Alert, Modal, Spin, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import productService from '../services/productService';

const { Text } = Typography;

const ProductEventHistoryModal = ({ open, onCancel, productId, historySummary }) => {
    const [loading, setLoading] = useState(false);
    const [allHistory, setAllHistory] = useState([]);

    useEffect(() => {
        if (open && productId && historySummary) {
            fetchAllEventHistory();
        }
    }, [open, productId, historySummary]);

    const fetchAllEventHistory = async () => {
        setLoading(true);
        try {
            const eventFields = historySummary.filter((item) => item.fieldName.startsWith('eventRequirements.'));
            const promises = eventFields.map((field) => productService.getProductHistory(productId, field.fieldName));

            const results = await Promise.all(promises);
            const combined = results.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setAllHistory(combined);
        } catch (error) {
            setAllHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const parseFieldName = (fieldName) => {
        const match = fieldName.match(/eventRequirements\.(.+)\.(\w+)$/);
        if (match) {
            return { eventName: match[1], field: match[2] };
        }
        return null;
    };

    const getFieldLabel = (fieldName) => {
        if (fieldName === 'removed') return 'Xóa event';
        if (fieldName === 'added') return 'Thêm event';
        if (fieldName === 'deliveryDate') return 'Ngày giao hàng';
        if (fieldName === 'quantity') return 'Số lượng';
        return fieldName;
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 160,
            render: (text) => (
                <span style={{ fontSize: 12 }}>
                    <ClockCircleOutlined style={{ marginRight: 6, color: '#1890ff' }} />
                    {text ? dayjs(text).format('DD/MM/YYYY HH:mm') : '-'}
                </span>
            ),
        },
        {
            title: 'Event',
            dataIndex: 'fieldName',
            key: 'eventName',
            width: 150,
            render: (fieldName) => {
                const parsed = parseFieldName(fieldName);
                return parsed ? (
                    <Tag color="blue" style={{ fontSize: 12 }}>
                        {parsed.eventName}
                    </Tag>
                ) : (
                    <Text type="secondary">-</Text>
                );
            },
        },
        {
            title: 'Trường',
            dataIndex: 'fieldName',
            key: 'fieldType',
            width: 120,
            render: (fieldName) => {
                const parsed = parseFieldName(fieldName);
                const label = getFieldLabel(parsed?.field || fieldName.split('.').pop());
                return <Tag color="purple">{label}</Tag>;
            },
        },
        {
            title: 'Giá trị cũ',
            dataIndex: 'oldValue',
            key: 'oldValue',
            render: (text) => (
                <Tag color="red" style={{ wordBreak: 'break-word', whiteSpace: 'normal', fontSize: 12 }}>
                    {text || '(Trống)'}
                </Tag>
            ),
        },
        {
            title: 'Giá trị mới',
            dataIndex: 'newValue',
            key: 'newValue',
            render: (text) => (
                <Tag color="green" style={{ wordBreak: 'break-word', whiteSpace: 'normal', fontSize: 12 }}>
                    {text || '(Trống)'}
                </Tag>
            ),
        },
        {
            title: 'Người thay đổi',
            dataIndex: 'createdByName',
            key: 'createdByName',
            width: 150,
            render: (name, record) => (
                <div>
                    <div style={{ fontWeight: 500, fontSize: 12 }}>{name || '-'}</div>
                    {record.createdByCode && (
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>({record.createdByCode})</div>
                    )}
                </div>
            ),
        },
    ];

    const totalChanges = historySummary?.filter((item) => item.fieldName.startsWith('eventRequirements.')).length || 0;

    return (
        <Modal
            title={
                <span>
                    <ClockCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    Lịch sử thay đổi Event Requirements ({totalChanges} trường)
                </span>
            }
            open={open}
            onCancel={onCancel}
            footer={null}
            width={1000}
            destroyOnClose
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin tip="Đang tải lịch sử..." />
                </div>
            ) : allHistory.length > 0 ? (
                <Table
                    columns={columns}
                    dataSource={allHistory}
                    rowKey={(record, index) => `${record.createdAt}-${record.fieldName}-${index}`}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng ${total} thay đổi`,
                    }}
                    size="small"
                />
            ) : (
                <Alert message="Không có lịch sử thay đổi event" type="info" showIcon />
            )}
        </Modal>
    );
};

export default ProductEventHistoryModal;
