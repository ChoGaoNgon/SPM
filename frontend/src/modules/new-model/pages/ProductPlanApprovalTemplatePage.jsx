import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    LockOutlined,
    MenuOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Button,
    Card,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Space,
    Switch,
    Table,
    Tag,
    Tooltip,
    Typography,
    message,
} from 'antd';
import React, { useEffect, useState } from 'react';
import PageHeader from '../../../components/PageHeader';
import productPlanApprovalTemplateService from '../services/productPlanApprovalTemplateService';

const { Title } = Typography;

const SortableRow = ({ children, ...props }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: props['data-row-key'],
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: 'move',
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    };

    return (
        <tr {...props} ref={setNodeRef} style={style}>
            {React.Children.map(children, (child) => {
                if (child.key === 'sort') {
                    return React.cloneElement(child, {
                        children: (
                            <MenuOutlined {...attributes} {...listeners} style={{ cursor: 'move', fontSize: '16px' }} />
                        ),
                    });
                }
                return child;
            })}
        </tr>
    );
};

const ProductPlanApprovalTemplatePage = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await productPlanApprovalTemplateService.getAllTemplates();
            setTemplates(response.data || []);
        } catch (error) {
            message.error('Lỗi khi tải danh sách template');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingTemplate(null);
        form.resetFields();
        const nextOrder = templates.length > 0 ? Math.max(...templates.map((t) => t.approvalOrder || 0)) + 1 : 1;
        form.setFieldsValue({
            required: true,
            approvalOrder: nextOrder,
        });
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingTemplate(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await productPlanApprovalTemplateService.deleteTemplate(id);
            message.success('Xóa template thành công');
            fetchTemplates();
        } catch (error) {
            message.error('Lỗi khi xóa template');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingTemplate) {
                await productPlanApprovalTemplateService.updateTemplate(editingTemplate.id, values);
                message.success('Cập nhật template thành công');
            } else {
                await productPlanApprovalTemplateService.createTemplate(values);
                message.success('Tạo template thành công');
            }
            setModalVisible(false);
            fetchTemplates();
        } catch (error) {
            if (error.errorFields) {
                return;
            }
            message.error('Lỗi khi lưu template');
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = templates.findIndex((item) => item.id === active.id);
        const newIndex = templates.findIndex((item) => item.id === over.id);

        const newTemplates = [...templates];
        const [removed] = newTemplates.splice(oldIndex, 1);
        newTemplates.splice(newIndex, 0, removed);

        setTemplates(newTemplates);

        try {
            const templateIds = newTemplates.map((t) => t.id);
            await productPlanApprovalTemplateService.reorderTemplates(templateIds);
            message.success('Sắp xếp thành công');
            fetchTemplates();
        } catch (error) {
            message.error('Lỗi khi sắp xếp template');
            fetchTemplates();
        }
    };

    const columns = [
        {
            key: 'sort',
            width: 50,
            align: 'center',
        },
        {
            title: 'STT',
            dataIndex: 'approvalOrder',
            key: 'approvalOrder',
            width: 70,
            align: 'center',
            render: (order) => (
                <Tag color="blue" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {order}
                </Tag>
            ),
        },
        {
            title: 'Loại phê duyệt',
            dataIndex: 'approvalType',
            key: 'approvalType',
            width: 150,
            render: (text) => <Tag color="geekblue">{text}</Tag>,
        },
        {
            title: 'Tên hiển thị',
            dataIndex: 'approvalTypeName',
            key: 'approvalTypeName',
            width: 200,
        },
        {
            title: 'Quyền yêu cầu',
            dataIndex: 'requiredPermission',
            key: 'requiredPermission',
            render: (text) =>
                text ? (
                    <Tooltip title={text}>
                        <Tag icon={<LockOutlined />} color="orange">
                            {text.length > 30 ? `${text.substring(0, 30)}...` : text}
                        </Tag>
                    </Tooltip>
                ) : (
                    <Tag color="default">Không yêu cầu</Tag>
                ),
        },
        {
            title: 'Bắt buộc',
            dataIndex: 'required',
            key: 'required',
            width: 100,
            align: 'center',
            render: (required) =>
                required ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                        Có
                    </Tag>
                ) : (
                    <Tag icon={<CloseCircleOutlined />} color="default">
                        Không
                    </Tag>
                ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc chắn muốn xóa template này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <PageHeader title="Quản lý Template Phê Duyệt" />
            <Card
                title={
                    <Space>
                        <Title level={4} style={{ margin: 0 }}>
                            Danh sách Template Phê Duyệt
                        </Title>
                        <Tag color="cyan">{templates.length} template</Tag>
                    </Space>
                }
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Thêm Template
                    </Button>
                }
            >
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={templates.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                        <Table
                            dataSource={templates}
                            columns={columns}
                            rowKey="id"
                            loading={loading}
                            pagination={false}
                            components={{
                                body: {
                                    row: SortableRow,
                                },
                            }}
                            locale={{
                                emptyText: 'Chưa có template nào',
                            }}
                        />
                    </SortableContext>
                </DndContext>
            </Card>

            <Modal
                title={editingTemplate ? 'Cập nhật Template' : 'Tạo Template Mới'}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                width={600}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="approvalType"
                        label="Loại phê duyệt"
                        rules={[{ required: true, message: 'Vui lòng nhập loại phê duyệt' }]}
                        tooltip="Mã định danh cho loại phê duyệt (VD: CHECKER, NMD, RESIN)"
                    >
                        <Input placeholder="VD: CHECKER, NMD, RESIN" />
                    </Form.Item>

                    <Form.Item
                        name="approvalTypeName"
                        label="Tên hiển thị"
                        rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị' }]}
                    >
                        <Input placeholder="VD: Kiểm tra, Trưởng phòng NMD" />
                    </Form.Item>

                    <Form.Item
                        name="approvalOrder"
                        label="Thứ tự phê duyệt"
                        rules={[{ required: true, message: 'Vui lòng nhập thứ tự' }]}
                        tooltip="Thứ tự thực hiện phê duyệt (1, 2, 3...)"
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="requiredPermission"
                        label="Quyền yêu cầu"
                        tooltip="Tên quyền cần có để thực hiện phê duyệt bước này"
                    >
                        <Input placeholder="VD: NMD_PRODUCT_PLAN_APPROVE_CHECKER" />
                    </Form.Item>

                    <Form.Item
                        name="required"
                        label="Bắt buộc"
                        valuePropName="checked"
                        tooltip="Có bắt buộc phải hoàn thành bước này không"
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductPlanApprovalTemplatePage;
