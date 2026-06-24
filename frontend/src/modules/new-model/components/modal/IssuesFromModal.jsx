import { DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, InputNumber, Modal, Select, Table, Upload, message } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useFileManager } from '~/hook/useFileManager';
import authService from '~/modules/auth/services/authService';
import productDefectCodeService from '../../services/productDefectCodeService';
import productPlanIssueService from '../../services/productPlanIssueService';

const IssuesFromModal = ({ open, onCancel, planId, planName, initialValues, onSuccess }) => {
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);
    const [defectCodes, setDefectCodes] = useState([]);
    const [selectedDefectCodes, setSelectedDefectCodes] = useState([]);
    const ACCEPTED_MEDIA_TYPES = '.png,.jpg,.jpeg,.gif,.bmp,.mp4,.webm,.ogg';

    const isSuperAdmin = authService.hasRole('SUPERADMIN');
    const isKT = authService.hasDepartmentCode('KT');
    const isMOLD = authService.hasDepartmentCode('MOLD');

    const beforeFileManager = useFileManager();
    const afterFileManager = useFileManager();

    useEffect(() => {
        const fetchDefectCodes = async () => {
            try {
                const data = await productDefectCodeService.getAllDefectCodes();
                setDefectCodes(data || []);
            } catch (error) {
                message.error('Lỗi khi tải danh sách mã lỗi');
            }
        };
        fetchDefectCodes();
    }, []);

    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue({
                    ...initialValues,
                    issueType: initialValues.issueType || undefined,
                    implemented: initialValues.implemented ?? false,
                    repairDeadline: initialValues.repairDeadline ? dayjs(initialValues.repairDeadline) : undefined,
                });

                const beforeFiles = initialValues.files?.filter((f) => f.status === 'BEFORE') || [];
                const afterFiles = initialValues.files?.filter((f) => f.status === 'AFTER') || [];

                beforeFileManager.setInitialFiles(beforeFiles);
                afterFileManager.setInitialFiles(afterFiles);
                setSelectedDefectCodes(initialValues.defectCodes || []);
            } else {
                form.resetFields();
                form.setFieldsValue({ implemented: false });
                beforeFileManager.setInitialFiles([]);
                afterFileManager.setInitialFiles([]);
                setSelectedDefectCodes([]);
            }
        }
    }, [open, initialValues]);

    const handlePasteToManager = (event, fileManager, zoneLabel) => {
        const clipboardItems = event.clipboardData?.items;
        if (!clipboardItems?.length) {
            return;
        }

        const pastedFiles = [];
        const now = Date.now();

        Array.from(clipboardItems).forEach((item, index) => {
            if (item.kind !== 'file') {
                return;
            }

            const rawFile = item.getAsFile();
            if (!rawFile) {
                return;
            }

            const extension = rawFile.type?.split('/')[1] || 'png';
            const generatedName = rawFile.name || `clipboard-${now}-${index}.${extension}`;
            const normalizedFile = new File([rawFile], generatedName, {
                type: rawFile.type || 'image/png',
                lastModified: Date.now(),
            });

            pastedFiles.push(normalizedFile);
        });

        if (pastedFiles.length === 0) {
            return;
        }

        event.preventDefault();
        fileManager.appendFiles(pastedFiles);
        message.success(`Đã dán ${pastedFiles.length} tệp vào khu vực ${zoneLabel}`);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            const formData = new FormData();

            const formatted = {
                ...values,
                implemented: values.implemented ?? false,
                issueType: values.issueType,

                repairDeadline:
                    values.issueType === 'MOLD_ERROR' && values.repairDeadline
                        ? values.repairDeadline.format('YYYY-MM-DDTHH:mm')
                        : null,

                defectCodes: values.issueType === 'PRODUCT_ERROR' ? selectedDefectCodes : [],
            };
            delete formatted.attachments;

            formData.append('data', new Blob([JSON.stringify(formatted)], { type: 'application/json' }));

            beforeFileManager.newFiles.forEach((file) => {
                formData.append('beforeFiles', file);
            });

            afterFileManager.newFiles.forEach((file) => {
                formData.append('afterFiles', file);
            });

            const allKeptOldFiles = [...beforeFileManager.keptOldFiles, ...afterFileManager.keptOldFiles];
            const allDeletedOldFiles = [...beforeFileManager.deletedOldFiles, ...afterFileManager.deletedOldFiles];

            formData.append('keptOldFiles', JSON.stringify(allKeptOldFiles));
            formData.append('deletedOldFiles', JSON.stringify(allDeletedOldFiles));

            const res = initialValues
                ? await productPlanIssueService.updateIssue(initialValues.id, formData)
                : await productPlanIssueService.createIssues(planId, formData);

            message.success(res?.message || 'Lưu thành công');

            onCancel();
            form.resetFields();
            setSelectedDefectCodes([]);
            onSuccess?.();
        } catch (error) {
            message.error(error?.message || String(error));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            onOk={handleSave}
            okText="Lưu"
            cancelText="Hủy"
            title={initialValues ? `Chỉnh sửa vấn đề cho ${planName}` : `Thêm vấn đề cho ${planName}`}
            confirmLoading={saving}
            width={1000}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="issueType"
                    label="Phân loại lỗi"
                    rules={[{ required: true, message: 'Vui lòng chọn loại lỗi' }]}
                >
                    <Select
                        placeholder="Chọn loại lỗi"
                        options={[
                            { label: 'Lỗi khuôn', value: 'MOLD_ERROR' },
                            { label: 'Lỗi sản phẩm', value: 'PRODUCT_ERROR' },
                        ]}
                        onChange={() => {
                            form.setFieldsValue({ repairDeadline: undefined });
                            setSelectedDefectCodes([]);
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="issueDescription"
                    label="Mô tả lỗi"
                    rules={[
                        {
                            required: isKT,
                            message: 'Vui lòng mô tả lỗi',
                        },
                    ]}
                >
                    <TextArea />
                </Form.Item>

                <Form.Item
                    name="cause"
                    label="Nguyên nhân"
                    rules={[
                        {
                            required: isMOLD,
                            message: 'Vui lòng tải lên hình ảnh hoặc video lỗi',
                        },
                    ]}
                >
                    <TextArea />
                </Form.Item>

                <Form.Item
                    name="improvePlan"
                    label="Hướng xử lý"
                    rules={[
                        {
                            required: isMOLD,
                            message: 'Vui lòng nhập hướng xử lý',
                        },
                    ]}
                >
                    <TextArea />
                </Form.Item>

                <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.issueType !== currentValues.issueType}
                >
                    {({ getFieldValue }) => {
                        const issueType = getFieldValue('issueType');
                        const hasExistingDeadline = initialValues?.repairDeadline;

                        return issueType === 'MOLD_ERROR' ? (
                            <Form.Item
                                name="repairDeadline"
                                label="Deadline sửa khuôn"
                                rules={[{ required: true, message: 'Vui lòng chọn deadline sửa khuôn' }]}
                            >
                                <DatePicker
                                    showTime={{ format: 'HH:mm' }}
                                    format="YYYY-MM-DD HH:mm"
                                    style={{ width: '100%' }}
                                    disabled={hasExistingDeadline}
                                    placeholder={
                                        hasExistingDeadline
                                            ? 'Deadline đã được thiết lập, không thể sửa'
                                            : 'Chọn deadline'
                                    }
                                />
                            </Form.Item>
                        ) : null;
                    }}
                </Form.Item>

                <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.issueType !== currentValues.issueType}
                >
                    {({ getFieldValue }) => {
                        const issueType = getFieldValue('issueType');

                        return issueType === 'PRODUCT_ERROR' ? (
                            <Form.Item label="Mã lỗi và số lượng" required>
                                <Table
                                    dataSource={selectedDefectCodes}
                                    rowKey={(record, index) => index}
                                    pagination={false}
                                    size="small"
                                    columns={[
                                        {
                                            title: 'Mã lỗi',
                                            dataIndex: 'defectCodeId',
                                            width: '40%',
                                            render: (value, record, index) => (
                                                <Select
                                                    style={{ width: '100%' }}
                                                    value={value}
                                                    placeholder="Chọn mã lỗi"
                                                    showSearch
                                                    optionFilterProp="children"
                                                    onChange={(val) => {
                                                        const updated = [...selectedDefectCodes];
                                                        const selected = defectCodes.find((dc) => dc.id === val);
                                                        updated[index] = {
                                                            ...updated[index],
                                                            defectCodeId: val,
                                                            defectCode: selected?.code,
                                                            defectCodeDescription: selected?.description,
                                                        };
                                                        setSelectedDefectCodes(updated);
                                                    }}
                                                >
                                                    {defectCodes.map((dc) => (
                                                        <Select.Option key={dc.id} value={dc.id}>
                                                            {dc.code} - {dc.description}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            ),
                                        },
                                        {
                                            title: 'Số lượng',
                                            dataIndex: 'quantity',
                                            width: '20%',
                                            render: (value, record, index) => (
                                                <InputNumber
                                                    min={1}
                                                    value={value}
                                                    onChange={(val) => {
                                                        const updated = [...selectedDefectCodes];
                                                        updated[index] = { ...updated[index], quantity: val };
                                                        setSelectedDefectCodes(updated);
                                                    }}
                                                    style={{ width: '100%' }}
                                                />
                                            ),
                                        },
                                        {
                                            title: 'Ghi chú',
                                            dataIndex: 'note',
                                            width: '30%',
                                            render: (value, record, index) => (
                                                <Input
                                                    value={value}
                                                    onChange={(e) => {
                                                        const updated = [...selectedDefectCodes];
                                                        updated[index] = { ...updated[index], note: e.target.value };
                                                        setSelectedDefectCodes(updated);
                                                    }}
                                                />
                                            ),
                                        },
                                        {
                                            title: '',
                                            width: '10%',
                                            render: (_, __, index) => (
                                                <Button
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => {
                                                        const updated = selectedDefectCodes.filter(
                                                            (_, i) => i !== index,
                                                        );
                                                        setSelectedDefectCodes(updated);
                                                    }}
                                                />
                                            ),
                                        },
                                    ]}
                                />
                                <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    onClick={() => {
                                        setSelectedDefectCodes([
                                            ...selectedDefectCodes,
                                            { defectCodeId: undefined, quantity: 1, note: '' },
                                        ]);
                                    }}
                                    style={{ width: '100%', marginTop: 8 }}
                                >
                                    Thêm mã lỗi
                                </Button>
                            </Form.Item>
                        ) : null;
                    }}
                </Form.Item>

                <Form.Item
                    name="implemented"
                    label="Trạng thái thực hiện"
                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái thực hiện' }]}
                    initialValue={false}
                >
                    <Select
                        options={[
                            { label: 'Chưa thực hiện', value: false },
                            { label: 'Đã thực hiện', value: true },
                        ]}
                    />
                </Form.Item>

                <Form.Item label="Ảnh/Video trước cải thiện">
                    <div
                        onPaste={(event) => handlePasteToManager(event, beforeFileManager, 'TRƯỚC')}
                        tabIndex={0}
                        style={{
                            border: '1px dashed #d9d9d9',
                            borderRadius: 8,
                            padding: 12,
                            background: '#fafafa',
                        }}
                    >
                        <Upload.Dragger
                            multiple
                            listType="picture"
                            beforeUpload={() => false}
                            fileList={beforeFileManager.fileList}
                            onChange={beforeFileManager.onChange}
                            accept={ACCEPTED_MEDIA_TYPES}
                            openFileDialogOnClick={false}
                            showUploadList
                        >
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined />
                            </p>
                            <p className="ant-upload-text">Kéo thả ảnh/video vào đây</p>
                            <p className="ant-upload-hint">
                                Hoặc click vào vùng này rồi nhấn Ctrl+V để dán ảnh từ Zalo/Snipping Tool
                            </p>
                            <Upload
                                multiple
                                beforeUpload={() => false}
                                fileList={beforeFileManager.fileList}
                                onChange={beforeFileManager.onChange}
                                accept={ACCEPTED_MEDIA_TYPES}
                                showUploadList={false}
                            >
                                <Button type="primary" icon={<UploadOutlined />} style={{ marginTop: 8 }}>
                                    Tải lên từ máy
                                </Button>
                            </Upload>
                        </Upload.Dragger>
                    </div>
                </Form.Item>

                <Form.Item label="Ảnh/Video sau cải thiện">
                    <div
                        onPaste={(event) => handlePasteToManager(event, afterFileManager, 'SAU')}
                        tabIndex={0}
                        style={{
                            border: '1px dashed #d9d9d9',
                            borderRadius: 8,
                            padding: 12,
                            background: '#fafafa',
                        }}
                    >
                        <Upload.Dragger
                            multiple
                            listType="picture"
                            beforeUpload={() => false}
                            fileList={afterFileManager.fileList}
                            onChange={afterFileManager.onChange}
                            accept={ACCEPTED_MEDIA_TYPES}
                            openFileDialogOnClick={false}
                            showUploadList
                        >
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined />
                            </p>
                            <p className="ant-upload-text">Kéo thả ảnh/video vào đây</p>
                            <p className="ant-upload-hint">
                                Hoặc click vào vùng này rồi nhấn Ctrl+V để dán ảnh từ Zalo/Snipping Tool
                            </p>
                            <Upload
                                multiple
                                beforeUpload={() => false}
                                fileList={afterFileManager.fileList}
                                onChange={afterFileManager.onChange}
                                accept={ACCEPTED_MEDIA_TYPES}
                                showUploadList={false}
                            >
                                <Button type="primary" icon={<UploadOutlined />} style={{ marginTop: 8 }}>
                                    Tải lên từ máy
                                </Button>
                            </Upload>
                        </Upload.Dragger>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default IssuesFromModal;
