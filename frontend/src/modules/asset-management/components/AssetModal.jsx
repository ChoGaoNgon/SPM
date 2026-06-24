import { DatePicker, Form, Input, message, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import DepartmentSelect from '~/components/select/DepartmentSelect';
import assetService from '~/modules/asset/service/AssetService';
import { renderAssetAssignmentStatusTag } from '~/utils/renderTag';

const AssetModal = ({ open, asset, assetTypes, loadingTypes, onClose, onSuccess }) => {
    const [form] = Form.useForm();

    const assetStatusOptions = [
        { value: 'AVAILABLE', label: 'Có sẵn' },
        { value: 'IN_USE', label: 'Đang sử dụng' },
        { value: 'MAINTENANCE', label: 'Đang bảo trì' },
        { value: 'BROKEN', label: 'Hỏng' },
        { value: 'LOST', label: 'Mất' },
    ];

    useEffect(() => {
        if (open) {
            if (asset?.id) {
                const values = {
                    code: asset.code,
                    name: asset.name,
                    model: asset.model,
                    purchaseDate: asset.purchaseDate ? dayjs(asset.purchaseDate) : null,
                    assetTypeId: asset.assetType.id,
                    departmentId: asset.departmentId,
                    description: asset.description,
                };
                form.setFieldsValue(values);
            } else {
                form.resetFields();
            }
        }
    }, [open, asset, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            const payload = {
                name: values.name,
                code: values.code,
                model: values.model,
                purchaseDate: values.purchaseDate?.format('YYYY-MM-DD'),
                description: values.description,
                assetTypeId: values.assetTypeId,
                departmentId: values.departmentId,
            };

            if (asset?.id) {
                await assetService.updateAsset(asset.id, payload);
                message.success('Cập nhật thành công');
            } else {
                await assetService.createAsset(payload);
                message.success('Thêm tài sản thành công');
            }

            form.resetFields();
            onSuccess?.();
            onClose();
        } catch (error) {
            if (error?.errorFields) return;
            message.error(error.message || 'Thao tác thất bại');
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title={asset?.id ? 'Chỉnh sửa tài sản' : 'Thêm tài sản mới'}
            open={open}
            onOk={handleSave}
            onCancel={handleCancel}
            okText="Lưu"
            cancelText="Hủy"
            width={1000}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" preserve={false}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <Form.Item name="code" label="Mã tài sản" rules={[{ required: true, message: 'Nhập mã tài sản' }]}>
                        <Input placeholder="VD: TS-001" />
                    </Form.Item>

                    <Form.Item
                        name="name"
                        label="Tên tài sản"
                        rules={[{ required: true, message: 'Nhập tên tài sản' }]}
                    >
                        <Input placeholder="Laptop Dell XPS 13" />
                    </Form.Item>

                    <Form.Item
                        name="assetTypeId"
                        label="Loại tài sản"
                        rules={[{ required: true, message: 'Chọn loại tài sản' }]}
                    >
                        <Select
                            loading={loadingTypes}
                            options={assetTypes.map((type) => ({
                                value: type.id,
                                label: type.name,
                            }))}
                            placeholder="Chọn loại tài sản"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>

                    <Form.Item name="model" label="Model">
                        <Input placeholder="VD: Dell XPS 13" />
                    </Form.Item>

                    <Form.Item
                        name="departmentId"
                        label="Phòng ban quản lý"
                        rules={[{ required: true, message: 'Chọn phòng ban' }]}
                    >
                        <DepartmentSelect allowClear placeholder="Chọn phòng ban" valueField="id" labelField="name" />
                    </Form.Item>

                    <Form.Item name="status" label="Tình trạng">
                        <Select placeholder="Chọn tình trạng">
                            {assetStatusOptions.map((option) => (
                                <Select.Option key={option.value} value={option.value}>
                                    {renderAssetAssignmentStatusTag(option.value)}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="purchaseDate" label="Ngày mua hàng">
                        <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày mua hàng" />
                    </Form.Item>
                </div>
                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea rows={2} placeholder="Ghi chú thêm..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AssetModal;
