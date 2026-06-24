import { Col, DatePicker, Form, Input, Modal, Row, Select } from 'antd';
import dayjs from 'dayjs';

const MoldFormModal = ({ open, onCancel, onSubmit, loading, initialValues }) => {
    const [form] = Form.useForm();

    if (open) {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
                expectedStartDate: initialValues.expectedStartDate ? dayjs(initialValues.expectedStartDate) : null,
                expectedEndDate: initialValues.expectedEndDate ? dayjs(initialValues.expectedEndDate) : null,
            });
        } else {
            form.resetFields();
        }
    }

    const handleOk = () => {
        form.validateFields().then((values) => {
            const payload = {
                id: initialValues?.id ?? null,
                code: values.code,
                type: values.type || '',
                factory: values.factory || '',
                expectedStartDate: values.expectedStartDate ? values.expectedStartDate.format('YYYY-MM-DD') : null,
                expectedEndDate: values.expectedEndDate ? values.expectedEndDate.format('YYYY-MM-DD') : null,
                isTransfer: values.isTransfer ?? false,
                numRepair: values.numRepair ? Number(values.numRepair) : 0,
            };

            onSubmit(payload);
        });
    };

    return (
        <Modal
            open={open}
            title={initialValues ? 'Cập nhật khuôn' : 'Thêm mới khuôn'}
            onCancel={onCancel}
            onOk={handleOk}
            confirmLoading={loading}
            width={650}
            okText={initialValues ? 'Cập nhật' : 'Thêm mới'}
        >
            <Form layout="vertical" form={form}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Mã khuôn" name="code" rules={[{ required: true }]}>
                            <Input placeholder="Nhập mã khuôn" disabled={!!initialValues} />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Loại khuôn" name="type">
                            <Select placeholder="Chọn loại khuôn" allowClear>
                                <Select.Option value="Mochi">Mochi</Select.Option>
                                <Select.Option value="Shikyu">Shikyu</Select.Option>
                                <Select.Option value="Transfer">Transfer</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Nhà máy" name="factory">
                            <Input placeholder="Nhà máy sản xuất" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Số lần sửa" name="numRepair">
                            <Input type="number" placeholder="0" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Ngày dự kiến bắt đầu" name="expectedStartDate">
                            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Ngày dự kiến kết thúc" name="expectedEndDate">
                            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default MoldFormModal;
