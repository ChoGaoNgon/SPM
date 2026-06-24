import React, { useState } from 'react';
import { Modal, Form, Input, Switch, message } from 'antd';
import approveResultDepartmentService from '../../services/approveResultDepartmentService';

const ApproveResultDepartmentFormModal = ({ open, onClose, editingRecord, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            if (editingRecord) {
                await approveResultDepartmentService.updateApproveResultDepartment(editingRecord.id, values);
                message.success('Cập nhật phòng ban phê duyệt thành công');
            } else {
                await approveResultDepartmentService.createApproveResultDepartment(values);
                message.success('Thêm mới phòng ban phê duyệt thành công');
            }
            form.resetFields();
            onClose();
            onSuccess();
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    React.useEffect(() => {
        if (open) {
            if (editingRecord) {
                form.setFieldsValue({
                    departmentCode: editingRecord.departmentCode,
                    isActive: editingRecord.isActive,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, editingRecord, form]);

    return (
        <Modal
            title={editingRecord ? 'Chỉnh sửa phòng ban phê duyệt' : 'Thêm mới phòng ban phê duyệt'}
            open={open}
            onCancel={handleClose}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={600}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ isActive: true }}>
                <Form.Item
                    name="departmentCode"
                    label="Mã phòng ban"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mã phòng ban!' },
                        { max: 50, message: 'Mã phòng ban không được vượt quá 50 ký tự!' },
                    ]}
                >
                    <Input placeholder="Nhập mã phòng ban (VD: KT, QC, SX...)" />
                </Form.Item>

                <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                    <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ApproveResultDepartmentFormModal;
