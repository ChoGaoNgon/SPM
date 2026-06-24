import { Button, DatePicker, Form, message, Modal, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useEffect, useState } from 'react';
import authService from '~/modules/auth/services/authService';
import employeeService from '~/modules/employee/services/employeeService';
import shiftChangeService from '../../services/shiftChangeService';
import shiftService from '../../services/shiftService';
import workScheduleService from '../../services/workScheduleService';

const ShiftChangeRequestModal = ({ visible, onClose, type = 'REQUEST', onSuccess }) => {
    const [form] = Form.useForm();
    const [shifts, setShifts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [schedule, setSchedule] = useState(null);
    useEffect(() => {
        const loadEmployees = async () => {
            if (visible && (type === 'ASSIGN' || type === 'DIRECT_ASSIGN' || type === 'DEFAULT')) {
                const departmentId = authService.getDepartmentId();

                try {
                    let data;

                    if (authService.hasRole('SUPERADMIN')) {
                        data = await employeeService.getAllEmployees();
                    } else {
                        data = await employeeService.getEmployeesByDepartment(departmentId, null);
                    }

                    setEmployees(data);
                } catch (err) {
                    message.error('Không thể tải danh sách nhân viên: ' + err.message);
                }
            }
        };

        loadEmployees();
    }, [visible, type]);

    useEffect(() => {
        shiftService
            .getAllShifts()
            .then(setShifts)
            .catch(() => message.error('Không thể tải danh sách ca'));
    }, []);

    const handleDateChange = async (date) => {
        if (!date) return;

        try {
            const employeeId = type === 'REQUEST' ? authService.getEmployeeId() : form.getFieldValue('employee');

            if (!employeeId) return;

            const data = await workScheduleService.getDailySchedule(employeeId, date.format('YYYY-MM-DD'));

            setSchedule(data);
        } catch (error) {
            message.error('Không thể lấy lịch làm việc ngày này');
        }
    };

    const handleSelectEmployee = () => {
        const date = form.getFieldValue('date');
        if (date) handleDateChange(date);
    };

    const handleRequestSubmit = async (values) => {
        const workDate = values.date.format('YYYY-MM-DD');

        const requestedShift = shifts.find((s) => s.shiftCode === values.requestedShift);

        await shiftChangeService.createRequest({
            employeeId: authService.getEmployeeId(),
            currentShiftId: schedule.shift.id,
            requestedShiftId: requestedShift.id,
            workDate,
            reason: values.reason,
        });

        message.success('Gửi đơn đổi ca thành công!');
    };

    const handleDirectAssignSubmit = async (values) => {
        const workDate = values.date.format('YYYY-MM-DD');

        const requestedShift = shifts.find((s) => s.shiftCode === values.requestedShift);

        await shiftChangeService.directAssignShiftChange({
            managerId: authService.getEmployeeId(),
            employeeId: values.employee,
            currentShiftId: schedule.shift.id,
            requestedShiftId: requestedShift.id,
            workDate,
            reason: values.reason,
        });

        message.success('Chỉ định đổi ca thành công!');
    };

    const handleUpdateDefault = async (values) => {
        const workDate = values.date.format('YYYY-MM-DD');

        const requestedShift = shifts.find((s) => s.shiftCode === values.requestedShift);

        await workScheduleService.updateSchedulesOnce(values.employee, workDate, requestedShift.id);

        message.success('Đổi ca không thông báo nhân viên thành công!');
    };

    const handleSubmit = async (values) => {
        try {
            if (type === 'DIRECT_ASSIGN') {
                await handleDirectAssignSubmit(values);
            } else if (type === 'REQUEST') {
                await handleRequestSubmit(values);
            } else {
                await handleUpdateDefault(values);
            }

            form.resetFields();
            setSchedule(null);
            onClose();
            onSuccess && onSuccess();
        } catch (error) {
            message.error(error.message);
        }
    };

    return (
        <Modal
            title={
                type === 'ASSIGN' ? 'Phân công đổi ca' : type === 'DIRECT_ASSIGN' ? 'Chỉ định đổi ca' : 'Đơn xin đổi ca'
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            destroyOnClose
        >
            <Form layout="vertical" form={form} onFinish={handleSubmit}>
                {(type === 'ASSIGN' || type === 'DIRECT_ASSIGN' || type === 'DEFAULT') && (
                    <Form.Item
                        name="employee"
                        label="Nhân viên"
                        rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
                        onChange={handleDateChange}
                    >
                        <Select
                            placeholder="Chọn nhân viên"
                            onChange={handleSelectEmployee}
                            showSearch
                            allowClear
                            optionFilterProp="children"
                        >
                            {employees.map((emp) => (
                                <Select.Option key={emp.id} value={emp.id}>
                                    {emp.name} ({emp.code})
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}

                <Form.Item
                    name="date"
                    label="Chọn ngày muốn đổi ca"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                >
                    <DatePicker format="DD-MM-YYYY" style={{ width: '100%' }} onChange={handleDateChange} />
                </Form.Item>

                {schedule && (
                    <div style={{ marginBottom: 12, color: '#555' }}>
                        🕒 Ca hiện tại:
                        <b> {schedule.shift.shiftCode}</b> – {schedule.shift.description}
                    </div>
                )}

                <Form.Item
                    name="requestedShift"
                    label="Ca muốn đổi sang"
                    rules={[{ required: true, message: 'Vui lòng chọn ca muốn đổi' }]}
                >
                    <Select placeholder="Chọn ca mới">
                        {shifts.map((s) => (
                            <Select.Option key={s.id} value={s.shiftCode}>
                                {s.shiftCode}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {type !== 'DEFAULT' && (
                    <Form.Item
                        name="reason"
                        label="Lý do đổi ca"
                        rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
                    >
                        <TextArea rows={3} placeholder="Nhập lý do..." />
                    </Form.Item>
                )}

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        {type === 'DIRECT_ASSIGN' ? (type === 'DEFAULT' ? 'Đổi ca' : 'Chỉ định') : 'Gửi đơn đổi ca'}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ShiftChangeRequestModal;
