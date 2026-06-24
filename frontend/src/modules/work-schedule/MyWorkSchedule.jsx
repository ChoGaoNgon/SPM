import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Input, message, Space, Table, Tabs, Tag } from 'antd';
import confirm from 'antd/es/modal/confirm';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import isoWeek from 'dayjs/plugin/isoWeek';
import { Calendar1, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import PageHeader from '~/components/PageHeader';
import authService from '~/modules/auth/services/authService';
import shiftChangeService from '~/modules/work-schedule/services/shiftChangeService';
import workScheduleService from '~/modules/work-schedule/services/workScheduleService';
import OvertimeRequestModal from './components/modal/OvertimeRequestModal';
import ShiftChangeRequestModal from './components/modal/ShiftChangeRequestModal';
import overtimeService from './services/overtimeService';
import './styles/EmployeeSchedule.css';

dayjs.extend(isoWeek);
dayjs.locale('vi');

const { TextArea } = Input;
const { TabPane } = Tabs;

const MyWorkSchedule = () => {
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [shiftRequests, setShiftRequests] = useState([]);
    const [overtimeRequests, setOvertimeRequests] = useState([]);
    const [assignedOvertime, setAssignedOvertime] = useState([]);
    const [shiftChangeModalVisible, setShiftChangeModalVisible] = useState(false);
    const [overtimeModalVisible, setOvertimeModalVisible] = useState(false);

    const [schedule, setSchedule] = useState([]);
    const fetchSchedule = async () => {
        try {
            const month = selectedMonth.month() + 1;
            const year = selectedMonth.year();
            const res = await workScheduleService.getWorkScheduleByEmployee(authService.getEmployeeId(), month, year);

            const scheduleMap = (res && (res.days || res.workSchedules)) || {};

            const start = selectedMonth.startOf('month');
            const end = selectedMonth.endOf('month');
            const calendar = [];
            let current = start.startOf('week');

            while (current.isBefore(end) || current.isSame(end, 'day')) {
                const week = [];
                for (let i = 0; i < 7; i++) {
                    const date = current.add(i, 'day');
                    const dateStr = date.format('YYYY-MM-DD');
                    week.push({
                        date,

                        shift: scheduleMap[dateStr] ? scheduleMap[dateStr].shift : null,
                        checkInTime: scheduleMap[dateStr] ? scheduleMap[dateStr].checkInTime : null,
                        checkOutTime: scheduleMap[dateStr] ? scheduleMap[dateStr].checkOutTime : null,
                        isLate: scheduleMap[dateStr] ? scheduleMap[dateStr].isLate : null,
                        isEarly: scheduleMap[dateStr] ? scheduleMap[dateStr].isEarly : null,

                        raw: scheduleMap[dateStr] || null,
                    });
                }
                calendar.push(week);
                current = current.add(7, 'day');
            }

            setSchedule(calendar);
        } catch (error) {
            message.error('Lấy lịch làm việc thất bại: ' + error.message);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, [selectedMonth]);

    const fetchShiftRequests = async () => {
        try {
            const employeeId = authService.getEmployeeId();
            const res = await shiftChangeService.getMyRequests(employeeId);

            const formatted = res.map((r) => ({
                key: r.id,
                date: r.workDate,
                currentShift: r.currentShift?.shiftCode,
                requestedShift: r.requestedShift?.shiftCode,
                reason: r.reason,
                status: r.status,
            }));

            setShiftRequests(formatted);
        } catch (error) {
            message.error(error.message);
        }
    };

    const fetchOvertimeRequests = async () => {
        try {
            const employeeId = authService.getEmployeeId();
            const res = await overtimeService.getMyRequests(employeeId);

            const formatted = res.map((r) => ({
                key: r.id,
                date: r.workDate,
                startTime: r.startTime,
                endTime: r.endTime,
                reason: r.reason,
                status: r.status,
            }));

            setOvertimeRequests(formatted);
        } catch (error) {
            message.error(error.message);
        }
    };

    const fetchAssignedOvertime = useCallback(async () => {
        try {
            const employeeId = authService.getEmployeeId();
            const res = await overtimeService.getAssignedOvertime(employeeId);

            const formatted = res.map((r) => ({
                key: r.id,
                id: r.id,
                msnv: r.employee?.code,
                name: r.employee?.name,
                department: r.employee?.departmentName,
                workDate: r.workDate,
                startTime: r.startTime,
                endTime: r.endTime,
                reason: r.reason,
                status: r.status,
            }));

            setAssignedOvertime(formatted);
        } catch (error) {
            message.error(error.message);
        }
    }, []);

    const shiftChangeRequestColumns = [
        { title: 'Ngày', dataIndex: 'date', key: 'date' },
        { title: 'Ca hiện tại', dataIndex: 'currentShift', key: 'currentShift' },
        { title: 'Ca yêu cầu', dataIndex: 'requestedShift', key: 'requestedShift' },
        { title: 'Lý do', dataIndex: 'reason', key: 'reason' },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                if (status === 'PENDING_MANAGER') return <Tag color="yellow">Chờ quản lý duyệt</Tag>;
                if (status === 'PENDING_HEAD') return <Tag color="blue">Chờ trưởng phòng duyệt</Tag>;
                if (status === 'APPROVED') return <Tag color="green">Đã duyệt</Tag>;
                if (status === 'REJECTED') return <Tag color="red">Từ chối</Tag>;
                return <Tag>{status}</Tag>;
            },
        },
    ];

    const overtimeRequestColumns = [
        { title: 'Ngày', dataIndex: 'date', key: 'date' },
        {
            title: 'Từ',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (value) => (
                <div>
                    <Tag color="blue">{dayjs(value).format('HH:mm')}</Tag>
                    <Tag color="default">{dayjs(value).format('DD/MM/YYYY')}</Tag>
                </div>
            ),
        },
        {
            title: 'Đến',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (value) => (
                <div>
                    <Tag color="blue">{dayjs(value).format('HH:mm')}</Tag>
                    <Tag color="default">{dayjs(value).format('DD/MM/YYYY')}</Tag>
                </div>
            ),
        },
        {
            title: 'Lý do',
            dataIndex: 'reason',
            key: 'reason',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                if (status === 'PENDING_MANAGER') return <Tag color="yellow">Chờ quản lý duyệt</Tag>;
                if (status === 'PENDING_HEAD') return <Tag color="blue">Chờ trưởng phòng duyệt</Tag>;
                if (status === 'APPROVED') return <Tag color="green">Đã duyệt</Tag>;
                if (status === 'REJECTED') return <Tag color="red">Từ chối</Tag>;
                return <Tag>{status}</Tag>;
            },
        },
    ];

    const handleAction = (record, action) => {
        confirm({
            title: action === 'APPROVED_BY_EMPLOYEE' ? 'Bạn xác nhận đồng ý tăng ca?' : 'Bạn xác nhận từ chối tăng ca?',
            icon: <ExclamationCircleOutlined />,
            content: (
                <>
                    <p>
                        Nhân viên: <b>{record.name}</b>
                    </p>
                    <p>
                        Ngày: <b>{dayjs(record.workDate).format('DD/MM/YYYY')}</b>
                        <br />
                        Thời gian:{' '}
                        <b>
                            {dayjs(record.startTime).format('HH:mm')} → {dayjs(record.endTime).format('HH:mm')}
                        </b>
                    </p>
                    <TextArea rows={3} placeholder="Nhập ghi chú (không bắt buộc)" id="approval-comment" />
                </>
            ),
            okText: action === 'APPROVED_BY_EMPLOYEE' ? 'Đồng ý' : 'Từ chối',
            okType: action === 'APPROVED_BY_EMPLOYEE' ? 'primary' : 'danger',
            cancelText: 'Hủy',

            onOk: async () => {
                try {
                    const employeeId = authService.getEmployeeId();
                    const reason = document.getElementById('approval-comment')?.value || '';

                    await overtimeService.respondAssignedOvertime({
                        requestId: record.id,
                        employeeId,
                        action,
                        reason,
                    });

                    message.success(
                        action === 'APPROVED_BY_EMPLOYEE' ? 'Bạn đã đồng ý tăng ca' : 'Bạn đã từ chối tăng ca',
                    );

                    fetchAssignedOvertime();
                } catch (error) {
                    message.error(error.message);
                }
            },
        });
    };

    const assignedOvertimeColumns = [
        { title: 'Ngày', dataIndex: 'workDate', key: 'workDate' },
        {
            title: 'Từ',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (value) => (
                <div>
                    <Tag color="blue">{dayjs(value).format('HH:mm')}</Tag>
                    <Tag color="default">{dayjs(value).format('DD/MM/YYYY')}</Tag>
                </div>
            ),
        },
        {
            title: 'Đến',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (value) => (
                <div>
                    <Tag color="blue">{dayjs(value).format('HH:mm')}</Tag>
                    <Tag color="default">{dayjs(value).format('DD/MM/YYYY')}</Tag>
                </div>
            ),
        },
        {
            title: 'Lý do',
            dataIndex: 'reason',
            key: 'reason',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                if (status === 'PENDING_MANAGER') return <Tag color="yellow">Chờ quản lý duyệt</Tag>;
                if (status === 'PENDING_HEAD') return <Tag color="blue">Chờ trưởng phòng duyệt</Tag>;
                if (status === 'APPROVED') return <Tag color="green">Đã duyệt</Tag>;
                if (status === 'REJECTED') return <Tag color="red">Từ chối</Tag>;
                if (status === 'ASSIGN_EMPLOYEE') return <Tag color="grey">Chờ phản hồi từ nhân viên</Tag>;
                if (status === 'APPROVED_BY_EMPLOYEE') return <Tag color="green">Đồng ý</Tag>;
                if (status === 'REJECTED_BY_EMPLOYEE') return <Tag color="red">Từ chối</Tag>;
                return <Tag>{status}</Tag>;
            },
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        disabled={!record.status?.startsWith('ASSIGN_EMPLOYEE')}
                        onClick={() => handleAction(record, 'APPROVED_BY_EMPLOYEE')}
                    >
                        Đồng ý
                    </Button>
                    <Button
                        danger
                        size="small"
                        disabled={!record.status?.startsWith('ASSIGN_EMPLOYEE')}
                        onClick={() => handleAction(record, 'REJECTED_BY_EMPLOYEE')}
                    >
                        Từ chối
                    </Button>
                </Space>
            ),
        },
    ];

    const handlePrevMonth = () => {
        setSelectedMonth(selectedMonth.subtract(1, 'month'));
    };

    const handleNextMonth = () => {
        setSelectedMonth(selectedMonth.add(1, 'month'));
    };

    return (
        <div className="my-work-schedule">
            <PageHeader
                icon={Calendar1}
                title="Lịch làm việc của tôi"
                description="Xem lịch làm việc, quản lý yêu cầu đổi ca và tăng ca của bạn"
            />

            <Tabs
                defaultActiveKey="1"
                onChange={(activeKey) => {
                    if (activeKey === '2' && shiftRequests.length === 0) {
                        fetchShiftRequests();
                    } else if (activeKey === '3' && overtimeRequests.length === 0) {
                        fetchOvertimeRequests();
                    } else if (activeKey === '4' && assignedOvertime.length === 0) {
                        fetchAssignedOvertime();
                    }
                }}
            >
                <TabPane tab="Lịch làm việc" key="1">
                    <div className="rounded-xl">
                        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4 md:gap-0">
                            <div className="flex items-center gap-6 justify-center md:justify-start">
                                <button
                                    onClick={handlePrevMonth}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-600 hover:text-slate-900"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <div className="text-center min-w-[100px]">
                                    <div className="text-sm font-medium dark:text-white text-slate-500 uppercase tracking-wide">
                                        THÁNG
                                    </div>
                                    <div className="text-2xl font-bold dark:text-white text-slate-900">
                                        {selectedMonth.month() + 1} / {selectedMonth.year()}
                                    </div>
                                </div>

                                <button
                                    onClick={handleNextMonth}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-600 hover:text-slate-900"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex gap-3 justify-center md:justify-end">
                                <button
                                    onClick={() => setShiftChangeModalVisible(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow active:scale-[0.98] transition-all"
                                >
                                    <svg
                                        className="w-4 h-4 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M4 4v6h6M20 20v-6h-6M5 19a9 9 0 0 0 14-14" />
                                    </svg>
                                    Đổi ca
                                </button>

                                <button
                                    onClick={() => setOvertimeModalVisible(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow active:scale-[0.98] transition-all"
                                >
                                    <svg
                                        className="w-4 h-4 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 6v6l4 2M5 4h14v16H5z" />
                                    </svg>
                                    Yêu cầu tăng ca
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-red-600 uppercase tracking-wide">
                                            Số buổi đi muộn
                                        </p>
                                        <p className="text-3xl font-bold text-red-700 mt-2">
                                            {
                                                schedule.flat().filter((day) => {
                                                    const offShifts = ['NT', 'L', 'DLBT', 'P', 'NKL', 'NPL', 'NS'];
                                                    const dayDate = dayjs(day.date);
                                                    const today = dayjs();
                                                    return (
                                                        day.isLate === true &&
                                                        day.shift &&
                                                        !offShifts.includes(day.shift) &&
                                                        (dayDate.isBefore(today, 'day') || dayDate.isSame(today, 'day'))
                                                    );
                                                }).length
                                            }
                                        </p>
                                    </div>
                                    <div className="text-red-400 opacity-50">
                                        <svg
                                            className="w-12 h-12"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 8v4l3 2m6-11a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-orange-600 uppercase tracking-wide">
                                            Số buổi về sớm
                                        </p>
                                        <p className="text-3xl font-bold text-orange-700 mt-2">
                                            {
                                                schedule.flat().filter((day) => {
                                                    const offShifts = ['NT', 'L', 'DLBT', 'P', 'NKL', 'NPL', 'NS'];
                                                    const dayDate = dayjs(day.date);
                                                    const today = dayjs();
                                                    return (
                                                        day.isEarly === true &&
                                                        day.shift &&
                                                        !offShifts.includes(day.shift) &&
                                                        (dayDate.isBefore(today, 'day') || dayDate.isSame(today, 'day'))
                                                    );
                                                }).length
                                            }
                                        </p>
                                    </div>
                                    <div className="text-orange-400 opacity-50">
                                        <svg
                                            className="w-12 h-12"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-amber-600 uppercase tracking-wide">
                                            Thiếu log chấm công
                                        </p>
                                        <p className="text-3xl font-bold text-amber-700 mt-2">
                                            {
                                                schedule.flat().filter((day) => {
                                                    const offShifts = ['NT', 'L', 'DLBT', 'P', 'NKL', 'NPL', 'NS'];
                                                    const dayDate = dayjs(day.date);
                                                    const today = dayjs();
                                                    return (
                                                        day.shift &&
                                                        !offShifts.includes(day.shift) &&
                                                        (dayDate.isBefore(today, 'day') ||
                                                            dayDate.isSame(today, 'day')) &&
                                                        (!day.checkInTime || !day.checkOutTime)
                                                    );
                                                }).length
                                            }
                                        </p>
                                    </div>
                                    <div className="text-amber-400 opacity-50">
                                        <svg
                                            className="w-12 h-12"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 9v2m0 4v2m0-12a9 9 0 110 18 9 9 0 010-18z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white hidden md:block border border-slate-200 rounded-lg overflow-hidden">
                            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                                    <div
                                        key={day}
                                        className="p-4 text-center font-semibold text-slate-700 border-r border-slate-200 last:border-r-0"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="divide-y divide-slate-200">
                                {schedule.map((week, weekIndex) => (
                                    <div key={weekIndex} className="grid grid-cols-7">
                                        {week.map((day, dayIndex) => (
                                            <div
                                                key={dayIndex}
                                                className={`min-h-[140px] p-3 border-r border-slate-200 last:border-r-0 flex flex-col ${
                                                    day.date.month() !== selectedMonth.month()
                                                        ? 'bg-slate-50'
                                                        : 'bg-white'
                                                }`}
                                            >
                                                <div className="text-right mb-2">
                                                    <span className="text-sm font-semibold text-slate-900">
                                                        {day.date.format('DD')}
                                                    </span>
                                                </div>

                                                {day.shift ? (
                                                    <>
                                                        <div
                                                            className={`shift-cell shift-code ${day.shift} inline-flex items-center justify-center px-3 py-1.5 rounded-md font-medium text-sm mb-2`}
                                                        >
                                                            {day.shift}
                                                        </div>

                                                        <div className="text-xs space-y-1">
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-500">Vào:</span>
                                                                <span
                                                                    className={`font-medium ${day.isLate ? 'text-red-600' : 'text-slate-900'}`}
                                                                >
                                                                    {day.checkInTime
                                                                        ? dayjs(day.checkInTime).format('HH:mm')
                                                                        : '—:—'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-500">Ra:</span>
                                                                <span
                                                                    className={`font-medium ${day.isEarly ? 'text-red-600' : 'text-slate-900'}`}
                                                                >
                                                                    {day.checkOutTime
                                                                        ? dayjs(day.checkOutTime).format('HH:mm')
                                                                        : '—:—'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <span className="text-slate-400 text-sm">—:—</span>
                                                        <span className="text-slate-400 text-sm">—:—</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="md:hidden flex flex-col gap-3">
                            {schedule.flat().map((day, i) => (
                                <div
                                    key={i}
                                    className="p-4 rounded-xl border border-slate-300/40 dark:border-slate-700"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-lg font-semibold">{day.date.format('DD/MM')}</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                            {day.date.format('dddd')}
                                        </div>
                                    </div>

                                    {day.shift ? (
                                        <>
                                            <div
                                                className={`shift-cell shift-code ${day.shift} inline-flex items-center justify-center px-3 py-1.5 rounded-md font-medium text-sm mb-2`}
                                            >
                                                {day.shift}
                                            </div>

                                            <div className="mt-2 text-sm space-y-1">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500 dark:text-slate-400">Vào:</span>
                                                    <span className={day.isLate ? 'text-red-600' : 'font-semibold'}>
                                                        {day.checkInTime
                                                            ? dayjs(day.checkInTime).format('HH:mm')
                                                            : '—:—'}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-slate-500 dark:text-slate-400">Ra:</span>
                                                    <span className={day.isEarly ? 'text-red-600' : 'font-semibold'}>
                                                        {day.checkOutTime
                                                            ? dayjs(day.checkOutTime).format('HH:mm')
                                                            : '—:—'}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-4 text-slate-400 dark:text-slate-500 text-sm">
                                            Không có dữ liệu
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </TabPane>

            </Tabs>

            <ShiftChangeRequestModal
                visible={shiftChangeModalVisible}
                onClose={() => setShiftChangeModalVisible(false)}
                schedule={schedule}
                type="REQUEST"
            />

            <OvertimeRequestModal
                visible={overtimeModalVisible}
                onClose={() => setOvertimeModalVisible(false)}
                onSuccess={() => fetchOvertimeRequests()}
                type="REQUEST"
            />
        </div>
    );
};

export default MyWorkSchedule;
