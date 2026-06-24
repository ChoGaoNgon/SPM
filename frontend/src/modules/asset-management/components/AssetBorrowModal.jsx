import { Alert, Button, DatePicker, Empty, Form, Input, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import assetService from '~/modules/asset/service/AssetService';
import authService from '~/modules/auth/services/authService';
import assetBorrowService from '~/services/assetBorrowService';

const AssetBorrowModal = ({ open, isEdit, borrow, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const [assetOptions, setAssetOptions] = useState([]);
    const [loadingAssets, setLoadingAssets] = useState(false);
    const [noAvailableAssets, setNoAvailableAssets] = useState(false);

    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        setCurrentUserId(authService.getEmployeeId());
    }, []);

    useEffect(() => {
        if (open) {
            fetchAssets();
        }
    }, [open]);

    const fetchAssets = async () => {
        setLoadingAssets(true);
        try {
            const data = await assetService.getAllAssets({
                page: 0,
                size: 1000,
                isAvailable: true,
            });

            const list = data.content || [];

            const options = list.map((asset) => ({
                label: `${asset.code} - ${asset.name}`,
                value: asset.id,
            }));

            setAssetOptions(options);

            setNoAvailableAssets(list.length === 0);
        } catch (error) {
            setAssetOptions([]);
            setNoAvailableAssets(true);
        } finally {
            setLoadingAssets(false);
        }
    };

    useEffect(() => {
        if (!open) {
            form.resetFields();
        } else if (isEdit && borrow) {
            form.setFieldsValue({
                assetId: borrow.assetId,
                borrowAt: borrow.borrowAt ? dayjs(borrow.borrowAt) : null,
                expectedReturnAt: borrow.expectedReturnAt ? dayjs(borrow.expectedReturnAt) : null,
                purpose: borrow.purpose,
                remark: borrow.remark,
            });
        } else if (!isEdit && currentUserId) {
            form.setFieldsValue({
                requestedById: currentUserId,
            });
        }
    }, [open, form, isEdit, borrow, currentUserId]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const payload = {
                assetId: Number(values.assetId),
                requestedById: currentUserId,
                borrowAt: values.borrowAt.format('YYYY-MM-DDTHH:mm:ss'),
                expectedReturnAt: values.expectedReturnAt.format('YYYY-MM-DDTHH:mm:ss'),
                purpose: values.purpose,
                remark: values.remark,
            };

            setLoading(true);

            if (isEdit && borrow?.id) {
                await assetBorrowService.updateAssetBorrow(borrow.id, payload);
            } else {
                await assetBorrowService.createAssetBorrow(values.assetId, payload);
            }

            onSuccess?.();
            onCancel();
        } catch (error) {
            if (error?.errorFields) return;
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={isEdit ? 'Cập nhật đơn mượn' : 'Tạo đơn mượn'}
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button
                    key="ok"
                    type="primary"
                    loading={loading}
                    onClick={handleSubmit}
                    disabled={!isEdit && noAvailableAssets}
                >
                    {isEdit ? 'Cập nhật' : 'Tạo'}
                </Button>,
            ]}
            destroyOnHidden
        >
            {!isEdit && noAvailableAssets && (
                <Alert
                    type="warning"
                    showIcon
                    message="Không có tài sản sẵn sàng để mượn"
                    description="Hiện tại tất cả tài sản đều đang được sử dụng hoặc không khả dụng."
                    style={{ marginBottom: 12 }}
                />
            )}

            <Form form={form} layout="vertical" requiredMark="required">
                <Form.Item name="assetId" label="Tài sản" rules={[{ required: true, message: 'Chọn tài sản' }]}>
                    <Select
                        showSearch
                        placeholder={noAvailableAssets ? 'Không có tài sản khả dụng' : 'Chọn tài sản'}
                        options={assetOptions}
                        loading={loadingAssets}
                        disabled={isEdit || noAvailableAssets}
                        notFoundContent={loadingAssets ? null : <Empty description="Không có tài sản khả dụng" />}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Form.Item>

                <Form.Item name="borrowAt" label="Ngày mượn" rules={[{ required: true, message: 'Chọn ngày mượn' }]}>
                    <DatePicker className="w-full" showTime format="DD/MM/YYYY HH:mm" />
                </Form.Item>

                <Form.Item
                    name="expectedReturnAt"
                    label="Ngày dự kiến trả"
                    rules={[{ required: true, message: 'Chọn ngày dự kiến trả' }]}
                >
                    <DatePicker className="w-full" showTime format="DD/MM/YYYY HH:mm" />
                </Form.Item>

                <Form.Item
                    name="purpose"
                    label="Mục đích mượn"
                    rules={[{ required: true, message: 'Nhập mục đích mượn' }]}
                >
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item name="remark" label="Ghi chú">
                    <Input.TextArea rows={2} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AssetBorrowModal;
