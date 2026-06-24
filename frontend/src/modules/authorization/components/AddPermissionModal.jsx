import React from 'react';
import { Modal, Form, Input } from 'antd';

export default function AddPermissionModal({
    open,
    onCancel,
    onSubmit,
    form,
    title = 'Thêm quyền mới',
    okText = 'Lưu',
    codeDisabled = false,
}) {
    return (
        <Modal title={title} open={open} onCancel={onCancel} onOk={onSubmit} okText={okText}>
            <Form layout="vertical" form={form}>
                <Form.Item label="Mã quyền" name="code" rules={[{ required: true }]}>
                    <Input disabled={codeDisabled} />
                </Form.Item>
                <Form.Item label="Mô tả" name="description" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
}
