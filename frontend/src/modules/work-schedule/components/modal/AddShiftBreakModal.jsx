import { Checkbox, Form, Input, message, Modal, Select, TimePicker } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import shiftBreakService from '~/modules/work-schedule/services/shiftBreakService';

const AddShiftBreakModal = ({ open, onCancel, onSuccess, shift, breakData }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [breakType, setBreakType] = useState([]);

    const fetchBreakType = async () => {
        try {
            setLoading(true);
            const data = await shiftBreakService.getBreakType();
            setBreakType(data || []);
        } catch (error) {
            message.error(error.message || 'Lỗi khi tải loại nghỉ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBreakType();
    }, []);

    useEffect(() => {
        if (breakData) {
            form.setFieldsValue({
                breakType: breakData.breakType,
                startTime: dayjs(breakData.startTime, 'HH:mm'),
                endTime: dayjs(breakData.endTime, 'HH:mm'),
                isPaid: breakData.isPaid,
            });
        } else {
            form.resetFields();
        }
    }, [breakData, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                breakType: values.breakType,
                startTime: values.startTime.format('HH:mm'),
                endTime: values.endTime.format('HH:mm'),
                duration: values.endTime.diff(values.startTime, 'minute'),
                isPaid: values.isPaid || false,
                shiftId: shift?.id,
            };

            setLoading(true);
            if (breakData?.id) {
                await shiftBreakService.updateShiftBreak(breakData.id, payload);
                message.success('Cập nhật giờ nghỉ thành công!');
            } else {
                await shiftBreakService.addShiftBreak(payload);
                message.success('Thêm giờ nghỉ thành công!');
            }

            form.resetFields();
            onCancel();
            onSuccess?.();
        } catch (error) {
            if (error.errorFields) return;
            message.error(error.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            title={breakData ? `Sửa giờ nghỉ` : `Thêm giờ nghỉ cho ca ${shift?.shiftCode || ''}`}
            onCancel={onCancel}
            onOk={handleOk}
            confirmLoading={loading}
            okText="Lưu"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Loại nghỉ"
                    name="breakType"
                    rules={[{ required: true, message: 'Vui lòng chọn loại nghỉ!' }]}
                >
                    <Select placeholder="Chọn loại nghỉ">
                        {breakType.map((bt) => (
                            <Select.Option key={bt.name} value={bt.name}>
                                {bt.description}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Thời gian nghỉ" required>
                    <Input.Group compact>
                        <Form.Item name="startTime" noStyle rules={[{ required: true, message: 'Chọn giờ bắt đầu!' }]}>
                            <TimePicker format="HH:mm" minuteStep={5} style={{ width: '45%' }} />
                        </Form.Item>
                        <span style={{ margin: '0 8px' }}>→</span>
                        <Form.Item
                            name="endTime"
                            noStyle
                            dependencies={['startTime']}
                            rules={[
                                { required: true, message: 'Chọn giờ kết thúc!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const start = getFieldValue('startTime');
                                        if (!value || !start || value.isAfter(start)) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Giờ kết thúc phải sau giờ bắt đầu'));
                                    },
                                }),
                            ]}
                        >
                            <TimePicker format="HH:mm" minuteStep={5} style={{ width: '45%' }} />
                        </Form.Item>
                    </Input.Group>
                </Form.Item>

                <Form.Item label="" name="isPaid" valuePropName="checked" initialValue={false}>
                    <Checkbox>Tính lương bình thường</Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddShiftBreakModal;
