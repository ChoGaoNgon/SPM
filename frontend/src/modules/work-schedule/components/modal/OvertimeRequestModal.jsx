import { Button, Col, DatePicker, Form, Input, message, Modal, Row, Select } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import authService from '~/modules/auth/services/authService';
import employeeService from '~/modules/employee/services/employeeService';
import overtimeService from '../../services/overtimeService';

const { TextArea } = Input;

const OvertimeRequestModal = ({ visible, onClose, type = 'REQUEST', onSuccess, initialData }) => {
    const [form] = Form.useForm();
    const [employees, setEmployees] = useState([]);
    const isSuperAdmin = authService.hasRole('SUPERADMIN');

    useEffect(() => {
        if (type === 'ASSIGN' || type === 'DIRECT_ASSIGN') {
            if (isSuperAdmin) {
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
        }

        if (visible && initialData) {
            form.setFieldsValue({
                employee: initialData.employeeId || undefined,
                startTime: initialData.startTime ? dayjs(initialData.startTime) : undefined,
                endTime: initialData.endTime ? dayjs(initialData.endTime) : undefined,
                reason: initialData.reason || '',
            });
        } else {
            form.resetFields();
        }
    }, [visible, type, initialData]);

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    const handleRequestSubmit = async (values) => {
        await overtimeService.createRequest({
            employeeId: authService.getEmployeeId(),
            startTime: dayjs(values.startTime).format('YYYY-MM-DDTHH:mm:ss'),
            endTime: dayjs(values.endTime).format('YYYY-MM-DDTHH:mm:ss'),
            reason: values.reason,
        });
        message.success('Gửi đơn tăng ca thành công!');
    };

    const handleAssignSubmit = async (values) => {
        if (!values.employee) throw new Error('Vui lòng chọn nhân viên');
        await overtimeService.assignOvertime({
            managerId: authService.getEmployeeId(),
            employeeId: values.employee,
            startTime: dayjs(values.startTime).format('YYYY-MM-DDTHH:mm:ss'),
            endTime: dayjs(values.endTime).format('YYYY-MM-DDTHH:mm:ss'),
            reason: values.reason,
        });
        message.success('Phân công tăng ca thành công!');
    };

    const handleDirectAssignSubmit = async (values) => {
        await overtimeService.directAssignOvertime({
            managerId: authService.getEmployeeId(),
            employeeId: values.employee,
            startTime: dayjs(values.startTime).format('YYYY-MM-DDTHH:mm:ss'),
            endTime: dayjs(values.endTime).format('YYYY-MM-DDTHH:mm:ss'),
            reason: values.reason,
        });
        message.success('Chỉ định tăng ca thành công!');
    };

    const handleSubmit = async (values) => {
        try {
            if (type === 'ASSIGN') await handleAssignSubmit(values);
            else if (type === 'DIRECT_ASSIGN') await handleDirectAssignSubmit(values);
            else await handleRequestSubmit(values);

            form.resetFields();
            onClose();
            onSuccess && onSuccess();
        } catch (err) {
            message.error(err.message);
        }
    };

    return (
        <Modal
            title={
                type === 'ASSIGN'
                    ? 'Phân công tăng ca'
                    : type === 'DIRECT_ASSIGN'
                      ? 'Chỉ định tăng ca'
                      : 'Đơn xin tăng ca'
            }
            open={visible}
            onCancel={handleClose}
            footer={null}
            destroyOnHidden={true}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                {(type === 'ASSIGN' || type === 'DIRECT_ASSIGN') && (
                    <Form.Item
                        name="employee"
                        label="Nhân viên"
                        rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
                    >
                        <Select showSearch optionFilterProp="children" placeholder="Chọn nhân viên">
                            {employees.map((emp) => (
                                <Select.Option key={emp.id} value={emp.id}>
                                    {emp.name} ({emp.code})
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="startTime"
                            label="Bắt đầu"
                            rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu' }]}
                        >
                            <DatePicker
                                showTime={{ format: 'HH:mm' }}
                                format="DD-MM-YYYY HH:mm"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="endTime"
                            label="Kết thúc"
                            rules={[{ required: true, message: 'Vui lòng chọn thời gian kết thúc' }]}
                        >
                            <DatePicker
                                showTime={{ format: 'HH:mm' }}
                                format="DD-MM-YYYY HH:mm"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="reason"
                    label="Lý do tăng ca"
                    rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
                >
                    <TextArea rows={3} placeholder="Nhập lý do..." />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        {type === 'ASSIGN' ? 'Phân công' : type === 'DIRECT_ASSIGN' ? 'Chỉ định' : 'Gửi đơn'}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default OvertimeRequestModal;
