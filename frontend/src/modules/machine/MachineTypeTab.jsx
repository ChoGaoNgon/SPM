import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Popconfirm, Space, Table, Tooltip } from 'antd';
import React, { useMemo, useState } from 'react';
import machineTypeService from '~/modules/machine/service/machineTypeService';

const MachineTypeTab = ({ machineTypes = [], loadingTypes = false, onRefreshMachineTypes }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();

    const dataSource = useMemo(() => machineTypes || [], [machineTypes]);

    const handleOpenModal = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingItem(record);
        form.setFieldsValue({
            name: record.name,
            code: record.code,
            description: record.description,
        });
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            const payload = {
                name: values.name?.trim(),
                code: values.code?.trim(),
                description: values.description?.trim(),
            };

            if (editingItem) {
                await machineTypeService.updateMachineType(editingItem.id, payload);
                message.success('Cập nhật loại máy thành công');
            } else {
                await machineTypeService.createMachineType(payload);
                message.success('Tạo loại máy thành công');
            }

            handleCancel();
            onRefreshMachineTypes?.();
        } catch (error) {
            if (error?.errorFields) {
                return;
            }
            message.error(error.message || `Không thể ${editingItem ? 'cập nhật' : 'tạo'} loại máy`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (record) => {
        try {
            setDeletingId(record.id);
            await machineTypeService.deleteMachineType(record.id);
            message.success('Xóa loại máy thành công');
            onRefreshMachineTypes?.();
        } catch (error) {
            message.error(error.message || 'Không thể xóa loại máy');
        } finally {
            setDeletingId(null);
        }
    };

    const columns = [
        {
            title: 'STT',
            width: 70,
            align: 'center',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Tên loại máy',
            dataIndex: 'name',
            key: 'name',
            width: '25%',
        },
        {
            title: 'Mã loại máy',
            dataIndex: 'code',
            key: 'code',
            width: '20%',
            render: (text) => text || '—',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: '35%',
            ellipsis: true,
            render: (text) => text || '—',
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: '20%',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa loại máy"
                        description={`Bạn có chắc muốn xóa loại máy ${record.name}?`}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true, loading: deletingId === record.id }}
                        onConfirm={() => handleDelete(record)}
                    >
                        <Tooltip title="Xóa">
                            <Button danger type="text" icon={<DeleteOutlined />} loading={deletingId === record.id} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div className="text-sm text-slate-500">Danh sách loại máy</div>
                    <div className="text-lg font-semibold text-slate-800 dark:text-white">Quản lý phân loại máy</div>
                </div>
                <Button icon={<PlusCircleOutlined />} type="primary" onClick={handleOpenModal}>
                    Thêm loại máy
                </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                <Table
                    rowKey={(record) => record.id || record.code}
                    loading={loadingTypes}
                    columns={columns}
                    dataSource={dataSource}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    locale={{ emptyText: 'Chưa có loại máy' }}
                />
            </div>

            <Modal
                title={editingItem ? 'Chỉnh sửa loại máy' : 'Thêm loại máy'}
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={handleSubmit}
                okText="Lưu"
                cancelText="Hủy"
                confirmLoading={submitting}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" preserve={false}>
                    <Form.Item
                        name="name"
                        label="Tên loại máy"
                        rules={[{ required: true, message: 'Nhập tên loại máy' }]}
                    >
                        <Input placeholder="Máy ép nhựa" maxLength={255} />
                    </Form.Item>
                    <Form.Item
                        name="code"
                        label="Mã loại máy"
                        rules={[{ required: true, message: 'Nhập mã loại máy' }]}
                    >
                        <Input placeholder="MAY_EP_NHUA" maxLength={100} />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={3} placeholder="Mô tả ngắn..." maxLength={500} showCount />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MachineTypeTab;
