import React, { useState, useEffect } from 'react';
import { Package, Search, Eye } from 'lucide-react';
import { Table, Modal, Tag } from 'antd';
import nmdStatisticsService from '../../modules/dashboard/service/NMDStatisticsService';
import { PLAN_TYPE_LABELS } from '../../constants/planTypes';
import { openProductDetail } from '~/utils/navigationUtils';

const ProductListTable = ({ planType, planTitle, isOpen, onClose }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        if (isOpen && planType) {
            fetchProducts();
        }
    }, [isOpen, planType]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = products.filter(
                (product) =>
                    product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.moldCode?.toLowerCase().includes(searchTerm.toLowerCase()),
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
    }, [searchTerm, products]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await nmdStatisticsService.getProductsByPlanType(planType);
            setProducts(response.products || []);
            setFilteredProducts(response.products || []);
        } catch (error) {
            setProducts([]);
            setFilteredProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setProducts([]);
        setFilteredProducts([]);
        setSearchTerm('');
        onClose();
    };

    const renderNmdStatusTag = (status) => {
        if (status === 'RETURNED') {
            return <Tag color="red">Yeu cau bo sung</Tag>;
        }
        if (status === 'RECEIVED') {
            return <Tag color="green">Da nhan thong tin</Tag>;
        }
        return <Tag>Chua xac nhan</Tag>;
    };

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            align: 'center',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Mã sản phẩm',
            dataIndex: 'code',
            key: 'code',
            width: 150,
            render: (text, record) => (
                <span
                    className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer underline"
                    onClick={() => openProductDetail(record)}
                    title="Click để xem chi tiết sản phẩm"
                >
                    {text || 'N/A'}
                </span>
            ),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            with: 250,
            render: (text) => <span className="text-gray-800">{text || 'N/A'}</span>,
        },
        {
            title: 'Mã model',
            dataIndex: 'modelCode',
            key: 'modelCode',
            width: 150,
        },
        {
            title: 'Mã khuôn',
            dataIndex: 'moldCode',
            key: 'moldCode',
            width: 150,
            render: (text) => <span className="text-gray-600">{text || 'Không có'}</span>,
        },
        {
            title: 'Trạng thái NMD',
            dataIndex: 'nmdInfoStatus',
            key: 'nmdInfoStatus',
            width: 170,
            render: (status) => renderNmdStatusTag(status),
        },
    ];

    if (!isOpen) return null;

    return (
        <Modal
            title={
                <div className="flex items-center space-x-3">
                    <Package className="w-6 h-6 text-blue-600" />
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Danh sách sản phẩm - {planTitle}</h2>
                        <p className="text-sm text-gray-600">
                            {PLAN_TYPE_LABELS[planType]} ({filteredProducts.length} sản phẩm)
                        </p>
                    </div>
                </div>
            }
            open={isOpen}
            onCancel={handleClose}
            footer={
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        {searchTerm && (
                            <span>
                                Tìm kiếm: "{searchTerm}" - {filteredProducts.length} kết quả
                            </span>
                        )}
                    </div>
                </div>
            }
            width={1200}
            centered={true}
            bodyStyle={{ padding: '20px' }}
        >
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã sản phẩm, tên sản phẩm, mã khuôn..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
            </div>

            <div className="overflow-auto" style={{ maxHeight: '60vh' }}>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredProducts}
                        rowKey="id"
                        size="small"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`,
                            pageSizeOptions: ['10', '20', '50'],
                        }}
                        locale={{
                            emptyText: (
                                <div className="text-center py-8">
                                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">
                                        {searchTerm ? 'Không tìm thấy sản phẩm nào phù hợp' : 'Chưa có sản phẩm nào'}
                                    </p>
                                </div>
                            ),
                        }}
                        scroll={{ y: 400 }}
                        className="product-list-table"
                    />
                )}
            </div>
        </Modal>
    );
};

export default ProductListTable;
