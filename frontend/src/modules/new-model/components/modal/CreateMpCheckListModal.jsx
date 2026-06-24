import { Alert, Form, Input, Modal } from 'antd';

const { TextArea } = Input;

const CreateMpCheckListModal = ({ open, onCancel, onConfirm, daysLate }) => {
    const [form] = Form.useForm();

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            onConfirm(values.delayReason);
            form.resetFields();
        } catch (error) {}
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="Tạo danh sách kiểm tra MP"
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Tạo"
            cancelText="Hủy"
            width={600}
        >
            <Alert
                message={`Cảnh báo: Tạo MP trễ ${daysLate} ngày`}
                description={`Ngày hiện tại đã vượt quá ngày mục tiêu MP. Vui lòng nhập lý do tạo trễ.`}
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
            />
            <Form form={form} layout="vertical">
                <Form.Item
                    name="delayReason"
                    label="Lý do tạo MP trễ"
                    rules={[
                        { required: true, message: 'Vui lòng nhập lý do tạo trễ' },
                        { min: 10, message: 'Lý do phải có ít nhất 10 ký tự' },
                    ]}
                >
                    <TextArea
                        rows={4}
                        placeholder="Nhập lý do tạo danh sách kiểm tra MP trễ so với ngày mục tiêu..."
                        maxLength={500}
                        showCount
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateMpCheckListModal;
