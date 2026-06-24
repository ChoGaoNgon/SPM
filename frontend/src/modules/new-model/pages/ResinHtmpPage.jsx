import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Input, message, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import { ArchiveIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import PageHeader from '~/components/PageHeader';
import ProductResinMappingModal from '../components/ProductResinMappingModal';
import ProductResinMappingService from '../services/ProductResinMappingService';

const { Title } = Typography;

const ProductResinMappingPage = () => {
    const [resins, setResins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResin, setSelectedResin] = useState(null);
    const [filters, setFilters] = useState({
        keyword: '',
        type: undefined,
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

    const fetchResins = async (filters = {}) => {
        setLoading(true);
        try {
            const params = {
                ...(filters.keyword && { keyword: filters.keyword }),
                ...(filters.type && { type: filters.type }),
            };
            const data = await ProductResinMappingService.getAllProductResinMapping(params);
            setResins(Array.isArray(data) ? data : data.content || []);
        } catch (error) {
            message.error(error.message || 'Lỗi khi tải danh sách nhựa HTMP');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResins(filters);
    }, [filters]);

    const handleDelete = async (id) => {
        try {
            await ProductResinMappingService.deleteProductResinMapping(id);
            message.success('Xóa nhựa HTMP thành công');
            fetchResins(filters);
        } catch (error) {
            message.error(error.message || 'Lỗi khi xóa nhựa HTMP');
        }
    };

    const handleCreate = () => {
        setSelectedResin(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setSelectedResin(record);
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        fetchResins(filters);
    };

    const columns = [
        {
            title: 'STT',
            width: '5%',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Mã nhựa',
            dataIndex: 'code',
            key: 'code',
            width: '25%',
            render: (text) => (
                <span className="font-semibold text-blue-600">
                    <HighlightText text={text} highlight={filters.keyword} />
                </span>
            ),
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            width: '15%',
            render: (text) => <Tag color="blue">{text || '—'}</Tag>,
        },
        {
            title: 'Màu',
            dataIndex: 'colorName',
            key: 'colorName',
            width: '20%',
            render: (text) => text || '—',
        },
        {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
            width: '15%',

            render: (text) => <HighlightText text={text} highlight={filters.keyword} />,
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: '10%',
            render: (_, record) => (
                <Space size="small">
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small">
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc muốn xóa nhựa này?"
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

    return (
        <div>
            <PageHeader icon={ArchiveIcon} title="Quản lý nhựa HTMP" />
            <Card
                title={
                    <Space>
                        <Title level={4} style={{ margin: 0 }}>
                            Danh sách nhựa HTMP
                        </Title>
                        <Tag color="cyan">{resins.length} nhựa</Tag>
                    </Space>
                }
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Thêm nhựa
                    </Button>
                }
            >
                <div className="mb-4 flex flex-wrap gap-3">
                    <Input.Search
                        allowClear
                        placeholder="Nhập từ khóa tìm kiếm (mã, grade...)"
                        className="w-64"
                        onSearch={(value) => setFilters((f) => ({ ...f, keyword: value }))}
                        onChange={(e) => {
                            if (!e.target.value) {
                                setFilters((f) => ({ ...f, keyword: '' }));
                            }
                        }}
                    />
                </div>

                <Table
                    rowKey={(record) => record.id}
                    loading={loading}
                    columns={columns}
                    dataSource={resins}
                    pagination={false}
                    locale={{ emptyText: 'Chưa có dữ liệu nhựa HTMP' }}
                    scroll={{ x: 900 }}
                />
            </Card>

            <ProductResinMappingModal
                open={isModalOpen}
                resin={selectedResin}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedResin(null);
                }}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
};

export default ProductResinMappingPage;
