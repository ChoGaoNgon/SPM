import { ClockCircleOutlined } from '@ant-design/icons';
import { Alert, Modal, Spin, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import productService from '../services/productService';

const ProductHistoryModal = ({ open, onCancel, productId, fieldName, fieldLabel }) => {
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (open && productId && fieldName) {
            fetchHistory();
        }
    }, [open, productId, fieldName]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await productService.getProductHistory(productId, fieldName);
            setHistory(data || []);
        } catch (error) {
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            render: (text) => (
                <span>
                    <ClockCircleOutlined style={{ marginRight: 6, color: '#1890ff' }} />
                    {text ? dayjs(text).format('DD/MM/YYYY HH:mm') : '-'}
                </span>
            ),
        },
        {
            title: 'Giá trị cũ',
            dataIndex: 'oldValue',
            key: 'oldValue',
            render: (text) => (
                <Tag color="red" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                    {text || '(Trống)'}
                </Tag>
            ),
        },
        {
            title: 'Giá trị mới',
            dataIndex: 'newValue',
            key: 'newValue',
            render: (text) => (
                <Tag color="green" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                    {text || '(Trống)'}
                </Tag>
            ),
        },
        {
            title: 'Người thay đổi',
            dataIndex: 'createdByName',
            key: 'createdByName',
            width: 200,
            render: (name, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{name || '-'}</div>
                    {record.createdByCode && (
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>({record.createdByCode})</div>
                    )}
                </div>
            ),
        },
    ];

    return (
        <Modal
            title={
                <span>
                    <ClockCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    Lịch sử thay đổi: {fieldLabel || fieldName}
                </span>
            }
            open={open}
            onCancel={onCancel}
            footer={null}
            width={900}
            destroyOnClose
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin tip="Đang tải lịch sử..." />
                </div>
            ) : history.length > 0 ? (
                <Table
                    columns={columns}
                    dataSource={history}
                    rowKey={(record, index) => `${record.createdAt}-${index}`}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng ${total} lần thay đổi`,
                    }}
                    size="small"
                />
            ) : (
                <Alert message="Không có lịch sử thay đổi" type="info" showIcon />
            )}
        </Modal>
    );
};

export default ProductHistoryModal;
