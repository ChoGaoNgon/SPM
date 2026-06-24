import React, { useEffect, useState } from 'react';
import { Table, Button, message, Modal, Form, Select, Input, Space, Popconfirm, Tag, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import notificationTemplateService from '~/modules/notification/services/notificationTemplateService';
import notificationService from '../services/notificationService';

const { Option } = Select;
const { TextArea } = Input;

const NotificationTemplateTab = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [eventCodeOptions, setEventCodeOptions] = useState([]);
    const [notificationTypeOptions, setNotificationTypeOptions] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchTemplates();
        fetchEvents();
        fetchTypes();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const data = await notificationTemplateService.getAllTemplates();
            setTemplates(data);
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
        } catch (error) {
            message.error(error);
        }
    };

    const fetchTypes = async () => {
        try {
            const data = await notificationService.getAllTypes();
            const options = data.map((type) => ({
                value: type.code,
                label: type.description,
            }));
            setNotificationTypeOptions(options);
        } catch (error) {
            message.error(error);
        }
    };

    const handleAdd = () => {
        setEditingTemplate(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingTemplate(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await notificationTemplateService.deleteTemplate(id);
            message.success('Xóa mẫu thông báo thành công');
            fetchTemplates();
        } catch (error) {
            message.error(error.message);
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            if (editingTemplate) {
                await notificationTemplateService.updateTemplate(editingTemplate.id, values);
                message.success('Cập nhật mẫu thông báo thành công');
            } else {
                await notificationTemplateService.createTemplate(values);
                message.success('Tạo mẫu thông báo thành công');
            }
            setModalVisible(false);
            fetchTemplates();
        } catch (error) {
            message.error(error.message);
        }
    };

    const handlePreview = (record) => {
        setPreviewData(record);
        setPreviewVisible(true);
    };

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
                return (
                    <Tag color="blue" className="font-medium">
                        {event?.label || eventCode}
                    </Tag>
                );
            },
        },
        {
            title: 'Loại thông báo',
            dataIndex: 'notificationType',
            key: 'notificationType',
            render: (type) => {
                const colors = {
                    ATTENDANCE: 'geekblue',
                    NEW_MODEL: 'purple',
                    APPROVAL: 'orange',
                    OVERTIME: 'red',
                    SHIFT_CHANGE: 'cyan',
                    SYSTEM_FEEDBACK: 'green',
                    SYSTEM: 'default',
                };
                const notifType = notificationTypeOptions.find((t) => t.value === type);
                return (
                    <Tag color={colors[type]} className="font-medium">
                        {notifType?.label || type}
                    </Tag>
                );
            },
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'titleTemplate',
            key: 'titleTemplate',
            ellipsis: true,
            render: (text) => <span className="text-slate-700 dark:text-slate-300">{text}</span>,
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
            width: 180,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handlePreview(record)}
                        title="Xem trước"
                    />
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm
                        title="Xóa mẫu này?"
                        description="Bạn có chắc muốn xóa mẫu thông báo này?"
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
                    Mẫu thông báo ({templates.length})
                </h3>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm mẫu
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={templates}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} mẫu`,
                }}
                bordered
                className="bg-white dark:bg-slate-800 rounded-lg"
            />

            <Modal
                title={editingTemplate ? 'Chỉnh sửa mẫu thông báo' : 'Thêm mẫu thông báo mới'}
                open={modalVisible}
                onOk={handleSave}
                onCancel={() => setModalVisible(false)}
                width={700}
                okText={editingTemplate ? 'Cập nhật' : 'Tạo mới'}
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
                        name="notificationType"
                        label="Loại thông báo"
                        rules={[{ required: true, message: 'Vui lòng chọn loại thông báo' }]}
                    >
                        <Select placeholder="Chọn loại thông báo">
                            {notificationTypeOptions.map((opt) => (
                                <Option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="titleTemplate"
                        label="Tiêu đề (có thể sử dụng {biến})"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tiêu đề' },
                            { max: 200, message: 'Tiêu đề không được vượt quá 200 ký tự' },
                        ]}
                    >
                        <Input placeholder="Ví dụ: New Model {modelName} đã được tạo" />
                    </Form.Item>

                    <Form.Item
                        name="messageTemplate"
                        label="Nội dung thông báo (có thể sử dụng {biến})"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Ví dụ: New Model {modelName} đã được tạo bởi {creatorName} vào {createdAt}"
                        />
                    </Form.Item>

                    <Form.Item name="urlTemplate" label="URL (có thể sử dụng {biến})">
                        <Input placeholder="Ví dụ: /product-manager/models/{modelId}" />
                    </Form.Item>

                    <Form.Item name="isActive" label="Trạng thái" valuePropName="checked" initialValue={true}>
                        <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Xem trước mẫu thông báo"
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setPreviewVisible(false)}>
                        Đóng
                    </Button>,
                ]}
                width={700}
            >
                {previewData && (
                    <div className="space-y-4">
                        <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300">Sự kiện:</label>
                            <p className="text-slate-600 dark:text-slate-400">
                                {eventCodeOptions.find((e) => e.value === previewData.eventCode)?.label}
                            </p>
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300">Loại thông báo:</label>
                            <p className="text-slate-600 dark:text-slate-400">
                                {notificationTypeOptions.find((t) => t.value === previewData.notificationType)?.label}
                            </p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                                Tiêu đề:
                            </label>
                            <p className="text-slate-800 dark:text-slate-100 font-medium text-lg">
                                {previewData.titleTemplate}
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                                Nội dung:
                            </label>
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                {previewData.messageTemplate}
                            </p>
                        </div>
                        {previewData.urlTemplate && (
                            <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300">URL:</label>
                                <p className="text-slate-600 dark:text-slate-400 break-all">
                                    {previewData.urlTemplate}
                                </p>
                            </div>
                        )}
                        <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300">Trạng thái:</label>
                            <Tag color={previewData.isActive ? 'success' : 'default'} className="mt-1 font-medium">
                                {previewData.isActive ? 'Hoạt động' : 'Tạm dừng'}
                            </Tag>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default NotificationTemplateTab;
