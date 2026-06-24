import { SendOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, message, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import employeeService from '~/modules/employee/services/employeeService';
import systemFeedbackService from '../services/systemFeedbackService';

const { Option } = Select;
const { TextArea } = Input;

const priorityOptions = [
    { value: 'LOW', label: 'Thấp' },
    { value: 'MEDIUM', label: 'Trung bình' },
    { value: 'HIGH', label: 'Cao' },
];

const statusOptions = [
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'IN_PROGRESS', label: 'Đang xử lý' },
    { value: 'DONE', label: 'Hoàn thành' },
    { value: 'REJECTED', label: 'Từ chối' },
];

const toDayjs = (value) => (value ? dayjs(value) : null);
const toIsoDateTime = (value) => (value ? dayjs(value).format('YYYY-MM-DDTHH:mm:ss') : null);

const SystemFeedbackAssignModal = ({
    open = false,
    initialValues = null,
    onCancel = () => {},
    onSuccess = () => {},
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await employeeService.getEmployeesByDepartment(null, 'IT');
                setEmployees(data || []);
            } catch (err) {
            }
        };
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (open && initialValues) {
            form.setFieldsValue({
                assignToEmployeeId: initialValues.assignToEmployeeId || initialValues.assignToEmployee?.id || null,
                priority: initialValues.priority || null,
                status: initialValues.status || null,
                startTime: toDayjs(initialValues.startTime),
                endTime: toDayjs(initialValues.endTime),
                remark: initialValues.remark || '',
            });
        } else {
            form.resetFields();
        }
    }, [open, initialValues, form]);

    const handleSubmit = async (values) => {
        if (!initialValues || !initialValues.id) {
            message.error('Không có góp ý để phân công');
            return;
        }
        setLoading(true);
        try {
            await systemFeedbackService.assignSystemFeedback(initialValues.id, {
                assignToEmployeeId: values.assignToEmployeeId,
                priority: values.priority,
                status: values.status,
                startTime: toIsoDateTime(values.startTime),
                endTime: toIsoDateTime(values.endTime),
                remark: values.remark || '',
            });
            message.success('Phân công thành công');
            onSuccess();
            onCancel();
        } catch (err) {
            message.error(err.message || 'Lỗi khi phân công');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-1.5 sm:p-2 rounded-lg">
                        <SendOutlined className="text-white text-base sm:text-xl" />
                    </div>
                    <span className="text-base sm:text-xl font-semibold text-slate-800">Phân công xử lý góp ý</span>
                </div>
            }
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            footer={null}
            width="95%"
            style={{ maxWidth: 600, top: 20 }}
            centered={false}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4 sm:mt-6">
                <Form.Item
                    name="assignToEmployeeId"
                    label={<span className="font-semibold text-slate-700 text-sm sm:text-base">Gán cho</span>}
                    rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
                >
                    <Select
                        showSearch
                        placeholder="Chọn nhân viên"
                        optionFilterProp="children"
                        allowClear
                        className="rounded-lg"
                    >
                        {employees.map((e) => (
                            <Option key={e.id} value={e.id}>
                                {e.name} ({e.code})
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="priority"
                    label={<span className="font-semibold text-slate-700 text-sm sm:text-base">Độ ưu tiên</span>}
                    rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên' }]}
                >
                    <Select placeholder="Chọn độ ưu tiên" allowClear className="rounded-lg">
                        {priorityOptions.map((p) => (
                            <Option key={p.value} value={p.value}>
                                {p.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="status"
                    label={<span className="font-semibold text-slate-700 text-sm sm:text-base">Trạng thái</span>}
                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                >
                    <Select placeholder="Chọn trạng thái" allowClear className="rounded-lg">
                        {statusOptions.map((s) => (
                            <Option key={s.value} value={s.value}>
                                {s.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Form.Item
                        name="startTime"
                        label={<span className="font-semibold text-slate-700 text-sm sm:text-base">Ngày bắt đầu</span>}
                    >
                        <DatePicker
                            showTime={{ format: 'HH:mm' }}
                            format="DD/MM/YYYY HH:mm"
                            className="w-full rounded-lg"
                            placeholder="Chọn ngày bắt đầu"
                        />
                    </Form.Item>

                    <Form.Item
                        name="endTime"
                        label={<span className="font-semibold text-slate-700 text-sm sm:text-base">Ngày kết thúc</span>}
                    >
                        <DatePicker
                            showTime={{ format: 'HH:mm' }}
                            format="DD/MM/YYYY HH:mm"
                            className="w-full rounded-lg"
                            placeholder="Chọn ngày kết thúc"
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    name="remark"
                    label={<span className="font-semibold text-slate-700 text-sm sm:text-base">Ghi chú</span>}
                >
                    <TextArea
                        rows={3}
                        placeholder="Nhập ghi chú xử lý hoặc lưu ý khi phân công"
                        className="rounded-lg"
                    />
                </Form.Item>

                <Form.Item>
                    <div className="flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                        <Button
                            onClick={() => {
                                form.resetFields();
                                onCancel();
                            }}
                            className="rounded-lg"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className="bg-accent-600 hover:bg-accent-700 rounded-lg"
                        >
                            Lưu
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SystemFeedbackAssignModal;
