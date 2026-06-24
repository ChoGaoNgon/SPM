import { DeleteOutlined, DownloadOutlined, EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Input, message, Popconfirm, Space, Spin, Table, Tabs, Tag, Upload } from 'antd';
import { debounce } from 'lodash';
import { ExternalLink, Eye, Package } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '~/modules/auth/services/authService';
import customerService from '~/modules/customer/services/customerService';
import { formatDate } from '~/utils/formatter';
import ModelFormModal from '../components/modal/ModelFormModal';
import modelService from '../services/modelService';
import productService from '../services/productService';

const { Search } = Input;
const debouncetime = 500;

const ModelListPage = () => {
    const navigate = useNavigate();

    const [models, setModels] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModel, setEditingModel] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [searchKeyword, setSearchKeyword] = useState('');
    const [productSearchKeyword, setProductSearchKeyword] = useState('');
    const [activeTab, setActiveTab] = useState('models');
    const [modelPagination, setModelPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [productPagination, setProductPagination] = useState({ current: 1, pageSize: 20, total: 0 });

    const canCreateModel = authService.hasPermission('NMD_MODEL_CREATE');
    const canUpdateModel = authService.hasPermission('NMD_MODEL_UPDATE');
    const canDeleteModel = authService.hasPermission('NMD_MODEL_DELETE');
    const canCreateManyProducts = authService.hasPermission('NMD_PRODUCT_CREATE_MANY');
    const fetchModels = async (pagination = modelPagination, keyword = searchKeyword) => {
        setLoading(true);
        try {
            const pageable = {
                page: (pagination.current || 1) - 1,
                size: pagination.pageSize || 20,
                sort: 'id,desc',
            };

            const data = keyword
                ? await modelService.searchModels(keyword, pageable)
                : await modelService.getAllModels(pageable);

            if (Array.isArray(data)) {
                setModels(data);
                setModelPagination((prev) => ({
                    ...prev,
                    current: 1,
                    pageSize: prev.pageSize,
                    total: data.length,
                }));
            } else {
                setModels(data?.content || []);
                setModelPagination((prev) => ({
                    ...prev,
                    current: (data?.number ?? 0) + 1,
                    pageSize: data?.size ?? prev.pageSize,
                    total: data?.totalElements ?? 0,
                }));
            }
        } catch (error) {
            const errorMessage = error?.message || error?.response?.data?.message || 'Lỗi khi tải danh sách model';
            messageApi.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const data = await customerService.getAllCustomer();
            setCustomers(data);
        } catch (error) {
            const errorMessage = error?.message || error?.response?.data?.message || 'Lỗi khi tải danh sách khách hàng';
            messageApi.error(errorMessage);
        }
    };

    const fetchProducts = async (pagination = productPagination, keyword = productSearchKeyword) => {
        setLoadingProducts(true);
        try {
            const page = (pagination.current || 1) - 1;
            const size = pagination.pageSize || 20;

            const result = await productService.getProductsByPage(page, size, keyword);

            setProducts(result.content);
            setProductPagination({
                current: result.currentPage + 1,
                pageSize: result.pageSize,
                total: result.totalElements,
            });
        } catch (error) {
            const errorMessage = error?.message || error?.response?.data?.message || 'Lỗi khi tải danh sách sản phẩm';
            messageApi.error(errorMessage);
        } finally {
            setLoadingProducts(false);
        }
    };

    useEffect(() => {
        fetchModels();
        fetchCustomers();
        fetchProducts();
    }, []);

    const handleSearch = async (keyword) => {
        const trimmed = keyword.trim();
        setSearchKeyword(trimmed);

        if (!trimmed) {
            await fetchModels();
            return;
        }
        try {
            const nextPagination = { ...modelPagination, current: 1 };
            setModelPagination(nextPagination);
            await fetchModels(nextPagination, trimmed);
        } catch (error) {
            const errorMessage = error?.message || error?.response?.data?.message || 'Lỗi khi tìm kiếm model';
            messageApi.error(errorMessage);
        }
    };
    const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };
    const highlightText = (text, keyword = searchKeyword) => {
        if (!keyword) return text;

        const escapedKeyword = escapeRegExp(keyword);
        const regex = new RegExp(escapedKeyword, 'gi');

        return text?.toString().replace(regex, (match) => `<mark>${match}</mark>`);
    };

    const handleProductSearch = async (keyword) => {
        const trimmed = keyword.trim();
        setProductSearchKeyword(trimmed);

        try {
            const nextPagination = { ...productPagination, current: 1 };
            setProductPagination(nextPagination);
            await fetchProducts(nextPagination, trimmed);
        } catch (error) {
            const errorMessage = error?.message || error?.response?.data?.message || 'Lỗi khi tìm kiếm sản phẩm';
            messageApi.error(errorMessage);
        }
    };

    const renderNmdStatusTag = (status) => {
        if (status === 'RETURNED') {
            return <Tag color="red">NMD yêu cầu bổ sung</Tag>;
        }
        if (status === 'RECEIVED') {
            return <Tag color="green">NDM đã nhận thông tin</Tag>;
        }
        return <Tag color="red">NMD Chưa xác nhận</Tag>;
    };

    const debouncedSearch = useMemo(() => debounce(handleSearch, debouncetime), []);
    const debouncedProductSearch = useMemo(() => debounce(handleProductSearch, debouncetime), []);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
            debouncedProductSearch.cancel();
        };
    }, [debouncedSearch, debouncedProductSearch]);

    const openAddModal = () => {
        setEditingModel(null);
        setIsModalOpen(true);
    };

    const openEditModal = (record) => {
        setEditingModel(record);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await modelService.deleteModel(id);
            messageApi.success('Xóa model thành công');
            fetchModels();
        } catch (error) {
            const errorMessage =
                error?.message ||
                error?.response?.data?.message ||
                (typeof error === 'string' ? error : 'Xóa model thất bại');

            messageApi.error(errorMessage);
        }
    };

    const handleImportExcel = async (file) => {
        setUploading(true);
        try {
            const result = await modelService.importModelsFromExcel(file);
            messageApi.success(result || 'Import Excel thành công');
            fetchModels();
        } catch (error) {
            const errorMessage = error?.message || error?.response?.data?.message || 'Lỗi khi import Excel';
            messageApi.error(errorMessage);
        } finally {
            setUploading(false);
        }
        return false;
    };

    const handleDownloadTemplate = async () => {
        try {
            await modelService.downloadTemplate();
            messageApi.success('Tải file mẫu thành công');
        } catch (error) {
            const errorMessage = error?.message || error?.response?.data?.message || 'Lỗi khi tải file mẫu';
            messageApi.error(errorMessage);
        }
    };

    const modelColumns = [
        {
            title: 'STT',
            key: 'index',
            render: (_, __, index) => (modelPagination.current - 1) * modelPagination.pageSize + index + 1,
            width: '5%',
            align: 'center',
            fixed: 'left',
        },
        {
            title: 'Mã Model',
            dataIndex: 'code',
            key: 'code',
            width: '15%',
            fixed: 'left',
            render: (code, record) => (
                <a
                    className="font-semibold inline-flex items-center gap-1.5 hover:gap-2 transition-all text-blue-600 hover:text-blue-800"
                    onClick={() => navigate(`/product-manager/models/${record.id}?kw=${searchKeyword}`)}
                >
                    <span dangerouslySetInnerHTML={{ __html: highlightText(code) }} />
                    <ExternalLink size={14} className="flex-shrink-0" />
                </a>
            ),
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customerName',
            key: 'customerName',
            width: '20%',
            filters: [
                ...Array.from(new Set(models.map((item) => item.customerName).filter(Boolean))).map((name) => ({
                    text: name,
                    value: name,
                })),
            ],
            onFilter: (value, record) => record.customerName === value,
            filterSearch: true,
            render: (text) => <span dangerouslySetInnerHTML={{ __html: highlightText(text) }} />,
        },
        {
            title: 'Ngày nhận đặt hàng',
            dataIndex: 'orderedDate',
            key: 'orderedDate',
            width: '15%',
            align: 'center',
            render: (value) => {
                if (!value) return <span style={{ color: '#999' }}>Chưa có</span>;

                const formatted = formatDate(value);
                return (
                    <span
                        dangerouslySetInnerHTML={{
                            __html: highlightText(formatted),
                        }}
                    />
                );
            },
        },
        ...(canUpdateModel || canDeleteModel
            ? [
                  {
                      title: 'Hành động',
                      key: 'actions',
                      width: '20%',
                      align: 'center',
                      render: (_, record) => (
                          <Space>
                              {canUpdateModel && (
                                  <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
                                      Sửa
                                  </Button>
                              )}
                              {canDeleteModel && (
                                  <Popconfirm
                                      title={`Bạn có chắc muốn xóa model "${record.code}"?`}
                                      okText="Xóa"
                                      cancelText="Hủy"
                                      okButtonProps={{ danger: true }}
                                      onConfirm={() => handleDelete(record.id)}
                                  >
                                      <Button size="small" danger icon={<DeleteOutlined />}>
                                          Xóa
                                      </Button>
                                  </Popconfirm>
                              )}
                          </Space>
                      ),
                  },
              ]
            : []),
    ];

    const productColumns = [
        {
            title: 'STT',
            key: 'index',
            render: (_, __, index) => index + 1,
            width: '5%',
            align: 'center',
            fixed: 'left',
        },
        {
            title: 'Mã sản phẩm',
            dataIndex: 'code',
            key: 'code',
            width: '15%',
            fixed: 'left',
            render: (code, record) => (
                <a
                    className="font-semibold inline-flex items-center gap-1.5 hover:gap-2 transition-all text-blue-600 hover:text-blue-800"
                    onClick={() => navigate(`/product-manager/models/${record.modelId}/products/${record.id}`)}
                >
                    <span dangerouslySetInnerHTML={{ __html: highlightText(code, productSearchKeyword) }} />
                    <ExternalLink size={14} className="flex-shrink-0" />
                </a>
            ),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
            render: (text) => <span dangerouslySetInnerHTML={{ __html: highlightText(text, productSearchKeyword) }} />,
        },
        {
            title: 'Mã Model',
            dataIndex: 'modelCode',
            key: 'modelCode',
            width: '15%',
            render: (text) => <span dangerouslySetInnerHTML={{ __html: highlightText(text, productSearchKeyword) }} />,
        },
        {
            title: 'Loại sản phẩm',
            dataIndex: 'productCategory',
            key: 'productCategory',
            width: '15%',
            render: (_, record) => {
                const label = record.categoryName || record.productCategory || 'Không có';
                const color = record.categoryColor || 'default';
                return <Tag color={color}>{label}</Tag>;
            },
        },
        {
            title: 'Mã khuôn',
            dataIndex: 'moldCode',
            key: 'moldCode',
            width: '15%',
            render: (text) => (
                <span dangerouslySetInnerHTML={{ __html: highlightText(text || 'Không có', productSearchKeyword) }} />
            ),
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customerName',
            key: 'customerName',
            width: '15%',
            render: (text) => <span dangerouslySetInnerHTML={{ __html: highlightText(text, productSearchKeyword) }} />,
        },
        {
            title: 'Trạng thái duyệt',
            dataIndex: 'nmdInfoStatus',
            key: 'nmdInfoStatus',
            width: '15%',
            render: (status, record) => {
                if (!record.isApprovedByHeadKD) {
                    return <Tag color="yellow">Đợi phòng KD duyệt</Tag>;
                }

                return renderNmdStatusTag(status);
            },
        },
        {
            title: 'Ghi chú',
            dataIndex: 'remark',
            key: 'remark',
            width: '15%',
            render: (text) => <span className="text-gray-600 dark:text-gray-400">{text || 'Không có ghi chú'}</span>,
        },
    ];

    return (
        <>
            {contextHolder}
            <div className="space-y-6">
                <div className="rounded-xl p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <div className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 tracking-wide">
                                📋 Quản lý Model
                            </div>
                            <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                                Danh sách Model
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                Tìm kiếm, nhập Excel và quản trị model
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {canCreateModel && (
                                <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
                                    Thêm mới
                                </Button>
                            )}
                            {canCreateManyProducts && (
                                <Upload beforeUpload={handleImportExcel} showUploadList={false} accept=".xlsx,.xls">
                                    <Button icon={<UploadOutlined />} loading={uploading}>
                                        Import Excel
                                    </Button>
                                </Upload>
                            )}
                            {canCreateManyProducts && (
                                <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
                                    Tải file mẫu
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-xl p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        size="middle"
                        items={[
                            {
                                key: 'models',
                                label: <span className="flex items-center gap-1.5">Models </span>,
                                children: (
                                    <div>
                                        <Spin spinning={loading}>
                                            <div className="hidden md:block">
                                                <div>
                                                    <div className="w-full md:w-96">
                                                        <Search
                                                            placeholder="Tìm kiếm model"
                                                            allowClear
                                                            enterButton
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                debouncedSearch(value);
                                                                if (!value.trim()) {
                                                                    setSearchKeyword('');
                                                                    const nextPagination = {
                                                                        ...modelPagination,
                                                                        current: 1,
                                                                    };
                                                                    setModelPagination(nextPagination);
                                                                    fetchModels(nextPagination, '');
                                                                }
                                                            }}
                                                            onSearch={handleSearch}
                                                            className="mb-2"
                                                        />
                                                    </div>
                                                </div>
                                                <Table
                                                    size="small"
                                                    rowKey="id"
                                                    columns={modelColumns}
                                                    dataSource={models}
                                                    bordered={false}
                                                    scroll={{ y: 'calc(100vh - 200px)', x: 1000 }}
                                                    pagination={{
                                                        current: modelPagination.current,
                                                        pageSize: modelPagination.pageSize,
                                                        total: modelPagination.total,
                                                        showSizeChanger: true,
                                                        showTotal: (total, range) =>
                                                            `${range[0]}-${range[1]} của ${total} model`,
                                                    }}
                                                    onChange={(pagination) => {
                                                        const nextPagination = {
                                                            current: pagination.current,
                                                            pageSize: pagination.pageSize,
                                                            total: modelPagination.total,
                                                        };
                                                        setModelPagination(nextPagination);
                                                        fetchModels(nextPagination, searchKeyword);
                                                    }}
                                                    className="rounded-xl overflow-hidden shadow-sm"
                                                />
                                            </div>

                                            <div className="md:hidden space-y-2 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-700">
                                                {models.length === 0 ? (
                                                    <div className="text-center text-sm text-gray-500 py-4">
                                                        Không có dữ liệu
                                                    </div>
                                                ) : (
                                                    models.map((item, idx) => (
                                                        <div
                                                            key={item.id || idx}
                                                            className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 p-2.5 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                                                            role="button"
                                                            onClick={() =>
                                                                navigate(`/product-manager/models/${item.id}`)
                                                            }
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400 font-mono">
                                                                            #
                                                                            {(modelPagination.current - 1) *
                                                                                modelPagination.pageSize +
                                                                                idx +
                                                                                1}
                                                                        </span>
                                                                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                                            {item.code}
                                                                        </span>
                                                                    </div>
                                                                    {item.customerName && (
                                                                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">
                                                                            👤 {item.customerName}
                                                                        </div>
                                                                    )}
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                        📅{' '}
                                                                        {item.orderedDate
                                                                            ? formatDate(item.orderedDate)
                                                                            : 'Chưa có ngày'}
                                                                    </div>
                                                                </div>
                                                                {(canUpdateModel || canDeleteModel) && (
                                                                    <div className="flex flex-col gap-1">
                                                                        {canUpdateModel && (
                                                                            <Button
                                                                                size="small"
                                                                                type="text"
                                                                                icon={<EditOutlined />}
                                                                                className="w-8 h-8 p-0 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900"
                                                                                title="Sửa"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    openEditModal(item);
                                                                                }}
                                                                            />
                                                                        )}
                                                                        {canDeleteModel && (
                                                                            <Popconfirm
                                                                                title={`Xóa model "${item.code}"?`}
                                                                                okText="Xóa"
                                                                                cancelText="Hủy"
                                                                                okButtonProps={{ danger: true }}
                                                                                onConfirm={() => handleDelete(item.id)}
                                                                            >
                                                                                <Button
                                                                                    size="small"
                                                                                    type="text"
                                                                                    danger
                                                                                    icon={<DeleteOutlined />}
                                                                                    className="w-8 h-8 p-0 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900"
                                                                                    title="Xóa"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                />
                                                                            </Popconfirm>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </Spin>
                                    </div>
                                ),
                            },
                            {
                                key: 'products',
                                label: <span className="flex items-center gap-1.5">Sản phẩm </span>,
                                children: (
                                    <div>
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                                            <div className="w-full md:w-96">
                                                <Search
                                                    placeholder="Tìm kiếm sản phẩm"
                                                    allowClear
                                                    enterButton
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        debouncedProductSearch(value);
                                                        if (!value.trim()) {
                                                            setProductSearchKeyword('');
                                                            const nextPagination = {
                                                                ...productPagination,
                                                                current: 1,
                                                            };
                                                            setProductPagination(nextPagination);
                                                            fetchProducts(nextPagination, '');
                                                        }
                                                    }}
                                                    onSearch={handleProductSearch}
                                                    className="mb-2"
                                                />
                                            </div>
                                        </div>

                                        <Spin spinning={loadingProducts}>
                                            <div className="hidden md:block">
                                                <Table
                                                    size="small"
                                                    rowKey="id"
                                                    columns={productColumns}
                                                    dataSource={products}
                                                    bordered={false}
                                                    scroll={{ y: 'calc(100vh - 200px)', x: 1200 }}
                                                    pagination={{
                                                        current: productPagination.current,
                                                        pageSize: productPagination.pageSize,
                                                        total: productPagination.total,
                                                        showSizeChanger: true,
                                                        showTotal: (total, range) =>
                                                            `${range[0]}-${range[1]} của ${total} sản phẩm`,
                                                    }}
                                                    onChange={(pagination) => {
                                                        const nextPagination = {
                                                            current: pagination.current,
                                                            pageSize: pagination.pageSize,
                                                            total: productPagination.total,
                                                        };
                                                        setProductPagination(nextPagination);
                                                        fetchProducts(nextPagination, productSearchKeyword);
                                                    }}
                                                    className="rounded-xl overflow-hidden shadow-sm"
                                                />
                                            </div>

                                            <div className="md:hidden space-y-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-700">
                                                {products.length === 0 ? (
                                                    <div className="text-center text-sm text-gray-500 py-8">
                                                        <Package size={48} className="mx-auto mb-4 text-gray-300" />
                                                        <div>Không có sản phẩm nào</div>
                                                    </div>
                                                ) : (
                                                    products.map((item, idx) => (
                                                        <div
                                                            key={item.id || idx}
                                                            className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 p-3 shadow-sm cursor-pointer hover:shadow-md transition"
                                                            role="button"
                                                            onClick={() =>
                                                                navigate(`/product-manager/products/${item.id}`)
                                                            }
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="flex-1">
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                        #
                                                                        {(productPagination.current - 1) *
                                                                            productPagination.pageSize +
                                                                            idx +
                                                                            1}
                                                                    </div>
                                                                    <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                                                        {item.code}
                                                                    </div>
                                                                    <div className="text-sm text-gray-700 dark:text-gray-200">
                                                                        {item.name}
                                                                    </div>
                                                                    {item.modelCode && (
                                                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                                                            Model: {item.modelCode}
                                                                        </div>
                                                                    )}
                                                                    {(item.categoryName || item.productCategory) && (
                                                                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                                            <Tag
                                                                                color={item.categoryColor || 'default'}
                                                                            >
                                                                                {item.categoryName ||
                                                                                    item.productCategory}
                                                                            </Tag>
                                                                        </div>
                                                                    )}
                                                                    {item.moldCode && (
                                                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                                                            Khuôn: {item.moldCode}
                                                                        </div>
                                                                    )}
                                                                    <div className="mt-1">
                                                                        {renderNmdStatusTag(item.nmdInfoStatus)}
                                                                    </div>
                                                                    <div className="mt-1">
                                                                        <span
                                                                            className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                                                                item.status === 'COMPLETED'
                                                                                    ? 'bg-green-100 text-green-800 border-green-200'
                                                                                    : item.status === 'IN_PROGRESS'
                                                                                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                                                                                      : item.status === 'PENDING'
                                                                                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                                                        : 'bg-gray-100 text-gray-800 border-gray-200'
                                                                            }`}
                                                                        >
                                                                            {item.status}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <Eye size={16} className="text-gray-400" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </Spin>
                                    </div>
                                ),
                            },
                        ]}
                    />
                </div>

                <ModelFormModal
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    onSuccess={fetchModels}
                    editingModel={editingModel}
                    customers={customers}
                />
            </div>
        </>
    );
};

export default ModelListPage;
