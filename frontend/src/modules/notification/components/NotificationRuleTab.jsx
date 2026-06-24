import React, { useEffect, useState } from 'react';
import { Table, Button, message, Modal, Form, Select, Input, Space, Popconfirm, Tag, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import notificationRuleService from '~/modules/notification/services/notificationRuleService';
import departmentService from '~/modules/department/services/departmentService';
import roleService from '~/modules/authorization/services/roleService';
import employeeService from '~/modules/employee/services/employeeService';
import notificationService from '../services/notificationService';

const { Option } = Select;

const NotificationRuleTab = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [eventCodeOptions, setEventCodeOptions] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchRules();
        fetchEvents();
        fetchDepartments();
        fetchRoles();
        fetchEmployees();
    }, []);

    const fetchRules = async () => {
        try {
            setLoading(true);
            const data = await notificationRuleService.getAllRules();
            setRules(data);
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            const data = await notificationService.getAllEvents();
            const options = data.map((event) => ({
                value: event.code,
                label: event.description,
            }));
            setEventCodeOptions(options);
        } catch (error) {}
    };

    const fetchDepartments = async () => {
        try {
            const data = await departmentService.getRootDepartments();
            setDepartments(data);
        } catch (error) {}
    };

    const fetchRoles = async () => {
        try {
            const data = await roleService.getAllRoles();
            setRoles(data);
        } catch (error) {
            message.error(error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const data = await employeeService.getAllEmployees();
            setEmployees(data);
        } catch (error) {
            message.error(error);
        }
    };

    const handleEdit = (record) => {
        setEditingRule(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await notificationRuleService.deleteRule(id);
            message.success('Xóa quy tắc thành công');
            fetchRules();
        } catch (error) {
            message.error(error.message);
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            if (editingRule) {
                await notificationRuleService.updateRule(editingRule.id, values);
                message.success('Cập nhật quy tắc thành công');
            } else {
                await notificationRuleService.createRule(values);
                message.success('Tạo quy tắc thành công');
            }
            setModalVisible(false);
            fetchRules();
        } catch (error) {
            message.error(error.message);
        }
    };

    const targetTypeOptions = [
        { value: 'DEPARTMENT', label: 'Phòng ban' },
        { value: 'ROLE', label: 'Vai trò' },
        { value: 'USER', label: 'Người dùng' },
        { value: 'ALL', label: 'Tất cả' },
        { value: 'APPROVAL_LEVEL', label: 'Cấp phê duyệt' },
        { value: 'DYNAMIC', label: 'Động' },
    ];

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            align: 'center',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Sự kiện',
            dataIndex: 'eventCode',
            key: 'eventCode',
            render: (eventCode) => {
                const event = eventCodeOptions.find((e) => e.value === eventCode);
                return <>{event?.label || eventCode}</>;
            },
        },
        {
            title: 'Loại đối tượng',
            dataIndex: 'targetType',
            key: 'targetType',
            render: (targetType) => {
                const colors = {
                    DEPARTMENT: 'geekblue',
                    ROLE: 'purple',
                    USER: 'cyan',
                    ALL: 'green',
                    APPROVAL_LEVEL: 'orange',
                };
                const type = targetTypeOptions.find((t) => t.value === targetType);
                return (
                    <Tag color={colors[targetType]} className="font-medium">
                        {type?.label || targetType}
                    </Tag>
                );
            },
        },
        {
            title: 'Giá trị đích',
            dataIndex: 'targetValue',
            key: 'targetValue',
            render: (value, record) => {
                if (record.targetType === 'ALL') {
                    return '-';
                }

                if (!value) return '-';

                const values = value
                    .split(',')
                    .map((v) => v.trim())
                    .filter(Boolean);

                if (record.targetType === 'DEPARTMENT') {
                    return (
                        <div className="flex flex-wrap gap-1">
                            {values.map((val, idx) => {
                                const dept = departments
                                    .flatMap((d) => [d, ...(d.subDepartments || [])])
                                    .find((d) => d.id === parseInt(val));
                                return (
                                    <Tag key={idx} color="blue">
                                        {dept?.name || val}
                                    </Tag>
                                );
                            })}
                        </div>
                    );
                } else if (record.targetType === 'ROLE') {
                    return (
                        <div className="flex flex-wrap gap-1">
                            {values.map((val, idx) => {
                                const role = roles.find((r) => r.code === val);
                                return (
                                    <Tag key={idx} color="purple">
                                        {role?.description || val}
                                    </Tag>
                                );
                            })}
                        </div>
                    );
                } else if (record.targetType === 'USER') {
                    return (
                        <div className="flex flex-wrap gap-1">
                            {values.map((val, idx) => {
                                const emp = employees.find((e) => e.id === parseInt(val));
                                return (
                                    <Tag key={idx} color="cyan">
                                        {emp ? `${emp.code} - ${emp.name}` : val}
                                    </Tag>
                                );
                            })}
                        </div>
                    );
                }
                return value;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            align: 'center',
            width: 120,
            render: (isActive) => (
                <Tag color={isActive ? 'success' : 'default'} className="font-medium">
                    {isActive ? 'Hoạt động' : 'Tạm dừng'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'actions',
            align: 'center',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm
                        title="Xóa quy tắc này?"
                        description="Bạn có chắc muốn xóa quy tắc này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okType="danger"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Quy tắc thông báo ({rules.length})
                </h3>
            </div>

            <Table
                columns={columns}
                dataSource={rules}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} quy tắc`,
                }}
                bordered
                className="bg-white dark:bg-slate-800 rounded-lg"
            />

            <Modal
                title={editingRule ? 'Chỉnh sửa quy tắc' : 'Thêm quy tắc mới'}
                open={modalVisible}
                onOk={handleSave}
                onCancel={() => setModalVisible(false)}
                width={600}
                okText={editingRule ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="eventCode"
                        label="Sự kiện"
                        rules={[{ required: true, message: 'Vui lòng chọn sự kiện' }]}
                    >
                        <Select placeholder="Chọn sự kiện">
                            {eventCodeOptions.map((opt) => (
                                <Option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="targetType"
                        label="Loại đối tượng"
                        rules={[{ required: true, message: 'Vui lòng chọn loại đối tượng' }]}
                    >
                        <Select
                            placeholder="Chọn loại đối tượng"
                            onChange={(value) => {
                                if (value === 'ALL') {
                                    form.setFieldsValue({ targetValue: null });
                                }
                            }}
                        >
                            {targetTypeOptions.map((opt) => (
                                <Option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate={(prev, curr) => prev.targetType !== curr.targetType}>
                        {({ getFieldValue }) => {
                            const targetType = getFieldValue('targetType');
                            if (targetType === 'ALL') return null;

                            if (targetType === 'DEPARTMENT') {
                                return (
                                    <Form.Item
                                        name="targetValue"
                                        label="Phòng ban (có thể chọn nhiều)"
                                        rules={[{ required: true, message: 'Vui lòng chọn ít nhất một phòng ban' }]}
                                        getValueFromEvent={(value) => (Array.isArray(value) ? value.join(',') : value)}
                                        getValueProps={(value) => ({
                                            value: value ? value.split(',').map((v) => v.trim()) : [],
                                        })}
                                    >
                                        <Select
                                            mode="multiple"
                                            placeholder="Chọn một hoặc nhiều phòng ban"
                                            showSearch
                                            optionFilterProp="children"
                                            maxTagCount="responsive"
                                        >
                                            {departments.flatMap((dept) => [
                                                <Option key={dept.id} value={String(dept.code)}>
                                                    {dept.code}
                                                </Option>,
                                                ...(dept.subDepartments || []).map((sub) => (
                                                    <Option key={sub.id} value={String(sub.code)}>
                                                        └─ {sub.code}
                                                    </Option>
                                                )),
                                            ])}
                                        </Select>
                                    </Form.Item>
                                );
                            }

                            if (targetType === 'ROLE') {
                                return (
                                    <Form.Item
                                        name="targetValue"
                                        label="Vai trò (có thể chọn nhiều)"
                                        rules={[{ required: true, message: 'Vui lòng chọn ít nhất một vai trò' }]}
                                        getValueFromEvent={(value) => (Array.isArray(value) ? value.join(',') : value)}
                                        getValueProps={(value) => ({
                                            value: value ? value.split(',').map((v) => v.trim()) : [],
                                        })}
                                    >
                                        <Select
                                            mode="multiple"
                                            placeholder="Chọn một hoặc nhiều vai trò"
                                            maxTagCount="responsive"
                                        >
                                            {roles.map((role) => (
                                                <Option key={role.code} value={role.code}>
                                                    {role.description}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                );
                            }

                            if (targetType === 'USER') {
                                return (
                                    <Form.Item
                                        name="targetValue"
                                        label="Nhân viên (có thể chọn nhiều)"
                                        rules={[{ required: true, message: 'Vui lòng chọn ít nhất một nhân viên' }]}
                                        getValueFromEvent={(value) => (Array.isArray(value) ? value.join(',') : value)}
                                        getValueProps={(value) => ({
                                            value: value ? value.split(',').map((v) => v.trim()) : [],
                                        })}
                                    >
                                        <Select
                                            mode="multiple"
                                            placeholder="Chọn một hoặc nhiều nhân viên"
                                            showSearch
                                            optionFilterProp="children"
                                            maxTagCount="responsive"
                                        >
                                            {employees.map((emp) => (
                                                <Option key={emp.id} value={String(emp.id)}>
                                                    {emp.code} - {emp.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                );
                            }

                            return null;
                        }}
                    </Form.Item>

                    <Form.Item name="isActive" label="Trạng thái" valuePropName="checked" initialValue={true}>
                        <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default NotificationRuleTab;
