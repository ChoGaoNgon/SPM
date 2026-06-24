import { Form, Input, message, Modal, Select } from 'antd';
import { useEffect, useState } from 'react';
import authService from '~/modules/auth/services/authService';
import { HtmpResult } from '~/utils/selectOptions';
import faDeliveryService from '../../services/productDelivery';

const { TextArea } = Input;

const ApproveConditionFileModal = ({ open, onCancel, deliveryId, onSuccess }) => {
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            const currentUser = authService.getEmployeeCode();
            form.setFieldsValue({
                conditionFileApprovedBy: currentUser,
            });
        } else {
            form.resetFields();
        }
    }, [open, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            const res = await faDeliveryService.approveConditionFile(deliveryId, values);

            message.success(res?.message || 'Duyệt file thành công');
            onCancel();
            form.resetFields();
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
            onOk={handleSave}
            okText="Lưu"
            cancelText="Hủy"
            title="Duyệt file điều kiện đúc"
            confirmLoading={saving}
        >
            <Form form={form} layout="vertical" name="approveConditionFileForm" autoComplete="off">
                <Form.Item
                    name="conditionFileApprovalResult"
                    label="Trạng thái duyệt"
                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                >
                    <Select placeholder="Chọn trạng thái" options={HtmpResult} />
                </Form.Item>

                <Form.Item
                    name="conditionFileApprovedBy"
                    label="Người duyệt"
                    rules={[{ required: true, message: 'Vui lòng nhập người duyệt!' }]}
                >
                    <Input placeholder="Mã nhân viên" readOnly style={{ backgroundColor: '#f5f5f5' }} />
                </Form.Item>

                <Form.Item name="conditionFileApprovalNote" label="Ghi chú">
                    <TextArea rows={4} placeholder="Nhập ghi chú về việc duyệt file..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ApproveConditionFileModal;
