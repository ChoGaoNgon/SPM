import { BellOutlined, DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import {
    Badge,
    Button,
    Card,
    Divider,
    Empty,
    Form,
    Input,
    Modal,
    Popconfirm,
    Select,
    Space,
    Switch,
    Table,
    Tag,
    Tooltip,
    Typography,
    message,
} from 'antd';
import { useState } from 'react';
import notificationRuleService from '../services/notificationRuleService';
import notificationTemplateService from '../services/notificationTemplateService';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const TARGET_TYPE_OPTIONS = [
    { value: 'DEPARTMENT', label: 'Phòng ban', color: 'geekblue' },
    { value: 'ROLE', label: 'Vai trò', color: 'purple' },
    { value: 'USER', label: 'Người dùng', color: 'cyan' },
    { value: 'ALL', label: 'Tất cả', color: 'green' },
    { value: 'APPROVAL_LEVEL', label: 'Cấp phê duyệt', color: 'orange' },
    { value: 'DYNAMIC', label: 'Động', color: 'magenta' },
];

const TYPE_COLORS = {
    ATTENDANCE: 'geekblue',
    NEW_MODEL: 'purple',
    APPROVAL: 'orange',
    OVERTIME: 'red',
    SHIFT_CHANGE: 'cyan',
    SYSTEM_FEEDBACK: 'green',
    SYSTEM: 'default',
};

const TemplateSection = ({ event, templates, notificationTypes, onRefresh }) => {
    const [templateModalVisible, setTemplateModalVisible] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();
    const hasTemplate = templates.length > 0;

    const openAdd = () => {
        setEditingTemplate(null);
        form.resetFields();
        form.setFieldsValue({ eventCode: event.code, isActive: true });
        setTemplateModalVisible(true);
    };

    const openEdit = (record) => {
        setEditingTemplate(record);
        form.setFieldsValue(record);
        setTemplateModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await notificationTemplateService.deleteTemplate(id);
            message.success('Xóa mẫu thông báo thành công');
            onRefresh();
        } catch (error) {
            message.error(error.message);
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);
            if (editingTemplate) {
                await notificationTemplateService.updateTemplate(editingTemplate.id, values);
                message.success('Cập nhật mẫu thông báo thành công');
            } else {
                await notificationTemplateService.createTemplate(values);
                message.success('Tạo mẫu thông báo thành công');
            }
            setTemplateModalVisible(false);
            onRefresh();
        } catch (error) {
            if (error?.errorFields) return;
            message.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <Space>
                    <BellOutlined className="text-blue-500" />
                    <Title level={5} className="!mb-0">
                        Template thông báo
                    </Title>
                    <Badge count={templates.length} showZero color="#6366f1" />
                </Space>
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openAdd} disabled={hasTemplate}>
                    Thêm template
                </Button>
            </div>
            {hasTemplate && (
                <Text type="secondary" className="text-xs">
                    Mỗi sự kiện chỉ có 1 template. Hãy dùng nút chỉnh sửa để cập nhật.
                </Text>
            )}

            {templates.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có template nào cho sự kiện này"
                    className="py-6"
                />
            ) : (
                <div className="grid gap-3">
                    {templates.map((tpl) => {
                        const notifType = notificationTypes.find((t) => t.value === tpl.notificationType);
                        return (
                            <Card
                                key={tpl.id}
                                size="small"
                                className="border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-colors"
                                extra={
                                    <Space>
                                        <Tooltip title="Xem trước">
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<EyeOutlined />}
                                                onClick={() => {
                                                    setPreviewData(tpl);
                                                    setPreviewVisible(true);
                                                }}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Chỉnh sửa">
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<EditOutlined />}
                                                onClick={() => openEdit(tpl)}
                                            />
                                        </Tooltip>
                                        <Popconfirm
                                            title="Xóa mẫu này?"
                                            description="Bạn có chắc muốn xóa mẫu thông báo này?"
                                            onConfirm={() => handleDelete(tpl.id)}
                                            okText="Xóa"
                                            cancelText="Hủy"
                                            okType="danger"
                                        >
                                            <Tooltip title="Xóa">
                                                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                                            </Tooltip>
                                        </Popconfirm>
                                    </Space>
                                }
                            >
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Tag color={TYPE_COLORS[tpl.notificationType] || 'default'}>
                                            {notifType?.label || tpl.notificationType}
                                        </Tag>
                                        <Tag color={tpl.isActive ? 'success' : 'default'}>
                                            {tpl.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                        </Tag>
                                    </div>
                                    <Text strong className="text-slate-800 dark:text-slate-100">
                                        {tpl.titleTemplate}
                                    </Text>
                                    <Text
                                        type="secondary"
                                        className="text-sm line-clamp-2"
                                        style={{ whiteSpace: 'pre-line' }}
                                    >
                                        {tpl.messageTemplate}
                                    </Text>
                                    {tpl.urlTemplate && (
                                        <Text type="secondary" className="text-xs text-blue-400">
                                            🔗 {tpl.urlTemplate}
                                        </Text>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Modal
                title={editingTemplate ? 'Chỉnh sửa template thông báo' : 'Thêm template thông báo'}
                open={templateModalVisible}
                onOk={handleSave}
                onCancel={() => setTemplateModalVisible(false)}
                width={680}
                okText={editingTemplate ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
                confirmLoading={saving}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item name="eventCode" hidden>
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="notificationType"
                        label="Loại thông báo"
                        rules={[{ required: true, message: 'Vui lòng chọn loại thông báo' }]}
                    >
                        <Select placeholder="Chọn loại thông báo">
                            {notificationTypes.map((opt) => (
                                <Option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="titleTemplate"
                        label="Tiêu đề (có thể dùng {biến})"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tiêu đề' },
                            { max: 200, message: 'Không vượt quá 200 ký tự' },
                        ]}
                    >
                        <Input placeholder="Ví dụ: New Model {modelName} đã được tạo" />
                    </Form.Item>

                    <Form.Item
                        name="messageTemplate"
                        label="Nội dung thông báo (có thể dùng {biến})"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Ví dụ: New Model {modelName} đã được tạo bởi {creatorName} vào {createdAt}"
                        />
                    </Form.Item>

                    <Form.Item name="urlTemplate" label="URL điều hướng (có thể dùng {biến})">
                        <Input placeholder="Ví dụ: /product-manager/models/{modelId}" />
                    </Form.Item>

                    <Form.Item name="isActive" label="Trạng thái" valuePropName="checked" initialValue={true}>
                        <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Xem trước template"
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setPreviewVisible(false)}>
                        Đóng
                    </Button>,
                ]}
                width={600}
            >
                {previewData && (
                    <div className="space-y-4 mt-2">
                        <div className="flex gap-2 flex-wrap">
                            <Tag color={TYPE_COLORS[previewData.notificationType] || 'default'}>
                                {notificationTypes.find((t) => t.value === previewData.notificationType)?.label ||
                                    previewData.notificationType}
                            </Tag>
                            <Tag color={previewData.isActive ? 'success' : 'default'}>
                                {previewData.isActive ? 'Hoạt động' : 'Tạm dừng'}
                            </Tag>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <Text className="text-xs text-slate-500 uppercase tracking-wide">Tiêu đề</Text>
                            <p className="text-slate-800 dark:text-slate-100 font-semibold text-base mt-1">
                                {previewData.titleTemplate}
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                            <Text className="text-xs text-slate-500 uppercase tracking-wide">Nội dung</Text>
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap mt-1">
                                {previewData.messageTemplate}
                            </p>
                        </div>
                        {previewData.urlTemplate && (
                            <div>
                                <Text className="text-xs text-slate-500 uppercase tracking-wide">URL</Text>
                                <p className="text-blue-500 break-all mt-1">{previewData.urlTemplate}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

const RulesSection = ({ event, rules, departments, roles, employees, onRefresh }) => {
    const [ruleModalVisible, setRuleModalVisible] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();
    const hasRule = rules.length > 0;

    const openAdd = () => {
        setEditingRule(null);
        form.resetFields();
        form.setFieldsValue({ eventCode: event.code, isActive: true });
        setRuleModalVisible(true);
    };

    const openEdit = (record) => {
        setEditingRule(record);
        form.setFieldsValue(record);
        setRuleModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await notificationRuleService.deleteRule(id);
            message.success('Xóa quy tắc thành công');
            onRefresh();
        } catch (error) {
            message.error(error.message);
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);
            if (editingRule) {
                await notificationRuleService.updateRule(editingRule.id, values);
                message.success('Cập nhật quy tắc thành công');
            } else {
                await notificationRuleService.createRule(values);
                message.success('Tạo quy tắc thành công');
            }
            setRuleModalVisible(false);
            onRefresh();
        } catch (error) {
            if (error?.errorFields) return;
            message.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const renderTargetValue = (value, record) => {
        if (record.targetType === 'ALL' || !value) return <Text type="secondary">—</Text>;

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
                            .find((d) => String(d.id) === val || d.code === val);
                        return (
                            <Tag key={idx} color="geekblue">
                                {dept?.name || dept?.code || val}
                            </Tag>
                        );
                    })}
                </div>
            );
        }
        if (record.targetType === 'ROLE') {
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
        }
        if (record.targetType === 'USER') {
            return (
                <div className="flex flex-wrap gap-1">
                    {values.map((val, idx) => {
                        const emp = employees.find((e) => String(e.id) === val);
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
    };

    const columns = [
        {
            title: 'Loại đối tượng',
            dataIndex: 'targetType',
            key: 'targetType',
            width: 130,
            render: (targetType) => {
                const opt = TARGET_TYPE_OPTIONS.find((t) => t.value === targetType);
                return (
                    <Tag color={opt?.color || 'default'} className="font-medium">
                        {opt?.label || targetType}
                    </Tag>
                );
            },
        },
        {
            title: 'Đối tượng nhận',
            dataIndex: 'targetValue',
            key: 'targetValue',
            render: (value, record) => renderTargetValue(value, record),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            align: 'center',
            width: 110,
            render: (isActive) => (
                <Tag color={isActive ? 'success' : 'default'}>{isActive ? 'Hoạt động' : 'Tạm dừng'}</Tag>
            ),
        },
        {
            title: '',
            key: 'actions',
            align: 'center',
            width: 90,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa quy tắc này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okType="danger"
                    >
                        <Tooltip title="Xóa">
                            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <Space>
                    <TeamOutlined className="text-purple-500" />
                    <Title level={5} className="!mb-0">
                        Quy tắc gửi thông báo
                    </Title>
                    <Badge count={rules.length} showZero color="#8b5cf6" />
                </Space>
                <Button type="default" size="small" icon={<PlusOutlined />} onClick={openAdd} disabled={hasRule}>
                    Thêm quy tắc
                </Button>
            </div>
            {hasRule && (
                <Text type="secondary" className="text-xs">
                    Mỗi sự kiện chỉ có 1 rule. Hãy dùng nút chỉnh sửa để cập nhật.
                </Text>
            )}

            {rules.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có quy tắc nào cho sự kiện này"
                    className="py-6"
                />
            ) : (
                <Table
                    columns={columns}
                    dataSource={rules}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    bordered
                    className="bg-white dark:bg-slate-800 rounded-lg"
                />
            )}

            <Modal
                title={editingRule ? 'Chỉnh sửa quy tắc' : 'Thêm quy tắc gửi thông báo'}
                open={ruleModalVisible}
                onOk={handleSave}
                onCancel={() => setRuleModalVisible(false)}
                width={580}
                okText={editingRule ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
                confirmLoading={saving}
                destroyOnClose
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item name="eventCode" hidden>
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="targetType"
                        label="Loại đối tượng nhận thông báo"
                        rules={[{ required: true, message: 'Vui lòng chọn loại đối tượng' }]}
                    >
                        <Select
                            placeholder="Chọn loại đối tượng"
                            onChange={() => form.setFieldsValue({ targetValue: undefined })}
                        >
                            {TARGET_TYPE_OPTIONS.map((opt) => (
                                <Option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate={(prev, curr) => prev.targetType !== curr.targetType}>
                        {({ getFieldValue }) => {
                            const targetType = getFieldValue('targetType');
                            if (
                                !targetType ||
                                targetType === 'ALL' ||
                                targetType === 'DYNAMIC' ||
                                targetType === 'APPROVAL_LEVEL'
                            )
                                return null;

                            if (targetType === 'DEPARTMENT') {
                                return (
                                    <Form.Item
                                        name="targetValue"
                                        label="Phòng ban (có thể chọn nhiều)"
                                        rules={[{ required: true, message: 'Vui lòng chọn ít nhất một phòng ban' }]}
                                        getValueFromEvent={(v) => (Array.isArray(v) ? v.join(',') : v)}
                                        getValueProps={(v) => ({ value: v ? v.split(',').map((s) => s.trim()) : [] })}
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
                                                    {dept.name || dept.code}
                                                </Option>,
                                                ...(dept.subDepartments || []).map((sub) => (
                                                    <Option key={sub.id} value={String(sub.code)}>
                                                        └─ {sub.name || sub.code}
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
                                        getValueFromEvent={(v) => (Array.isArray(v) ? v.join(',') : v)}
                                        getValueProps={(v) => ({ value: v ? v.split(',').map((s) => s.trim()) : [] })}
                                    >
                                        <Select mode="multiple" placeholder="Chọn vai trò" maxTagCount="responsive">
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
                                        getValueFromEvent={(v) => (Array.isArray(v) ? v.join(',') : v)}
                                        getValueProps={(v) => ({ value: v ? v.split(',').map((s) => s.trim()) : [] })}
                                    >
                                        <Select
                                            mode="multiple"
                                            placeholder="Chọn nhân viên"
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

const EventDetailPanel = ({ event, templates, rules, notificationTypes, departments, roles, employees, onRefresh }) => {
    if (!event) {
        return (
            <div className="flex items-center justify-center h-full min-h-64">
                <Empty description="Chọn một sự kiện bên trái để xem cấu hình" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
        );
    }

    const eventTemplates = templates.filter((t) => t.eventCode === event.code);
    const eventRules = rules.filter((r) => r.eventCode === event.code);

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <BellOutlined className="text-white text-lg" />
                    </div>
                    <div>
                        <Title level={4} className="!mb-0 text-slate-800 dark:text-slate-100">
                            {event.description || event.code}
                        </Title>
                        <Text type="secondary" className="text-sm font-mono">
                            {event.code}
                        </Text>
                    </div>
                </div>
            </div>

            <Card
                size="small"
                className="border border-slate-200 dark:border-slate-700"
                bodyStyle={{ padding: '16px' }}
            >
                <TemplateSection
                    event={event}
                    templates={eventTemplates}
                    notificationTypes={notificationTypes}
                    onRefresh={onRefresh}
                />
            </Card>

            <Divider className="my-0" />

            <Card
                size="small"
                className="border border-slate-200 dark:border-slate-700"
                bodyStyle={{ padding: '16px' }}
            >
                <RulesSection
                    event={event}
                    rules={eventRules}
                    departments={departments}
                    roles={roles}
                    employees={employees}
                    onRefresh={onRefresh}
                />
            </Card>
        </div>
    );
};

export default EventDetailPanel;
