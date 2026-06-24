import { message, Modal } from 'antd';
import React, { useState } from 'react';
import mpCheckListService from '../../services/mpCheckListService';

const MpHandoverFormModal = ({ open, onCancel, productId, productCode, onSuccess }) => {
    const [saving, setSaving] = useState(false);

    const handleCreate = async () => {
        try {
            setSaving(true);
            await mpCheckListService.createMpCheckList(productId);
            message.success('Tạo danh sách kiểm tra MP thành công');
            onCancel();
            onSuccess?.();
        } catch (error) {
            message.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            onOk={handleCreate}
            okText="Tạo"
            cancelText="Hủy"
            title={`Tạo danh sách kiểm tra MP cho ${productCode}`}
            confirmLoading={saving}
            width={500}
        >
            <p style={{ fontSize: '14px', color: '#666' }}>
                Bạn có chắc chắn muốn tạo danh sách kiểm tra MP cho sản phẩm <strong>{productCode}</strong>?
            </p>
            <p style={{ fontSize: '13px', color: '#999', marginTop: '12px' }}>
                Danh sách kiểm tra sẽ được tạo tự động dựa trên các hạng mục kiểm tra tiêu chuẩn.
            </p>
        </Modal>
    );
};

export default MpHandoverFormModal;
