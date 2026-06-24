import {
    AlertOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    CodeSandboxOutlined,
    SyncOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import {
    Alert,
    Avatar,
    Button,
    Card,
    Col,
    Empty,
    List,
    message,
    Row,
    Space,
    Spin,
    Statistic,
    Tag,
    Typography,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import SystemFeedbackModal from '~/modules/system-feedback/components/SystemFeedbackModal';
import systemFeedbackService from '~/modules/system-feedback/services/systemFeedbackService';
import itDashboardService from '../service/ITDashboardService';

const { Text } = Typography;

const EMPTY_DASHBOARD = {
    stats: {
        total: 0,
        pending: 0,
        inProgress: 0,
        done: 0,
        rejected: 0,
    },
    types: [],
    modules: [],
    departments: [],
    employees: [],
    pendingList: [],
};

const STATUS_COLORS = {
    pending: '#1677ff',
    inProgress: '#fa8c16',
    done: '#52c41a',
    rejected: '#ff4d4f',
};

const MODULE_COLORS = ['#155eef', '#0ea5e9', '#14b8a6', '#64748b'];
const TYPE_COLORS = {
    BUG: '#ef4444',
    IMPROVEMENT: '#22c55e',
    REQUEST: '#f59e0b',
    OTHER: '#64748b',
};

const getPriorityColor = (p) => {
    if (p === 'HIGH') return 'red';
    if (p === 'MEDIUM') return 'orange';
    return 'green';
};

const getPriorityLabel = (priority) => {
    if (priority === 'HIGH') return 'Cao';
    if (priority === 'MEDIUM') return 'Trung bình';
    if (priority === 'LOW') return 'Thấp';
    return 'Chưa đánh giá';
};

const getFeedbackTypeLabel = (type) => {
    if (type === 'BUG') return 'Lỗi';
    if (type === 'IMPROVEMENT') return 'Cải tiến';
    if (type === 'REQUEST') return 'Yêu cầu';
    if (type === 'OTHER') return 'Khác';
    return 'Chưa có';
};

const renderPieValueLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
    if (!value) return null;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    return (
        <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700}>
            {value}
        </text>
    );
};

const renderBarValue = (value) => (value > 0 ? value : '');

