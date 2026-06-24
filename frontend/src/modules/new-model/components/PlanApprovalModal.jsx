import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Alert, Form, Input, Modal, Radio, Space, Tag, Typography } from 'antd';
import { useState } from 'react';

const { TextArea } = Input;
const { Text } = Typography;

const PlanApprovalModal = ({ visible, approval, onSubmit, onCancel }) => {
    const [form] = Form.useForm();
    const [status, setStatus] = useState('APPROVED');

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await onSubmit({
                approvalType: approval?.approvalType,
                status: values.status,
                remark: values.remark,
            });
            form.resetFields();
            setStatus('APPROVED');
        } catch (error) {
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setStatus('APPROVED');
        onCancel();
    };

    return (
        <Modal
            title={
                <Space>
                    <Text strong>Phê duyệt: {approval?.approvalTypeName}</Text>
                    {approval?.required && (
                        <Tag color="red" style={{ fontSize: '10px' }}>
                            Bắt buộc
                        </Tag>
                    )}
                </Space>
            }
            open={visible}
            onOk={handleSubmit}
            onCancel={handleCancel}
            width={600}
            okText="Xác nhận"
            cancelText="Hủy"
            okButtonProps={{
                danger: status === 'REJECTED',
            }}
        >
            {approval && (
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            status: 'APPROVED',
                        }}
                    >
                        <Form.Item
                            name="status"
                            label="Quyết định"
                            rules={[{ required: true, message: 'Vui lòng chọn quyết định phê duyệt' }]}
                        >
                            <Radio.Group onChange={(e) => setStatus(e.target.value)} size="large">
                                <Space direction="vertical">
                                    <Radio value="APPROVED">
                                        <Space>
                                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                            <Text strong>Phê duyệt</Text>
                                        </Space>
                                    </Radio>
                                    <Radio value="REJECTED">
                                        <Space>
                                            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                                            <Text strong>Từ chối</Text>
                                        </Space>
                                    </Radio>
                                </Space>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item
                            name="remark"
                            label="Ghi chú"
                            rules={[
                                {
                                    required: status === 'REJECTED',
                                    message: 'Vui lòng nhập lý do từ chối',
                                },
                            ]}
                        >
                            <TextArea
                                rows={4}
                                placeholder={
                                    status === 'REJECTED'
                                        ? 'Vui lòng nhập lý do từ chối...'
                                        : 'Nhập ghi chú (không bắt buộc)...'
                                }
                            />
                        </Form.Item>
                    </Form>

                    {status === 'REJECTED' && (
                        <Alert
                            message="Lưu ý"
                            description="Khi từ chối phê duyệt, kế hoạch sẽ bị hủy và không thể tiếp tục các bước phê duyệt tiếp theo."
                            type="warning"
                            showIcon
                        />
                    )}
                </Space>
            )}
        </Modal>
    );
};

export default PlanApprovalModal;
