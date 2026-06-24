import { Button, Form, Input, Modal, Select, message } from 'antd';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import modelService from '../../services/modelService';

const { Option } = Select;

const ModelFormModal = ({ open, onCancel, editingModel, customers, onSuccess }) => {
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (editingModel) {
            form.setFieldsValue({
                code: editingModel.code,
                name: editingModel.name,
                customerId: Number(editingModel.customerId),
                orderedDate: editingModel.orderedDate ? editingModel.orderedDate.split('T')[0] : '',
            });
        } else {
            form.resetFields();
        }
    }, [editingModel, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            if (editingModel) {
                await modelService.updateModel(editingModel.id, values);
                message.success('Cập nhật model thành công');
            } else {
                await modelService.createModel(values);
                message.success('Thêm mới model thành công');
            }

            form.resetFields();
            onCancel();
            onSuccess?.();
        } catch (error) {
            const errorMessage = error?.message || error?.response?.data?.message || 'Có lỗi xảy ra khi lưu model';
            message.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        onCancel();
    };

    return (
        <Modal
            title={editingModel ? 'Cập nhật Model' : 'Thêm mới Model'}
            open={open}
            onCancel={handleCancel}
            onOk={handleSave}
            okText="Lưu"
            cancelText="Hủy"
            confirmLoading={saving}
            destroyOnHidden={false}
            footer={[
                <Button
                    key="cancel"
                    onClick={() => {
                        form.resetFields();
                        onCancel();
                    }}
                >
                    Hủy
                </Button>,
                <Button key="ok" type="primary" loading={saving} onClick={handleSave}>
                    Lưu
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={handleSave}>
                <Form.Item
                    label="Mã Model"
                    name="code"
                    rules={[{ required: true, message: 'Vui lòng nhập mã model!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Khách hàng"
                    name="customerId"
                    rules={[{ required: true, message: 'Vui lòng chọn khách hàng!' }]}
                >
                    <Select placeholder="Chọn khách hàng" showSearch optionFilterProp="children">
                        {customers.map((customer) => (
                            <Option key={customer.id} value={customer.id}>
                                {customer.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item label="Ngày nhận đặt hàng" name="orderedDate">
                    <Input type="date" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

ModelFormModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    editingModel: PropTypes.object,
    customers: PropTypes.array.isRequired,
};

export default ModelFormModal;
