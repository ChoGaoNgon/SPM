import {
    CalendarOutlined,
    CloseCircleOutlined,
    CopyOutlined,
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Button, Card, Input, Space, Table, Tabs, Tag, Typography, message } from 'antd';
import { ExternalLink } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import authService from '~/modules/auth/services/authService';
import customerService from '~/modules/customer/services/customerService';
import modelService from '../services/modelService';
import productService from '../services/productService';

import ApproveSendMailModal from '../components/modal/ApproveSendMailModal';
import BomlistFormModal from '../components/modal/BomlistFormModal';
import ModelFormModal from '../components/modal/ModelFormModal';
import BomlistTable from '../components/table/BomlistTable';

import LoadingCentered from '~/components/LoadingCentered';
import highlightText from '~/utils/highlightText';
import renderProgressStatus from '~/utils/progressStatusMapping';
import { renderNmdStatusTag } from '~/utils/renderTag';

const { Title } = Typography;

const renderProductCategory = (product) => {
    const categoryName = product?.categoryName || product?.productCategory?.replace(/_/g, ' ') || 'Chưa phân loại';
    const categoryColor = product?.categoryColor || 'default';

    return <Tag color={categoryColor}>{categoryName}</Tag>;
};

const getProductCategoryType = (product) => {
    const category = product?.productCategory || '';
    const categoryName = product?.categoryName || '';

    if (category.includes('FINISHED')) return 'FINISHED';
    if (category.includes('SECOND_PROCESS')) return 'SECOND_PROCESS';

    if (categoryName.includes('Thành phẩm')) return 'FINISHED';
    if (categoryName.includes('Bán thành phẩm')) return 'SECOND_PROCESS';

    return 'UNKNOWN';
};

const buildProductHierarchy = (productList) => {
    if (!Array.isArray(productList) || productList.length === 0) {
        return [];
    }

    const nodes = productList.map((p) => ({ ...p }));
    const codeMap = new Map();

    nodes.forEach((node) => {
        if (!node?.code) {
            return;
        }
        if (!codeMap.has(node.code)) {
            codeMap.set(node.code, []);
        }
        codeMap.get(node.code).push(node);
    });

    const roots = [];

    nodes.forEach((node) => {
        const categoryType = getProductCategoryType(node);
        const code = node?.code || '';


        if (categoryType === 'SECOND_PROCESS' && code && code.includes('-')) {
            const parts = code.split('-');

            const parentCode = parts.slice(0, -1).join('-');
            const possibleParents = codeMap.get(parentCode) || [];
            const parentNode = possibleParents.find((p) => getProductCategoryType(p) === 'FINISHED');

            console.log('  -> Tìm parent:', { parentCode, foundParent: !!parentNode });

            if (parentNode && parentNode.id !== node.id) {
                if (!Array.isArray(parentNode.children)) {
                    parentNode.children = [];
                }
                parentNode.children.push(node);
                return;
            }
        }

        if (categoryType === 'FINISHED' && code && code.match(/-(?:DUP|COPY|Copy|Dup|\d{2})$/i)) {
            const parts = code.split('-');
            const parentCode = parts.slice(0, -1).join('-');
            const possibleParents = codeMap.get(parentCode) || [];
            const parentNode = possibleParents.find(
                (p) => getProductCategoryType(p) === 'FINISHED' && p.id !== node.id,
            );

            console.log('  -> Tìm parent theo suffix:', { parentCode, foundParent: !!parentNode });

            if (parentNode && parentNode.id !== node.id) {
                if (!Array.isArray(parentNode.children)) {
                    parentNode.children = [];
                }
                parentNode.children.push(node);
                return;
            }
        }

        roots.push(node);
    });

    console.log('Hierarchy result:', { totalRoots: roots.length, roots });
    return roots;
};

const collectAutoExpandedKeysByMoldCode = (nodes, keyword) => {
    if (!Array.isArray(nodes) || !nodes.length || !keyword?.trim()) {
        return [];
    }

    const normalizedKeyword = keyword.trim().toLowerCase();
    const expandedKeys = new Set();

    const walk = (node) => {
        if (!node) {
            return false;
        }

        const selfMatched = (node.moldCode || '').toString().toLowerCase().includes(normalizedKeyword);
        const children = Array.isArray(node.children) ? node.children : [];

        let childMatched = false;
        children.forEach((child) => {
            if (walk(child)) {
                childMatched = true;
            }
        });

        if (childMatched && node.id !== undefined && node.id !== null) {
            expandedKeys.add(node.id);
        }

        return selfMatched || childMatched;
    };

    nodes.forEach(walk);

    return Array.from(expandedKeys);
};

