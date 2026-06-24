import { Form, Input, Modal, Radio, message } from 'antd';
import React, { useEffect, useState } from 'react';
import productService from '../../services/productService';

const NmdInfoStatusModal = ({ open, product, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);
    const action = Form.useWatch('action', form);
    const isReturned = action === 'RETURNED';

    useEffect(() => {
        if (!open) {
            return;
        }

        form.setFieldsValue({
            action: product?.nmdInfoStatus === 'RETURNED' ? 'RETURNED' : 'RECEIVED',
            remark: '',
        });
    }, [open, product, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            await productService.updateNmdInfoStatus(product.id, {
                status: values.action,
                remark: values.remark,
            });

            message.success(values.action === 'RECEIVED' ? 'Đã xác nhận nhận thông tin từ NMD' : 'Đã trả lại yêu cầu');
            onSuccess?.();
            onCancel?.();
        } catch (error) {
            message.error(error?.message || 'Không thể cập nhật trạng thái NMD');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            open={open}
            title="Cập nhật trạng thái thông tin NMD"
            onCancel={onCancel}
            onOk={handleSubmit}
            okText={isReturned ? 'Trả lại yêu cầu' : 'Xác nhận đã nhận'}
            cancelText="Hủy"
            confirmLoading={saving}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="action"
                    label="Thao tác"
                    rules={[{ required: true, message: 'Vui lòng chọn thao tác' }]}
                >
                    <Radio.Group>
                        <Radio value="RECEIVED">Xác nhận đã nhận thông tin</Radio>
                        <Radio value="RETURNED">Trả lại yêu cầu bổ sung</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item
                    name="remark"
                    label="Ghi chú NMD"
                    rules={isReturned ? [{ required: true, message: 'Vui lòng nhập remark khi trả lại yêu cầu' }] : []}
                >
                    <Input.TextArea rows={4} placeholder="Nhập ghi chú cho xác nhận hoặc trả lại" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default NmdInfoStatusModal;
