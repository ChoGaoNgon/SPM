import React from 'react';
import { Modal, Form, Input, Select, Switch } from 'antd';

const MailModal = ({ open, editingRecord, form, departments, onCancel, onSubmit }) => {
    return (
        <Modal
            open={open}
            title={editingRecord ? 'Chỉnh sửa địa chỉ mail' : 'Thêm địa chỉ mail'}
            onCancel={onCancel}
            onOk={onSubmit}
            okText={editingRecord ? 'Cập nhật' : 'Thêm'}
            cancelText="Hủy"
            destroyOnClose
            className="[&_.ant-modal-content]:!rounded-lg [&_.ant-modal-header]:!border-b-gray-100 [&_.ant-modal-header]:!pb-4"
            width={500}
        >
            <Form form={form} layout="vertical" className="pt-4">
                <Form.Item
                    name="email"
                    label={<span className="text-sm font-medium text-gray-700">Email</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập email' }]}
                >
                    <Input placeholder="example@company.com" className="!h-10 !rounded-md !border-gray-300" />
                </Form.Item>

                <Form.Item
                    name="displayName"
                    label={<span className="text-sm font-medium text-gray-700">Tên hiển thị</span>}
                >
                    <Input placeholder="Tên người nhận" className="!h-10 !rounded-md !border-gray-300" />
                </Form.Item>

                <Form.Item
                    name="departmentId"
                    label={<span className="text-sm font-medium text-gray-700">Phòng ban</span>}
                >
                    <Select
                        allowClear
                        showSearch
                        placeholder="Chọn phòng ban"
                        className="[&_.ant-select-selector]:!rounded-md [&_.ant-select-selector]:!border-gray-300"
                    >
                        {departments.map((d) => (
                            <Select.Option key={d.id} value={d.id}>
                                {d.displayName || d.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="active"
                    label={<span className="text-sm font-medium text-gray-700">Hoạt động</span>}
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
                <div className="flex items-center gap-2 -mt-2 mb-4">
                    <span className="text-sm text-gray-500">Kích hoạt để dùng địa chỉ mail này</span>
                </div>
            </Form>
        </Modal>
    );
};

export default MailModal;
