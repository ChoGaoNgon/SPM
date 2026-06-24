import { Col, Form, Input, message, Modal, Row, TimePicker } from 'antd';
import { useState } from 'react';
import shiftService from '~/modules/work-schedule/services/shiftService';

const AddShiftModal = ({ open, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleOk = async (values) => {
        try {
            const shiftData = {
                shiftCode: values.shiftCode.trim(),
                description: values.description.trim(),
                startTime: values.startTime.format('HH:mm'),
                endTime: values.endTime.format('HH:mm'),
            };

            setLoading(true);
            await shiftService.addShift(shiftData);

            message.success('Thêm ca làm việc thành công!');
            form.resetFields();
            onCancel();
            if (onSuccess) onSuccess();
        } catch (error) {
            message.error(error.message || 'Lỗi khi thêm ca làm việc');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            title="Thêm ca làm việc"
            onCancel={onCancel}
            confirmLoading={loading}
            okText="Lưu"
            onOk={() => form.submit()}
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical" onFinish={handleOk}>
                <Form.Item label="Mã ca" name="shiftCode" rules={[{ required: true, message: 'Vui lòng nhập mã ca!' }]}>
                    <Input placeholder="VD: HCGT, HCT2..." maxLength={10} />
                </Form.Item>

                <Form.Item
                    label="Mô tả"
                    name="description"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                >
                    <Input placeholder="Ca hành chính, Ca tối..." maxLength={255} />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Giờ bắt đầu" name="startTime">
                            <TimePicker format="HH:mm" minuteStep={5} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Giờ kết thúc" name="endTime">
                            <TimePicker format="HH:mm" minuteStep={5} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default AddShiftModal;
