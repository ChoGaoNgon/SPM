import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Input, message, Select, Table, Tag } from 'antd';
import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DepartmentSelect from '~/components/select/DepartmentSelect';
import EmployeeSelect from '~/components/select/EmployeeSelect';
import AssetModal from '~/modules/asset-management/components/AssetModal';
import assetService from '~/modules/asset/service/AssetService';

const AssetTab = ({ assetTypes = [], loadingTypes = false }) => {
    const navigate = useNavigate();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        keyword: '',
        type: undefined,
        employeeUseId: undefined,
        departmentId: undefined,
        status: undefined,
    });

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const HighlightText = ({ text, highlight }) => {
        if (!highlight || !text) {
            return text || '—';
        }

        const parts = text.toString().split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
        return (
            <span>
                {parts.map((part, index) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <span
                            key={index}
                            style={{ backgroundColor: '#ffeb3b', color: '#000', padding: '0 2px', borderRadius: '2px' }}
                        >
                            {part}
                        </span>
                    ) : (
                        part
                    ),
                )}
            </span>
        );
    };

    const fetchAssets = async (page = 1, size = 10, filters = {}) => {
        setLoading(true);
        try {
            const params = {
                page: page - 1,
                size,
                ...(filters.keyword && { keyword: filters.keyword }),
                ...(filters.type && { assetTypeId: filters.type }),
                ...(filters.employeeUseId && { employeeUseId: filters.employeeUseId }),
                ...(filters.departmentId && { departmentId: filters.departmentId }),
                ...(filters.status && { status: filters.status }),
            };

            const data = await assetService.getAllAssets(params);

            setAssets(data.content || []);

            setPagination((prev) => ({
                ...prev,
                current: (data.number ?? 0) + 1,
                pageSize: data.size || size,
                total: data.totalElements || 0,
            }));
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets(1, pagination.pageSize || 10, filters);
    }, [filters]);

    const handleTableChange = (newPagination) => {
        fetchAssets(newPagination.current, newPagination.pageSize, filters);
    };

    const columns = [
        {
            title: 'STT',
            width: '5%',
            render: (_, __, index) => ((pagination.current || 1) - 1) * (pagination.pageSize || 10) + index + 1,
        },
        {
            title: 'Mã tài sản',
            dataIndex: 'code',
            key: 'code',
            width: '15%',
            render: (code, record) => (
                <a
                    href={`/assets-management/assets/${record.id}`}
                    className="font-semibold inline-flex items-center gap-1.5 hover:gap-2 transition-all text-blue-600 hover:text-blue-800"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate(`/assets-management/assets/${record.id}`);
                    }}
                >
                    <HighlightText text={code} highlight={filters.keyword} />
                    <ExternalLink size={14} className="flex-shrink-0" />
                </a>
            ),
        },
        {
            title: 'Tên tài sản',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
            render: (text) => <HighlightText text={text} highlight={filters.keyword} />,
        },
        {
            title: 'Loại tài sản',
            dataIndex: 'assetTypeName',
            key: 'assetTypeName',
            width: '20%',
            render: (text) => <Tag color="blue">{text || 'Khác'}</Tag>,
        },
        {
            title: 'Phòng ban quản lý',
            dataIndex: 'departmentName',
            key: 'departmentName',
            width: '10%',
            render: (text) => text || '—',
        },
        {
            title: 'Tình trạng',
            dataIndex: 'status',
            key: 'status',
            width: '10%',
            render: (status) => {
                let color = 'default';
                let text = 'Không xác định';
                if (status === 'AVAILABLE') {
                    color = 'green';
                    text = 'Sẵn sàng';
                } else if (status === 'IN_USE') {
                    color = 'blue';
                    text = 'Đang sử dụng';
                } else if (status === 'MAINTENANCE') {
                    color = 'orange';
                    text = 'Bảo trì';
                } else if (status === 'DISPOSED') {
                    color = 'red';
                    text = 'Đã thanh lý';
                } else if (status === 'LOST') {
                    color = 'gray';
                    text = 'Mất';
                }
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Ghi chú',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (text) => <HighlightText text={text} highlight={filters.keyword} />,
        },
    ];

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        fetchAssets(pagination.current, pagination.pageSize);
    };

    return (
        <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div className="text-sm text-slate-500">Danh sách tài sản</div>
                    <div className="text-lg font-semibold text-slate-800 dark:text-white">Quản lý & theo dõi</div>
                </div>
                <Button icon={<PlusCircleOutlined />} type="primary" onClick={handleOpenModal}>
                    Thêm tài sản
                </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                <div className="flex flex-wrap gap-3 mb-4">
                    <Input.Search
                        allowClear
                        placeholder="Nhập từ khóa tìm kiếm"
                        className="w-64"
                        onSearch={(value) => setFilters((f) => ({ ...f, keyword: value }))}
                        onChange={(e) => {
                            if (!e.target.value) {
                                setFilters((f) => ({ ...f, keyword: '' }));
                            }
                        }}
                    />
                    <Select
                        allowClear
                        loading={loadingTypes}
                        className="w-56"
                        placeholder="Chọn loại tài sản"
                        options={assetTypes.map((type) => ({
                            value: type.id,
                            label: type.name,
                        }))}
                        value={filters.type}
                        onChange={(value) => setFilters((f) => ({ ...f, type: value }))}
                    />
                    <DepartmentSelect
                        allowClear
                        className="w-56"
                        placeholder="Chọn phòng ban quản lý"
                        value={filters.departmentId}
                        onChange={(value) => setFilters((f) => ({ ...f, departmentId: value }))}
                    />

                    <EmployeeSelect
                        allowClear
                        className="w-56"
                        placeholder="Chọn nhân viên sử dụng"
                        value={filters.employeeUseId}
                        onChange={(value) => setFilters((f) => ({ ...f, employeeUseId: value }))}
                    />
                    <Select
                        allowClear
                        className="w-56"
                        placeholder="Chọn tình trạng"
                        options={[
                            { value: 'AVAILABLE', label: 'Sẵn sàng' },
                            { value: 'IN_USE', label: 'Đang sử dụng' },
                            { value: 'MAINTENANCE', label: 'Bảo trì' },
                            { value: 'DISPOSED', label: 'Đã thanh lý' },
                            { value: 'LOST', label: 'Mất' },
                        ]}
                        value={filters.status}
                        onChange={(value) => setFilters((f) => ({ ...f, status: value }))}
                    />
                </div>

                <Table
                    rowKey={(record) => record.key || record.id || record.code}
                    loading={loading}
                    columns={columns}
                    dataSource={assets}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} tài sản`,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    onChange={handleTableChange}
                    locale={{ emptyText: 'Chưa có tài sản' }}
                    scroll={{ x: 900 }}
                />
            </div>

            <AssetModal
                open={isModalOpen}
                asset={null}
                assetTypes={assetTypes}
                loadingTypes={loadingTypes}
                onClose={() => {
                    setIsModalOpen(false);
                }}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
};

export default AssetTab;
