import { UploadOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, InputNumber, message, Modal, Row, Select, Upload } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import authService from '~/modules/auth/services/authService';
import employeeService from '~/modules/employee/services/employeeService';
import { formatDateTime } from '~/utils/formatter';
import { HtmpResult } from '~/utils/selectOptions';
import bomlistService from '../../services/bomlistService';

const BomlistFormModal = ({ open, onCancel, modelCode, modelId, initialValues, onSuccess }) => {
    const [form] = Form.useForm();
    const [employees, setEmployees] = useState([]);
    const employee = authService.getEmployee();

    useEffect(() => {
        if (open && initialValues) {
            const toDayjs = (val) => {
                if (!val) return null;
                if (dayjs.isDayjs(val)) return val;
                return dayjs(val);
            };

            const fileList = initialValues.fileUrl
                ? [
                      {
                          uid: '-1',
                          name: initialValues.fileUrl.split('/').pop(),
                          status: 'done',
                          url: `${process.env.REACT_APP_UPLOAD_URL}/${initialValues.fileUrl}`,
                      },
                  ]
                : [];

            const values = {
                ...initialValues,
                checkAt: toDayjs(initialValues.checkAt),
                approvalAt: toDayjs(initialValues.approvalAt),
                attachments: fileList,
            };
            form.setFieldsValue(values);
        }

    }, [open, initialValues, form]);

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                if (authService.hasRole('SUPERADMIN') || authService.hasRole('ADMIN')) {
                    employeeService
                        .getAllEmployees()
                        .then(setEmployees)
                        .catch((err) => message.error('Không thể tải danh sách nhân viên: ' + err.message));
                } else {
                    const departmentId = authService.getDepartmentId();
                    employeeService
                        .getEmployeesByDepartment(departmentId, null)
                        .then(setEmployees)
                        .catch((err) => message.error('Không thể tải danh sách nhân viên: ' + err.message));
                }
            } catch (error) {
                message.error(error.message);
            }
        };
        loadEmployees();
    }, []);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const formData = new FormData();

            const formattedValues = {
                ...values,
                checkAt: formatDateTime(values.checkAt),
                approvalAt: formatDateTime(values.approvalAt),
            };

            delete formattedValues.attachments;
            formData.append('data', new Blob([JSON.stringify(formattedValues)], { type: 'application/json' }));

            if (values.attachments?.length > 0) {
                const fileObj = values.attachments[0];
                if (fileObj.originFileObj) {
                    formData.append('uploadFile', fileObj.originFileObj);
                }
            }

            let res;
            if (initialValues?.id) {
                res = await bomlistService.updateBomlist(initialValues.id, formData);
            } else {
                res = await bomlistService.createBomList(modelId, formData);
            }

            message.success(res?.message || 'Lưu thông tin Bomlist thành công!');
            form.resetFields();
            onCancel();
            onSuccess?.();
        } catch (err) {
            message.error(err);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={handleSave}
            okText="Lưu"
            cancelText="Hủy"
            title={initialValues ? `Chỉnh sửa Bomlist cho ${modelCode}` : `Thêm Bomlist cho ${modelCode}`}
            width={1400}
        >
            <Form form={form} layout="vertical" name="bomListForm" autoComplete="off">
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="version"
                            label="Phiên bản"
                            rules={[{ required: true, message: 'Vui lòng nhập phiên bản' }]}
                        >
                            <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="phase"
                            label="Giai đoạn"
                            rules={[{ required: true, message: 'Vui lòng nhập giai đoạn' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="attachments"
                            label="File bomlist"
                            rules={[{ required: true, message: 'Vui lòng đính kèm File' }]}
                            valuePropName="fileList"
                            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
                            required
                        >
                            <Upload
                                beforeUpload={() => false}
                                maxCount={1}
                                listType="text"
                                onRemove={() => form.setFieldValue('attachments', [])}
                            >
                                <Button icon={<UploadOutlined />}>Chọn file</Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="checkAt" label="Ngày kiểm tra">
                            <DatePicker
                                showTime={{
                                    format: 'HH:mm',
                                    defaultValue: dayjs('00:00', 'HH:mm'),
                                }}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="checkedById" label="Nhân viên kiểm tra">
                            <Select
                                showSearch
                                allowClear
                                placeholder="Chọn nhân viên"
                                optionFilterProp="label"
                                options={employees.map((e) => ({
                                    value: e.id,
                                    label: `${e.code} - ${e.name}`,
                                }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="checkResult" label="Kết quả kiểm tra">
                            <Select showSearch allowClear placeholder="Kết quả " options={HtmpResult} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default BomlistFormModal;
