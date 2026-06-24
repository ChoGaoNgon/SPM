import { CalendarOutlined } from '@ant-design/icons';
import { DatePicker, Input, message, Select, Table } from 'antd';
import dayjs from 'dayjs';
import { Database } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import PageHeader from '~/components/PageHeader';
import { useTheme } from '~/contexts/ThemeContext';
import attendanceService from '~/modules/attendance/services/attendanceService';
import employeeService from '~/modules/employee/services/employeeService';

export default function AttendanceRawLogs() {
    const { RangePicker } = DatePicker;
    const { isDark } = useTheme();
    const [selectedDateRange, setSelectedDateRange] = useState([dayjs(), dayjs()]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchText, setSearchText] = useState('');

    const [page, setPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 50;

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const list = await employeeService.getAllEmployees();
                setEmployees(list);
            } catch (error) {
                message.error('Lỗi tải danh sách nhân viên: ' + error.message);
            }
        };
        loadEmployees();
    }, []);

    const fetchRawLogs = useCallback(
        async (pageNumber = 0) => {
            try {
                setLoading(true);
                const startDate = selectedDateRange?.[0] ? selectedDateRange[0].format('YYYY-MM-DD') : null;
                const endDate = selectedDateRange?.[1] ? selectedDateRange[1].format('YYYY-MM-DD') : null;
                const response = await attendanceService.getRawLogs(
                    startDate,
                    endDate,
                    selectedEmployee,
                    pageNumber,
                    pageSize,
                );

                setLogs(response.content || []);
                setTotalElements(response.totalElements || 0);
                setPage(pageNumber);
            } catch (error) {
                message.error('Lỗi tải dữ liệu: ' + error.message);
            } finally {
                setLoading(false);
            }
        },
        [selectedDateRange, selectedEmployee, pageSize],
    );

    useEffect(() => {
        fetchRawLogs(0);
    }, [selectedDateRange, selectedEmployee, fetchRawLogs]);

    const handleTableChange = (pagination) => {
        fetchRawLogs(pagination.current - 1);
    };

    const filteredEmployees = employees.filter(
        (emp) =>
            emp.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            emp.code?.toLowerCase().includes(searchText.toLowerCase()),
    );

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            align: 'center',
            render: (text, record, index) => page * pageSize + index + 1,
        },
        {
            title: 'Thời gian',
            dataIndex: 'logTime',
            key: 'logTime',
            width: 180,
            render: (time) => dayjs(time).format('DD/MM/YYYY HH:mm:ss'),
            sorter: (a, b) => dayjs(a.logTime).unix() - dayjs(b.logTime).unix(),
        },
        {
            title: 'Machine Employee ID',
            dataIndex: 'machineEmployeeId',
            key: 'machineEmployeeId',
            width: 150,
            align: 'center',
        },
        {
            title: 'Mã NV',
            dataIndex: 'employeeCode',
            key: 'employeeCode',
            width: 120,
            render: (code) => code || '-',
        },
        {
            title: 'Tên nhân viên',
            dataIndex: 'employeeName',
            key: 'employeeName',
            width: 200,
            render: (name) => name || '-',
        },
        {
            title: 'Phòng ban',
            dataIndex: 'departmentName',
            key: 'departmentName',
            width: 180,
            render: (dept) => dept || '-',
        },
        {
            title: 'Device IP',
            dataIndex: 'deviceIp',
            key: 'deviceIp',
            width: 120,
            align: 'center',
            render: (ip) => ip || '-',
        },
    ];

    return (
        <div className="bg-gradient-to-br to-blue-50 min-h-screen">
            <PageHeader
                title="Raw Attendance Logs"
                description="Xem dữ liệu thô chấm công chưa qua xử lý từ máy chấm công"
                icon={Database}
            />

            <div className={`rounded-xl shadow-md p-4 mb-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                <div className="flex gap-4 items-center flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                            Chọn khoảng ngày
                        </label>
                        <RangePicker
                            value={selectedDateRange}
                            onChange={(dates) => setSelectedDateRange(dates || [null, null])}
                            format="DD/MM/YYYY"
                            placeholder={['Từ ngày', 'Đến ngày']}
                            className="w-full"
                            suffixIcon={<CalendarOutlined />}
                        />
                    </div>

                    <div className="flex-1 min-w-[250px]">
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                            Chọn nhân viên (tùy chọn)
                        </label>
                        <Select
                            value={selectedEmployee}
                            onChange={(value) => setSelectedEmployee(value)}
                            placeholder="Tất cả nhân viên"
                            allowClear
                            showSearch
                            filterOption={false}
                            onSearch={setSearchText}
                            className="w-full"
                            dropdownRender={(menu) => (
                                <>
                                    <div style={{ padding: '8px' }}>
                                        <Input
                                            placeholder="Tìm kiếm nhân viên..."
                                            value={searchText}
                                            onChange={(e) => setSearchText(e.target.value)}
                                        />
                                    </div>
                                    {menu}
                                </>
                            )}
                        >
                            {filteredEmployees.map((emp) => (
                                <Select.Option key={emp.id} value={emp.id}>
                                    {emp.code} - {emp.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex items-end">
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            Tổng: <span className="font-bold">{totalElements}</span> bản ghi
                        </div>
                    </div>
                </div>
            </div>

            <div className={`rounded-xl shadow-xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={logs}
                    loading={loading}
                    size="small"
                    bordered
                    scroll={{ x: 'max-content', y: 'calc(100vh - 400px)' }}
                    className={`custom-table ${isDark ? 'dark' : ''}`}
                    pagination={{
                        current: page + 1,
                        pageSize: pageSize,
                        total: totalElements,
                        showSizeChanger: false,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
                    }}
                    onChange={handleTableChange}
                />
            </div>
        </div>
    );
}
