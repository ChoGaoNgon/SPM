import { ClockCircleOutlined } from '@ant-design/icons';
import { Alert, Modal, Spin, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import productService from '../services/productService';

const { Text } = Typography;

const ProductMaterialHistoryModal = ({ open, onCancel, productId, historySummary }) => {
    const [loading, setLoading] = useState(false);
    const [allHistory, setAllHistory] = useState([]);

    useEffect(() => {
        if (open && productId && historySummary) {
            fetchAllMaterialHistory();
        }
    }, [open, productId, historySummary]);

    const fetchAllMaterialHistory = async () => {
        setLoading(true);
        try {
            const materialFields = historySummary.filter((item) => item.fieldName.startsWith('materials.'));

            const promises = materialFields.map((field) =>
                productService.getProductHistory(productId, field.fieldName),
            );

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
        const match = fieldName.match(/materials\.(\d+)\.(\w+)$/);
        if (match) {
            return { materialIndex: match[1], field: match[2] };
        }
        return null;
    };

    const getFieldLabel = (fieldName) => {
        const fieldLabels = {
            matCode: 'Mã NVL',
            matName: 'Tên NVL',
            matColorCode: 'Mã màu',
            matColorName: 'Tên màu',
            matMaker: 'Nhà sản xuất',
            unitUsage: 'Định mức',
            unit: 'Đơn vị',
            isQuotation: 'Loại (Báo giá/Khách gửi)',
            remark: 'Ghi chú',
            removed: 'Xóa NVL',
            added: 'Thêm NVL',
        };
        return fieldLabels[fieldName] || fieldName;
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
            title: 'NVL #',
            dataIndex: 'fieldName',
            key: 'materialIndex',
            width: 80,
            render: (fieldName) => {
                const parsed = parseFieldName(fieldName);
                return parsed ? (
                    <Tag color="geekblue" style={{ fontSize: 12 }}>
                        #{parsed.materialIndex}
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
            width: 150,
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

    const totalChanges = historySummary?.filter((item) => item.fieldName.startsWith('materials.')).length || 0;

    return (
        <Modal
            title={
                <span>
                    <ClockCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    Lịch sử thay đổi Nguyên vật liệu ({totalChanges} trường)
                </span>
            }
            open={open}
            onCancel={onCancel}
            footer={null}
            width={1000}
            destroyOnClose
        >
            {loading ? (
                <Spin tip="Đang tải lịch sử...">
                    <Alert message="Đang tải dữ liệu" type="info" />
                </Spin>
            ) : (
                <Table
                    dataSource={allHistory}
                    columns={columns}
                    rowKey={(record, index) => `${record.fieldName}-${record.createdAt}-${index}`}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} thay đổi`,
                    }}
                    size="small"
                    bordered
                    locale={{ emptyText: 'Chưa có lịch sử thay đổi' }}
                    scroll={{ x: 900 }}
                />
            )}
        </Modal>
    );
};

export default ProductMaterialHistoryModal;
