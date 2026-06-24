import React, { useCallback, useEffect, useState } from 'react';
import { Col, DatePicker, Form, Input, message, Modal, Row } from 'antd';
import dayjs from 'dayjs';

import machineService from '~/modules/machine/service/machineService';
import productPlanService from '../../services/productPlanService';
import MachineCodeAutoCompleteField from './MachineCodeAutoCompleteField';

const PlanPcUpdateModal = ({ open, onCancel, plan, onSuccess }) => {
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);
    const [machines, setMachines] = useState([]);

    useEffect(() => {
        if (!open) return;

        const loadMachines = async () => {
            try {
                const data = await machineService.getAllMachines({
                    page: 0,
                    size: 1000,
                    sort: 'id,desc',
                    machineTypeId: 1,
                });
                setMachines(data?.content || []);
            } catch (error) {
                message.error(error?.message || 'Lỗi tải danh sách máy');
            }
        };

        loadMachines();
    }, [open]);

    useEffect(() => {
        if (!open || !plan) return;

        form.setFieldsValue({
            machineId: plan.machineId || null,
            machineNo: plan.machineNo || null,
            machineCode: plan.machineCode || null,
            machineCapacityTon: plan.machineCapacityTon || null,
            requestMachineNote: undefined,
            requestStartTime: plan.requestStartTime ? dayjs(plan.requestStartTime) : null,
            requestEndTime: plan.requestEndTime ? dayjs(plan.requestEndTime) : null,
            requestStartTimeNote: undefined,
            requestEndTimeNote: undefined,
        });
    }, [open, plan, form]);

    useEffect(() => {
        if (!open) {
            form.resetFields();
            setMachines([]);
        }
    }, [open, form]);

    const handleSubmit = useCallback(async () => {
        try {
            setSaving(true);
            const values = await form.validateFields();
            await productPlanService.updateRequestTime(plan.id, values);
            message.success('Cập nhật thời gian yêu cầu thành công');
            onCancel();
            onSuccess?.();
        } catch (error) {
            if (!error?.errorFields) {
                message.error(error?.message || 'Cập nhật thời gian yêu cầu thất bại');
            }
        } finally {
            setSaving(false);
        }
    }, [form, plan, onCancel, onSuccess]);

    return (
        <Modal
            title="PC chỉnh sửa thông tin lập kế hoạch"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="Lưu thay đổi"
            cancelText="Đóng"
            confirmLoading={saving}
            destroyOnClose
            width={900}
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
                        <MachineCodeAutoCompleteField
                            form={form}
                            machines={machines}
                            label="Máy yêu cầu"
                            disabled={false}
                        />
                    </Col>
                    <Col span={12}>
                        <Form.Item name="requestMachineNote" label="Ghi chú đổi máy">
                            <Input.TextArea rows={3} placeholder="Nhập lý do thay đổi máy" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="requestStartTime"
                            label="Thời gian yêu cầu bắt đầu thử khuôn"
                            rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu' }]}
                        >
                            <DatePicker showTime format="HH:mm DD/MM/YYYY" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="requestEndTime"
                            label="Thời gian yêu cầu kết thúc thử khuôn"
                            dependencies={['requestStartTime']}
                            rules={[
                                { required: true, message: 'Vui lòng chọn thời gian kết thúc' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const startTime = getFieldValue('requestStartTime');
                                        if (!value || !startTime) {
                                            return Promise.resolve();
                                        }

                                        const start = dayjs.isDayjs(startTime) ? startTime : dayjs(startTime);
                                        const end = dayjs.isDayjs(value) ? value : dayjs(value);

                                        if (end.isSame(start) || end.isBefore(start)) {
                                            return Promise.reject(
                                                new Error('Thời gian kết thúc phải sau thời gian bắt đầu'),
                                            );
                                        }

                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <DatePicker showTime format="HH:mm DD/MM/YYYY" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="requestStartTimeNote" label="Ghi chú thời gian bắt đầu">
                            <Input.TextArea rows={4} placeholder="Nhập ghi chú thay đổi thời gian bắt đầu" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="requestEndTimeNote" label="Ghi chú thời gian kết thúc">
                            <Input.TextArea rows={4} placeholder="Nhập ghi chú thay đổi thời gian kết thúc" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default PlanPcUpdateModal;
