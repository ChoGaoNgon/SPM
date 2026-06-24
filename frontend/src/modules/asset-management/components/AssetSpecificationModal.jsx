import { Form, Input, message, Modal } from 'antd';
import { useEffect } from 'react';
import { getDisplayFields } from '~/modules/asset-management/config/specificationFieldsConfig';
import assetSpecificationService from '~/modules/asset/service/AssetSpecificationService';

const AssetSpecificationModal = ({ open, assetId, specification, assetTypeName, onClose, onSuccess }) => {
    const [form] = Form.useForm();

    const displayFields = getDisplayFields(assetTypeName);

    const fieldInfoMap = {
        ram: { label: 'RAM', placeholder: 'VD: 16GB DDR4' },
        rom: { label: 'ROM / Ổ cứng', placeholder: 'VD: 512GB SSD' },
        cpu: { label: 'CPU / Bộ xử lý', placeholder: 'VD: Intel Core i7-11800H' },
        manufacture: { label: 'Hãng sản xuất', placeholder: 'VD: Dell, HP, Lenovo...' },
        model: { label: 'Model', placeholder: 'VD: Dell Latitude 5520' },
        dimension: { label: 'Kích thước', placeholder: 'VD: 35.7 x 24.2 x 1.8 cm' },
        weight: { label: 'Cân nặng', placeholder: 'VD: 2.1 kg' },
        color: { label: 'Màu sắc', placeholder: 'VD: Đen, Xám, Bạc...' },
        material: { label: 'Chất liệu', placeholder: 'VD: Nhôm nguyên khối, Nhựa ABS...' },
        ipAddress: { label: 'Địa chỉ IP', placeholder: 'VD: 192.168.1.100' },
    };

    useEffect(() => {
        if (open) {
            if (specification) {
                form.setFieldsValue(specification);
            } else {
                form.resetFields();
            }
        }
    }, [open, specification, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            if (specification) {
                await assetSpecificationService.updateAssetSpecificationByAssetId(assetId, values);
                message.success('Cập nhật thông số kỹ thuật thành công');
            } else {
                await assetSpecificationService.createAssetSpecification(assetId, values);
                message.success('Thêm thông số kỹ thuật thành công');
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
            title={specification ? 'Chỉnh sửa thông số kỹ thuật' : 'Thêm thông số kỹ thuật'}
            open={open}
            onOk={handleSave}
            onCancel={handleCancel}
            okText="Lưu"
            cancelText="Hủy"
            width={900}
            destroyOnClose
        >
            <Form form={form} layout="vertical" preserve={false}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    {displayFields.map((field) => {
                        const fieldInfo = fieldInfoMap[field.key];
                        if (!fieldInfo) return null;

                        return (
                            <Form.Item
                                key={field.key}
                                name={field.key}
                                label={fieldInfo.label}
                                className={field.span === 2 ? 'md:col-span-2' : ''}
                            >
                                <Input placeholder={fieldInfo.placeholder} />
                            </Form.Item>
                        );
                    })}
                </div>

                <Form.Item name="note" label="Ghi chú">
                    <Input.TextArea rows={2} placeholder="Ghi chú thêm về thông số kỹ thuật..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AssetSpecificationModal;