const DashboardIT = () => {
    const [dashboardData, setDashboardData] = useState(EMPTY_DASHBOARD);
    const [loading, setLoading] = useState(true);
    const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [loadingFeedbackDetail, setLoadingFeedbackDetail] = useState(false);
    const [openingFeedbackId, setOpeningFeedbackId] = useState(null);
    const { stats, types, modules, departments, pendingList, employees } = dashboardData;
    const completionRate = Math.round((stats.done / stats.total) * 100);
    const activeRate = Math.round((stats.inProgress / stats.total) * 100);

    useEffect(() => {
        let isMounted = true;

        const fetchDashboard = async () => {
            setLoading(true);

            try {
                const response = await itDashboardService.getSystemFeedbackDashboard();

                if (isMounted) {
                    setDashboardData({
                        stats: response?.stats || EMPTY_DASHBOARD.stats,
                        types: response?.types || [],
                        modules: response?.modules || [],
                        departments: response?.departments || [],
                        employees: response?.employees || [],
                        pendingList: response?.pendingList || [],
                    });
                }
            } catch (error) {
                if (isMounted) {
                    setDashboardData(EMPTY_DASHBOARD);
                    message.error(error.message || 'Không thể tải dashboard IT');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchDashboard();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleOpenFeedbackDetail = async (feedbackId) => {
        if (!feedbackId || loadingFeedbackDetail) {
            return;
        }

        setOpeningFeedbackId(feedbackId);
        setLoadingFeedbackDetail(true);

        try {
            const detail = await systemFeedbackService.getSystemFeedbackById(feedbackId);
            setSelectedFeedback(detail);
            setOpenFeedbackModal(true);
        } catch (error) {
            message.error(error.message || 'Không thể tải chi tiết góp ý');
        } finally {
            setOpeningFeedbackId(null);
            setLoadingFeedbackDetail(false);
        }
    };

    const statusData = useMemo(
        () => [
            { name: 'Chờ', value: stats.pending, color: STATUS_COLORS.pending },
            { name: 'Đang xử lý', value: stats.inProgress, color: STATUS_COLORS.inProgress },
            { name: 'Hoàn thành', value: stats.done, color: STATUS_COLORS.done },
            { name: 'Từ chối', value: stats.rejected, color: STATUS_COLORS.rejected },
        ],
        [stats.done, stats.inProgress, stats.pending, stats.rejected],
    );

    const employeeChartData = useMemo(
        () =>
            employees.map((employee) => ({
                name: employee.name,
                pending: employee.pending,
                inProgress: employee.inProgress,
                done: employee.done,
            })),
        [employees],
    );

    const typeChartData = useMemo(
        () =>
            types.map((item) => ({
                name: getFeedbackTypeLabel(item.type),
                value: item.count,
                color: TYPE_COLORS[item.type] || TYPE_COLORS.OTHER,
            })),
        [types],
    );

    const departmentChartData = useMemo(
        () =>
            departments.map((item, index) => ({
                name: item.name,
                done: item.doneCount,
                inProgress: item.inProgressCount,
                pending: item.pendingCount,
                rejected: item.rejectedCount,
                color: MODULE_COLORS[index % MODULE_COLORS.length],
            })),
        [departments],
    );

    const summaryCards = [
        {
            key: 'total',
            title: 'Tổng yêu cầu',
            value: stats.total,
            icon: <CodeSandboxOutlined style={{ color: '#155eef' }} />,
            suffix: 'ticket',
        },
        {
            key: 'pending',
            title: 'Đang chờ xử lý',
            value: stats.pending,
            icon: <ClockCircleOutlined style={{ color: STATUS_COLORS.pending }} />,
            suffix: 'mục',
        },
        {
            key: 'inProgress',
            title: 'Đang thực hiện',
            value: stats.inProgress,
            icon: <SyncOutlined spin style={{ color: STATUS_COLORS.inProgress }} />,
            suffix: 'mục',
        },
        {
            key: 'done',
            title: 'Đã hoàn thành',
            value: stats.done,
            icon: <CheckCircleOutlined style={{ color: STATUS_COLORS.done }} />,
            suffix: 'mục',
        },
        {
            key: 'rejected',
            title: 'Đã từ chối',
            value: stats.rejected,
            icon: <CloseCircleOutlined style={{ color: STATUS_COLORS.rejected }} />,
            suffix: 'mục',
        },
    ];

    return (
        <Space direction="vertical" size={20} style={{ display: 'flex' }}>
            {loading ? (
                <Card style={{ borderRadius: 18 }}>
                    <div style={{ minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Spin size="large" />
                    </div>
                </Card>
            ) : (
                <>
                    <Button onClick={() => (window.location.href = '/report/oee')}>Báo cáo OEE</Button>
                    <Button onClick={() => (window.location.href = '/report/plan-downtime')}>Báo cáo dừng máy</Button>
                    <Alert
                        type="info"
                        showIcon
                        icon={<AlertOutlined />}
                        message="Tổng quan hôm nay"
                        description={`Tỷ lệ hoàn thành hiện tại là ${completionRate || 0}% trên tổng ${stats.total} yêu cầu. Có ${stats.pending} yêu cầu đang chờ ưu tiên xử lý.`}
                        style={{ borderRadius: 16 }}
                    />

                    <Row gutter={[16, 16]}>
                        {summaryCards.map((item) => (
                            <Col xs={24} sm={12} xl={8} xxl={4} key={item.key}>
                                <Card style={{ borderRadius: 18 }}>
                                    <Statistic
                                        title={item.title}
                                        value={item.value}
                                        prefix={item.icon}
                                        suffix={item.suffix}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} xl={5}>
                            <Card
                                title="Toàn cảnh trạng thái"
                                extra={<Tag color="gold">Hoạt động {activeRate || 0}%</Tag>}
                                style={{ borderRadius: 18 }}
                            >
                                {stats.total === 0 ? (
                                    <Empty
                                        description="Chưa có dữ liệu trạng thái"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                ) : (
                                    <div style={{ height: 320 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={statusData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={72}
                                                    outerRadius={112}
                                                    paddingAngle={4}
                                                    labelLine={false}
                                                    label={renderPieValueLabel}
                                                >
                                                    {statusData.map((entry) => (
                                                        <Cell key={entry.name} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => [`${value} yêu cầu`, 'Số lượng']} />
                                                <Legend verticalAlign="bottom" height={24} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </Card>
                        </Col>

                        <Col xs={24} xl={13}>
                            <Card title="Khối lượng theo nhân sự" style={{ borderRadius: 18, height: '100%' }}>
                                {employees.length === 0 ? (
                                    <Empty description="Chưa có dữ liệu nhân sự" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                ) : (
                                    <>
                                        <div style={{ height: 320 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={employeeChartData}
                                                    margin={{ top: 8, right: 18, left: 0, bottom: 8 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="name" />
                                                    <YAxis allowDecimals={false} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar
                                                        dataKey="pending"
                                                        name="Chờ"
                                                        stackId="workload"
                                                        fill={STATUS_COLORS.pending}
                                                    >
                                                        <LabelList
                                                            dataKey="pending"
                                                            position="center"
                                                            formatter={renderBarValue}
                                                            fill="#ffffff"
                                                            fontSize={12}
                                                        />
                                                    </Bar>
                                                    <Bar
                                                        dataKey="inProgress"
                                                        name="Đang"
                                                        stackId="workload"
                                                        fill={STATUS_COLORS.inProgress}
                                                    >
                                                        <LabelList
                                                            dataKey="inProgress"
                                                            position="center"
                                                            formatter={renderBarValue}
                                                            fill="#ffffff"
                                                            fontSize={12}
                                                        />
                                                    </Bar>
                                                    <Bar
                                                        dataKey="done"
                                                        name="Xong"
                                                        stackId="workload"
                                                        fill={STATUS_COLORS.done}
                                                    >
                                                        <LabelList
                                                            dataKey="done"
                                                            position="center"
                                                            formatter={renderBarValue}
                                                            fill="#ffffff"
                                                            fontSize={12}
                                                        />
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </>
                                )}
                            </Card>
                        </Col>

                        <Col xs={24} xl={6}>
                            <Card title="Danh sách cần ưu tiên" style={{ borderRadius: 18, height: '100%' }}>
                                {pendingList.length === 0 ? (
                                    <Empty
                                        description="Không có yêu cầu ưu tiên"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                ) : (
                                    <List
                                        dataSource={pendingList}
                                        split={false}
                                        renderItem={(item) => (
                                            <List.Item
                                                style={{ padding: '0 0 12px', borderBottom: '1px solid #f0f0f0' }}
                                            >
                                                <div style={{ width: '100%' }}>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            gap: 12,
                                                            alignItems: 'flex-start',
                                                        }}
                                                    >
                                                        <div style={{ minWidth: 0 }}>
                                                            <Button
                                                                type="link"
                                                                onClick={() => handleOpenFeedbackDetail(item.id)}
                                                                loading={
                                                                    loadingFeedbackDetail &&
                                                                    openingFeedbackId === item.id
                                                                }
                                                                style={{
                                                                    padding: 0,
                                                                    height: 'auto',
                                                                    fontWeight: 600,
                                                                    display: 'block',
                                                                    marginBottom: 4,
                                                                    textAlign: 'left',
                                                                    color: '#0f172a',
                                                                }}
                                                            >
                                                                {item.title}
                                                            </Button>
                                                            <Space wrap size={[8, 8]}>
                                                                <Tag color="blue">{item.module}</Tag>
                                                                <Tag color={getPriorityColor(item.priority)}>
                                                                    {getPriorityLabel(item.priority)}
                                                                </Tag>
                                                            </Space>
                                                        </div>
                                                        <Avatar
                                                            icon={<TeamOutlined />}
                                                            style={{ background: '#eff6ff', color: '#155eef' }}
                                                        />
                                                    </div>

                                                    <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                                                        Phụ trách: {item.owner}
                                                    </Text>
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                )}
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} xl={8}>
                            <Card title="Loại feedback" style={{ borderRadius: 18, height: '100%' }}>
                                {typeChartData.length === 0 ? (
                                    <Empty
                                        description="Chưa có dữ liệu loại feedback"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                ) : (
                                    <>
                                        <div style={{ height: 320 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Tooltip formatter={(value, name) => [`${value} feedback`, name]} />

                                                    <Legend verticalAlign="bottom" align="center" height={36} />

                                                    <Pie
                                                        data={typeChartData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="45%"
                                                        outerRadius={110}
                                                        innerRadius={0}
                                                        paddingAngle={4}
                                                        labelLine={false}
                                                        label={renderPieValueLabel}
                                                    >
                                                        {typeChartData.map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={entry.color || TYPE_COLORS.OTHER}
                                                            />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </>
                                )}
                            </Card>
                        </Col>

                        <SystemFeedbackModal
                            open={openFeedbackModal}
                            initialValues={selectedFeedback}
                            onCancel={() => {
                                setOpenFeedbackModal(false);
                                setSelectedFeedback(null);
                            }}
                            onSuccess={() => {
                                setOpenFeedbackModal(false);
                                setSelectedFeedback(null);
                            }}
                        />

                        <Col xs={24} xl={16}>
                            <Card title="Phân bổ theo module" style={{ borderRadius: 18, height: '100%' }}>
                                {modules.length === 0 ? (
                                    <Empty description="Chưa có dữ liệu module" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                ) : (
                                    <>
                                        <div style={{ height: 320 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={modules}
                                                    margin={{ top: 8, right: 16, left: 16, bottom: 8 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />

                                                    <XAxis type="category" dataKey="name" />

                                                    <YAxis type="number" allowDecimals={false} />

                                                    <Tooltip
                                                        formatter={(value) => [`${value} yêu cầu`, 'Khối lượng']}
                                                    />

                                                    <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                                                        <LabelList
                                                            dataKey="count"
                                                            position="top"
                                                            formatter={renderBarValue}
                                                            fill="#334155"
                                                            fontSize={12}
                                                        />
                                                        {modules.map((entry, index) => (
                                                            <Cell
                                                                key={entry.name}
                                                                fill={MODULE_COLORS[index % MODULE_COLORS.length]}
                                                            />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </>
                                )}
                            </Card>
                        </Col>

                        <Col xs={24} xl={24}>
                            <Card title="Số lượng theo bộ phận" style={{ borderRadius: 18, height: '100%' }}>
                                {departmentChartData.length === 0 ? (
                                    <Empty description="Chưa có dữ liệu bộ phận" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                ) : (
                                    <div style={{ height: 320 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={departmentChartData}
                                                margin={{ top: 16, right: 16, left: 0, bottom: 24 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <Legend verticalAlign="bottom" align="center" height={36} />

                                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />

                                                <YAxis allowDecimals={false} />

                                                <Tooltip formatter={(value, name) => [`${value}`, name]} />

                                                <Bar dataKey="done" stackId="a" fill="#5fcf88" name="Done">
                                                    <LabelList
                                                        dataKey="done"
                                                        position="center"
                                                        fill="#fff"
                                                        fontSize={12}
                                                    />
                                                </Bar>

                                                <Bar
                                                    dataKey="in_progress"
                                                    stackId="a"
                                                    fill="#f59e0b"
                                                    name="In Progress"
                                                >
                                                    <LabelList
                                                        dataKey="in_progress"
                                                        position="center"
                                                        fill="#fff"
                                                        fontSize={12}
                                                    />
                                                </Bar>

                                                <Bar dataKey="pending" stackId="a" fill="#3b82f6" name="Pending">
                                                    <LabelList
                                                        dataKey="pending"
                                                        position="center"
                                                        fill="#fff"
                                                        fontSize={12}
                                                    />
                                                </Bar>

                                                <Bar
                                                    dataKey="rejected"
                                                    stackId="a"
                                                    fill="#ef4444"
                                                    name="Rejected"
                                                    radius={[10, 10, 0, 0]}
                                                >
                                                    <LabelList
                                                        dataKey="rejected"
                                                        position="center"
                                                        fill="#fff"
                                                        fontSize={12}
                                                    />
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </Space>
    );
};

export default DashboardIT;
