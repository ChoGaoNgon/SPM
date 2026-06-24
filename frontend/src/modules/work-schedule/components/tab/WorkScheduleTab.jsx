import { FileExcelFilled, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, message, Row, Table } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import DepartmentTree from '~/components/DepartmentTree';
import workScheduleService from '~/modules/work-schedule/services/workScheduleService';

const weekdaysMap = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const WorkScheduleTab = ({ selectedMonth, onChangeMonth }) => {
    const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [employeeSchedules, setEmployeeSchedules] = useState([]);
    const [showDepartment, setShowDepartment] = useState(true);

    useEffect(() => {
        if (!selectedDepartmentId) return;

        const fetchWorkSchedule = async () => {
            try {
                setLoading(true);
                const data = await workScheduleService.getWorkScheduleByDepartment(
                    selectedDepartmentId,
                    selectedMonth.month() + 1,
                    selectedMonth.year(),
                );
                setEmployeeSchedules(data || []);
            } catch (error) {
                message.error(error.message || 'Lỗi khi tải lịch làm việc');
            } finally {
                setLoading(false);
            }
        };

        fetchWorkSchedule();
    }, [selectedDepartmentId, selectedMonth]);

    const year = selectedMonth.year();
    const month = selectedMonth.month() + 1;
    const startDate = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
    const daysInMonth = startDate.daysInMonth();

    const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
        const date = startDate.add(i, 'day');
        return { day: String(i + 1).padStart(2, '0'), weekday: date.day() };
    });

    const dayColumnsUI = daysArray.map((d, idx) => ({
        title: (
            <div style={{ color: d.weekday === 0 ? 'red' : d.weekday === 6 ? 'orange' : 'inherit' }}>
                {d.day}
                <br />
                <small>({weekdaysMap[d.weekday]})</small>
            </div>
        ),
        dataIndex: `day${idx + 1}`,
        key: `day${idx + 1}`,
        align: 'center',
        width: 50,
        render: (text) => <div className={`shift-cell ${text}`}>{text}</div>,
    }));

    const employeeColumns = [
        {
            title: 'STT',
            key: 'stt',
            fixed: 'left',
            width: 40,
            align: 'center',
            render: (_, __, index) => index + 1,
        },
        { title: 'Họ và Tên', dataIndex: 'name', key: 'name', fixed: 'left', width: 150 },
        { title: 'MSNV', dataIndex: 'msnv', key: 'msnv', width: 60, align: 'center' },
        ...dayColumnsUI,
    ];

    const employeeData = employeeSchedules.map((emp) => {
        const dayColumns = {};
        for (let i = 1; i <= daysInMonth; i++) {
            const dayStr = String(i).padStart(2, '0');
            const dateKey = `${year}-${String(month).padStart(2, '0')}-${dayStr}`;
            dayColumns[`day${i}`] = emp.days?.[dateKey] || '';
        }
        return {
            key: emp.employeeId,
            name: emp.employeeName,
            msnv: emp.employeeCode,
            ...dayColumns,
        };
    });

    return (
        <>
            <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
                <Col>
                    <DatePicker
                        picker="month"
                        value={selectedMonth}
                        onChange={(value) => value && onChangeMonth(value)}
                        format="MM/YYYY"
                        allowClear={false}
                    />
                </Col>

                <Col>
                    <Button
                        icon={showDepartment ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                        onClick={() => setShowDepartment(!showDepartment)}
                    >
                        {showDepartment ? 'Ẩn phòng ban' : 'Hiện phòng ban'}
                    </Button>
                </Col>

                <Col>
                    <Button
                        style={{
                            backgroundColor: '#1D6F42',
                            borderColor: '#1D6F42',
                            color: 'white',
                        }}
                        icon={<FileExcelFilled />}
                        disabled={!selectedDepartmentId}
                        onClick={async () => {
                            try {
                                await workScheduleService.exportWorkSchedule(
                                    selectedDepartmentId,
                                    selectedMonth.year(),
                                    selectedMonth.month() + 1,
                                );
                                message.success('Xuất Excel thành công!');
                            } catch (error) {
                                message.error(error.message);
                            }
                        }}
                    >
                        Xuất Excel
                    </Button>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                {showDepartment && (
                    <Col xs={24} md={4}>
                        <Card
                            style={{ maxHeight: 'calc(100vh - 280px)' }}
                            title="Chọn phòng ban"
                            className="md:h-auto overflow-y-auto"
                        >
                            <DepartmentTree onSelectDepartment={setSelectedDepartmentId} />
                        </Card>
                    </Col>
                )}

                <Col xs={24} md={showDepartment ? 20 : 24}>
                    <Table
                        columns={employeeColumns}
                        dataSource={employeeData}
                        bordered
                        size="small"
                        scroll={{ x: 'max-content' }}
                        pagination={false}
                        className="custom-table"
                        loading={loading}
                    />
                </Col>
            </Row>
        </>
    );
};

export default WorkScheduleTab;
