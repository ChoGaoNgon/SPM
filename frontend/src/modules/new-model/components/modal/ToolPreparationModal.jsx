import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Select, Input, message, InputNumber, DatePicker, Row, Col } from 'antd';
import dayjs from 'dayjs';
import authService from '~/modules/auth/services/authService';
import toolPreparationService from '../../services/toolPreparationService';

const { TextArea } = Input;

const createEmptyItem = () => ({
    id: null,
    toolName: '',
    quantityRequired: 1,
    quantityAvailable: 0,
    status: 'NOT_STARTED',
    completionDate: null,
    note: '',
});

const ToolPreparationModal = ({ open, onCancel, initialValues, onSuccess, productId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [item, setItem] = useState(createEmptyItem());
    const assignedDateValue = Form.useWatch('assignedDate', form);
    const completionDateValue = Form.useWatch('completionDate', form);
    const currentEmployee = authService.getEmployee();

    const currentItem = useMemo(() => {
        if (!initialValues) {
            return null;
        }

        if (initialValues.toolName) {
            return initialValues;
        }

        if (Array.isArray(initialValues.items) && initialValues.items.length > 0) {
            return {
                ...initialValues.items[0],
                processType: initialValues.processType,
                productId: initialValues.productId,
            };
        }

        return null;
    }, [initialValues]);

    const isEditing = Boolean(currentItem?.id);

    useEffect(() => {
        if (!open) {
            form.resetFields();
            setItem(createEmptyItem());
            return;
        }

        if (isEditing && currentItem) {
            form.setFieldsValue({
                processType: currentItem.processType || 'FIRST_PROCESS',
                assignedDate: currentItem.assignedDate ? dayjs(currentItem.assignedDate) : null,
                completionDate: currentItem.completionDate
                    ? dayjs(currentItem.completionDate)
                    : currentItem.actualCompletionDate
                      ? dayjs(currentItem.actualCompletionDate)
                      : currentItem.expectedCompletionDate
                        ? dayjs(currentItem.expectedCompletionDate)
                        : null,
            });
            setItem({
                ...createEmptyItem(),
                ...currentItem,
            });
        } else {
            form.setFieldsValue({
                processType: 'FIRST_PROCESS',
                assignedDate: null,
                completionDate: null,
            });
            setItem(createEmptyItem());
        }
    }, [open, form, isEditing, currentItem]);

    const updateItemField = (field, value) => {
        setItem((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const deriveStatus = (assignedDate, completionDate) => {
        if (!assignedDate) {
            return 'NOT_STARTED';
        }
        if (completionDate) {
            return 'COMPLETED';
        }
        return 'IN_PROGRESS';
    };

    const getStatusText = (status) => {
        const statusMap = {
            NOT_STARTED: 'Chưa bắt đầu',
            IN_PROGRESS: 'Đang thực hiện',
            COMPLETED: 'Đã hoàn thành',
        };
        return statusMap[status] || 'Chưa bắt đầu';
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const normalizedItem = {
                ...item,
                toolName: item.toolName?.trim(),
            };

            if (!normalizedItem.toolName) {
                message.error('Vui lòng nhập tên dụng cụ!');
                return;
            }

            if (values.completionDate && !values.assignedDate) {
                message.error('Nếu có ngày hoàn thành thì phải có ngày bắt đầu!');
                return;
            }

            const derivedStatus = deriveStatus(values.assignedDate, values.completionDate);
            const formattedAssignedDate = values.assignedDate
                ? values.assignedDate.format('YYYY-MM-DDTHH:mm:ss')
                : null;
            const formattedCompletionDate = values.completionDate
                ? values.completionDate.format('YYYY-MM-DDTHH:mm:ss')
                : null;

            const targetProductId = currentItem?.productId || initialValues?.productId || productId;
            if (!targetProductId) {
                message.error('Không tìm thấy sản phẩm để lưu chuẩn bị dụng cụ!');
                return;
            }

            setLoading(true);

            const payload = {
                productId: targetProductId,
                processType: isEditing ? currentItem?.processType || values.processType : values.processType,
                assignedDate: formattedAssignedDate,
                actualCompletionDate: formattedCompletionDate,
                expectedCompletionDate: formattedCompletionDate,
                items: [
                    {
                        id: typeof normalizedItem.id === 'number' ? normalizedItem.id : undefined,
                        toolName: normalizedItem.toolName,
                        quantityRequired: normalizedItem.quantityRequired,
                        quantityAvailable: normalizedItem.quantityAvailable,
                        status: derivedStatus,
                        completionDate: formattedCompletionDate,
                        note: normalizedItem.note,
                    },
                ],
            };

            const response = isEditing
                ? await toolPreparationService.update(currentItem.id, payload)
                : await toolPreparationService.create(payload);

            if (response?.status === 200 || response?.code === 200) {
                message.success(isEditing ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
                onSuccess?.(response.data);
                onCancel?.();
            } else {
                message.error(response?.message || (isEditing ? 'Cập nhật thất bại!' : 'Tạo mới thất bại!'));
            }
        } catch (error) {
            message.error(`${isEditing ? 'Lỗi khi cập nhật' : 'Lỗi khi tạo mới'}: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getProcessTypeLabel = (processType) => {
        return processType === 'FIRST_PROCESS' ? 'First Process (Tay gá + Bàn cắt)' : 'Second Process (JIG)';
    };

    return (
        <Modal
            title={
                isEditing ? `Cập nhật dụng cụ - ${getProcessTypeLabel(currentItem?.processType)}` : 'Tạo mới dụng cụ'
            }
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            width={900}
            okText={isEditing ? 'Cập nhật' : 'Tạo mới'}
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="Quy trình"
                            name="processType"
                            rules={[{ required: true, message: 'Vui lòng chọn quy trình!' }]}
                        >
                            <Select placeholder="Chọn quy trình" disabled={isEditing}>
                                <Select.Option value="FIRST_PROCESS">First Process (Tay gá + Bàn cắt)</Select.Option>
                                <Select.Option value="SECOND_PROCESS">Second Process (JIG)</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Tên dụng cụ" required>
                            <Input
                                value={item.toolName}
                                onChange={(e) => updateItemField('toolName', e.target.value)}
                                placeholder="Ví dụ: JIG A, Tay gá 1, Bàn cắt lớn..."
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Trạng thái">
                            <Input
                                value={getStatusText(deriveStatus(assignedDateValue, completionDateValue))}
                                disabled
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Người phụ trách">
                            <Input
                                value={
                                    currentItem?.responsibleEmployeeName
                                        ? `${currentItem.responsibleEmployeeName}${currentItem.responsibleEmployeeCode ? ` (${currentItem.responsibleEmployeeCode})` : ''}`
                                        : currentEmployee?.name
                                          ? `${currentEmployee.name}${currentEmployee.code ? ` (${currentEmployee.code})` : ''}`
                                          : 'Người đang đăng nhập'
                                }
                                disabled
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Ngày bắt đầu" name="assignedDate">
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Ngày hoàn thành" name="completionDate">
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Số lượng yêu cầu">
                            <InputNumber
                                value={item.quantityRequired}
                                onChange={(value) => updateItemField('quantityRequired', value)}
                                min={0}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Số lượng đã có">
                            <InputNumber
                                value={item.quantityAvailable}
                                onChange={(value) => updateItemField('quantityAvailable', value)}
                                min={0}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}> </Col>
                </Row>

                <Form.Item label="Ghi chú">
                    <TextArea
                        rows={3}
                        value={item.note}
                        onChange={(e) => updateItemField('note', e.target.value)}
                        placeholder="Nhập ghi chú..."
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ToolPreparationModal;
