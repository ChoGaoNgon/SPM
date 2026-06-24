import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    ConfigProvider,
    Form,
    Input,
    message,
    Modal,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag,
    theme,
    Typography,
} from 'antd';
import {
    BarChart3,
    Building2,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Layers,
    Network,
    Plus,
    Search,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '~/contexts/ThemeContext';
import departmentService from '~/modules/department/services/departmentService';
import DepartmentOrgChart from '../components/DepartmentOrgChart';

const { Title, Text } = Typography;

function DepartmentManagerPage() {
    const { isDark } = useTheme();
    const [rootDepartments, setRootDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [viewMode, setViewMode] = useState('table');
    const [openId, setOpenId] = useState(null);

    const totalEmployees = rootDepartments.reduce((acc, dept) => acc + dept.employeeCount, 0);

    const totalSubs = rootDepartments.reduce((acc, dept) => acc + (dept.subDepartmentCount || 0), 0);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const rawData = await departmentService.getRootDepartments();

            const processedData = rawData.map((parent) => ({
                ...parent,
                subDepartments: parent.subDepartments?.map((child) => ({
                    ...child,
                    parentDepartmentId: parent.id,
                })),
            }));
            setRootDepartments(processedData);
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            if (editingDepartment) {
                await departmentService.updateDepartment(editingDepartment.id, values);
                message.success('Cập nhật phòng ban thành công');
            } else {
                await departmentService.createDepartment(values);
                message.success('Thêm phòng ban thành công');
            }

            setModalVisible(false);
            setEditingDepartment(null);
            form.resetFields();
            fetchDepartments();
        } catch (error) {
            message.error(error.message);
        }
    };

    const handleEdit = (record) => {
        setEditingDepartment(record);
        form.setFieldsValue({
            code: record.code,
            name: record.name,
            parentDepartmentId: record.parentDepartmentId,
        });
        setModalVisible(true);
    };

    const handleAdd = () => {
        setEditingDepartment(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleDelete = async (record) => {
        const idToDelete = record.id;
        Modal.confirm({
            title: 'Xác nhận xóa phòng ban',
            content: 'Bạn có chắc muốn xóa phòng ban / nhóm này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            async onOk() {
                try {
                    await departmentService.deleteDepartment(idToDelete);
                    message.success('Xóa phòng ban thành công');
                    fetchDepartments();
                } catch (error) {
                    message.error(error.message);
                }
            },
        });
    };

    const columns = [
        {
            title: 'Tên phòng ban / Bộ phận',
            dataIndex: 'name',
            key: 'name',
            width: '40%',
            render: (text, record) => (
                <Space>
                    {record.subDepartments && record.subDepartments.length > 0 ? (
                        <Building2 className={`w-4 h-4 ${isDark ? 'text-accent-400' : 'text-accent-500'}`} />
                    ) : (
                        <Layers className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    )}
                    <Text className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{text}</Text>
                </Space>
            ),
        },
        {
            title: 'Mã code',
            dataIndex: 'code',
            key: 'code',
            align: 'center',
            render: (code) => (
                <Tag
                    color="blue"
                    className={`rounded-lg font-mono border-none ${isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-slate-100 text-slate-600'} px-3`}
                >
                    {code}
                </Tag>
            ),
        },
        {
            title: 'Nhân sự',
            dataIndex: 'employeeCount',
            key: 'employeeCount',
            align: 'right',
            render: (count) => (
                <Space>
                    <Text className={`font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                        {count.toLocaleString()}
                    </Text>
                    <Users className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-300'}`} />
                </Space>
            ),
        },
        {
            title: 'Tổ trực thuộc',
            dataIndex: 'subDepartmentCount',
            key: 'subDepartmentCount',
            align: 'center',
            render: (count, record) =>
                count > 0 ? (
                    <Tag
                        color="cyan"
                        className={`rounded-full px-3 border-none font-bold ${isDark ? 'bg-cyan-900/40 text-cyan-300' : ''}`}
                    >
                        {count} bộ phận
                    </Tag>
                ) : (
                    <Text className={isDark ? 'text-slate-500' : 'text-slate-300'}>—</Text>
                ),
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            width: '25%',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        type="default"
                        className={
                            isDark
                                ? 'dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600'
                                : ''
                        }
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Button
                        icon={<DeleteOutlined />}
                        type="default"
                        danger
                        className={isDark ? 'dark:bg-red-900/30 dark:border-red-700/50 dark:text-red-400' : ''}
                        onClick={() => handleDelete(record)}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    const filteredData = rootDepartments
        .filter((dept) => {
            const matchesDept =
                dept.name.toLowerCase().includes(searchText.toLowerCase()) ||
                dept.code.toLowerCase().includes(searchText.toLowerCase());

            const filteredSubDepts =
                dept.subDepartments?.filter(
                    (sub) =>
                        sub.name.toLowerCase().includes(searchText.toLowerCase()) ||
                        sub.code.toLowerCase().includes(searchText.toLowerCase()),
                ) || [];

            if (!searchText) {
                return true;
            }
            return matchesDept || filteredSubDepts.length > 0;
        })
        .map((dept) => ({
            ...dept,
            subDepartments:
                dept.subDepartments?.filter(
                    (sub) =>
                        sub.name.toLowerCase().includes(searchText.toLowerCase()) ||
                        sub.code.toLowerCase().includes(searchText.toLowerCase()),
                ) ||
                dept.subDepartments ||
                [],
        }));

    const toggleOpen = (id) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    colorPrimary: '#4f46e5',
                    borderRadius: 8,
                },
            }}
        >
            <div className={isDark ? 'dark' : ''}>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                    <div>
                        <Title level={2} className="!mb-1 dark:text-white">
                            Cơ cấu tổ chức
                        </Title>
                        <Text className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                            Quản lý sơ đồ phòng ban và phân bổ nhân sự toàn công ty.
                        </Text>
                    </div>

                    <Row gutter={16} className="w-full lg:w-auto">
                        <Col span={12}>
                            <Card className="rounded-2xl border-none shadow-md bg-accent-600 text-white min-w-[160px]">
                                <Statistic
                                    title={
                                        <span className="text-accent-100 font-bold uppercase text-[10px] tracking-wider">
                                            Tổng nhân sự
                                        </span>
                                    }
                                    value={totalEmployees}
                                    valueStyle={{ color: '#fff', fontWeight: 900 }}
                                    prefix={<Users className="w-5 h-5 mr-1" />}
                                />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card className="rounded-2xl border-none shadow-md min-w-[160px]">
                                <Statistic
                                    title={
                                        <span
                                            className={`font-bold uppercase text-[10px] tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                                        >
                                            Phòng / Tổ
                                        </span>
                                    }
                                    value={rootDepartments.length + totalSubs}
                                    valueStyle={{ color: isDark ? '#f1f5f9' : '#1e293b', fontWeight: 900 }}
                                    prefix={
                                        <Building2
                                            className={`w-5 h-5 mr-1 ${isDark ? 'text-accent-400' : 'text-accent-500'}`}
                                        />
                                    }
                                />
                            </Card>
                        </Col>
                    </Row>
                </div>

                <div className="mt-6 flex gap-3">
                    <Button
                        onClick={() => setViewMode('table')}
                        type={viewMode === 'table' ? 'primary' : 'default'}
                        icon={<BarChart3 className="w-4 h-4" />}
                        className={`${viewMode === 'table' ? 'bg-accent-600 border-accent-600' : ''} rounded-lg h-10 px-4 font-semibold`}
                    >
                        Bảng dữ liệu
                    </Button>
                    <Button
                        onClick={() => setViewMode('chart')}
                        type={viewMode === 'chart' ? 'primary' : 'default'}
                        icon={<Network className="w-4 h-4" />}
                        className={`${viewMode === 'chart' ? 'bg-accent-600 border-accent-600' : ''} rounded-lg h-10 px-4 font-semibold`}
                    >
                        Sơ đồ phân cấp
                    </Button>
                </div>

                {viewMode === 'table' && (
                    <Card className="mt-5 rounded-[32px] shadow-2xl border-none p-0 overflow-hidden">
                        <div
                            className={`p-8 border-b ${isDark ? 'border-slate-700' : 'border-slate-50'} flex flex-col md:flex-row justify-between items-center gap-4`}
                        >
                            <Input
                                prefix={
                                    <Search className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-300'}`} />
                                }
                                placeholder="Tìm nhanh theo tên hoặc mã code..."
                                className="w-full md:w-96 rounded-xl border-none h-11"
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                            <Button
                                type="primary"
                                icon={<Plus className="w-4 h-4" />}
                                className="h-11 px-6 rounded-xl font-bold bg-accent-600 shadow-sm shadow-accent-200 border-none"
                                onClick={handleAdd}
                            >
                                Thêm phòng ban mới
                            </Button>
                        </div>

                        <div className="hidden md:block">
                            <Table
                                columns={columns}
                                dataSource={filteredData}
                                rowKey="id"
                                expandable={{
                                    childrenColumnName: 'subDepartments',
                                    expandIcon: ({ expanded, onExpand, record }) =>
                                        record.subDepartments && record.subDepartments.length > 0 ? (
                                            <button
                                                onClick={(e) => onExpand(record, e)}
                                                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${expanded ? (isDark ? 'bg-accent-900/50 text-accent-400' : 'bg-accent-100 text-accent-600') + ' rotate-90' : isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400'}`}
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        ) : null,
                                }}
                                pagination={false}
                                className={`custom-tree-table ${isDark ? 'dark' : ''}`}
                            />
                        </div>

                        <div className="block md:hidden overflow-y-auto">
                            <div className="space-y-3">
                                {filteredData.map((dept) => (
                                    <div
                                        key={dept.id}
                                        className="rounded-2xl border border-border shadow-sm
                           bg-white dark:bg-slate-800"
                                    >
                                        <button
                                            onClick={() => toggleOpen(dept.id)}
                                            className="w-full flex justify-between items-center p-4"
                                        >
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {dept.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {dept.employeeCount} nhân sự
                                                </p>
                                            </div>

                                            <div className="text-gray-500 dark:text-gray-400">
                                                {openId === dept.id ? (
                                                    <ChevronUp className="w-5 h-5" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5" />
                                                )}
                                            </div>
                                        </button>

                                        {openId === dept.id && (
                                            <div
                                                className="border-t border-border 
                                    bg-gray-50 dark:bg-slate-900/40
                                    p-3 space-y-2"
                                            >
                                                {dept.subDepartments.length === 0 ? (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                        Không có bộ phận con
                                                    </p>
                                                ) : (
                                                    dept.subDepartments.map((sub) => (
                                                        <div
                                                            key={sub.id}
                                                            className="p-3 rounded-xl border border-border shadow-sm
                                               bg-white dark:bg-slate-800"
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <p className="font-medium text-gray-800 dark:text-gray-100">
                                                                    {sub.name}
                                                                </p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {sub.employeeCount}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                )}

                {viewMode === 'chart' && (
                    <Card className="mt-5 rounded-[32px] shadow-2xl border-none">
                        <div
                            style={{
                                maxWidth: '100%',
                                overflowX: 'auto',
                                minHeight: 400,
                            }}
                        >
                            <DepartmentOrgChart data={rootDepartments} />
                        </div>
                    </Card>
                )}

                <Modal
                    title={editingDepartment ? 'Sửa phòng ban' : 'Thêm phòng ban'}
                    open={modalVisible}
                    onCancel={() => {
                        setModalVisible(false);
                        setEditingDepartment(null);
                        form.resetFields();
                    }}
                    onOk={handleSave}
                    okText="Lưu"
                    cancelText="Hủy"
                    width="100%"
                    style={{ top: 20, maxWidth: 480, margin: '0 auto' }}
                    wrapClassName={isDark ? 'dark' : ''}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item
                            label="Tên phòng ban"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng nhập tên phòng ban' }]}
                        >
                            <Input
                                className={isDark ? 'dark:bg-slate-700 dark:text-white dark:border-slate-600' : ''}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Mã phòng ban"
                            name="code"
                            rules={[{ required: true, message: 'Vui lòng nhập mã phòng ban' }]}
                        >
                            <Input
                                className={isDark ? 'dark:bg-slate-700 dark:text-white dark:border-slate-600' : ''}
                            />
                        </Form.Item>

                        <Form.Item label="Phòng ban" name="parentDepartmentId">
                            <Select allowClear placeholder="Chọn phòng ban" className={isDark ? 'dark' : ''}>
                                {rootDepartments

                                    .filter((dep) => !editingDepartment || dep.id !== editingDepartment.id)
                                    .map((dep) => (
                                        <Select.Option key={dep.id} value={dep.id}>
                                            {dep.name}
                                        </Select.Option>
                                    ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </ConfigProvider>
    );
}

export default DepartmentManagerPage;
