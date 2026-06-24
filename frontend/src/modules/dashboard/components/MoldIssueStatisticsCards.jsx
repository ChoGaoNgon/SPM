import React, { useEffect, useState } from 'react';
import { Card, Col, Collapse, Empty, List, Row, Select, Spin, Tag, Typography, message } from 'antd';
import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '~/utils/axiosClient';

const { Text } = Typography;

const LIMIT_OPTIONS = [
    { label: 'Top 3', value: 3 },
    { label: 'Top 5', value: 5 },
    { label: 'Top 10', value: 10 },
    { label: 'Top 15', value: 15 },
];

const MoldIssueStatisticsCards = () => {
    const navigate = useNavigate();
    const [limit, setLimit] = useState(5);
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState([]);
    const [selectedMold, setSelectedMold] = useState(null);
    const [issues, setIssues] = useState([]);
    const [loadingIssues, setLoadingIssues] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchMoldIssueStatistics = async () => {
            setLoading(true);
            try {
                const res = await axiosClient.get('/molds/issue-statistics', {
                    params: { limit },
                });

                if (!isMounted) {
                    return;
                }

                setStatistics(res?.data?.data || []);
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setStatistics([]);
                message.error(error?.response?.data?.message || error.message || 'Không thể tải thống kê lỗi khuôn');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchMoldIssueStatistics();

        return () => {
            isMounted = false;
        };
    }, [limit]);

    const handleOpenIssues = async (mold) => {
        setSelectedMold(mold);
        setIssues([]);
        setLoadingIssues(true);

        try {
            const res = await axiosClient.get(`/molds/${mold.moldId}/issues`);
            setIssues(res?.data?.data || []);
        } catch (error) {
            setIssues([]);
            message.error(error?.response?.data?.message || error.message || 'Không thể tải danh sách vấn đề');
        } finally {
            setLoadingIssues(false);
        }
    };

    return (
        <Card
            title="Thống kê lỗi khuôn"
            extra={
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Số khuôn hiển thị</span>
                    <Select
                        value={limit}
                        options={LIMIT_OPTIONS}
                        style={{ width: 110 }}
                        onChange={(value) => setLimit(value)}
                    />
                </div>
            }
        >
            <Row gutter={16}>
                <Col span={8}>
                    <Card title="Danh sách khuôn" size="small">
                        {loading ? (
                            <div className="text-center p-5">
                                <Spin />
                            </div>
                        ) : statistics.length === 0 ? (
                            <Empty description="Không có khuôn có vấn đề" />
                        ) : (
                            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                                {statistics.map((item) => {
                                    const isActive = selectedMold?.moldId === item.moldId;

                                    return (
                                        <Card
                                            key={item.moldId}
                                            size="small"
                                            hoverable
                                            onClick={() => handleOpenIssues(item)}
                                            className={`cursor-pointer ${isActive ? 'border-blue-500 bg-blue-50' : ''}`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <Text strong>{item.moldCode || '--'}</Text>
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        Tổng lỗi: {item.totalIssues || 0}
                                                    </div>
                                                </div>
                                                <Tag color="blue">{item.totalProducts || 0} SP</Tag>
                                            </div>

                                            <div className="mt-2 flex flex-wrap gap-1">
                                                <Tag color="green">HT: {item.completedIssues || 0}</Tag>
                                                <Tag color="orange">CHT: {item.pendingIssues || 0}</Tag>
                                                <Tag color="red">Thiếu NC: {item.pendingIssuesWithoutCause || 0}</Tag>
                                                <Tag color="volcano">
                                                    Thiếu KH: {item.pendingIssuesWithoutImprovePlan || 0}
                                                </Tag>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </Col>

                <Col span={16}>
                    <Card
                        title={selectedMold ? `Vấn đề phát sinh khuôn ${selectedMold.moldCode}` : 'Chi tiết khuôn'}
                        size="small"
                    >
                        <div className=" ">
                            {selectedMold ? (
                                <div className="mb-3 border-b border-gray-200 pb-3">
                                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                        <div>
                                            <div className="text-xs text-gray-400">Tổng vấn đề</div>
                                            <div className="text-lg font-semibold text-gray-900">
                                                {selectedMold.totalIssues || 0}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400">Đã hoàn thành</div>
                                            <div className="text-lg font-semibold text-green-600">
                                                {selectedMold.completedIssues || 0}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400">Chưa thực hiện</div>
                                            <div className="text-lg font-semibold text-amber-600">
                                                {selectedMold.pendingIssues || 0}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400">Số sản phẩm</div>
                                            <div className="text-lg font-semibold text-blue-600">
                                                {selectedMold.totalProducts || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                            {!selectedMold ? (
                                <div className="p-10 text-center text-gray-400">
                                    Chọn một khuôn để xem danh sách vấn đề
                                </div>
                            ) : loadingIssues ? (
                                <div className="flex min-h-[240px] items-center justify-center">
                                    <Spin />
                                </div>
                            ) : issues.length === 0 ? (
                                <Empty description="Không có vấn đề nào" />
                            ) : (
                                <List
                                    itemLayout="vertical"
                                    dataSource={issues}
                                    renderItem={(issue) => (
                                        <List.Item key={issue.planId}>
                                            <Card size="small" className="border border-gray-100 mb-3">
                                                <div className="flex items-start justify-between gap-3 mb-4">
                                                    <div>
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center gap-1.5 text-base font-semibold text-blue-600 transition-all hover:gap-2 hover:text-blue-800"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/product-manager/models/${issue.modelId}/products/${issue.productId}/plan/${issue.productPlanId}?tab=issues`,
                                                                )
                                                            }
                                                        >
                                                            <span>{issue.planName || '--'}</span>
                                                            <ExternalLink size={14} className="flex-shrink-0" />
                                                        </button>
                                                        <div className="mt-1 text-sm text-gray-500">
                                                            {issue.productCode || 'Chưa có mã sản phẩm'} -{' '}
                                                            {issue.modelCode || 'Chưa có mã model'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {issue.productPlanIssues && issue.productPlanIssues.length > 0 ? (
                                                    <Collapse
                                                        items={issue.productPlanIssues.map((detail, idx) => ({
                                                            key: detail.id,
                                                            label: (
                                                                <div className="flex items-center justify-between w-full pr-4">
                                                                    <span className="font-semibold text-gray-700">
                                                                        Vấn đề #{idx + 1}:{' '}
                                                                        {detail.issueDescription?.substring(0, 50)}...
                                                                    </span>
                                                                    <div className="flex gap-2">
                                                                        {detail.implemented ? (
                                                                            <Tag color="success">Đã xử lý</Tag>
                                                                        ) : (
                                                                            <Tag color="processing">Chưa xử lý</Tag>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ),
                                                            children: (
                                                                <div className="space-y-3">
                                                                    {detail.issueDescription && (
                                                                        <div>
                                                                            <div className="text-sm font-semibold text-gray-700 mb-1">
                                                                                Nội dung lỗi:
                                                                            </div>
                                                                            <div className="text-sm text-gray-800 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                                                                                {detail.issueDescription}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div>
                                                                        <div className="text-sm font-semibold text-gray-700 mb-1">
                                                                            Nguyên nhân:
                                                                        </div>
                                                                        <div className="text-sm text-gray-700 bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                                                                            {detail.cause?.trim() || 'chưa có'}
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <div className="text-sm font-semibold text-gray-700 mb-1">
                                                                            Hướng xử lý:
                                                                        </div>
                                                                        <div className="text-sm text-gray-700 bg-green-50 p-3 rounded border-l-4 border-green-400">
                                                                            {detail.improvePlan?.trim() || 'chưa có'}
                                                                        </div>
                                                                    </div>

                                                                    {detail.defectCodes &&
                                                                        detail.defectCodes.length > 0 && (
                                                                            <div>
                                                                                <div className="text-sm font-semibold text-gray-700 mb-2">
                                                                                    Mã lỗi:
                                                                                </div>
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    {detail.defectCodes.map((code) => (
                                                                                        <Tag
                                                                                            key={code.id}
                                                                                            color="orange"
                                                                                            className="text-xs"
                                                                                        >
                                                                                            {code.defectCode} (
                                                                                            {code.quantity})
                                                                                        </Tag>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                    {detail.repairDeadline && (
                                                                        <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                                                                            <span className="font-semibold">
                                                                                Hạn sửa:
                                                                            </span>{' '}
                                                                            {new Date(
                                                                                detail.repairDeadline,
                                                                            ).toLocaleDateString('vi-VN')}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ),
                                                        }))}
                                                        size="small"
                                                        className="bg-transparent"
                                                    />
                                                ) : (
                                                    <div className="text-sm text-gray-500 italic">
                                                        Chưa có chi tiết vấn đề
                                                    </div>
                                                )}
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>
        </Card>
    );
};

export default MoldIssueStatisticsCards;
