import { DeleteOutlined, EditOutlined, PlusOutlined, QrcodeOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Form, message, Modal, QRCode, Space, Spin, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AssetAssignmentModal from '~/modules/asset-management/components/AssetAssignmentModal';
import AssetBorrowTable from '~/modules/asset-management/components/AssetBorrowTable';
import AssetModal from '~/modules/asset-management/components/AssetModal';
import AssetSpecificationModal from '~/modules/asset-management/components/AssetSpecificationModal';
import SpecificationDisplay from '~/modules/asset-management/components/SpecificationDisplay';
import assetService from '~/modules/asset/service/AssetService';
import assetTypeService from '~/modules/asset/service/AssetTypeService';
import assetAssignmentService from '~/services/assetAssignmentService';
import assetBorrowService from '~/services/assetBorrowService';

const AssetDetailPage = () => {
    const { assetId } = useParams();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isEditAssignOpen, setIsEditAssignOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    const [assetTypes, setAssetTypes] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(false);
    const [form] = Form.useForm();
    const [assetAssignments, setAssetAssignments] = useState([]);
    const [assetBorrows, setAssetBorrows] = useState([]);
    const [borrowLoading, setBorrowLoading] = useState(false);
    const [borrowPagination, setBorrowPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });
    const qrRef = useRef(null);

    const fetchAssetAssignments = async () => {
        try {
            const data = await assetAssignmentService.getAssetAssignmentsByAssetId(assetId);
            setAssetAssignments(data);
        } catch (error) {
            message.error(error);
        }
    };

    const fetchAssetBorrows = async () => {
        setBorrowLoading(true);
        try {
            const data = await assetBorrowService.getAssetBorrowsByAssetId(assetId);
            setAssetBorrows(data || []);
            setBorrowPagination({
                ...borrowPagination,
                total: data?.length || 0,
            });
        } catch (error) {
            message.error(error.message || 'Không tải được danh sách đơn mượn');
        } finally {
            setBorrowLoading(false);
        }
    };

    useEffect(() => {
        const fetchAssetTypes = async () => {
            setLoadingTypes(true);
            try {
                const data = await assetTypeService.getAllAssetTypes();
                setAssetTypes(data || []);
            } catch (e) {
                message.error('Không tải được loại tài sản');
            } finally {
                setLoadingTypes(false);
            }
        };

        fetchAssetTypes();
    }, []);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const data = await assetService.getAssetById(assetId);
            setAsset(data);
            form.setFieldsValue(data);
            const assignments = await assetAssignmentService.getAssetAssignmentsByAssetId(assetId);
            setAssetAssignments(assignments);

            await fetchAssetBorrows();
        } catch (e) {
            message.error('Không tải được chi tiết tài sản');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [assetId, form]);

    const handleOpenEditModal = () => {
        setIsModalOpen(true);
    };

    const handleEditSuccess = (values) => {
        setAsset({ ...asset, ...values });
        fetchDetail();
    };

    const handleOpenSpecModal = () => {
        setIsSpecModalOpen(true);
    };

    const handleAssignSuccess = () => {
        fetchAssetAssignments();
    };

    const handleEditAssignment = (record) => {
        setSelectedAssignment(record);
        setIsEditAssignOpen(true);
    };

    const handleDeleteAssignment = async (id) => {
        Modal.confirm({
            title: 'Xóa lịch sử cấp phát tài sản',
            content: 'Bạn chắc chắn muốn xóa lịch sử cấp phát này?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await assetAssignmentService.deleteAssetAssignment(id);
                    message.success('Xóa lịch sử cấp phát tài sản thành công');
                    fetchAssetAssignments();
                } catch (error) {
                    message.error(error.message || 'Không thể xóa lịch sử cấp phát tài sản');
                }
            },
        });
    };

    const handleEditAssignSuccess = () => {
        setIsEditAssignOpen(false);
        setSelectedAssignment(null);
        fetchAssetAssignments();
    };

    const handleSpecSuccess = async () => {
        try {
            const data = await assetService.getAssetById(assetId);
            setAsset(data);
        } catch (e) {
            message.error('Không tải được chi tiết tài sản');
        }
    };

    const handleBorrowTableChange = (page) => {
        setBorrowPagination({
            current: page.current,
            pageSize: page.pageSize,
            total: borrowPagination.total,
        });
    };

    const handleRefreshBorrowTable = () => {
        fetchAssetBorrows();
    };

    const handleEditBorrow = () => {
        message.info('Vui lòng vào trang quản lý mượn tài sản để chỉnh sửa');
    };

    const handleDownloadQr = () => {
        if (!qrRef.current) return;

        const canvas = qrRef.current.querySelector('canvas');
        if (canvas) {
            const padding = 20;
            const textSpace = 40;

            const newCanvas = document.createElement('canvas');
            const ctx = newCanvas.getContext('2d');
            if (!ctx) return;

            newCanvas.width = canvas.width + padding * 2;
            newCanvas.height = canvas.height + padding * 2 + textSpace;

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
            ctx.drawImage(canvas, padding, padding);

            ctx.fillStyle = '#000000';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${asset.code}`, newCanvas.width / 2, padding + canvas.height + textSpace / 2);

            const link = document.createElement('a');
            link.href = newCanvas.toDataURL('image/png');
            link.download = `asset-${asset.code}-qr.png`;
            link.click();
            return;
        }

        const svg = qrRef.current.querySelector('svg');
        if (svg) {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svg);

            const blob = new Blob([svgString], {
                type: 'image/svg+xml;charset=utf-8',
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `asset-${asset.code}-qr.svg`;
            link.click();
            URL.revokeObjectURL(url);
        }
    };

    const getAssetTagColor = (status) => {
        switch (status) {
            case 'AVAILABLE':
                return <Tag color="green">Sẵn sàng</Tag>;
            case 'IN_USE':
                return <Tag color="blue">Đang sử dụng</Tag>;
            case 'MAINTENANCE':
                return <Tag color="orange">Bảo trì</Tag>;
            case 'BROKEN':
                return <Tag color="red">Hỏng</Tag>;
            case 'LOST':
                return <Tag color="gray">Mất</Tag>;
            default:
                return <Tag color="default">Không xác định</Tag>;
        }
    };

    if (loading) return <Spin />;
    if (!asset) return null;

    return (
        <Spin spinning={loadingTypes}>
            <Form form={form} layout="vertical">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <Card className="lg:col-span-1">
                            <div className="flex flex-col items-center gap-2">
                                <div className="text-sm font-medium text-slate-600">QR tài sản</div>
                                <div ref={qrRef}>
                                    <QRCode
                                        value={`${process.env.REACT_APP_API_FE}/assets/${assetId}`}
                                        size={160}
                                        color="#000000"
                                        bgColor="#FFFFFF"
                                        bordered={false}
                                        ref={qrRef}
                                    />
                                </div>
                                <div>
                                    <strong style={{ color: '#1668DC' }}>{asset.code}</strong>
                                </div>
                                <div className="text-xs text-slate-500 text-center">
                                    Quét để mở nhanh trên điện thoại
                                </div>
                                <Button size="small" onClick={handleDownloadQr} icon={<QrcodeOutlined />}>
                                    Tải xuống
                                </Button>
                            </div>
                        </Card>

                        <Card
                            title={
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <span>Thông tin tài sản</span>
                                    <Button type="primary" icon={<EditOutlined />} onClick={handleOpenEditModal}>
                                        Chỉnh sửa
                                    </Button>
                                </div>
                            }
                            className="lg:col-span-2"
                        >
                            <Descriptions bordered column={{ xs: 1, sm: 2, lg: 4 }}>
                                <Descriptions.Item label="Tên tài sản" span={4}>
                                    {asset.name}
                                </Descriptions.Item>
                                <Descriptions.Item label="Model" span={2}>
                                    {asset.model}
                                </Descriptions.Item>
                                <Descriptions.Item label="Loại tài sản" span={2}>
                                    {asset.assetTypeName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày mua hàng" span={2}>
                                    {asset.purchaseDate ? dayjs(asset.purchaseDate).format('DD/MM/YYYY') : '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Phòng ban quản lý" span={2}>
                                    {asset.departmentName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tình trạng" span={2}>
                                    {getAssetTagColor(asset.status)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Mô tả" span={3}>
                                    {asset.description}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </div>

                    <Card
                        title={
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <span>Thông số kỹ thuật</span>
                                <Space>
                                    <Button
                                        icon={asset.specification ? <EditOutlined /> : <PlusOutlined />}
                                        type="primary"
                                        onClick={handleOpenSpecModal}
                                    >
                                        {asset.specification ? 'Chỉnh sửa' : 'Thêm'}
                                    </Button>
                                </Space>
                            </div>
                        }
                    >
                        <SpecificationDisplay
                            specification={asset.specification}
                            assetTypeName={asset.assetTypeName}
                            bordered={true}
                            column={{ xs: 1, sm: 2, lg: 3 }}
                        />
                    </Card>

                    <Card
                        title={
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <span>Lịch sử cấp phát</span>
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => setIsAssignModalOpen(true)}
                                    >
                                        Cấp phát
                                    </Button>
                                </Space>
                            </div>
                        }
                    >
                        <Table
                            rowKey="id"
                            pagination={false}
                            dataSource={assetAssignments}
                            scroll={{ x: 800 }}
                            columns={[
                                {
                                    title: 'Người sử dụng',
                                    dataIndex: 'employeeUseName',
                                    render: (v) => v || <Tag color="default">—</Tag>,
                                },
                                {
                                    title: 'Phòng ban sử dụng',
                                    dataIndex: 'departmentUseName',
                                    render: (v) => v || <Tag color="default">—</Tag>,
                                },
                                {
                                    title: 'Loại cấp phát',
                                    render: (v) =>
                                        v.departmentUseName ? (
                                            <Tag color="blue">Dùng chung</Tag>
                                        ) : (
                                            <Tag color="purple">Cá nhân</Tag>
                                        ),
                                },
                                {
                                    title: 'Ngày cấp phát',
                                    dataIndex: 'assignAt',
                                    render: (v) => dayjs(v).format('DD/MM/YYYY'),
                                },
                                {
                                    title: 'Ngày thu hồi',
                                    dataIndex: 'returnAt',
                                    render: (v) =>
                                        v ? dayjs(v).format('DD/MM/YYYY') : <Tag color="green">Đang sử dụng</Tag>,
                                },
                                {
                                    title: 'Thao tác',
                                    key: 'actions',
                                    render: (_, record) => (
                                        <Space>
                                            <Button
                                                icon={<EditOutlined />}
                                                type="default"
                                                onClick={() => handleEditAssignment(record)}
                                            >
                                                Sửa
                                            </Button>
                                            <Button
                                                icon={<DeleteOutlined />}
                                                type="default"
                                                danger
                                                onClick={() => handleDeleteAssignment(record.id)}
                                            >
                                                Xóa
                                            </Button>
                                        </Space>
                                    ),
                                },
                            ]}
                        />
                    </Card>

                    <Card
                        title={
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <span>Lịch sử mượn tài sản</span>
                            </div>
                        }
                    >
                        <AssetBorrowTable
                            borrowList={assetBorrows}
                            loading={borrowLoading}
                            pagination={borrowPagination}
                            onTableChange={handleBorrowTableChange}
                            onRefresh={handleRefreshBorrowTable}
                            onEditBorrow={handleEditBorrow}
                        />
                    </Card>
                </div>
            </Form>

            <AssetModal
                open={isModalOpen}
                asset={asset}
                assetTypes={assetTypes}
                loadingTypes={loadingTypes}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleEditSuccess}
                isEdit={true}
            />

            <AssetSpecificationModal
                open={isSpecModalOpen}
                assetId={assetId}
                specification={asset.specification}
                assetTypeName={asset.assetTypeName}
                onClose={() => setIsSpecModalOpen(false)}
                onSuccess={handleSpecSuccess}
            />

            <AssetAssignmentModal
                open={isAssignModalOpen}
                assetId={assetId}
                onCancel={() => setIsAssignModalOpen(false)}
                onClose={() => setIsAssignModalOpen(false)}
                onSuccess={handleAssignSuccess}
            />

            <AssetAssignmentModal
                open={isEditAssignOpen}
                assetId={assetId}
                assignment={selectedAssignment}
                onCancel={() => {
                    setIsEditAssignOpen(false);
                    setSelectedAssignment(null);
                }}
                onClose={() => {
                    setIsEditAssignOpen(false);
                    setSelectedAssignment(null);
                }}
                onSuccess={handleEditAssignSuccess}
                isEdit={true}
            />
        </Spin>
    );
};

export default AssetDetailPage;
