import { Col, DatePicker, Form, Input, InputNumber, message, Modal, Row } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import EmployeeSelect from '~/components/select/EmployeeSelect';
import authService from '~/modules/auth/services/authService';
import { formatDateTime } from '~/utils/formatter';
import productMoldTrialPlanService from '../../services/productPlanService';

const toDayjs = (val) => {
    if (!val) return null;
    if (dayjs.isDayjs(val)) return val;
    return dayjs(val);
};

const PlanKTModal = ({ open, onCancel, initialValues, onSuccess, productCode, productId, typePlan }) => {
    const [form] = Form.useForm();
    const [currentDepartmentCode, setCurrentDepartmentCode] = useState('');
    const isEvent = typePlan === 'EVENT';
    const isMoldTrial = typePlan === 'MOLD_TRIAL';
    const isSecondProcess = typePlan === 'SECOND_PROCESS';

    useEffect(() => {
        const departmentCode = authService.getDepartmentCode();
        setCurrentDepartmentCode(departmentCode || '');
    }, []);

    const PLAN_LABELS = {
        MOLD_TRIAL: {
            actualStartTimeLabel: 'Thời gian bắt đầu thử khuôn thực tế',
            actualEndTimeLabel: 'Thời gian kết thúc thử khuôn thực tế',
            endTimeValidationMsg: 'Vui lòng nhập thời gian kết thúc thử khuôn',
            productSampleSubmitDateLabel: 'Ngày gửi mẫu sản phẩm',
            productSampleSubmitterLabel: 'Người gửi mẫu sản phẩm',
        },
        EVENT: {
            actualStartTimeLabel: 'Ngày bắt đầu chạy event thực tế',
            actualEndTimeLabel: 'Ngày kết thúc chạy event thực tế',
            endTimeValidationMsg: 'Vui lòng nhập ngày kết thúc chạy event',
            productSampleSubmitDateLabel: 'Ngày gửi mẫu sản phẩm',
            productSampleSubmitterLabel: 'Người gửi mẫu sản phẩm',
        },
        SECOND_PROCESS: {
            actualStartTimeLabel: 'Thời gian bắt đầu secondProcess thực tế',
            actualEndTimeLabel: 'Thời gian kết thúc secondProcess thực tế',
            endTimeValidationMsg: 'Vui lòng nhập thời gian kết thúc secondProcess',
            productSampleSubmitDateLabel: 'Ngày gửi mẫu sản phẩm',
            productSampleSubmitterLabel: 'Người gửi mẫu sản phẩm',
        },
    };

    const labels = PLAN_LABELS[typePlan] || PLAN_LABELS.MOLD_TRIAL;

    useEffect(() => {
        if (open && initialValues) {
            form.setFieldsValue({
                actualStartTime: toDayjs(initialValues.actualStartTime),
                actualEndTime: toDayjs(initialValues.actualEndTime),
                actualDurationHours: initialValues.actualDurationHours,
                productSampleSubmitDate: toDayjs(initialValues.productSampleSubmitDate),
                productSampleSubmitterId: initialValues.productSampleSubmitterId,
                dryingTemperatureActual: initialValues.dryingTemperatureActual,
                dryingTimeActual: initialValues.dryingTimeActual,
                planDelayReason: initialValues.planDelayReason,
                faSubmitDelayReason: initialValues.faSubmitDelayReason,
            });
        } else {
            form.resetFields();
        }
    }, [open, initialValues, form, typePlan]);
    const handleSaveLog = async () => {
        try {
            const values = await form.validateFields();

            const updateReq = {
                actualStartTime: formatDateTime(values.actualStartTime),
                actualEndTime: formatDateTime(values.actualEndTime),
                productSampleSubmitDate: formatDateTime(values.productSampleSubmitDate),
                productSampleSubmitterId: values.productSampleSubmitterId,
                dryingTemperatureActual: values.dryingTemperatureActual,
                dryingTimeActual: values.dryingTimeActual,
                planDelayReason: values.planDelayReason || null,
                faSubmitDelayReason: values.faSubmitDelayReason || null,
            };

            const res = await productMoldTrialPlanService.updateMoldTrialPlanForKT(initialValues.id, updateReq);

            message.success(res?.message || 'Cập nhật thông tin thử khuôn thành công!');

            form.resetFields();
            onCancel();
            onSuccess?.();
        } catch (error) {
            message.error(error?.message || error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật dữ liệu!');
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            onOk={handleSaveLog}
            okText="Lưu thông tin"
            cancelText="Hủy"
            title={`Cập nhật tiến độ thực tế: [${initialValues?.name || 'N/A'}] của sản phẩm [${productCode || 'N/A'}] `}
            width={800}
        >
            <Form form={form} layout="vertical" name="moldTrialKTForm" autoComplete="off">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="actualStartTime" label={labels.actualStartTimeLabel}>
                            <DatePicker
                                showTime={{
                                    format: 'HH:mm',
                                    defaultValue: dayjs('00:00', 'HH:mm'),
                                }}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="actualEndTime" label={labels.actualEndTimeLabel}>
                            <DatePicker
                                style={{ width: '100%' }}
                                showTime={{
                                    format: 'HH:mm',
                                    defaultValue: dayjs('00:00', 'HH:mm'),
                                }}
                                dependencies={['actualStartTime']}
                                rules={[
                                    {
                                        required: true,
                                        message: labels.endTimeValidationMsg,
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const startTime = getFieldValue('actualStartTime');
                                            if (!value || !startTime) {
                                                return Promise.resolve();
                                            }

                                            const start = dayjs.isDayjs(startTime) ? startTime : dayjs(startTime);
                                            const end = dayjs.isDayjs(value) ? value : dayjs(value);

                                            if (end.isBefore(start) || end.isSame(start)) {
                                                return Promise.reject(
                                                    new Error(`Thời gian kết thúc phải sau thời gian bắt đầu`),
                                                );
                                            }
                                            return Promise.resolve();
                                        },
                                    }),
                                ]}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item noStyle shouldUpdate>
                            {() => {
                                const startTime = form.getFieldValue('actualStartTime');
                                const endTime = form.getFieldValue('actualEndTime');
                                let durationHours = 0;

                                if (startTime && endTime && endTime.isAfter(startTime)) {
                                    durationHours = endTime.diff(startTime, 'hour', true);
                                    durationHours = Math.round(durationHours * 100) / 100;

                                    if (form.getFieldValue('actualDurationHours') !== durationHours) {
                                        form.setFieldsValue({ actualDurationHours: durationHours });
                                    }
                                } else if (form.getFieldValue('actualDurationHours') !== 0) {
                                    form.setFieldsValue({ actualDurationHours: 0 });
                                }

                                return (
                                    <Form.Item name="actualDurationHours" label="Tổng thời gian thực tế">
                                        <InputNumber style={{ width: '100%' }} min={0} disabled />
                                    </Form.Item>
                                );
                            }}
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="productSampleSubmitDate" label={labels.productSampleSubmitDateLabel}>
                            <DatePicker
                                style={{ width: '100%' }}
                                showTime={{
                                    format: 'HH:mm',
                                    defaultValue: dayjs('00:00', 'HH:mm'),
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="productSampleSubmitterId" label={labels.productSampleSubmitterLabel}>
                            <EmployeeSelect placeholder="Chọn người gửi mẫu" departmentCode={currentDepartmentCode} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="dryingTemperatureActual" label="Nhiệt độ sấy thực tế">
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="Nhập nhiệt độ sấy"
                                min={0}
                                addonAfter="°C"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="dryingTimeActual" label="Thời gian sấy thực tế">
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="Nhập thời gian sấy"
                                min={0}
                                step={0.5}
                                addonAfter="giờ"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item noStyle shouldUpdate>
                    {() => {
                        const actualEndTime = form.getFieldValue('actualEndTime');
                        const requestEndTime = initialValues?.requestEndTime
                            ? dayjs(initialValues.requestEndTime)
                            : null;
                        const isEndTimeDelayed =
                            actualEndTime && requestEndTime && actualEndTime.isAfter(requestEndTime);

                        if (!isEndTimeDelayed) {
                            return null;
                        }

                        return (
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        name="planDelayReason"
                                        label="Lý do quá hạn kết thúc"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Vui lòng nhập lý do quá hạn kết thúc',
                                            },
                                        ]}
                                    >
                                        <Input.TextArea
                                            placeholder="Nhập lý do thực tế kết thúc muộn hơn dự kiến"
                                            rows={3}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        );
                    }}
                </Form.Item>

                <Form.Item noStyle shouldUpdate>
                    {() => {
                        const productSampleSubmitDate = form.getFieldValue('productSampleSubmitDate');
                        const expectedFaSubmitDate = initialValues?.expectedFaSubmitDate
                            ? dayjs(initialValues.expectedFaSubmitDate)
                            : null;
                        const isFaSubmitDelayed =
                            productSampleSubmitDate &&
                            expectedFaSubmitDate &&
                            productSampleSubmitDate.isAfter(expectedFaSubmitDate, 'day');

                        if (!isFaSubmitDelayed) {
                            return null;
                        }

                        return (
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        name="faSubmitDelayReason"
                                        label="Lý do chậm gửi mẫu"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Vui lòng nhập lý do chậm gửi mẫu',
                                            },
                                        ]}
                                    >
                                        <Input.TextArea
                                            placeholder="Nhập lý do gửi mẫu muộn hơn ngày yêu cầu"
                                            rows={3}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        );
                    }}
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PlanKTModal;
