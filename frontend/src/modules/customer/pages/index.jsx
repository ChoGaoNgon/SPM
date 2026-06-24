import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Popconfirm, Space, Spin, Table, Tag } from 'antd';
import { ExternalLink, UserCircle2Icon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '~/components/PageHeader';
import authService from '~/modules/auth/services/authService';
import customerService from '~/modules/customer/services/customerService';
import productService from '~/modules/new-model/services/productService';
import { openProductDetail } from '~/utils/navigationUtils';

function CustomerManagerPage() {
    const navigate = useNavigate();

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [customerProducts, setCustomerProducts] = useState({});
    const [productLoadingByCustomer, setProductLoadingByCustomer] = useState({});
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [tableScrollY, setTableScrollY] = useState(600);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    const tableContainerRef = useRef(null);
    const [form] = Form.useForm();

    const isAllowCreateCustomer = authService.hasPermission('CUSTOMER_CREATE');
    const isAllowUpdateCustomer = authService.hasPermission('CUSTOMER_UPDATE');
    const isAllowDeleteCustomer = authService.hasPermission('CUSTOMER_DELETE');

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await customerService.getAllCustomer();
            setCustomers(data);
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        const updateTableHeight = () => {
            if (!tableContainerRef.current) return;

            const containerHeight = tableContainerRef.current.clientHeight;
            const padding = 32;
            const tableHeaderHeight = 55;
            const paginationHeight = 56;
            const scrollY = containerHeight - padding - tableHeaderHeight - paginationHeight;
            setTableScrollY(Math.max(220, Math.floor(scrollY)));
        };

        const observer = new ResizeObserver(updateTableHeight);
        if (tableContainerRef.current) observer.observe(tableContainerRef.current);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const maxPage = Math.max(1, Math.ceil(customers.length / pagination.pageSize));
        if (pagination.current > maxPage) {
            setPagination((prev) => ({ ...prev, current: maxPage }));
        }
    }, [customers.length, pagination.current, pagination.pageSize]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            if (editingCustomer) {
                await customerService.updateCustomer(editingCustomer.id, values);
                message.success('Cập nhật khách hàng thành công');
            } else {
                await customerService.createCustomer(values);
                message.success('Thêm khách hàng thành công');
            }

            form.resetFields();
            setModalVisible(false);
            setEditingCustomer(null);
            fetchCustomers();
        } catch (error) {
            message.error(error.message);
        }
    };

    const handleSearch = async (value) => {
        const param = value?.trim() || '';
        setSearchText(param);
        setPagination((prev) => ({ ...prev, current: 1 }));

        if (!param) {
            await fetchCustomers();
            return;
        }

        setLoading(true);
        try {
            const result = await customerService.searchCustomers(param);
            setCustomers(result);
        } catch (error) {
            message.error(error.message || 'Lỗi khi tìm kiếm khách hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record) => {
        setEditingCustomer(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await customerService.deleteCustomer(id);
            message.success('Xóa khách hàng thành công');
            fetchCustomers();
        } catch (error) {
            message.error(error.message);
        }
    };

    const fetchProductsForCustomer = async (customerId) => {
        if (customerProducts[customerId] || productLoadingByCustomer[customerId]) {
            return;
        }

        setProductLoadingByCustomer((prev) => ({ ...prev, [customerId]: true }));
        try {
            const products = await productService.getProductsByCustomer(customerId);
            setCustomerProducts((prev) => ({ ...prev, [customerId]: products }));
        } catch (error) {
            message.error(error.message || 'Lỗi khi lấy sản phẩm của khách hàng');
        } finally {
            setProductLoadingByCustomer((prev) => ({ ...prev, [customerId]: false }));
        }
    };

    const handleExpand = async (expanded, record) => {
        setExpandedRowKeys((prev) => (expanded ? [...prev, record.id] : prev.filter((key) => key !== record.id)));

        if (expanded) {
            await fetchProductsForCustomer(record.id);
        }
    };

    const expandedRowRender = (record) => {
        const products = customerProducts[record.id] || [];
        const loading = productLoadingByCustomer[record.id];

        if (loading) {
            return (
                <div className="py-4 text-center">
                    <Spin />
                </div>
            );
        }

        if (!products.length) {
            return <div className="py-4 text-slate-500">Khách hàng chưa có sản phẩm</div>;
        }

        const productColumns = [
            {
                title: 'Mã SP',
                dataIndex: 'code',
                key: 'code',
                width: 120,
                render: (text, record) => (
                    <a
                        className="inline-flex items-center gap-1 font-semibold text-sky-700 truncate hover:underline cursor-pointer"
                        onClick={() => openProductDetail(record)}
                        title="Click để xem chi tiết sản phẩm"
                    >
                        <span> {text}</span>
                        <ExternalLink size={14} className="flex-shrink-0" />
                    </a>
                ),
            },
            {
                title: 'Tên SP',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: 'Mã mẫu',
                dataIndex: 'modelCode',
                key: 'modelCode',
                align: 'center',
                width: 150,
                render: (text, record) => (
                    <a
                        className="inline-flex items-center gap-1 font-semibold text-sky-700 truncate hover:underline cursor-pointer"
                        onClick={() => navigate(`/product-manager/models/${record.modelId || record.id}`)}
                        title="Click để xem chi tiết sản phẩm"
                    >
                        <span> {text || 'N/A'}</span>
                        <ExternalLink size={14} className="flex-shrink-0" />
                    </a>
                ),
            },
            {
                title: 'Mã khuôn',
                dataIndex: 'moldCode',
                key: 'moldCode',
                align: 'center',
                width: 120,
            },
            {
                title: 'Loại',
                dataIndex: 'categoryName',
                key: 'categoryName',
                width: 200,
                align: 'center',
                render: (categoryName, record) => <Tag color={record.categoryColor}>{categoryName}</Tag>,
            },

            {
                title: 'Ngày nhận',
                dataIndex: 'infoReceivedDate',
                key: 'infoReceivedDate',
                width: 140,
                render: (value) => value || '-',
            },
        ];

        return (
            <Table
                rowKey="id"
                columns={productColumns}
                dataSource={products}
                pagination={false}
                bordered
                size="small"
                className="bg-white"
            />
        );
    };

    const handleTableChange = (newPagination) => {
        setPagination({
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        });
    };

    const columns = [
        {
            title: 'STT',
            key: 'index',
            align: 'center',
            width: '20%',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Tên khách hàng',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        ...(isAllowUpdateCustomer || isAllowDeleteCustomer
            ? [
                  {
                      title: 'Thao tác',
                      key: 'action',
                      align: 'center',
                      width: '16%',
                      render: (_, record) => (
                          <Space size="small">
                              {isAllowUpdateCustomer && (
                                  <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                                      Sửa
                                  </Button>
                              )}

                              {isAllowDeleteCustomer && (
                                  <Popconfirm
                                      title="Xác nhận xóa khách hàng này?"
                                      onConfirm={() => handleDelete(record.id)}
                                      okText="Có"
                                      cancelText="Không"
                                  >
                                      <Button size="small" icon={<DeleteOutlined />} danger>
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

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 flex-shrink-0">
                <div className="flex-1 min-w-0">
                    <PageHeader
                        icon={UserCircle2Icon}
                        title="Quản lý khách hàng"
                        description="Theo dõi danh sách khách hàng và chỉnh sửa thông tin nhanh chóng."
                    />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Input.Search
                        placeholder="Tìm tên khách hàng"
                        allowClear
                        enterButton="Tìm"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onSearch={handleSearch}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            form.resetFields();
                            setEditingCustomer(null);
                            setModalVisible(true);
                        }}
                    >
                        Thêm khách hàng
                    </Button>
                </div>
            </div>

            <div
                ref={tableContainerRef}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3 lg:p-4 flex-1 min-h-0 overflow-hidden"
            >
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={customers}
                    loading={loading}
                    bordered
                    expandable={{
                        expandedRowRender,
                        expandedRowKeys,
                        onExpand: handleExpand,
                        rowExpandable: () => true,
                    }}
                    onChange={handleTableChange}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: customers.length,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} khách hàng`,
                        position: ['bottomRight'],
                    }}
                    className="rounded-xl overflow-hidden h-full"
                    scroll={{ y: tableScrollY }}
                />
            </div>

            <Modal
                title={editingCustomer ? 'Cập nhật khách hàng' : 'Thêm khách hàng'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingCustomer(null);
                    form.resetFields();
                }}
                onOk={handleSave}
                okText="Lưu"
                cancelText="Hủy"
                centered
                width={400}
            >
                <Form form={form} layout="vertical" initialValues={{ name: '' }}>
                    <Form.Item
                        label="Tên khách hàng"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
                    >
                        <Input placeholder="Nhập tên khách hàng" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default CustomerManagerPage;
