import {
    Modal, Form, Input, DatePicker, Upload, Button, message
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import orderService from "~/modules/purchase-order/services/orderService";
import dayjs from "dayjs";
import authService from "~/modules/auth/services/authService";

const CreateOrderModal = ({ open, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleOk = async () => {
        setLoading(true);
        try {
            const values = await form.validateFields();
            const formData = new FormData();

            formData.append("documentNumber", values.documentNumber);
            formData.append("orderDate", values.orderDate.format("YYYY-MM-DD"));
            formData.append("note", values.note || "");
            formData.append("employeeId", authService.getEmployeeId());
            formData.append("file", values.excelFile[0].originFileObj);

            await orderService.createOrder(formData);
            message.success("Đơn hàng đã được tạo thành công");
            onSuccess();
            form.resetFields();
        } catch (error) {
            if (error?.errorFields) {
                message.error(error.errorFields.map(f => f.errors[0]).join(", "));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Tạo đơn hàng mới"
            open={open}
            onOk={handleOk}
            onCancel={() => {
                onCancel();
                form.resetFields();
            }}
            okText="Lưu"
            cancelText="Hủy"
            confirmLoading={loading}
        >
            <Form layout="vertical" form={form} initialValues={{ orderDate: dayjs() }}>
                <Form.Item
                    name="documentNumber"
                    label="Số chứng từ"
                    rules={[{ required: true, message: "Vui lòng nhập số chứng từ" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="orderDate"
                    label="Ngày đặt hàng"
                    rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                >
                    <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item name="note" label="Ghi chú">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item
                    name="excelFile"
                    label="Tải lên file Excel"
                    valuePropName="fileList"
                    getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList}
                    rules={[{ required: true, message: "Vui lòng chọn file Excel" }]}
                >
                    <Upload beforeUpload={() => false} accept=".xlsx,.xls" maxCount={1}>
                        <Button icon={<UploadOutlined />}>Chọn file Excel</Button>
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateOrderModal;
