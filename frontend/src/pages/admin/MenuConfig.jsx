import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
    Button,
    Card,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Popconfirm,
    Radio,
    Select,
    Space,
    Switch,
    Table,
    Tabs,
    Tag,
    TreeSelect,
} from 'antd';
import { List, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import DynamicIcon from '~/components/DynamicIcon';
import PageHeader from '~/components/PageHeader';
import DepartmentSelect from '~/components/select/DepartmentSelect';
import EmployeeSelect from '~/components/select/EmployeeSelect';
import menuService from '~/services/menuService';

const MenuConfig = () => {
    const [form] = Form.useForm();
    const [menus, setMenus] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const [activeTab, setActiveTab] = useState('SYSTEM_1');

    const roleOptions = [
        { label: 'ALL - Tất cả', value: 'ALL' },
        { label: 'SUPERADMIN', value: 'SUPERADMIN' },
        { label: 'ADMIN', value: 'ADMIN' },
        { label: 'HR', value: 'HR' },
        { label: 'MANAGER', value: 'MANAGER' },
        { label: 'HEAD', value: 'HEAD' },
        { label: 'USER', value: 'USER' },
    ];

    const systemTypeOptions = [
        { label: 'Hệ thống 1', value: 'SYSTEM_1' },
        { label: 'Hệ thống 2', value: 'SYSTEM_2' },
    ];

    useEffect(() => {
        fetchMenus();
        fetchGroups();
    }, []);

    const fetchMenus = async () => {
        setLoading(true);
        try {
            const data = await menuService.getAllMenuItems();
            setMenus(flattenMenuTree(data));
        } catch (error) {
            message.error(error.message || 'Lỗi tải danh sách menu');
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        try {
            const data = await menuService.getAllGroupMenus();
            setGroups(data);
        } catch (error) {
        }
    };

    const flattenMenuTree = (items, level = 0) => {
        let result = [];
        const sorted = [...items].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

        sorted.forEach((item) => {
            const { children, ...rest } = item;
            result.push({ ...rest, level });
            if (children && children.length > 0) {
                result = result.concat(flattenMenuTree(children, level + 1));
            }
        });
        return result;
    };

    const buildTreeData = (items) => {
        const map = {};
        const roots = [];

        items.forEach((item) => {
            map[item.id] = {
                title: item.label,
                value: item.id,
                key: item.id,
                children: [],
            };
        });

        items.forEach((item) => {
            if (item.parentId) {
                if (map[item.parentId]) {
                    map[item.parentId].children.push(map[item.id]);
                }
            } else {
                roots.push(map[item.id]);
            }
        });

        return roots;
    };

    const handleCreate = () => {
        setEditingMenu(null);
        form.resetFields();
        setModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingMenu(record);
        form.setFieldsValue({
            menuKey: record.key,
            label: record.label,
            icon: record.icon,
            parentId: record.parentId,
            displayOrder: record.displayOrder,
            systemType: record.systemType || 'SYSTEM_2',
            groupMenu: record.groupMenu,
            allowedRoles: record.allowedRoles || [],
            allowedDepartments: record.allowedDepartments || [],
            allowedEmployees: record.allowedEmployees || [],
            isActive: record.isActive !== false,
            isVisible: record.isVisible !== false,
            description: record.description,
        });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await menuService.deleteMenuItem(id);
            message.success('Xóa menu thành công');
            fetchMenus();
        } catch (error) {
            message.error(error.message || 'Xóa menu thất bại');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const payload = {
                menuKey: values.menuKey,
                label: values.label,
                icon: values.icon,
                parentId: values.parentId || null,
                displayOrder: values.displayOrder || 0,
                systemType: values.systemType || 'SYSTEM_2',
                groupMenu: values.groupMenu || null,
                allowedRoles: values.allowedRoles || [],
                allowedDepartments: values.allowedDepartments || [],
                allowedEmployees: values.allowedEmployees || [],
                isActive: values.isActive !== false,
                isVisible: values.isVisible !== false,
                description: values.description,
            };

            if (editingMenu) {
                await menuService.updateMenuItem(editingMenu.id, payload);
                message.success('Cập nhật menu thành công');
            } else {
                await menuService.createMenuItem(payload);
                message.success('Tạo menu thành công');
            }

            setModalOpen(false);
            form.resetFields();
            fetchMenus();
        } catch (error) {
            message.error(error.message || 'Lưu menu thất bại');
        }
    };

    const columns = [
        {
            title: 'Label',
            dataIndex: 'label',
            key: 'label',
            width: 250,
            render: (text, record) => (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        paddingLeft: record.level * 20,
                    }}
                >
                    {record.level > 0 && <span style={{ color: '#94a3b8' }}>└</span>}
                    <DynamicIcon name={record.icon} size={16} />
                    <span className="font-medium">{text}</span>
                </div>
            ),
        },
        {
            title: 'Key (Route)',
            dataIndex: 'key',
            key: 'key',
            width: 200,
            render: (text) => (
                <code className="text-xs bg-gray-100 px-2 py-1 rounded dark:bg-slate-800 dark:text-slate-300">
                    {text}
                </code>
            ),
        },
        {
            title: 'Icon',
            dataIndex: 'icon',
            key: 'icon',
            width: 100,
            render: (icon) => (
                <Space>
                    <DynamicIcon name={icon} size={20} />
                    <span className="text-xs text-gray-500">{icon}</span>
                </Space>
            ),
        },
        {
            title: 'Thứ tự',
            dataIndex: 'displayOrder',
            key: 'displayOrder',
            width: 80,
            align: 'center',
        },
        {
            title: 'Hệ thống',
            dataIndex: 'systemType',
            key: 'systemType',
            width: 120,
            align: 'center',
            render: (systemType) => (
                <Tag color={systemType === 'SYSTEM_1' ? 'purple' : 'cyan'}>
                    {systemType === 'SYSTEM_1' ? 'HT 1' : 'HT 2'}
                </Tag>
            ),
        },
        {
            title: 'Nhóm',
            dataIndex: 'groupMenu',
            key: 'groupMenu',
            width: 150,
            align: 'center',
            render: (groupMenu) => {
                if (!groupMenu) return <span className="text-gray-400">-</span>;
                const group = groups.find((g) => g.name === groupMenu);
                return (
                    <Tag
                        color={group?.color || '#3b82f6'}
                        style={{
                            borderColor: group?.color || '#3b82f6',
                        }}
                    >
                        {group?.description || groupMenu}
                    </Tag>
                );
            },
        },
        {
            title: 'Roles',
            dataIndex: 'allowedRoles',
            key: 'allowedRoles',
            width: 200,
            render: (roles) =>
                roles && roles.length > 0 ? (
                    <Space size={[0, 4]} wrap>
                        {roles.map((role) => (
                            <Tag key={role} color={role === 'ALL' ? 'green' : 'blue'}>
                                {role}
                            </Tag>
                        ))}
                    </Space>
                ) : (
                    <span className="text-gray-400">-</span>
                ),
        },
        {
            title: 'Departments',
            dataIndex: 'allowedDepartments',
            key: 'allowedDepartments',
            width: 150,
            render: (depts) =>
                depts && depts.length > 0 ? (
                    <Space size={[0, 4]} wrap>
                        {depts.map((dept) => (
                            <Tag key={dept} color="orange">
                                {dept}
                            </Tag>
                        ))}
                    </Space>
                ) : (
                    <span className="text-gray-400">-</span>
                ),
        },
        {
            title: 'Employees',
            dataIndex: 'allowedEmployees',
            key: 'allowedEmployees',
            width: 150,
            render: (employees) =>
                employees && employees.length > 0 ? (
                    <Space size={[0, 4]} wrap>
                        {employees.slice(0, 3).map((empId) => (
                            <Tag key={empId} color="purple">
                                ID: {empId}
                            </Tag>
                        ))}
                        {employees.length > 3 && <Tag color="purple">+{employees.length - 3}</Tag>}
                    </Space>
                ) : (
                    <span className="text-gray-400">-</span>
                ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            render: (_, record) => (
                <Space>
                    {record.isActive && <Tag color="success">Active</Tag>}
                    {!record.isActive && <Tag color="error">Inactive</Tag>}
                    {!record.isVisible && <Tag color="warning">Hidden</Tag>}
                </Space>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            fixed: 'right',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small">
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa menu này?"
                        description="Menu con (nếu có) cũng sẽ bị xóa theo."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="link" danger icon={<DeleteOutlined />} size="small">
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const getFilteredMenus = () => {
        return menus.filter((menu) => menu.systemType === activeTab);
    };

    return (
        <div>
            <PageHeader icon={Menu} title="Cấu hình Menu" description="Cấu hình menu hiển thị trong hệ thống" />
            <Card
                title={
                    <Space>
                        <List size={24} className="text-blue-600" />
                        <span className="text-xl font-bold">Quản lý Menu</span>
                    </Space>
                }
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Thêm menu
                    </Button>
                }
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: 'SYSTEM_1',
                            label: (
                                <span>
                                    <Tag color="purple">Hệ thống 1</Tag>
                                    <span className="ml-2">
                                        {menus.filter((m) => m.systemType === 'SYSTEM_1').length}
                                    </span>
                                </span>
                            ),
                        },
                        {
                            key: 'SYSTEM_2',
                            label: (
                                <span>
                                    <Tag color="cyan">Hệ thống 2</Tag>
                                    <span className="ml-2">
                                        {menus.filter((m) => m.systemType === 'SYSTEM_2').length}
                                    </span>
                                </span>
                            ),
                        },
                    ]}
                />
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={getFilteredMenus()}
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 1500 }}
                    size="small"
                />
            </Card>

            <Modal
                title={editingMenu ? 'Chỉnh sửa menu' : 'Thêm menu mới'}
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                width={700}
                okText={editingMenu ? 'Cập nhật' : 'Tạo'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
                    <Form.Item
                        label="Key (Route)"
                        name="menuKey"
                        rules={[{ required: true, message: 'Vui lòng nhập key!' }]}
                    >
                        <Input placeholder="/example-page" />
                    </Form.Item>

                    <Form.Item label="Label" name="label" rules={[{ required: true, message: 'Vui lòng nhập label!' }]}>
                        <Input placeholder="Tên hiển thị" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item label="Icon" name="icon">
                            <Input placeholder="Ví dụ: Users, Building2, Clock, Lock..." />
                        </Form.Item>

                        <Form.Item label="Menu cha" name="parentId">
                            <TreeSelect
                                placeholder="Chọn menu cha (nếu có)"
                                treeData={buildTreeData(menus.filter((m) => m.id !== editingMenu?.id))}
                                allowClear
                            />
                        </Form.Item>
                    </div>

                    <Form.Item label="Thứ tự hiển thị" name="displayOrder">
                        <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
                    </Form.Item>

                    <Form.Item
                        label="Loại hệ thống"
                        name="systemType"
                        initialValue="SYSTEM_2"
                        rules={[{ required: true, message: 'Vui lòng chọn loại hệ thống!' }]}
                    >
                        <Radio.Group buttonStyle="solid">
                            <Radio.Button value="SYSTEM_1">
                                <Space>
                                    <Tag color="purple" bordered={false}>
                                        HT 1
                                    </Tag>
                                </Space>
                            </Radio.Button>
                            <Radio.Button value="SYSTEM_2">
                                <Space>
                                    <Tag color="cyan" bordered={false}>
                                        HT 2
                                    </Tag>
                                </Space>
                            </Radio.Button>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item label="Nhóm menu" name="groupMenu">
                        <Select
                            placeholder="Chọn nhóm menu"
                            allowClear
                            options={groups.map((group) => ({
                                label: (
                                    <Space>
                                        <div
                                            style={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: 3,
                                                backgroundColor: group.color,
                                            }}
                                        />
                                        {group.description}
                                    </Space>
                                ),
                                value: group.name,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item label="Roles được phép truy cập" name="allowedRoles">
                        <Select mode="multiple" placeholder="Chọn roles" options={roleOptions} />
                    </Form.Item>

                    <Form.Item label="Departments được phép truy cập" name="allowedDepartments">
                        <DepartmentSelect multiple={true} valueField="code" labelField="name" />
                    </Form.Item>

                    <Form.Item
                        label="Employees được phép truy cập"
                        name="allowedEmployees"
                        tooltip="Chỉ định nhân viên cụ thể có quyền truy cập menu này. Ưu tiên cao hơn Role và Department."
                    >
                        <EmployeeSelect multiple={true} valueField="id" placeholder="Chọn nhân viên (nếu có)" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item label="Active" name="isActive" valuePropName="checked">
                            <Switch defaultChecked />
                        </Form.Item>

                        <Form.Item label="Visible" name="isVisible" valuePropName="checked">
                            <Switch defaultChecked />
                        </Form.Item>
                    </div>

                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea rows={3} placeholder="Mô tả menu (optional)" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MenuConfig;
