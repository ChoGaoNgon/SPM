import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons';
import {
    Button,
    Card,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Popconfirm,
    Space,
    Switch,
    Table,
    Tag,
    Tooltip,
    Typography,
} from 'antd';
import { FileSliders } from 'lucide-react';
import { useEffect, useState } from 'react';
import PageHeader from '~/components/PageHeader';
import productPlanApprovalTemplateService from '../services/productPlanApprovalTemplateService';

const { Title, Text } = Typography;

const PlanApprovalTemplatePage = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [form] = Form.useForm();

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await productPlanApprovalTemplateService.getAllTemplates();
            const data = response?.data || [];

            const sortedData = [...data].sort((a, b) => (a.approvalOrder || 0) - (b.approvalOrder || 0));
            setTemplates(sortedData);
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi tải danh sách template');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleCreate = () => {
        setEditingTemplate(null);
        form.resetFields();

        form.setFieldsValue({
            required: true,
            approvalOrder: templates.length + 1,
        });
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingTemplate(record);
        form.setFieldsValue({
            approvalType: record.approvalType,
            approvalTypeName: record.approvalTypeName,
            approvalOrder: record.approvalOrder,
            required: record.required,
            requiredPermission: record.requiredPermission,
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await productPlanApprovalTemplateService.deleteTemplate(id);
            message.success('Xóa template thành công');
            fetchTemplates();
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi xóa template');
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
            form.resetFields();
            fetchTemplates();
        } catch (error) {
            if (error.errorFields) {
                return;
            }
            message.error(error.response?.data?.message || 'Lỗi khi lưu template');
        }
    };

    const columns = [
        {
            title: 'Thứ tự',
            dataIndex: 'approvalOrder',
            key: 'approvalOrder',
            width: 100,
            align: 'center',
            sorter: (a, b) => (a.approvalOrder || 0) - (b.approvalOrder || 0),
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
            render: (type) => (
                <Tag color="purple" style={{ fontSize: '13px' }}>
                    {type}
                </Tag>
            ),
        },
        {
            title: 'Tên hiển thị',
            dataIndex: 'approvalTypeName',
            key: 'approvalTypeName',
            render: (name) => <Text strong>{name}</Text>,
        },
        {
            title: 'Quyền yêu cầu',
            dataIndex: 'requiredPermission',
            key: 'requiredPermission',
            width: 250,
            render: (permission) =>
                permission ? (
                    <Tooltip title={permission}>
                        <Tag
                            color="geekblue"
                            style={{ maxWidth: '230px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {permission}
                        </Tag>
                    </Tooltip>
                ) : (
                    <Text type="secondary" italic>
                        Không yêu cầu
                    </Text>
                ),
        },
        {
            title: 'Bắt buộc',
            dataIndex: 'required',
            key: 'required',
            width: 120,
            align: 'center',
            render: (required) =>
                required ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                        Bắt buộc
                    </Tag>
                ) : (
                    <Tag icon={<CloseCircleOutlined />} color="default">
                        Tùy chọn
                    </Tag>
                ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa template phê duyệt"
                        description="Bạn có chắc chắn muốn xóa template này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                    >
                        <Tooltip title="Xóa">
                            <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Template phê duyệt Kế hoạch"
                icon={FileSliders}
                description={'Quản lý quy trình phê duyệt kế hoạch thử khuôn, event,...'}
            />

            <Card
                title={
                    <Space>
                        <Title level={4} style={{ margin: 0 }}>
                            Danh sách Template
                        </Title>
                        <Text type="secondary">({templates.length} template)</Text>
                    </Space>
                }
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Thêm Template
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={templates}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} template`,
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>

            <Modal
                title={
                    <Space>
                        {editingTemplate ? <EditOutlined /> : <PlusOutlined />}
                        <span>{editingTemplate ? 'Chỉnh sửa Template' : 'Thêm Template mới'}</span>
                    </Space>
                }
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                okText={editingTemplate ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
                width={600}
                destroyOnClose
            >
                <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
                    <Form.Item
                        name="approvalType"
                        label="Loại phê duyệt (Code)"
                        rules={[
                            { required: true, message: 'Vui lòng nhập loại phê duyệt' },
                            { max: 50, message: 'Tối đa 50 ký tự' },
                        ]}
                        tooltip="Mã định danh cho loại phê duyệt (VD: CHECKER, HEAD_NMD, RESIN)"
                    >
                        <Input placeholder="VD: CHECKER" />
                    </Form.Item>

                    <Form.Item
                        name="approvalTypeName"
                        label="Tên hiển thị"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên hiển thị' },
                            { max: 100, message: 'Tối đa 100 ký tự' },
                        ]}
                        tooltip="Tên hiển thị cho người dùng (VD: Kiểm tra, Trưởng phòng NMD)"
                    >
                        <Input placeholder="VD: Kiểm tra" />
                    </Form.Item>

                    <Form.Item
                        name="approvalOrder"
                        label="Thứ tự phê duyệt"
                        rules={[
                            { required: true, message: 'Vui lòng nhập thứ tự' },
                            { type: 'number', min: 1, message: 'Thứ tự phải lớn hơn 0' },
                        ]}
                        tooltip="Thứ tự thực hiện phê duyệt (số nhỏ được duyệt trước)"
                    >
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="VD: 1" />
                    </Form.Item>

                    <Form.Item
                        name="requiredPermission"
                        label="Quyền yêu cầu"
                        tooltip="Quyền hệ thống cần có để thực hiện phê duyệt bước này"
                    >
                        <Input placeholder="VD: NMD_PRODUCT_PLAN_APPROVE_CHECKER" />
                    </Form.Item>

                    <Form.Item
                        name="required"
                        label="Bắt buộc"
                        valuePropName="checked"
                        tooltip="Nếu bật, bước này bắt buộc phải hoàn thành"
                    >
                        <Switch checkedChildren="Bắt buộc" unCheckedChildren="Tùy chọn" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PlanApprovalTemplatePage;