const collectAllExpandableKeys = (nodes) => {
    if (!Array.isArray(nodes) || !nodes.length) {
        return [];
    }

    const keys = [];
    nodes.forEach((node) => {
        if (Array.isArray(node.children) && node.children.length > 0 && node.id !== undefined && node.id !== null) {
            keys.push(node.id);
            keys.push(...collectAllExpandableKeys(node.children));
        }
    });

    return keys;
};

const ModelDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = searchParams.get('kw') || '';

    const [searchQueries, setSearchQueries] = useState({});

    const handleColumnSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchQueries((prev) => ({ ...prev, [dataIndex]: selectedKeys[0] || '' }));
    };

    const handleResetColumn = (clearFilters, confirm, dataIndex) => {
        clearFilters();
        setSearchQueries((prev) => ({ ...prev, [dataIndex]: '' }));
        confirm();
    };

    const getColumnSearchProps = (dataIndex, placeholder) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    placeholder={`Tìm ${placeholder}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleColumnSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleColumnSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                    >
                        Tìm
                    </Button>
                    <Button
                        onClick={() => handleResetColumn(clearFilters, confirm, dataIndex)}
                        size="small"
                        icon={<CloseCircleOutlined />}
                    >
                        Đặt lại
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) => {
            const recordValue = record[dataIndex];
            return recordValue ? recordValue.toString().toLowerCase().includes(value.toLowerCase()) : false;
        },
    });

    const [model, setModel] = useState(null);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openApproveMailModal, setOpenApproveMailModal] = useState(false);
    const [openBomlistModal, setOpenBomlistModal] = useState(false);
    const [editingBomlist, setEditingBomlist] = useState(null);
    const [reloadBomlist, setReloadBomlist] = useState(false);
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);

    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || '1');

    const canAddProduct = authService.hasPermission('NMD_PRODUCT_CREATE');
    const canDuplicateProduct = authService.hasPermission('NMD_PRODUCT_CREATE');
    const canEditModel = authService.hasPermission('NMD_MODEL_UPDATE');
    const canSendApprovalMail = authService.hasPermission('NMD_MODEL_SEND_MAIL');
    const canAddBomlist = authService.hasPermission('NMD_BOMLIST_CREATE');

    const openBomlistModalForEdit = useCallback((bomlist) => {
        setEditingBomlist(bomlist);
        setOpenBomlistModal(true);
    }, []);

    useEffect(() => {
        customerService
            .getAllCustomer()
            .then(setCustomers)
            .catch((e) => message.error(e.message));
    }, []);

    useEffect(() => {
        if (!id) return;

        Promise.all([modelService.getModelById(id), productService.getProductsByModelId(id)])
            .then(([modelData, productsData]) => {
                if (!modelData) {
                    message.error('Model không tồn tại');
                    navigate('/product-manager/models');
                    return;
                }
                setModel(modelData);
                setProducts(productsData);
            })
            .catch((e) => {
                message.error(e.message || 'Không tải được model');
                navigate('/product-manager/models');
            });
    }, [id]);

    useEffect(() => {
        setActiveTab(searchParams.get('tab') || '1');
    }, [searchParams]);

    useEffect(() => {
        if (keyword && products.length > 0) {
            const timer = setTimeout(() => {
                const highlightedElements = document.getElementsByTagName('mark');

                const target = Array.from(highlightedElements).find(
                    (el) => el.textContent.trim().toLowerCase() === keyword.toLowerCase(),
                );

                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });

                    target.style.outline = '2px solid #1890ff';
                    target.style.borderRadius = '2px';
                    setTimeout(() => {
                        target.style.outline = 'none';
                    }, 2000);
                }
            }, 600);

            return () => clearTimeout(timer);
        }
    }, [keyword, products, activeTab]);

    const reloadModelData = useCallback(async () => {
        try {
            const [modelData, productsData] = await Promise.all([
                modelService.getModelById(id),
                productService.getProductsByModelId(id),
            ]);
            setModel(modelData);
            setProducts(productsData);
            return { modelData, productsData };
        } catch (e) {
            message.error(e.message);
            return null;
        }
    }, [id]);

    const handleModelSaveSuccess = () => {
        setIsModalOpen(false);
        reloadModelData();
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        setSearchParams({ tab: key });
    };

    const handleDuplicateProduct = useCallback(
        async (product) => {
            if (!product?.id) {
                message.error('Không xác định được sản phẩm để sao chép');
                return;
            }

            try {
                await productService.duplicateProduct(product.id);
                message.success(`Đã sao chép sản phẩm ${product.code || ''}`.trim());
                const refreshed = await reloadModelData();

                if (refreshed?.productsData) {
                    const nextHierarchy = buildProductHierarchy(refreshed.productsData);
                    setExpandedRowKeys(collectAllExpandableKeys(nextHierarchy));
                }
            } catch (error) {
                message.error(error?.message || 'Sao chép sản phẩm thất bại');
            }
        },
        [reloadModelData],
    );

    const productColumns = useMemo(
        () => [
            {
                title: 'STT',
                render: (_, __, index) => index + 1,
                width: 60,
                align: 'center',
                fixed: 'left',
            },
            {
                title: 'Mã sản phẩm',
                dataIndex: 'code',
                width: 180,
                fixed: 'left',
                ...getColumnSearchProps('code', 'Mã sản phẩm'),
                render: (code, record) => (
                    <a
                        className="font-semibold inline-flex items-center gap-1.5 hover:gap-2 transition-all text-blue-600 hover:text-blue-800"
                        onClick={() => navigate(`/product-manager/models/${id}/products/${record.id}?kw=${keyword}`)}
                    >
                        <span>
                            {highlightText(code, searchQueries.code || keyword, {
                                markClassName: 'bg-orange-300 p-0 rounded-sm',
                                markProps: { 'data-keyword': searchQueries.code || keyword },
                                textKeyPrefix: `product-code-${record.id}`,
                            })}
                        </span>
                        <ExternalLink size={14} className="flex-shrink-0" />
                    </a>
                ),
            },
            {
                title: 'Tên sản phẩm',
                dataIndex: 'name',
                width: 200,
                ...getColumnSearchProps('name', 'Tên sản phẩm'),
                render: (text, record) => (
                    <span>
                        {highlightText(text, searchQueries.name || keyword, {
                            markClassName: 'bg-orange-300 p-0 rounded-sm',
                            markProps: { 'data-keyword': searchQueries.name || keyword },
                            textKeyPrefix: `product-name-${record.id}`,
                        })}
                    </span>
                ),
            },
            {
                title: 'Loại sản phẩm',
                dataIndex: 'productCategory',
                width: 160,
                align: 'center',
                render: (_, record) => renderProductCategory(record),
            },
            {
                title: 'Mã khuôn',
                dataIndex: 'moldCode',
                width: 180,
                ...getColumnSearchProps('moldCode', 'Mã khuôn'),
                render: (text, record) => (
                    <span>
                        {highlightText(text, searchQueries.moldCode || keyword, {
                            markClassName: 'bg-orange-300 p-0 rounded-sm',
                            markProps: { 'data-keyword': searchQueries.moldCode || keyword },
                            textKeyPrefix: `mold-code-${record.id}`,
                        })}
                    </span>
                ),
            },
            {
                title: 'Ghi chú',
                dataIndex: 'remark',
                width: 200,
            },
            {
                title: 'NMD',
                key: 'nmdStatus',
                width: 170,
                align: 'center',
                render: (_, record) => renderNmdStatusTag(record),
            },
            {
                title: 'Thao tác',
                key: 'actions',
                width: 130,
                align: 'center',
                fixed: 'right',
                render: (_, record) =>
                    canDuplicateProduct ? (
                        <Button
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateProduct(record);
                            }}
                        >
                            Sao chép
                        </Button>
                    ) : null,
            },
        ],
        [id, navigate, searchQueries, keyword, canDuplicateProduct, handleDuplicateProduct],
    );

    const hierarchicalProducts = useMemo(() => buildProductHierarchy(products), [products]);

    useEffect(() => {
        if (activeTab !== '1') {
            return;
        }

        if (!keyword?.trim()) {
            return;
        }

        const autoExpanded = collectAutoExpandedKeysByMoldCode(hierarchicalProducts, keyword);
        setExpandedRowKeys(autoExpanded);
    }, [activeTab, hierarchicalProducts, keyword]);

    if (!model) {
        return <LoadingCentered />;
    }

    return (
        <div className="space-y-3">
            <Card size="small" className="shadow-sm">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Title level={5} className="!mb-0 !text-lg">
                            {model.code}
                        </Title>
                        <div className="flex items-center gap-2">
                            {canSendApprovalMail && (
                                <Button size="small" type="primary" onClick={() => setOpenApproveMailModal(true)}>
                                    Phê duyệt tất cả sản phẩm và gửi mail
                                </Button>
                            )}
                            {canEditModel && (
                                <Button size="small" icon={<EditOutlined />} onClick={() => setIsModalOpen(true)}>
                                    Sửa
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="text-blue-500 bg-blue-50 p-1 rounded">
                                <UserOutlined className="text-xs" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Khách hàng</div>
                                <div className="font-medium text-sm">{model.customerName || 'Chưa có'}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="text-green-500 bg-green-50 p-1 rounded">
                                <CalendarOutlined className="text-xs" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Ngày đặt hàng</div>
                                <div className="font-medium text-sm">
                                    {model.orderedDate
                                        ? new Date(model.orderedDate).toLocaleDateString('vi-VN')
                                        : 'Chưa có'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Tabs activeKey={activeTab} onChange={handleTabChange} type="card" size="small">
                <Tabs.TabPane tab="Sản phẩm" key="1">
                    <div className="flex justify-end mb-2">
                        {canAddProduct && (
                            <Button
                                type="primary"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() => navigate(`${location.pathname}/create`)}
                            >
                                Thêm sản phẩm
                            </Button>
                        )}
                    </div>

                    <div className="md:hidden">
                        <ProductListMobile
                            products={hierarchicalProducts}
                            modelId={model.id}
                            navigate={navigate}
                            canDuplicateProduct={canDuplicateProduct}
                            onDuplicateProduct={handleDuplicateProduct}
                        />
                    </div>

                    <div className="hidden md:block">
                        <Table
                            size="small"
                            rowKey="id"
                            dataSource={hierarchicalProducts}
                            columns={productColumns}
                            expandable={{
                                expandedRowKeys,
                                onExpandedRowsChange: (keys) => setExpandedRowKeys(keys),
                                rowExpandable: (record) =>
                                    getProductCategoryType(record) === 'FINISHED' &&
                                    Array.isArray(record.children) &&
                                    record.children.length > 0,
                            }}
                            bordered
                            pagination={false}
                            onRow={(record) => ({
                                style:
                                    getProductCategoryType(record) === 'SECOND_PROCESS'
                                        ? { backgroundColor: '#f5f5f5' }
                                        : {},
                            })}
                            scroll={{ y: 'calc(100vh - 360px)', x: 1000 }}
                        />
                    </div>
                </Tabs.TabPane>

                <Tabs.TabPane tab="Bomlist" key="2">
                    <div className="flex justify-end mb-2">
                        {canAddBomlist && (
                            <Button
                                type="primary"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() => setOpenBomlistModal(true)}
                            >
                                Thêm Bomlist
                            </Button>
                        )}
                    </div>

                    <BomlistTable modelId={model.id} reloadTrigger={reloadBomlist} onEdit={openBomlistModalForEdit} />
                </Tabs.TabPane>
            </Tabs>

            <ModelFormModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSuccess={handleModelSaveSuccess}
                editingModel={model}
                customers={customers}
            />

            <ApproveSendMailModal
                open={openApproveMailModal}
                onCancel={() => setOpenApproveMailModal(false)}
                modelId={model.id}
                modelCode={model.code}
                onSuccess={reloadModelData}
            />

            <BomlistFormModal
                open={openBomlistModal}
                onCancel={() => {
                    setOpenBomlistModal(false);
                    setEditingBomlist(null);
                }}
                modelCode={model.code}
                modelId={model.id}
                initialValues={editingBomlist}
                onSuccess={() => setReloadBomlist((prev) => !prev)}
            />
        </div>
    );
};

export default ModelDetailPage;

const ProductListMobile = ({ products, modelId, navigate, canDuplicateProduct, onDuplicateProduct, level = 0 }) => {
    if (!products.length) {
        return <div className="text-center text-gray-400 py-4 text-sm">Không có sản phẩm</div>;
    }

    return (
        <div className="space-y-2">
            {products.map((p) => (
                <div key={p.id} className="space-y-1">
                    <div
                        onClick={() => navigate(`/product-manager/models/${modelId}/products/${p.id}`)}
                        className="border rounded-lg p-2 active:scale-[0.98] transition cursor-pointer hover:shadow-sm hover:border-blue-300"
                        style={{ marginLeft: `${Math.min(level * 8, 32)}px` }}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-sm">{p.code}</div>
                            <div className="text-xs">{renderProgressStatus(p.progressStatus)}</div>
                        </div>

                        <div className="space-y-1">
                            {p.name && <div className="text-xs text-gray-600 truncate">{p.name}</div>}
                            <div className="flex items-center justify-between">
                                <div className="text-xs">{renderProductCategory(p)}</div>
                                <div className="text-xs">{renderNmdStatusTag(p)}</div>
                            </div>
                            {p.remark && <div className="text-xs text-gray-400 truncate">💬 {p.remark}</div>}
                            {canDuplicateProduct && (
                                <div className="pt-1">
                                    <Button
                                        size="small"
                                        icon={<CopyOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDuplicateProduct?.(p);
                                        }}
                                    >
                                        Sao chép
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {p.children?.length > 0 && (
                        <ProductListMobile
                            products={p.children}
                            modelId={modelId}
                            navigate={navigate}
                            canDuplicateProduct={canDuplicateProduct}
                            onDuplicateProduct={onDuplicateProduct}
                            level={level + 1}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};
