import { Button, Card, Form, Input, message, Typography } from 'antd';
import { useState } from 'react';
import authService from '~/modules/auth/services/authService';

const { Title } = Typography;

const ChangePasswordPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const employeeId = authService.getEmployeeId();

    const onFinish = async (values) => {
        if (!employeeId) {
            return message.error('Không tìm thấy thông tin nhân viên!');
        }

        setLoading(true);
        try {
            await authService.changePassword(employeeId, values.oldPassword, values.newPassword);

            message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
            setTimeout(() => {
                authService.logout();
            }, 3000);
        } catch (err) {
            message.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                maxWidth: '450px',
                margin: 'auto',
            }}
        >
            <Card>
                <Title level={3} style={{ textAlign: 'center', marginBottom: 20 }}>
                    Đổi mật khẩu
                </Title>

                <Form layout="vertical" form={form} onFinish={onFinish}>
                    <Form.Item
                        label="Mật khẩu cũ"
                        name="oldPassword"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu cũ" />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                            { min: 6, message: 'Mật khẩu phải ít nhất 6 ký tự' },
                            () => ({
                                validator(_, value) {
                                    if (!value) return Promise.resolve();

                                    if (value.toLowerCase() === 'htmp1234') {
                                        return Promise.reject(
                                            new Error('Không được sử dụng mật khẩu mặc định Htmp1234'),
                                        );
                                    }

                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu mới" />
                    </Form.Item>

                    <Form.Item
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng nhập lại mật khẩu' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject('Mật khẩu không khớp!');
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Nhập lại mật khẩu mới" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block loading={loading} style={{ marginTop: 10 }}>
                        Đổi mật khẩu
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default ChangePasswordPage;
