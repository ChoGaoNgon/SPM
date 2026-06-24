import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, message, Popconfirm, Space, Table, Tag, Tooltip, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { formatDate, formatDateTime } from '~/utils/formatter';
import productionLotService from '../../services/productionLot/productionLotService';

const { Text } = Typography;

const ProductionLotTable = ({ productPlanId, onEdit, onAdd, reloadTrigger }) => {
    const [loading, setLoading] = useState(false);
    const [productionLots, setProductionLots] = useState([]);

    const fetchProductionLots = async () => {
        if (!productPlanId) return;

        setLoading(true);
        try {
            const response = await productionLotService.getProductionLotsByProductPlan(productPlanId);

            if (Array.isArray(response)) {
                setProductionLots(response);
            } else {
                setProductionLots([]);
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách lot sản xuất');
            setProductionLots([]);
        } finally {
            setLoading(false);
        }
    };
    const handleDelete = async (id) => {
        try {
            await productionLotService.deleteProductionLot(id);
            message.success('Xóa lot sản xuất thành công');
            fetchProductionLots();
        } catch (error) {
            message.error('Lỗi khi xóa lot sản xuất');
        }
    };

    const renderQcResultTag = (result) => {
        if (!result) return <Text type="secondary">-</Text>;

        const colorMap = {
            OK: 'success',
            NG: 'error',
            PENDING: 'warning',
        };

        return <Tag color={colorMap[result] || 'default'}>{result}</Tag>;
    };

    const calculateDefectRate = (quantity, defectDetails) => {
        if (!quantity || quantity === 0) return '0%';
        const totalNgQuantity = defectDetails?.reduce((sum, detail) => sum + (detail.quantity || 0), 0) || 0;
        const rate = (totalNgQuantity / quantity) * 100;
        return `${rate.toFixed(2)}%`;
    };

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Ngày sản xuất',
            dataIndex: 'productionDate',
            key: 'productionDate',
            width: 120,
            render: (date) => (date ? formatDate(date) : '-'),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            render: (quantity) => (quantity ? quantity.toLocaleString() : '-'),
        },
        {
            title: 'Số lượng NG',
            key: 'ngQuantity',
            width: 100,
            render: (_, record) => {
                const totalNg = record.defectDetails?.reduce((sum, detail) => sum + (detail.quantity || 0), 0) || 0;
                return totalNg > 0 ? totalNg.toLocaleString() : '0';
            },
        },
        {
            title: 'Tỷ lệ lỗi',
            key: 'defectRate',
            width: 100,
            render: (_, record) => calculateDefectRate(record.quantity, record.defectDetails),
        },
        {
            title: 'Kết quả QC',
            dataIndex: 'qcCheckResult',
            key: 'qcCheckResult',
            width: 120,
            render: renderQcResultTag,
        },
        {
            title: 'Chi tiết lỗi',
            dataIndex: 'defectDetails',
            key: 'defectDetails',
            width: 250,
            render: (defectDetails) => {
                if (!defectDetails || defectDetails.length === 0) {
                    return <Text type="secondary">Không có lỗi</Text>;
                }
                return (
                    <div>
                        {defectDetails.map((detail, index) => (
                            <Tooltip
                                key={index}
                                title={`${detail.defectDescription || 'Không có mô tả'} - Số lượng: ${detail.quantity}`}
                                placement="top"
                            >
                                <Tag color="red" style={{ marginBottom: 4, cursor: 'help' }}>
                                    Mã lỗi: {detail.defectCode} - Số lượng: {detail.quantity}
                                </Tag>
                            </Tooltip>
                        ))}
                    </div>
                );
            },
        },
        {
            title: 'Người kiểm tra',
            dataIndex: 'checkedBy',
            key: 'checkedBy',
            width: 150,
            render: (checkedBy) => {
                if (!checkedBy) return <Text type="secondary">-</Text>;

                return (
                    <Tooltip title={checkedBy.name || 'Không có tên'} placement="top">
                        <Tag color="blue" style={{ cursor: 'help' }}>
                            {checkedBy.code}
                        </Tag>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (date) => (date ? formatDateTime(date) : '-'),
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa lot sản xuất này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger size="small" icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    useEffect(() => {
        fetchProductionLots();
    }, [productPlanId, reloadTrigger]);

    return (
        <div>
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => onAdd()}>
                    Thêm lot sản xuất
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={productionLots}
                loading={loading}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
                }}
                scroll={{ x: 1400 }}
                size="small"
            />
        </div>
    );
};

export default ProductionLotTable;
