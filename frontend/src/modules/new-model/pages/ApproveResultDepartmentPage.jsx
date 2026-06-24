import {
    ApiOutlined,
    CheckOutlined,
    CloseOutlined,
    DeleteOutlined,
    EditOutlined,
    ExclamationCircleFilled,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { Button, Input, message, Modal, Space, Table, Tag, Tooltip } from 'antd';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import ApproveResultDepartmentFormModal from '../components/modal/ApproveResultDepartmentFormModal';
import approveResultDepartmentService from '../services/approveResultDepartmentService';

const { confirm } = Modal;

const ApproveResultDepartmentPage = () => {
    const [departments, setDepartments] = useState([]);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loading, setLoading] = useState(false);

    const loadDepartments = async () => {
        setLoading(true);
        try {
            const data = await approveResultDepartmentService.getAllApproveResultDepartments();
            setDepartments(Array.isArray(data) ? data : []);
            setFilteredDepartments(Array.isArray(data) ? data : []);
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDepartments();
    }, []);

    const handleAdd = () => {
        setEditingRecord(null);
        setOpenModal(true);
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        setOpenModal(true);
    };

    const handleDelete = async (record) => {
        confirm({
            title: 'Xác nhận xóa',
            icon: <ExclamationCircleFilled />,
            content: `Bạn có chắc chắn muốn xóa phòng ban "${record.departmentCode}"?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await approveResultDepartmentService.deleteApproveResultDepartment(record.id);
                    message.success('Xóa phòng ban phê duyệt thành công');
                    loadDepartments();
                } catch (error) {
                    message.error(error.message);
                }
            },
        });
    };

    const handleCreateTemplate = async () => {
        confirm({
            title: 'Tạo template phòng ban phê duyệt',
            icon: <ApiOutlined />,
            content: 'Bạn có muốn tạo template các phòng ban phê duyệt mặc định (KT, QC, SX, P-NMD, MOLD)?',
            okText: 'Tạo',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await approveResultDepartmentService.createTemplateApproveResultDepartments();
                    message.success('Tạo template phòng ban phê duyệt thành công');
                    loadDepartments();
                } catch (error) {
                    message.error(error.message);
                }
            },
        });
    };

    const handleSearch = (value) => {
        setSearchKeyword(value);
        if (!value.trim()) {
            setFilteredDepartments(departments);
        } else {
            const filtered = departments.filter((dept) =>
                dept.departmentCode?.toLowerCase().includes(value.toLowerCase()),
            );
            setFilteredDepartments(filtered);
        }
    };

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            render: (_, record, index) => index + 1,
        },
        {
            title: 'Mã phòng ban',
            dataIndex: 'departmentCode',
            key: 'departmentCode',
            width: 150,
            render: (text) => (
                <Tag color="blue" style={{ fontWeight: 'bold' }}>
                    {text}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
            render: (isActive) => (
                <Tag icon={isActive ? <CheckOutlined /> : <CloseOutlined />} color={isActive ? 'success' : 'error'}>
                    {isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
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
                    <Tooltip title="Xóa">
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={() => handleDelete(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="flex  items-center justify-between mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Bell size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Quản lý phòng ban phê duyệt
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">Xem và quản lý phòng ban phê duyệt</p>
                    </div>
                </div>
                <Space>
                    <Input.Search
                        placeholder="Tìm kiếm theo mã phòng ban..."
                        allowClear
                        onSearch={handleSearch}
                        onChange={(e) => {
                            if (!e.target.value) {
                                handleSearch('');
                            }
                        }}
                        style={{ width: 300 }}
                        prefix={<SearchOutlined />}
                    />
                    <Button type="default" icon={<ApiOutlined />} onClick={handleCreateTemplate}>
                        Tạo Template
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm mới
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={filteredDepartments}
                rowKey="id"
                loading={loading}
                pagination={{
                    total: filteredDepartments.length,
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
                }}
                scroll={{ x: 800 }}
                size="middle"
            />

            <ApproveResultDepartmentFormModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                editingRecord={editingRecord}
                onSuccess={loadDepartments}
            />
        </div>
    );
};

export default ApproveResultDepartmentPage;
