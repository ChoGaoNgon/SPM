import { Button, Form, Input, message, Modal, Select, Upload } from 'antd';
import { useEffect, useState } from 'react';

import { BulbOutlined, UploadOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { useFileManager } from '~/hook/useFileManager';
import authService from '~/modules/auth/services/authService';
import systemFeedbackService from '../services/systemFeedbackService';
import { getSystemFeedbackPriorityMeta, systemFeedbackType, systemModules } from '../SystemFeedbackUtils';

const statusOptions = [
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'IN_PROGRESS', label: 'Đang xử lý' },
    { value: 'DONE', label: 'Hoàn thành' },
    { value: 'REJECTED', label: 'Từ chối' },
];

const priorityOptions = ['LOW', 'MEDIUM', 'HIGH'].map((value) => ({
    value,
    label: getSystemFeedbackPriorityMeta(value).label,
}));

const SystemFeedbackModal = ({ open, onCancel, initialValues, onSuccess }) => {
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);
    const [isCreator, setIsCreator] = useState(true);
    const [isAssignee, setIsAssignee] = useState(false);

    const { fileList, setInitialFiles, onChange, keptOldFiles, newFiles, deletedOldFiles } = useFileManager();

    const currentEmployeeCode = authService.getEmployeeCode();
    const isAdmin = authService.hasRole('SUPERADMIN');
    const canEditCoreFields = isCreator || isAdmin;
    const canEditProcessingFields = isAssignee || isAdmin;

    useEffect(() => {
        if (open && initialValues) {
            const fileList = initialValues.files
                ? initialValues.files.map((file, index) => {
                      const pathParts = file.filePath ? file.filePath.split('/') : ['Unknown file'];
                      const fileName = pathParts[pathParts.length - 1];

                      return {
                          uid: file.id ? String(file.id) : `-${index}`,
                          name: fileName,
                          status: 'done',

                          url: `${process.env.REACT_APP_UPLOAD_URL}/${file.filePath}`,

                          ...file,
                      };
                  })
                : [];

            const values = {
                ...initialValues,
                attachments: fileList,
            };

            form.setFieldsValue(values);

            const isOwner = initialValues.createdByEmployeeCode === currentEmployeeCode;
            setIsCreator(isOwner);

            const isAssigned = initialValues.assignToEmployeeCode === currentEmployeeCode;
            setIsAssignee(isAssigned);
        } else {
            form.resetFields();
            setIsCreator(true);
            setIsAssignee(false);
        }
    }, [open, initialValues, form, currentEmployeeCode]);

    const canEdit = isCreator || isAssignee || isAdmin;

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            const formData = new FormData();

            const formatted = {
                ...values,
                remark: values.remark || '',
            };
            delete formatted.attachments;

            formData.append('data', new Blob([JSON.stringify(formatted)], { type: 'application/json' }));

            newFiles.forEach((file) => {
                formData.append('uploadFiles', file);
            });

            formData.append('keptOldFiles', JSON.stringify(keptOldFiles));
            formData.append('deletedOldFiles', JSON.stringify(deletedOldFiles));

            const res = initialValues
                ? await systemFeedbackService.updateSystemFeedback(initialValues.id, formData)
                : await systemFeedbackService.createSystemFeedback(formData);

            message.success(res?.message || 'Lưu thành công');

            onCancel();
            form.resetFields();

            onSuccess?.();
        } catch (err) {
            if (err?.errorFields) {
                return;
            }

            message.error(err?.message || 'Lưu góp ý thất bại');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            onOk={isCreator || isAssignee || authService.hasRole('SUPERADMIN') ? handleSave : undefined}
            okText="Lưu"
            cancelText={canEdit ? 'Hủy' : 'Đóng'}
            title={
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-gradient-to-r from-accent-500 to-accent-600 p-1.5 sm:p-2 rounded-lg">
                        <BulbOutlined className="text-white text-base sm:text-xl" />
                    </div>
                    <span className="text-base sm:text-xl font-semibold text-slate-800">
                        {initialValues ? 'Chỉnh sửa ý kiến đóng góp' : 'Thêm ý kiến đóng góp'}
                    </span>
                </div>
            }
            confirmLoading={saving}
            width="90%"
            style={{ maxWidth: 900, top: 20 }}
            bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
            okButtonProps={{
                className: 'bg-accent-600 hover:bg-accent-700',
                style: { display: canEdit ? 'inline-block' : 'none' },
            }}
            centered={false}
        >
            <Form form={form} layout="vertical" className="mt-2 sm:mt-3">
                {!isCreator && !isAssignee && !authService.hasRole('SUPERADMIN') && (
                    <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <span className="text-xs sm:text-sm text-yellow-800">⚠️ Bạn chỉ có thể xem góp ý này.</span>
                    </div>
                )}
                {isAssignee && !isCreator && !authService.hasRole('SUPERADMIN') && (
                    <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="text-xs sm:text-sm text-blue-800">
                            ℹ️ Bạn có thể nhập phản hồi và cập nhật trạng thái.
                        </span>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Form.Item
                        name="title"
                        label={<span className="font-semibold text-slate-700 text-xs sm:text-sm">Tiêu đề</span>}
                        rules={[{ required: canEditCoreFields, message: 'Vui lòng điền tiêu đề' }]}
                        className="mb-3"
                    >
                        <Input
                            placeholder="Nhập tiêu đề góp ý"
                            className="rounded-lg"
                            disabled={!canEditCoreFields}
                            size="middle"
                        />
                    </Form.Item>
                    <Form.Item
                        name="module"
                        label={<span className="font-semibold text-slate-700 text-xs sm:text-sm">Chức năng</span>}
                        rules={[{ required: canEditCoreFields, message: 'Vui lòng chọn chức năng' }]}
                        className="mb-3"
                    >
                        <Select
                            allowClear
                            showSearch
                            options={systemModules}
                            placeholder="Chọn chức năng"
                            className="rounded-lg"
                            disabled={!canEditCoreFields}
                            size="middle"
                        />
                    </Form.Item>
                    <Form.Item
                        name="requestType"
                        label={<span className="font-semibold text-slate-700 text-xs sm:text-sm">Loại góp ý</span>}
                        rules={[{ required: canEditCoreFields, message: 'Vui lòng chọn loại góp ý' }]}
                        className="mb-3"
                    >
                        <Select
                            allowClear
                            showSearch
                            options={systemFeedbackType}
                            placeholder="Chọn loại góp ý"
                            className="rounded-lg"
                            disabled={!canEditCoreFields}
                            size="middle"
                        />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                    <Form.Item
                        name="impactScope"
                        label={
                            <span className="font-semibold text-slate-700 text-xs sm:text-sm">Phạm vi ảnh hưởng</span>
                        }
                        className="mb-3"
                    >
                        <Input
                            placeholder="Ví dụ: toàn bộ module đơn hàng"
                            className="rounded-lg"
                            disabled={!canEditCoreFields}
                            size="middle"
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    name="content"
                    label={<span className="font-semibold text-slate-700 text-xs sm:text-sm">Mô tả ý kiến</span>}
                    rules={[{ required: canEditCoreFields, message: 'Vui lòng mô tả chi tiết ý kiến' }]}
                    className="mb-3"
                >
                    <TextArea
                        rows={3}
                        placeholder="Mô tả chi tiết ý kiến đóng góp của bạn"
                        className="rounded-lg"
                        disabled={!canEditCoreFields}
                    />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Form.Item
                        name="primaryObjective"
                        label={<span className="font-semibold text-slate-700 text-xs sm:text-sm">Mục tiêu chính</span>}
                        className="mb-3"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Nêu mục tiêu chính của góp ý hoặc yêu cầu"
                            className="rounded-lg"
                            disabled={!canEditCoreFields}
                        />
                    </Form.Item>

                    <Form.Item
                        name="expectedOutcome"
                        label={
                            <span className="font-semibold text-slate-700 text-xs sm:text-sm">Kết quả mong đợi</span>
                        }
                        className="mb-3"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Kết quả mong đợi sau khi xử lý"
                            className="rounded-lg"
                            disabled={!canEditCoreFields}
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    name="remark"
                    label={<span className="font-semibold text-slate-700 text-xs sm:text-sm">Ghi chú</span>}
                    className="mb-3"
                >
                    <TextArea
                        rows={2}
                        placeholder="Bổ sung ghi chú nếu cần"
                        className="rounded-lg"
                        disabled={!canEditCoreFields && !canEditProcessingFields}
                    />
                </Form.Item>

                {isCreator && !isAssignee && initialValues && initialValues.response && (
                    <Form.Item
                        name="response"
                        label={<span className="font-semibold text-slate-700 text-xs sm:text-sm">Phản hồi từ IT</span>}
                        className="mb-3"
                    >
                        <TextArea rows={3} className="rounded-lg bg-gray-50" disabled />
                    </Form.Item>
                )}

                {(isAssignee || isAdmin) && initialValues && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Form.Item
                            name="priority"
                            label={<span className="font-semibold text-slate-700 text-xs sm:text-sm">Ưu tiên</span>}
                            className="mb-3"
                        >
                            <Select
                                placeholder="Chọn mức ưu tiên"
                                className="rounded-lg"
                                size="middle"
                                disabled={!canEditProcessingFields}
                                options={priorityOptions}
                            />
                        </Form.Item>

                        <Form.Item
                            name="response"
                            label={
                                <span className="font-semibold text-slate-700 text-xs sm:text-sm">Phản hồi xử lý</span>
                            }
                            className="mb-3 md:col-span-2"
                        >
                            <TextArea
                                rows={3}
                                placeholder="Nhập phản hồi về cách xử lý góp ý này..."
                                className="rounded-lg"
                                disabled={!canEditProcessingFields}
                            />
                        </Form.Item>

                        <Form.Item
                            name="status"
                            label={<span className="font-semibold text-slate-700 text-xs sm:text-sm">Trạng thái</span>}
                            className="mb-3"
                        >
                            <Select
                                placeholder="Chọn trạng thái"
                                className="rounded-lg"
                                size="middle"
                                disabled={!canEditProcessingFields}
                                options={statusOptions}
                            />
                        </Form.Item>
                    </div>
                )}

                <Form.Item
                    name="attachments"
                    label={<span className="font-semibold text-slate-700 text-xs sm:text-sm">File đính kèm</span>}
                    valuePropName="fileList"
                    getValueFromEvent={(e) => {
                        if (Array.isArray(e)) {
                            return e;
                        }
                        return e && e.fileList;
                    }}
                    rules={[
                        {
                            required: false,
                            message: 'Vui lòng tải lên file',
                        },
                    ]}
                    className="mb-0"
                >
                    <Upload
                        multiple
                        listType="picture"
                        fileList={fileList}
                        onChange={onChange}
                        beforeUpload={() => false}
                        accept=".png,.jpg,.jpeg,.gif,.bmp,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.mp4,.webm,.ogg"
                        onRemove={(file) => {
                            return isCreator || authService.hasRole('SUPERADMIN');
                        }}
                        disabled={!canEditCoreFields}
                        className="upload-list-compact"
                    >
                        {canEditCoreFields && (
                            <Button icon={<UploadOutlined />} size="small" className="text-xs">
                                Tải file lên
                            </Button>
                        )}
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SystemFeedbackModal;
