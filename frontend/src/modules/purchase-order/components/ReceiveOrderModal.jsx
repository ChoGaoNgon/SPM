import { DatePicker, Form, InputNumber, message, Modal } from 'antd';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import orderService from '~/modules/purchase-order/services/orderService';

const ReceiveOrderModal = ({ open, orderItem, onCancel, onSuccess }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (orderItem) {
            form.setFieldsValue({
                receivedDate: orderItem.receivedDate ? dayjs(orderItem.receivedDate) : null,
                quantityReceived: orderItem.quantityReceived ?? 0,
            });
        }
    }, [orderItem, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            await orderService.updateReceivedInfo(orderItem.id, {
                receivedDate: values.receivedDate.format('YYYY-MM-DD'),
                quantityReceived: values.quantityReceived,
            });
            message.success('Cập nhật thành công');
            onSuccess();
            form.resetFields();
        } catch (error) {
        }
    };

    return (
        <Modal
            title="Cập nhật trạng thái nhận hàng"
            open={open}
            onOk={handleOk}
            onCancel={() => {
                onCancel();
                form.resetFields();
            }}
            okText="Xác nhận"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="receivedDate"
                    label="Ngày nhận"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày nhận' }]}
                >
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name="quantityReceived"
                    label="Số lượng đã nhận"
                    rules={[{ required: true, type: 'number', min: 0, message: 'Vui lòng nhập số hợp lệ' }]}
                >
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ReceiveOrderModal;
