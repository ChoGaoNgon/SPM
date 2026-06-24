import { CalendarOutlined, CloudServerOutlined, DatabaseOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, DatePicker, message, Select, Table } from 'antd';
import dayjs from 'dayjs';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import DepartmentTree from '~/components/DepartmentTree';
import PageHeader from '~/components/PageHeader';
import attendanceService from '~/modules/attendance/services/attendanceService';
import authService from '~/modules/auth/services/authService';
import employeeService from '~/modules/employee/services/employeeService';

export default function AttendanceByDepartment() {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [fetching, setFetching] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [dateRange, setDateRange] = useState([dayjs(), dayjs()]);

    const isSuperAdmin = authService.hasRole('SUPERADMIN');
    const isManager = authService.hasRole('MANAGER');
    const isHead = authService.hasRole('HEAD');
    const isManagerOrHead = isManager || isHead;
    const [selectedDept, setSelectedDept] = useState(() => (isManagerOrHead ? authService.getDepartmentId() : null));

    const fetchAttendance = async (deptId, date) => {
        if (!deptId || !date) return;
        try {
            setLoading(true);
            const res = await attendanceService.getDailyByDepartment(date.format('YYYY-MM-DD'), deptId);
            setAttendanceData(res);
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance(selectedDept, selectedDate);
    }, [selectedDept, selectedDate]);

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                if (!selectedDept) {
                    setEmployees([]);
                    return;
                }
                const list = await employeeService.getEmployeesByDepartment(selectedDept, null);
                setEmployees(list);
            } catch (error) {
                message.error(error.message);
            }
        };
        loadEmployees();
    }, [selectedDept]);

    const handleCheckServiceStatus = async () => {
        try {
            setCheckingStatus(true);
            const [serviceStatus, jobStatus] = await Promise.all([
                attendanceService.getWindowsServiceStatus(),
                attendanceService.getFetchFromWindowsJobStatus(),
            ]);
            message.success(`Service: ${serviceStatus}`);
            message.info(`Job fetch: ${jobStatus}`);
        } catch (error) {
            message.error(error.message);
        } finally {
            setCheckingStatus(false);
        }
    };

    const handleFetchFromWindows = async () => {
        try {
            setFetching(true);
            const msg = await attendanceService.fetchFromWindowsService();
            message.success(msg);
            message.info('Quá trình lấy dữ liệu chạy nền. Bấm "Kiểm tra Service" để xem trạng thái job.');
        } catch (error) {
            message.error(error.message);
        } finally {
            setFetching(false);
        }
    };

    const handleSyncAttendance = async () => {
        if (!dateRange || dateRange.length !== 2) {
            message.warning('Vui lòng chọn khoảng thời gian!');
            return;
        }
        const [start, end] = dateRange;
        try {
            setSyncing(true);
            const msg = await attendanceService.sync(
                start.format('YYYY-MM-DD'),
                end.format('YYYY-MM-DD'),
                selectedEmployee || null,
            );
            message.success(msg);
        } catch (error) {
            message.error(error.message);
        } finally {
            setSyncing(false);
        }
    };

    const columns = [
        {
            title: 'Mã NV',
            dataIndex: 'employeeCode',
            key: 'employeeCode',
            align: 'center',
            width: '10%',
        },
        {
            title: 'Tên NV',
            dataIndex: 'employeeName',
            key: 'employeeName',
            width: '20%',
        },
        {
            title: 'Ngày',
            dataIndex: 'workDate',
            key: 'workDate',
            align: 'center',
            width: '10%',
            render: (val) => (val ? dayjs(val).format('DD/MM/YYYY') : '—'),
        },
        {
            title: 'Check In',
            dataIndex: 'checkInTime',
            key: 'checkInTime',
            align: 'center',
            width: '10%',
            render: (val) => (
                <span className="font-medium text-slate-700 dark:text-slate-200">
                    {val ? dayjs(val).format('HH:mm') : '—'}
                </span>
            ),
        },
        {
            title: 'Check Out',
            dataIndex: 'checkOutTime',
            key: 'checkOutTime',
            align: 'center',
            render: (val, record) => {
                if (!val) return '—';
                const isSameDay = (d1, d2) => dayjs(d1).isSame(dayjs(d2), 'day');
                const checkOutDay = dayjs(val).format('DD/MM');
                const showExtraDay =
                    record.checkOutTime &&
                    ((record.checkInTime && !isSameDay(record.checkInTime, record.checkOutTime)) ||
                        (!record.checkInTime && !isSameDay(record.checkOutTime, selectedDate)));
                return (
                    <div className="text-slate-700 dark:text-slate-200">
                        <span className="font-medium">{dayjs(val).format('HH:mm')}</span>
                        {showExtraDay && (
                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">({checkOutDay})</div>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Ca',
            dataIndex: 'shiftName',
            key: 'shiftName',
            align: 'center',
            width: '10%',
            render: (val) => <span className="text-slate-600 dark:text-slate-300">{val || '—'}</span>,
        },
        {
            title: 'Đi muộn',
            dataIndex: 'lateMinutes',
            key: 'lateMinutes',
            align: 'center',
            render: (val) => (
                <span className={`font-semibold ${val > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>
                    {val > 0 ? val : '_'}
                </span>
            ),
        },
        {
            title: 'Về sớm',
            dataIndex: 'earlyLeaveMinutes',
            key: 'earlyLeaveMinutes',
            align: 'center',
            width: '10%',
            render: (val) => (
                <span className={`font-semibold ${val > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>
                    {val > 0 ? val : '_'}
                </span>
            ),
        },
        {
            title: 'Tăng ca (giờ)',
            dataIndex: 'overTimeHours',
            key: 'overTimeHours',
            align: 'center',
            width: '10%',
            render: (val) =>
                val && val !== 0 ? (
                    <span className="font-semibold text-green-600 dark:text-green-400">{val}</span>
                ) : (
                    <span className="text-slate-400">_</span>
                ),
        },
    ];

    return (
        <div>
            <PageHeader
                icon={Calendar}
                title="Quản lý chấm công"
                description="Xem và quản lý dữ liệu chấm công của nhân viên theo phòng ban và ngày tháng"
            />
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-3">
                    <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md dark:shadow-dark-md border border-slate-200 dark:border-dark overflow-hidden">
                        <div className="bg-gradient-to-r from-accent-500 to-accent-600 px-4 py-4 border-b border-accent-700">
                            <div className="flex items-center gap-3">
                                <CalendarOutlined className="text-white text-xl" />
                                <span className="text-white font-semibold">Chọn ngày:</span>
                            </div>
                            <DatePicker
                                className="w-full mt-3"
                                value={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                format="DD/MM/YYYY"
                            />
                        </div>
                        <div className="p-4 max-h-[calc(100vh-283px)] overflow-y-auto custom-scrollbar">
                            {!isManagerOrHead ? (
                                <DepartmentTree onSelectDepartment={(deptId) => setSelectedDept(deptId)} />
                            ) : (
                                <div className="text-slate-600 dark:text-slate-300">
                                    Đang xem dữ liệu của phòng ban hiện tại.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-9">
                    {isSuperAdmin && (
                        <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md dark:shadow-dark-md border border-slate-200 dark:border-dark mb-6">
                            <div className="bg-gradient-to-r from-accent-600 to-accent-700 px-5 py-3 border-b border-accent-800">
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    <SyncOutlined className="text-lg" />
                                    Hành động & Đồng bộ
                                </h3>
                            </div>
                            <div className="p-5">
                                <div className="flex flex-wrap gap-4">
                                    <DatePicker.RangePicker
                                        value={dateRange}
                                        onChange={(range) => setDateRange(range)}
                                        format="DD/MM/YYYY"
                                        placeholder={['Từ ngày', 'Đến ngày']}
                                        className="min-w-[240px]"
                                    />
                                    <Select
                                        showSearch
                                        allowClear
                                        placeholder="Chọn nhân viên (bỏ trống = tất cả)"
                                        className="min-w-[250px]"
                                        optionFilterProp="label"
                                        onChange={setSelectedEmployee}
                                        value={selectedEmployee}
                                        options={employees.map((e) => ({
                                            value: e.id,
                                            label: `${e.code} - ${e.name}`,
                                        }))}
                                    />
                                    <Button
                                        type="primary"
                                        loading={syncing}
                                        onClick={handleSyncAttendance}
                                        icon={<SyncOutlined />}
                                        className="bg-accent-600 hover:bg-accent-700 border-accent-600"
                                    >
                                        Đồng bộ chấm công
                                    </Button>
                                    <Button
                                        loading={checkingStatus}
                                        onClick={handleCheckServiceStatus}
                                        icon={<CloudServerOutlined />}
                                        className="border-slate-300 dark:border-dark hover:border-accent-500 dark:hover:border-accent-600"
                                    >
                                        Kiểm tra Service
                                    </Button>
                                    <Button
                                        loading={fetching}
                                        onClick={handleFetchFromWindows}
                                        icon={<DatabaseOutlined />}
                                        className="border-slate-300 dark:border-dark hover:border-accent-500 dark:hover:border-accent-600"
                                    >
                                        Lấy dữ liệu từ Service
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-md dark:shadow-dark-md border border-slate-200 dark:border-dark overflow-hidden">
                        <div className="bg-gradient-to-r from-accent-500 to-accent-600 px-5 py-4 border-b border-accent-700">
                            <h3 className="text-white font-semibold text-lg">Dữ liệu chấm công</h3>
                        </div>
                        <div className="p-0">
                            <Table
                                rowKey="employeeId"
                                columns={columns}
                                dataSource={attendanceData}
                                loading={loading}
                                pagination={false}
                                scroll={{ x: 'max-content', y: '60vh' }}
                                className="attendance-table"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-track {
                    background: #1e293b;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #475569;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #64748b;
                }
            `}</style>
        </div>
    );
}
