import { HistoryOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useState } from 'react';
import ProductHistoryModal from './ProductHistoryModal';

const ProductFieldHistoryBadge = ({ productId, fieldName, count, fieldLabel }) => {
    const [showModal, setShowModal] = useState(false);

    if (!count || count === 0) {
        return null;
    }

    return (
        <>
            <Tooltip title={`Đã chỉnh sửa ${count} lần - Click để xem chi tiết`}>
                <span
                    onClick={() => setShowModal(true)}
                    style={{
                        marginLeft: 8,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px',
                        borderRadius: 10,
                        backgroundColor: '#f0f5ff',
                        border: '1px solid #d6e4ff',
                        fontSize: 12,
                        color: '#1890ff',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e6f7ff';
                        e.currentTarget.style.borderColor = '#91d5ff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f5ff';
                        e.currentTarget.style.borderColor = '#d6e4ff';
                    }}
                >
                    <HistoryOutlined style={{ fontSize: 12 }} />
                    <span>{count}</span>
                </span>
            </Tooltip>

            <ProductHistoryModal
                open={showModal}
                onCancel={() => setShowModal(false)}
                productId={productId}
                fieldName={fieldName}
                fieldLabel={fieldLabel}
            />
        </>
    );
};

export default ProductFieldHistoryBadge;
