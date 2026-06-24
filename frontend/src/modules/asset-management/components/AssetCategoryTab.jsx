import { EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Space, Table } from 'antd';
import { useMemo, useState } from 'react';
import assetTypeService from '~/modules/asset/service/AssetTypeService';

const AssetCategoryTab = ({ assetTypes = [], loadingTypes = false, onRefreshAssetTypes }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();

    const columns = [
        {
            title: 'STT',
            width: '5%',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Tên loại tài sản',
            dataIndex: 'name',
            width: '25%',
            key: 'name',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            width: '40%',
            render: (text) => text || '—',
        },
        {
            title: 'Số lượng tài sản',
            dataIndex: 'assetCount',
            key: 'assetCount',
            width: '15%',
            align: 'center',
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: '20%',
            render: (_, record) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        Chỉnh sửa
                    </Button>
                </Space>
            ),
        },
    ];

    const dataSource = useMemo(() => assetTypes || [], [assetTypes]);

    const handleOpenModal = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingItem(record);
        form.setFieldsValue({
            name: record.name,
            description: record.description,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                name: values.name,
                description: values.description,
            };

            if (editingItem) {
                await assetTypeService.updateAssetType(editingItem.id, payload);
                message.success('Đã cập nhật loại tài sản');
            } else {
                await assetTypeService.createAssetType(payload);
                message.success('Đã thêm loại tài sản');
            }

            setIsModalOpen(false);
            form.resetFields();
            setEditingItem(null);
            onRefreshAssetTypes?.();
        } catch (error) {
            if (error?.errorFields) return;
            message.error(error.message || `Không thể ${editingItem ? 'cập nhật' : 'thêm'} loại tài sản`);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        setEditingItem(null);
    };

    return (
        <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div className="text-sm text-slate-500">Danh sách loại tài sản</div>
                    <div className="text-lg font-semibold text-slate-800 dark:text-white">Quản lý phân loại</div>
                </div>
                <Button icon={<PlusCircleOutlined />} type="primary" onClick={handleOpenModal}>
                    Thêm loại tài sản
                </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                <Table
                    rowKey={(record) => record.id || record.code}
                    loading={loadingTypes}
                    columns={columns}
                    dataSource={dataSource}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    locale={{ emptyText: 'Chưa có loại tài sản' }}
                />
            </div>

            <Modal
                title={editingItem ? 'Chỉnh sửa loại tài sản' : 'Thêm loại tài sản'}
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={handleSubmit}
                okText="Lưu"
                cancelText="Hủy"
                destroyOnHidden
            >
                <Form form={form} layout="vertical" preserve={false}>
                    <Form.Item name="name" label="Tên loại" rules={[{ required: true, message: 'Nhập tên loại' }]}>
                        <Input placeholder="Thiết bị CNTT" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={3} placeholder="Mô tả ngắn..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AssetCategoryTab;
