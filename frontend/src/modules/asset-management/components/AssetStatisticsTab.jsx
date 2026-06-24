import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    LaptopOutlined,
    QuestionCircleOutlined,
    SyncOutlined,
} from '@ant-design/icons';
import { Card, Col, message, Progress, Row, Spin, Statistic, Table, Tag } from 'antd';
import { Boxes, Calendar, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import assetService from '~/modules/asset/service/AssetService';

const AssetStatisticsTab = ({ assetTypes, loadingTypes }) => {
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState({
        overview: {
            total: 0,
            available: 0,
            inUse: 0,
            maintenance: 0,
            broken: 0,
            lost: 0,
            needReturn: 0,
        },
        byType: [],
        byDepartment: [],
        recentActivity: [],
        monthlyTrend: [],
    });

    const COLORS = {
        available: '#52c41a',
        inUse: '#1890ff',
        maintenance: '#faad14',
        broken: '#ff4d4f',
        lost: '#8c8c8c',
        needReturn: '#fa8c16',
    };

    const PIE_COLORS = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96'];

    const fetchStatistics = async () => {
        setLoading(true);
        try {
            const data = await assetService.getAssetStatistical();

            const mockStatistics = {
                overview: {
                    total: 150,
                    available: 45,
                    inUse: 85,
                    maintenance: 12,
                    broken: 6,
                    lost: 2,
                    needReturn: 8,
                },
                byType: assetTypes.slice(0, 6).map((type, index) => ({
                    name: type.name,
                    value: Math.floor(Math.random() * 30) + 5,
                    color: PIE_COLORS[index % PIE_COLORS.length],
                })),
                byDepartment: [
                    { name: 'IT', total: 45, inUse: 38, available: 7 },
                    { name: 'Kế toán', total: 25, inUse: 20, available: 5 },
                    { name: 'Nhân sự', total: 18, inUse: 15, available: 3 },
                    { name: 'Marketing', total: 22, inUse: 18, available: 4 },
                    { name: 'Bán hàng', total: 30, inUse: 25, available: 5 },
                ],
                recentActivity: [
                    {
                        id: 1,
                        action: 'Cấp phát',
                        asset: 'MacBook Pro M1',
                        employee: 'Nguyễn Văn A',
                        date: '2026-02-01',
                        type: 'success',
                    },
                    {
                        id: 2,
                        action: 'Thu hồi',
                        asset: 'Dell Latitude 5520',
                        employee: 'Trần Thị B',
                        date: '2026-01-30',
                        type: 'warning',
                    },
                    {
                        id: 3,
                        action: 'Bảo trì',
                        asset: 'Máy in HP LaserJet',
                        employee: 'Lê Văn C',
                        date: '2026-01-28',
                        type: 'info',
                    },
                    {
                        id: 4,
                        action: 'Thêm mới',
                        asset: 'iPhone 15 Pro',
                        employee: 'Admin',
                        date: '2026-01-25',
                        type: 'success',
                    },
                ],
                needReturnAssets: [
                    {
                        id: 1,
                        assetName: 'MacBook Pro 2019',
                        assetCode: 'MAC001',
                        employeeName: 'Nguyễn Văn D',
                        reason: 'Nhân viên nghỉ việc',
                        dueDate: '2026-02-10',
                        status: 'pending',
                    },
                    {
                        id: 2,
                        assetName: 'Dell Monitor 27"',
                        assetCode: 'MON015',
                        employeeName: 'Trần Thị E',
                        reason: 'Chuyển phòng ban',
                        dueDate: '2026-02-08',
                        status: 'pending',
                    },
                    {
                        id: 3,
                        assetName: 'iPhone 13',
                        assetCode: 'PHN033',
                        employeeName: 'Lê Văn F',
                        reason: 'Thay thế thiết bị mới',
                        dueDate: '2026-02-05',
                        status: 'overdue',
                    },
                    {
                        id: 4,
                        assetName: 'Máy tính để bàn HP',
                        assetCode: 'PC089',
                        employeeName: 'Phạm Thị G',
                        reason: 'Kết thúc hợp đồng',
                        dueDate: '2026-02-12',
                        status: 'pending',
                    },
                ],
                monthlyTrend: [
                    { month: 'T10/2025', newAssets: 8, assignments: 12, returns: 5 },
                    { month: 'T11/2025', newAssets: 15, assignments: 18, returns: 8 },
                    { month: 'T12/2025', newAssets: 12, assignments: 15, returns: 10 },
                    { month: 'T1/2026', newAssets: 20, assignments: 22, returns: 6 },
                    { month: 'T2/2026', newAssets: 6, assignments: 14, returns: 9 },
                ],
            };

            setStatistics(mockStatistics);
        } catch (error) {
            message.error('Không thể tải dữ liệu thống kê');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loadingTypes && assetTypes.length > 0) {
            fetchStatistics();
        }
    }, [assetTypes, loadingTypes]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'available':
                return <CheckCircleOutlined style={{ color: COLORS.available }} />;
            case 'inUse':
                return <LaptopOutlined style={{ color: COLORS.inUse }} />;
            case 'maintenance':
                return <SyncOutlined style={{ color: COLORS.maintenance }} />;
            case 'broken':
                return <ExclamationCircleOutlined style={{ color: COLORS.broken }} />;
            case 'lost':
                return <CloseCircleOutlined style={{ color: COLORS.lost }} />;
            case 'needReturn':
                return <ExclamationCircleOutlined style={{ color: COLORS.needReturn }} />;
            default:
                return <QuestionCircleOutlined />;
        }
    };

    const getActivityTag = (type) => {
        switch (type) {
            case 'success':
                return <Tag color="success">Thành công</Tag>;
            case 'warning':
                return <Tag color="warning">Cảnh báo</Tag>;
            case 'info':
                return <Tag color="processing">Thông tin</Tag>;
            default:
                return <Tag>Khác</Tag>;
        }
    };

    const activityColumns = [
        {
            title: 'Hành động',
            dataIndex: 'action',
            key: 'action',
            render: (text, record) => (
                <div className="flex items-center gap-2">
                    {getActivityTag(record.type)}
                    <span>{text}</span>
                </div>
            ),
        },
        {
            title: 'Tài sản',
            dataIndex: 'asset',
            key: 'asset',
        },
        {
            title: 'Người thực hiện',
            dataIndex: 'employee',
            key: 'employee',
        },
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
        },
    ];

    const departmentColumns = [
        {
            title: 'Phòng ban',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span className="font-medium">{text}</span>,
        },
        {
            title: 'Tổng số',
            dataIndex: 'total',
            key: 'total',
            render: (value) => <span className="text-blue-600 font-semibold">{value}</span>,
        },
        {
            title: 'Đang sử dụng',
            dataIndex: 'inUse',
            key: 'inUse',
            render: (value) => <span className="text-green-600">{value}</span>,
        },
        {
            title: 'Còn trống',
            dataIndex: 'available',
            key: 'available',
            render: (value) => <span className="text-orange-600">{value}</span>,
        },
        {
            title: 'Tỷ lệ sử dụng',
            key: 'usage',
            render: (_, record) => {
                const percent = Math.round((record.inUse / record.total) * 100);
                return (
                    <Progress
                        percent={percent}
                        size="small"
                        strokeColor={percent > 80 ? '#ff4d4f' : percent > 60 ? '#faad14' : '#52c41a'}
                    />
                );
            },
        },
    ];

    const needReturnColumns = [
        {
            title: 'Tài sản',
            key: 'asset',
            render: (_, record) => (
                <div>
                    <div className="font-medium">{record.assetName}</div>
                    <div className="text-xs text-gray-500">{record.assetCode}</div>
                </div>
            ),
        },
        {
            title: 'Người sử dụng',
            dataIndex: 'employeeName',
            key: 'employeeName',
        },
        {
            title: 'Lý do',
            dataIndex: 'reason',
            key: 'reason',
        },
        {
            title: 'Hạn thu hồi',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date, record) => {
                const isOverdue = record.status === 'overdue';
                return <span className={isOverdue ? 'text-red-500 font-medium' : ''}>{date}</span>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                if (status === 'overdue') {
                    return <Tag color="error">Quá hạn</Tag>;
                }
                return <Tag color="warning">Chờ thu hồi</Tag>;
            },
        },
    ];

    if (loading || loadingTypes) {
        return (
            <div className="flex justify-center items-center py-20">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <Row gutter={[16, 16]}>
                <Col xs={12} sm={8} md={6} lg={4} xl={3}>
                    <Card>
                        <Statistic
                            title="Tổng tài sản"
                            value={statistics.overview.total}
                            prefix={getStatusIcon('total')}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={6} lg={4} xl={3}>
                    <Card>
                        <Statistic
                            title="Đang sử dụng"
                            value={statistics.overview.inUse}
                            prefix={getStatusIcon('inUse')}
                            valueStyle={{ color: COLORS.inUse }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={6} lg={4} xl={3}>
                    <Card>
                        <Statistic
                            title="Còn trống"
                            value={statistics.overview.available}
                            prefix={getStatusIcon('available')}
                            valueStyle={{ color: COLORS.available }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={6} lg={4} xl={3}>
                    <Card>
                        <Statistic
                            title="Cần thu hồi"
                            value={statistics.overview.needReturn}
                            prefix={getStatusIcon('needReturn')}
                            valueStyle={{ color: COLORS.needReturn }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={6} lg={4} xl={3}>
                    <Card>
                        <Statistic
                            title="Bảo trì"
                            value={statistics.overview.maintenance}
                            prefix={getStatusIcon('maintenance')}
                            valueStyle={{ color: COLORS.maintenance }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={6} lg={4} xl={3}>
                    <Card>
                        <Statistic
                            title="Hỏng"
                            value={statistics.overview.broken}
                            prefix={getStatusIcon('broken')}
                            valueStyle={{ color: COLORS.broken }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={6} lg={4} xl={3}>
                    <Card>
                        <Statistic
                            title="Mất"
                            value={statistics.overview.lost}
                            prefix={getStatusIcon('lost')}
                            valueStyle={{ color: COLORS.lost }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <Boxes className="w-5 h-5" />
                                Phân bố theo loại tài sản
                            </div>
                        }
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statistics.byType}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statistics.byType.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Xu hướng hoạt động
                            </div>
                        }
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={statistics.monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="newAssets" fill="#1890ff" name="Tài sản mới" />
                                <Bar dataKey="assignments" fill="#52c41a" name="Cấp phát" />
                                <Bar dataKey="returns" fill="#faad14" name="Thu hồi" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Thống kê theo phòng ban
                            </div>
                        }
                    >
                        <Table
                            dataSource={statistics.byDepartment}
                            columns={departmentColumns}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Hoạt động gần đây
                            </div>
                        }
                    >
                        <Table
                            dataSource={statistics.recentActivity}
                            columns={activityColumns}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <ExclamationCircleOutlined className="w-5 h-5 text-orange-500" />
                                <span>Tài sản cần thu hồi</span>
                                <Tag color="error" className="ml-2">
                                    {statistics.needReturnAssets?.length || 0}
                                </Tag>
                            </div>
                        }
                        extra={<div className="text-sm text-gray-500">Cần xử lý ưu tiên</div>}
                    >
                        <Table
                            dataSource={statistics.needReturnAssets}
                            columns={needReturnColumns}
                            pagination={{ pageSize: 10 }}
                            size="small"
                            rowClassName={(record) => (record.status === 'overdue' ? 'bg-red-50' : '')}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AssetStatisticsTab;
