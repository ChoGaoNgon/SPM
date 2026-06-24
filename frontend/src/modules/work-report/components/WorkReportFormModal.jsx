import { UploadOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, message, Modal, Radio, Select, Upload } from 'antd';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import authService from '~/modules/auth/services/authService';

dayjs.extend(utc);
dayjs.extend(timezone);

const WorkReportFormModal = ({
    visible,
    submitting,
    onCancel,
    onSubmit,
    form,
    editingRecord,
    employees,
    canSelectEmployee,
}) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];

    const handleBeforeUpload = (file) => {
        const isAllowedType = allowedTypes.includes(file.type);
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isAllowedType) {
            message.error('Chỉ cho phép định dạng PDF, PNG, hoặc JPG!');
        }

        if (!isLt2M) {
            message.error('Dung lượng file không được vượt quá 2MB!');
        }

        return (isAllowedType && isLt2M) || Upload.LIST_IGNORE;
    };

    const disabledDate = () => false;

    return (
        <Modal
            title={editingRecord ? 'Cập nhật công việc' : 'Thêm công việc'}
            confirmLoading={submitting}
            open={visible}
            onOk={onSubmit}
            onCancel={onCancel}
            okText="Lưu"
            cancelText="Hủy"
        >
            <Form
                layout="vertical"
                form={form}
                onValuesChange={(changedValues, allValues) => {
                    if (changedValues.taskType) {
                        const typeLabel = changedValues.taskType;
                        const currentDescription = allValues.taskDescription || '';

                        const newDescription = currentDescription.replace(/^\((PS|ST|BD|K)\)\s*/, '');

                        form.setFieldsValue({
                            taskDescription: `(${typeLabel}) ${newDescription}`,
                        });
                    }
                }}
            >
                {!editingRecord && canSelectEmployee && Array.isArray(employees) && employees.length > 0 && (
                    <Form.Item
                        label="Nhân viên"
                        name="employeeId"
                        rules={[{ required: true, message: 'Vui lòng chọn nhân viên!' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Chọn nhân viên"
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={employees.map((emp) => ({
                                label: `${emp.name} (${emp.code})`,
                                value: emp.id,
                            }))}
                        />
                    </Form.Item>
                )}

                <Form.Item
                    label="Thời gian bắt đầu"
                    name="startDateTime"
                    rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu!' }]}
                >
                    <DatePicker
                        showTime={{
                            format: 'HH:mm',
                            minuteStep: 5,
                        }}
                        format="DD/MM/YYYY HH:mm"
                        style={{ width: '100%' }}
                        placeholder="Chọn ngày và giờ bắt đầu"
                        disabledDate={disabledDate}
                        showNow={false}
                        getPopupContainer={(trigger) => trigger.parentElement}
                    />
                </Form.Item>

                <Form.Item
                    label="Thời gian kết thúc"
                    name="endDateTime"
                    dependencies={['startDateTime']}
                    rules={[
                        { required: true, message: 'Vui lòng chọn thời gian kết thúc!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const start = getFieldValue('startDateTime');
                                if (!start || !value) return Promise.resolve();
                                if (value.isAfter(start)) return Promise.resolve();
                                return Promise.reject(new Error('Thời gian kết thúc phải sau thời gian bắt đầu'));
                            },
                        }),
                    ]}
                >
                    <DatePicker
                        showTime={{
                            format: 'HH:mm',
                            minuteStep: 5,
                        }}
                        format="DD/MM/YYYY HH:mm"
                        style={{ width: '100%' }}
                        placeholder="Chọn ngày và giờ kết thúc"
                        disabledDate={disabledDate}
                        showNow={false}
                        getPopupContainer={(trigger) => trigger.parentElement}
                    />
                </Form.Item>

                <Form.Item
                    name="taskDescription"
                    label="Mô tả công việc"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả công việc!' }]}
                >
                    <Input.TextArea rows={3} placeholder="Nhập nội dung công việc..." />
                </Form.Item>

                <Form.Item
                    name="upload"
                    label="Tải lên ảnh hoặc file (tùy chọn)"
                    valuePropName="fileList"
                    normalize={(value) => (Array.isArray(value) ? value : value?.fileList)}
                >
                    <Upload
                        beforeUpload={handleBeforeUpload}
                        maxCount={1}
                        listType="picture"
                        accept=".png,.jpg,.jpeg,.pdf"
                        customRequest={({ onSuccess }) => {
                            setTimeout(() => {
                                onSuccess('ok');
                            }, 0);
                        }}
                    >
                        <Button icon={<UploadOutlined />}>Chọn file</Button>
                    </Upload>
                </Form.Item>

                {authService.hasDepartmentCode('KTL') && (
                    <Form.Item
                        name="taskType"
                        label="Loại công việc"
                        rules={[{ required: true, message: 'Vui lòng chọn loại công việc!' }]}
                    >
                        <Radio.Group>
                            <Radio value="PS">Phát sinh (PS)</Radio>
                            <Radio value="ST">Setup (ST)</Radio>
                            <Radio value="BD">Bảo dưỡng (BD)</Radio>
                            <Radio value="K">Khác (K)</Radio>
                        </Radio.Group>
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};

export default WorkReportFormModal;
