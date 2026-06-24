import { Card, Col, DatePicker, Divider, message, Row, Spin } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import authService from '~/modules/auth/services/authService';
import workScheduleService from '~/modules/work-schedule/services/workScheduleService';

const Superset_HOST = process.env.REACT_APP_SUPERSET_HOST;

const COLORS = {
    HC: '#66BB6A',
    C1: '#42A5F5',
    C2: '#2196F3',
    C3: '#1E88E5',
    KO: '#64B5F6',
    KD: '#1976D2',
    NT: '#FFB74D',
    P: '#E57373',
    NKL: '#BDBDBD',
    OTHER: '#90A4AE',
};

const electricalCharts = [
    { title: 'Biểu đồ thống kê tình trạng dự án', key: 'nkGZylRA58B' },
    { title: 'Biểu đồ thống kê loại dự án', key: 'g8pYADk94MQ' },
    { title: 'Biểu đồ thống kê bên thực hiện dự án', key: 'lVx090jeJ4Y' },
    { title: 'Biểu đồ thống kê bên thực hiện dự án (Auto)', key: 'kGZylnBzA58' },
    { title: 'Biểu đồ thống kê bên thực hiện dự án (SPM)', key: 'kWzA52PEe8w' },
    { title: 'Biểu đồ thống kê bên thực hiện dự án (Cải tiến)', key: 'PRz9wgwB96g' },
];

const SupersetChartCard = ({ title, chartKey }) => {
    const src = `${Superset_HOST}/superset/explore/p/${chartKey}/?standalone=1&height=400`;
    return (
        <Card title={title} hoverable className="shadow-lg rounded-xl mb-4">
            <iframe title={title} width="100%" height="280px" frameBorder="0" scrolling="no" src={src} />
        </Card>
    );
};

const DashboardElectricalPage = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    const departmentId = authService.getDepartmentId();
    const employee = authService.getEmployee();
    const departmentCode = employee?.parentDepartmentCode || employee?.departmentCode;

    useEffect(() => {
        if (!departmentId || departmentCode !== 'P-CD') return;
        const fetchStats = async () => {
            setLoading(true);
            try {
                const data = await workScheduleService.getDailyStats(departmentId, selectedDate.format('YYYY-MM-DD'));
                setStats(data);
            } catch (error) {
                message.error(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [departmentId, departmentCode, selectedDate]);

    const pieData = stats
        ? [
              { name: 'Đi làm', value: Math.round(stats.percentWorking * 100) / 100 },
              { name: 'Nghỉ', value: Math.round(stats.percentResting * 100) / 100 },
          ]
        : [];

    const barData = stats
        ? [
              { name: 'HC', value: stats.hc },
              { name: 'C1', value: stats.c1 },
              { name: 'C2', value: stats.c2 },
              { name: 'C3', value: stats.c3 },
              { name: 'KO', value: stats.ko },
              { name: 'KD', value: stats.kd },
              { name: 'P', value: stats.p },
              { name: 'NT', value: stats.nt },
              { name: 'NKL', value: stats.nkl },
              { name: 'Khác', value: stats.other },
          ]
        : [];

    return (
        <div className="">
            <DatePicker value={selectedDate} onChange={(date) => date && setSelectedDate(date)} className="mb-6" />

            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                Thống kê ca làm việc ngày {selectedDate.format('YYYY-MM-DD')}
            </h1>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                </div>
            ) : (
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} md={12}>
                        <Card title="Tỷ lệ đi làm / nghỉ" hoverable className="shadow-lg rounded-xl">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={index} fill={entry.name === 'Đi làm' ? '#66BB6A' : '#E57373'} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card title="Số lượng nhân viên theo ca" hoverable className="shadow-lg rounded-xl">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={barData}>
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" name="Số lượng" label={{ position: 'top' }}>
                                        {barData.map((entry, index) => (
                                            <Cell key={index} fill={COLORS[entry.name] || '#90A4AE'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>
            )}

            <Divider className="my-8" />

            {(authService.hasDepartmentCode('P-CD') || authService.hasDepartmentCode('TDH')) && (
                <>
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Biểu đồ dự án nhóm tự động hóa</h1>
                    <Row gutter={[16, 16]}>
                        {electricalCharts.map(({ title, key }) => (
                            <Col xs={24} sm={12} lg={8} key={key}>
                                <SupersetChartCard title={title} chartKey={key} />
                            </Col>
                        ))}
                    </Row>
                </>
            )}
        </div>
    );
};

export default DashboardElectricalPage;
