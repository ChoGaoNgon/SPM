import { Card, Empty, Input, Spin, Table, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';

const { Text } = Typography;

const QcqaPendingSampleReceipts = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [rows, setRows] = useState([]);

    useEffect(() => {
        let mounted = true;

        const fetchPendingSampleReceipts = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get('/qcqa/statistics/pending-sample-receipt');

                if (!mounted) {
                    return;
                }

                setRows(response?.data?.data || []);
            } catch (error) {
                if (!mounted) {
                    return;
                }

                setRows([]);
                message.error(
                    error?.response?.data?.message || error?.message || 'Không thể tải danh sách mẫu chờ tiếp nhận',
                );
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchPendingSampleReceipts();

        return () => {
            mounted = false;
        };
    }, []);

    const dataSource = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return [...rows]
            .filter((item) => {
                if (!normalizedKeyword) {
                    return true;
                }

                return [item?.modelCode, item?.productCode, item?.planName, item?.productId, item?.planId]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(normalizedKeyword));
            })
            .sort((a, b) => {
                const aTime = a?.productSampleSubmitDate || a?.planActualStartTime || a?.planActualEndTime;

                const bTime = b?.productSampleSubmitDate || b?.planActualStartTime || b?.planActualEndTime;

                return dayjs(aTime).valueOf() - dayjs(bTime).valueOf();
            })
            .map((item, index) => ({
                key: `${item?.planId || 'plan'}-${item?.productId || 'product'}-${index}`,

                index: index + 1,

                modelId: item?.modelId,
                modelCode: item?.modelCode || '--',

                productId: item?.productId,
                productCode: item?.productCode || '--',

                planId: item?.planId,
                planName: item?.planName || '--',

                productSampleSubmitDate: item?.productSampleSubmitDate || null,

                planActualStartTime: item?.planActualStartTime || null,
                planActualEndTime: item?.planActualEndTime || null,
            }));
    }, [keyword, rows]);

    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            width: 60,
            align: 'center',
        },
        {
            title: 'Mã model',
            dataIndex: 'modelCode',
            render: (value, record) => (
                <span
                    className="cursor-pointer font-medium text-blue-600 hover:text-blue-800"
                    onClick={() => {
                        if (record.modelId) {
                            navigate(`/product-manager/models/${record.modelId}`);
                        }
                    }}
                >
                    {value}
                </span>
            ),
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'productCode',
            sorter: (a, b) => a.productCode.localeCompare(b.productCode),
            render: (value, record) => (
                <span
                    className="cursor-pointer font-medium text-blue-600 hover:text-blue-800"
                    onClick={() => {
                        if (record.productId) {
                            navigate(`/product-manager/models/${record.modelId}/products/${record.productId}`);
                        }
                    }}
                >
                    {value}
                </span>
            ),
        },
        {
            title: 'Kế hoạch',
            dataIndex: 'planName',
            render: (value, record) => (
                <span
                    className="cursor-pointer font-medium text-blue-600 hover:text-blue-800"
                    onClick={() => {
                        if (record.productId && record.planId) {
                            const url = `/product-manager/models/${record.modelId || ''}/products/${record.productId}/plan/${record.planId}?tab=fa-inspection`;

                            window.open(url, '_blank', 'noopener,noreferrer');
                        }
                    }}
                >
                    {value}
                </span>
            ),
        },
        {
            title: 'Ngày kỹ thuật gửi mẫu',
            dataIndex: 'productSampleSubmitDate',
            width: 220,
            align: 'center',
            render: (value) => (value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '--'),
        },
    ];

    return (
        <Card
            title="Danh sách mẫu chờ tiếp nhận"
            extra={
                <Text className="text-sm text-gray-500">
                    Tổng số bản ghi: <span className="font-semibold text-blue-600">{dataSource.length}</span>
                </Text>
            }
        >
            <div className="mb-3">
                <Input.Search
                    allowClear
                    placeholder="Tìm theo mã sản phẩm, tên kế hoạch..."
                    value={keyword}
                    onSearch={(value) => setKeyword(value || '')}
                    onChange={(event) => {
                        if (!event.target.value) {
                            setKeyword('');
                        }
                    }}
                    style={{ maxWidth: 420 }}
                />
            </div>

            {loading ? (
                <div className="flex h-[280px] items-center justify-center">
                    <Spin />
                </div>
            ) : dataSource.length === 0 ? (
                <Empty description="Không có dữ liệu mẫu chờ tiếp nhận" />
            ) : (
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    size="middle"
                />
            )}
        </Card>
    );
};

export default QcqaPendingSampleReceipts;
