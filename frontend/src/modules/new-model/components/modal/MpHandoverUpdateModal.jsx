import { UploadOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Select, Upload } from 'antd';
import { useEffect, useState } from 'react';
import authService from '~/modules/auth/services/authService';
import { HtmpResult } from '~/utils/selectOptions';
import mpCheckListService from '../../services/mpCheckListService';

const { TextArea } = Input;

const MpHandoverUpdateModal = ({ open, onCancel, editingItem, onSuccess }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [deletedFiles, setDeletedFiles] = useState([]);

    const currentEmployeeId = authService.getEmployeeId();
    const currentDepartmentCode = authService.getDepartmentCode();
    const isSuperAdmin = authService.getRole() === 'SUPERADMIN';

    const isResponsibility1 = editingItem?.responsibility1Code === currentDepartmentCode;
    const isResponsibility2 = editingItem?.responsibility2Code === currentDepartmentCode;

    useEffect(() => {
        if (open && editingItem) {
            const existingFiles = [];
            if (editingItem.filePath1) {
                existingFiles.push({
                    uid: '-1',
                    name: editingItem.filePath1.split('/').pop(),
                    status: 'done',
                    url: editingItem.filePath1,
                    existingFile: true,
                    filePath: editingItem.filePath1,
                });
            }
            if (editingItem.filePath2) {
                existingFiles.push({
                    uid: '-2',
                    name: editingItem.filePath2.split('/').pop(),
                    status: 'done',
                    url: editingItem.filePath2,
                    existingFile: true,
                    filePath: editingItem.filePath2,
                });
            }

            setFileList(existingFiles);
            setDeletedFiles([]);

            const formValues = {
                remark: editingItem.remark || '',
            };

            if (isSuperAdmin) {
                formValues.resultByResponsibility1 = editingItem.resultByResponsibility1 || undefined;
                formValues.resultByResponsibility2 = editingItem.resultByResponsibility2 || undefined;
            } else if (isResponsibility1) {
                formValues.resultByResponsibility1 = editingItem.resultByResponsibility1 || undefined;
            } else if (isResponsibility2) {
                formValues.resultByResponsibility2 = editingItem.resultByResponsibility2 || undefined;
            }

            form.setFieldsValue(formValues);
        } else if (!open) {
            form.resetFields();
            setFileList([]);
            setDeletedFiles([]);
        }
    }, [open, editingItem, form, currentEmployeeId, isResponsibility1, isResponsibility2, isSuperAdmin]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const data = {
                employeeResponsibility1Id: null,
                resultByResponsibility1: null,
                employeeResponsibility2Id: null,
                resultByResponsibility2: null,
                remark: values.remark || null,
            };

            if (isSuperAdmin) {
                if (values.resultByResponsibility1) {
                    data.employeeResponsibility1Id = currentEmployeeId;
                    data.resultByResponsibility1 = values.resultByResponsibility1;
                }
                if (values.resultByResponsibility2) {
                    data.employeeResponsibility2Id = currentEmployeeId;
                    data.resultByResponsibility2 = values.resultByResponsibility2;
                }
            } else if (isResponsibility1) {
                data.employeeResponsibility1Id = currentEmployeeId;
                data.resultByResponsibility1 = values.resultByResponsibility1 || null;
            } else if (isResponsibility2) {
                data.employeeResponsibility2Id = currentEmployeeId;
                data.resultByResponsibility2 = values.resultByResponsibility2 || null;
            }

            const uploadFiles = fileList
                .filter((file) => !file.existingFile && file.originFileObj)
                .map((file) => file.originFileObj);

            const keptOldFiles = fileList
                .filter((file) => file.existingFile && !deletedFiles.includes(file.filePath))
                .map((file) => file.filePath);

            const deletedOldFiles = deletedFiles;

            setSubmitting(true);
            await mpCheckListService.updateItem(editingItem.id, data, uploadFiles, keptOldFiles, deletedOldFiles);

            message.success('Cập nhật mục kiểm tra thành công');
            form.resetFields();
            setFileList([]);
            setDeletedFiles([]);
            onSuccess?.();
        } catch (error) {
            if (error.errorFields) {
                return;
            }
            message.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const handleFileRemove = (file) => {
        if (file.existingFile) {
            setDeletedFiles([...deletedFiles, file.filePath]);
        }
        return true;
    };

    const uploadProps = {
        fileList,
        onChange: handleFileChange,
        onRemove: handleFileRemove,
        beforeUpload: () => false,
        multiple: true,
    };

    return (
        <Modal
            title="Cập nhật kết quả"
            open={open}
            onOk={handleSubmit}
            onCancel={onCancel}
            confirmLoading={submitting}
            width={700}
            okText="Lưu"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                {(isSuperAdmin || isResponsibility1) && (
                    <>
                        <Form.Item label={`Phòng ban phụ trách 1: ${editingItem?.responsibility1Name || ''}`}>
                            <Input value={editingItem?.responsibility1Name} disabled />
                        </Form.Item>

                        <Form.Item
                            label={`Kết quả của phòng ban phụ trách: ${editingItem?.responsibility1Name || ''}`}
                            name="resultByResponsibility1"
                            rules={
                                !isSuperAdmin && isResponsibility1
                                    ? [{ required: true, message: 'Vui lòng chọn kết quả' }]
                                    : []
                            }
                        >
                            <Select showSearch allowClear placeholder="Chọn kết quả" options={HtmpResult} />
                        </Form.Item>
                    </>
                )}

                {(isSuperAdmin || isResponsibility2) && editingItem?.responsibility2Code && (
                    <>
                        <Form.Item label={`Phòng ban phụ trách 2: ${editingItem?.responsibility2Name || ''}`}>
                            <Input value={editingItem?.responsibility2Name} disabled />
                        </Form.Item>

                        <Form.Item
                            label={`Kết quả của phòng ban phụ trách 2: ${editingItem?.responsibility2Name || ''}`}
                            name="resultByResponsibility2"
                            rules={
                                !isSuperAdmin && isResponsibility2
                                    ? [{ required: true, message: 'Vui lòng chọn kết quả' }]
                                    : []
                            }
                        >
                            <Select showSearch allowClear placeholder="Chọn kết quả" options={HtmpResult} />
                        </Form.Item>
                    </>
                )}

                <Form.Item label="Ghi chú" name="remark">
                    <TextArea rows={4} placeholder="Nhập ghi chú (không bắt buộc)" />
                </Form.Item>

                <Form.Item label="File đính kèm">
                    <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />}>Chọn file</Button>
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default MpHandoverUpdateModal;
