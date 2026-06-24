import {
    FileExcelOutlined,
    PlusOutlined,
    SearchOutlined,
    DownloadOutlined,
    DownOutlined,
    LoadingOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Button, Space, Row, Col, Table, Tag, message, Spin, Input } from 'antd';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import orderService from '~/modules/purchase-order/services/orderService';
import CreateOrderModal from '../components/CreateOrderModal';
import ReceiveOrderModal from '../components/ReceiveOrderModal';
import PageHeader from '~/components/PageHeader';
import { ShoppingBasket } from 'lucide-react';

const { Search } = Input;

const useOrderData = () => {
    const [orders, setOrders] = useState([]);
    const fetchOrders = async () => {
        try {
            const result = await orderService.getOrders();
            setOrders(result);
        } catch (error) {
            message.error(error);
        }
    };
    useEffect(() => {
        fetchOrders();
    }, []);
    return { orders, setOrders, fetchOrders };
};

const useExpandable = () => {
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);
    const [expandedData, setExpandedData] = useState({});
    const [loadingExpandedRow, setLoadingExpandedRow] = useState({});
    const [orderId, setOrderId] = useState(null);

    const loadOrderItems = async (id) => {
        setLoadingExpandedRow((prev) => ({ ...prev, [id]: true }));
        try {
            const items = await orderService.getOrderItemByOrderId(id);
            setExpandedData((prev) => ({ ...prev, [id]: items }));
        } catch {
            message.error('Không thể tải danh sách vật tư');
        } finally {
            setLoadingExpandedRow((prev) => ({ ...prev, [id]: false }));
        }
    };

    return {
        expandedRowKeys,
        setExpandedRowKeys,
        expandedData,
        loadingExpandedRow,
        loadOrderItems,
        setOrderId,
        orderId,
    };
};

const ElectricalOrderPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [selectedOrderItem, setSelectedOrderItem] = useState(null);

    const { orders, setOrders, fetchOrders } = useOrderData();
    const {
        expandedRowKeys,
        setExpandedRowKeys,
        expandedData,
        loadingExpandedRow,
        loadOrderItems,
        setOrderId,
        orderId,
    } = useExpandable();

    const handleDownloadTemplate = async () => {
        try {
            await orderService.downloadTemplate();
            message.success('Tải file mẫu thành công');
        } catch (error) {
            message.error(error.message);
        }
    };

    const handleSearch = async (materialCode) => {
        if (materialCode !== '') {
            const orders = await orderService.getOrdersByMaterialCode(materialCode);
            setOrders(orders);
        }
    };

    const handleToggleReceive = (record) => {
        setSelectedOrderItem(record);
        setIsReceiveModalOpen(true);
    };

    const orderColumns = [
        {
            title: 'Số chứng từ',
            dataIndex: 'documentNumber',
            width: '15%',
            render: (text) => <span className="font-semibold text-slate-900">{text}</span>,
            sorter: (a, b) => a.documentNumber.localeCompare(b.documentNumber),
        },
        {
            title: 'Người đặt hàng',
            dataIndex: 'employeeName',
            width: '25%',
            filters: Array.from(new Set(orders.map((o) => o.employeeName))).map((name) => ({
                text: name,
                value: name,
            })),
            onFilter: (value, record) => record.employeeName === value,
            render: (text) => <span className="text-slate-700">{text}</span>,
        },
        {
            title: 'Ngày đặt hàng',
            dataIndex: 'orderDate',
            width: '15%',
            render: (text) => <span className="text-slate-600">{dayjs(text).format('DD/MM/YYYY')}</span>,
            sorter: (a, b) => dayjs(a.orderDate).unix() - dayjs(b.orderDate).unix(),
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            width: '25%',
            render: (text) => <span className="text-slate-600 line-clamp-2">{text || '-'}</span>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: '10%',
            filters: [
                { text: 'PENDING', value: 'PENDING' },
                { text: 'DONE', value: 'DONE' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => {
                const statusConfig = {
                    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <ClockCircleOutlined /> },
                    DONE: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircleOutlined /> },
                };
                const config = statusConfig[status] || { bg: 'bg-slate-100', text: 'text-slate-800' };
                return (
                    <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
                    >
                        {config.icon}
                        {status}
                    </span>
                );
            },
        },
    ];

    const itemColumns = (handleToggleReceive) => [
        {
            title: 'Mã vật tư',
            dataIndex: 'materialCode',
            render: (text) => <span className="font-mono font-semibold text-blue-600">{text}</span>,
        },
        {
            title: 'Tên vật tư',
            dataIndex: 'materialName',
            render: (text) => <span className="text-slate-900 font-medium">{text}</span>,
        },
        {
            title: 'Số lượng đặt',
            dataIndex: 'quantityOrdered',
            render: (text) => <span className="font-semibold text-slate-700">{text}</span>,
        },
        {
            title: 'Đã nhận',
            dataIndex: 'quantityReceived',
            render: (text) => <span className="text-green-600 font-semibold">{text || 0}</span>,
        },
        { title: 'Đơn vị', dataIndex: 'unit', render: (text) => <span className="text-slate-600">{text}</span> },
        { title: 'Mục đích', dataIndex: 'purpose', render: (text) => <span className="text-slate-600">{text}</span> },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            render: (text) => <span className="text-slate-600">{text || '-'}</span>,
        },
        {
            title: 'Tình trạng nhận',
            dataIndex: 'receivedDate',
            render: (text, record) => {
                const qtyReceived = record.quantityReceived || 0;
                const qtyOrdered = record.quantityOrdered || 0;

                let bgColor = 'bg-red-100';
                let textColor = 'text-red-800';
                let icon = <ExclamationCircleOutlined />;
                let label = 'Chưa nhận';

                if (qtyReceived >= qtyOrdered && qtyOrdered > 0) {
                    bgColor = 'bg-green-100';
                    textColor = 'text-green-800';
                    icon = <CheckCircleOutlined />;
                    label = 'Đã nhận đủ';
                } else if (qtyReceived > 0 && qtyReceived < qtyOrdered) {
                    bgColor = 'bg-amber-100';
                    textColor = 'text-amber-800';
                    icon = <ClockCircleOutlined />;
                    label = 'Nhận chưa đủ';
                }

                return (
                    <button
                        onClick={() => handleToggleReceive(record)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${bgColor} ${textColor} hover:shadow-md transition-all cursor-pointer`}
                    >
                        {icon}
                        {label}
                    </button>
                );
            },
        },
    ];

    return (
        <div>
            <PageHeader
                icon={ShoppingBasket}
                title="Quản lý Đơn hàng"
                description="Theo dõi và quản lý các đơn hàng mua nguyên vật liệu"
            />

            <div className="mb-8 bg-white rounded-xl shadow-sm p-5 border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative w-full md:w-72">
                    <SearchOutlined className="absolute left-3 top-3 text-slate-400 text-lg" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã vật tư..."
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch(e.target.value);
                            }
                        }}
                        onChange={(e) => e.target.value === '' && fetchOrders()}
                        className="w-full pl-10 pr-4 py-2.5 text-slate-700 placeholder-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                        <PlusOutlined className="text-lg" />
                        Tạo đơn hàng
                    </button>
                    <button
                        onClick={handleDownloadTemplate}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                        <DownloadOutlined className="text-lg" />
                        Tải mẫu đơn hàng
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <Table
                    dataSource={orders}
                    rowKey="id"
                    columns={orderColumns}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]} đến ${range[1]} của ${total} đơn hàng`,
                        className: 'px-6 py-4',
                    }}
                    expandable={{
                        expandedRowKeys,
                        onExpand: async (expanded, record) => {
                            setExpandedRowKeys([]);
                            if (expanded) {
                                setOrderId(record.id);
                                await loadOrderItems(record.id);
                                setExpandedRowKeys([record.id]);
                            }
                        },
                        expandedRowRender: (record) =>
                            loadingExpandedRow[record.id] ? (
                                <div className="flex justify-center py-8">
                                    <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <Table
                                        dataSource={expandedData[record.id] || []}
                                        columns={itemColumns(handleToggleReceive)}
                                        pagination={false}
                                        rowKey="id"
                                        size="small"
                                        className="border border-slate-200 rounded-lg"
                                    />
                                </div>
                            ),
                        rowExpandable: () => true,
                        expandIcon: ({ expanded, onExpand, record }) => (
                            <button
                                onClick={(e) => onExpand(record, e)}
                                className="text-slate-600 hover:text-blue-600 transition-colors"
                            >
                                <DownOutlined
                                    style={{
                                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.3s ease',
                                    }}
                                />
                            </button>
                        ),
                    }}
                    className="border-none"
                    rowClassName="hover:bg-blue-50 transition-colors"
                />
            </div>

            <CreateOrderModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchOrders();
                }}
            />

            <ReceiveOrderModal
                open={isReceiveModalOpen}
                orderItem={selectedOrderItem}
                onCancel={() => setIsReceiveModalOpen(false)}
                onSuccess={() => {
                    setIsReceiveModalOpen(false);
                    fetchOrders();
                    loadOrderItems(orderId);
                }}
            />
        </div>
    );
};

export default ElectricalOrderPage;
