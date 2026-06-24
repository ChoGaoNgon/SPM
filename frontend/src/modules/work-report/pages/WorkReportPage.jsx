import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Image, message, Modal, Popconfirm, Select, Space, Spin, Table, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import authService from '~/modules/auth/services/authService';
import employeeService from '~/modules/employee/services/employeeService';
import dailyWorkReportService from '~/modules/work-report/services/dailyWorkReportService';
import OvertimeRequestModal from '~/modules/work-schedule/components/modal/OvertimeRequestModal';
import overtimeService from '~/modules/work-schedule/services/overtimeService';
import CustomTooltip from '../components/CustomTooltip';
import EmployeeReportsTable from '../components/EmployeeReportsTable';
import WorkReportFormModal from '../components/WorkReportFormModal';
import { mapToGanttTask } from '../utils/gantt';

const DEFAULT_SELECTED_DATE = () => dayjs().subtract(1, 'day');

const parseSearchDate = (dateValue) => {
    if (!dateValue || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return null;
    }

    const parsedDate = dayjs(dateValue);
    return parsedDate.isValid() ? parsedDate : null;
};

const WorkReportPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [reports, setReports] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rowViewModes, setRowViewModes] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const [employeeData, setEmployeeData] = useState(null);
    const [overtimeModalVisible, setOvertimeModalVisible] = useState(false);
    const [overtimeSent, setOvertimeSent] = useState(false);
    const [employeeViewMode, setEmployeeViewMode] = useState('gantt');

    const [selectedEmployeeDetail, setSelectedEmployeeDetail] = useState(null);
    const [employeeDetailModalVisible, setEmployeeDetailModalVisible] = useState(false);

    const employee = authService.getEmployee() || {};
    const employeeId = employee.id;
    const searchDateParam = searchParams.get('date');
    const selectedDate = useMemo(() => parseSearchDate(searchDateParam) || DEFAULT_SELECTED_DATE(), [searchDateParam]);
    const selectedDateParam = useMemo(() => selectedDate.format('YYYY-MM-DD'), [selectedDate]);

    const isAdmin = authService.hasRole('ADMIN') || authService.hasRole('SUPERADMIN');
    const isManager = authService.hasRole('MANAGER') || authService.hasRole('HEAD');
    const isEmployee = authService.hasRole('EMPLOYEE');
    const isPrivilegedUser = isAdmin || isManager;
    const isEmployeeOnly = isEmployee && !isPrivilegedUser;

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const date = selectedDateParam;

            if (isEmployeeOnly) {
                const res = await dailyWorkReportService.getByEmployeeAndDate(employeeId, date);
                const data = res?.data?.[0];
                setEmployeeData(data);
                setReports(data?.reports || []);
            } else {
                const res = await dailyWorkReportService.getByDate(date);
                setReports(res?.data || []);
            }
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    }, [selectedDateParam, isEmployeeOnly, employeeId]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    useEffect(() => {
        const currentDateParam = searchDateParam;
        const nextDateParam = selectedDateParam;

        if (currentDateParam === nextDateParam) {
            return;
        }

        const nextSearchParams = new URLSearchParams(searchParams);
        nextSearchParams.set('date', nextDateParam);
        setSearchParams(nextSearchParams, { replace: true });
    }, [searchDateParam, searchParams, selectedDateParam, setSearchParams]);

    const updateSelectedDate = useCallback(
        (date) => {
            const nextDate = date || DEFAULT_SELECTED_DATE();
            const nextDateParam = nextDate.format('YYYY-MM-DD');

            if (searchDateParam === nextDateParam) {
                return;
            }

            const nextSearchParams = new URLSearchParams(searchParams);
            nextSearchParams.set('date', nextDateParam);
            setSearchParams(nextSearchParams, { replace: true });
        },
        [searchDateParam, searchParams, setSearchParams],
    );

    useEffect(() => {
        const fetchEmployees = async () => {
            if (!isPrivilegedUser) {
                setEmployees([]);
                return;
            }

            try {
                if (isAdmin) {
                    const data = await employeeService.getAllEmployees();
                    setEmployees(data);
                    return;
                }

                const managerDepartmentId = authService.getDepartmentId();
                const managerDepartmentCode = authService.getDepartmentCode();

                if (!managerDepartmentId && !managerDepartmentCode) {
                    setEmployees([]);
                    message.warning('Không tìm thấy thông tin phòng ban của quản lý.');
                    return;
                }

                const data = await employeeService.getEmployeesByDepartment(managerDepartmentId, managerDepartmentCode);
                setEmployees(data || []);
            } catch (error) {
                message.error(error.message);
            }
        };

        fetchEmployees();
    }, [isPrivilegedUser, isAdmin]);

    const checkOvertimeSent = useCallback(async () => {
        if (!isEmployee || !employeeId || !selectedDateParam) return;
        try {
            const sent = await overtimeService.checkOvertimeRequest(employeeId, dayjs(selectedDateParam));
            setOvertimeSent(sent);
        } catch (error) {
            message.error(error);
        }
    }, [isEmployee, employeeId, selectedDateParam]);

    useEffect(() => {
        checkOvertimeSent();
    }, [checkOvertimeSent]);

    const handleRowViewModeChange = (empId, mode) => {
        setRowViewModes((prev) => ({ ...prev, [empId]: mode }));
    };

    const handleAdd = () => {
        setEditingRecord(null);
        form.resetFields();
        form.setFieldsValue({ reportDate: selectedDate });
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue({
            employeeId: record.employeeId,
            startDateTime: record.startDateTime ? dayjs(record.startDateTime) : null,
            endDateTime: record.endDateTime ? dayjs(record.endDateTime) : null,
            taskDescription: record.taskDescription,
            upload: record.filePath
                ? [
                      {
                          uid: '-1',
                          name: record.filePath.split('/').pop(),
                          status: 'done',
                          url: `${process.env.REACT_APP_UPLOAD_URL}/${record.filePath}`,
                      },
                  ]
                : [],
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (record) => {
        try {
            const msg = await dailyWorkReportService.delete(record.id);
            message.success(msg);
            fetchReports();
        } catch (error) {
            message.error(error.message);
        }
    };

    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            const fileList = values.upload || [];
            const firstFile = fileList[0];
            const file = firstFile?.originFileObj || null;

            let existingFilePath = editingRecord?.filePath || null;
            if (!file && firstFile?.url) {
                const urlParts = firstFile.url.split('/');
                existingFilePath = urlParts.slice(urlParts.length - 2).join('/');
            }

            const createEmployeeId = !editingRecord
                ? isPrivilegedUser
                    ? values.employeeId
                    : isEmployeeOnly
                      ? employeeId
                      : null
                : null;

            if (!editingRecord && !createEmployeeId) {
                message.error('Vui lòng chọn nhân viên cho công việc mới.');
                return;
            }

            const payload = {
                startDateTime: dayjs(values.startDateTime).format('YYYY-MM-DDTHH:mm:ss'),
                endDateTime: dayjs(values.endDateTime).format('YYYY-MM-DDTHH:mm:ss'),
                taskDescription: values.taskDescription,
                file,
                ...(editingRecord && !file && existingFilePath ? { filePath: existingFilePath } : {}),
                ...(!editingRecord ? { employeeId: createEmployeeId } : {}),
            };

            if (editingRecord) {
                const msg = await dailyWorkReportService.update(editingRecord.id, payload);
                message.success(msg);
            } else {
                const msg = await dailyWorkReportService.create(payload);
                message.success(msg);
            }

            setIsModalVisible(false);
            setEditingRecord(null);
            form.resetFields();
            fetchReports();
        } catch (error) {
            message.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const checkOvertimeTasks = (reports, shiftEndTime) => {
        if (!reports || !shiftEndTime) return false;
        const shiftEnd = dayjs(shiftEndTime);
        return reports.some((report) => dayjs(report.endDateTime).isAfter(shiftEnd));
    };

    const getOvertimeInfo = (reports, shiftEndTime) => {
        if (!reports || !shiftEndTime) return null;
        const shiftEnd = dayjs(shiftEndTime);
        const overtimeTasks = reports.filter((r) => dayjs(r.endDateTime).isAfter(shiftEnd));
        if (!overtimeTasks.length) return null;

        const lastTask = overtimeTasks.reduce((prev, curr) =>
            dayjs(curr.endDateTime).isAfter(dayjs(prev.endDateTime)) ? curr : prev,
        );

        return {
            startTime: shiftEnd,
            endTime: dayjs(lastTask.endDateTime),
            reason: lastTask.taskDescription,
        };
    };

    const overtimeInfo = isEmployee && employeeData ? getOvertimeInfo(reports, employeeData?.endDateTime) : null;

    const handleOvertimeClick = () => {
        if (!overtimeInfo) return;

        if (overtimeSent) {
            message.warning('Bạn đã gửi yêu cầu tăng ca cho ngày này');
            return;
        }

        setOvertimeModalVisible(true);
    };

    const parseReportTypeFirst5 = (taskDescription) => {
        if (!taskDescription) return null;
        const first5 = taskDescription.slice(0, 5);
        if (first5.includes('(PS)')) return 'PS';
        if (first5.includes('(ST)')) return 'ST';
        if (first5.includes('(BD)')) return 'BD';
        if (first5.includes('(K)')) return 'K';
        return null;
    };

    const totalStats =
        (isAdmin || isManager) && Array.isArray(reports)
            ? reports.reduce(
                  (acc, emp) => {
                      (emp.reports || []).forEach((r) => {
                          const type = parseReportTypeFirst5(r.taskDescription);
                          if (type === 'PS') acc.PS += 1;
                          else if (type === 'ST') acc.ST += 1;
                          else if (type === 'BD') acc.BD += 1;
                          else if (type === 'K') acc.K += 1;
                      });
                      return acc;
                  },
                  { PS: 0, ST: 0, BD: 0, K: 0 },
              )
            : null;

    return (
        <Spin spinning={loading}>
            <div>
                <div className="rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                                <svg
                                    className="w-5 h-5 text-gray-600 dark:text-gray-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <DatePicker
                                    value={selectedDate}
                                    format="DD/MM/YYYY"
                                    onChange={updateSelectedDate}
                                    className="border-none shadow-none"
                                />
                            </div>
                            <Button
                                onClick={() => updateSelectedDate(dayjs())}
                                className="flex items-center gap-2 h-10 px-4 border-gray-300 hover:border-blue-500 hover:text-blue-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Hôm nay
                            </Button>
                        </div>
                        <Button
                            type="primary"
                            onClick={handleAdd}
                            className="flex items-center gap-2 h-10 px-6 bg-blue-600 hover:bg-blue-700 shadow-md"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Thêm công việc
                        </Button>
                    </div>
                </div>

                {(isAdmin || isManager) && authService.hasDepartmentCode('KTL') && totalStats && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <svg
                                className="w-5 h-5 text-orange-600 dark:text-orange-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                            Thống kê công việc trong ngày
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="rounded-lg p-4 shadow-sm border border-pink-200 dark:border-pink-700">
                                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Phát sinh</div>
                                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                                    {totalStats.PS}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">PS</div>
                            </div>
                            <div className="rounded-lg p-4 shadow-sm border border-blue-200 dark:border-blue-700">
                                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Setup</div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {totalStats.ST}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">ST</div>
                            </div>
                            <div className="rounded-lg p-4 shadow-sm border border-green-200 dark:border-green-700">
                                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Bảo dưỡng</div>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {totalStats.BD}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">BD</div>
                            </div>
                            <div className="rounded-lg p-4 shadow-sm border border-orange-200 dark:border-orange-700">
                                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Khác</div>
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {totalStats.K}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">K</div>
                            </div>
                        </div>
                    </div>
                )}

                {isEmployee && !isAdmin && !isManager && employeeData && (
                    <div>
                        <div className="rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                                Thông tin ca làm việc
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div className="rounded-lg p-4 border border-blue-100 dark:border-blue-700">
                                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Bắt đầu ca</div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {dayjs(employeeData.startDateTime).format('HH:mm')}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {dayjs(employeeData.startDateTime).format('DD/MM/YYYY')}
                                    </div>
                                </div>
                                <div className="rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Kết thúc ca</div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {dayjs(employeeData.endDateTime).format('HH:mm')}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {dayjs(employeeData.endDateTime).format('DD/MM/YYYY')}
                                    </div>
                                </div>
                                <div className="rounded-lg p-4 border border-green-200 dark:border-green-700">
                                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Giờ vào</div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {dayjs(employeeData.checkinTime).format('HH:mm')}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {dayjs(employeeData.checkinTime).format('DD/MM/YYYY')}
                                    </div>
                                </div>
                                <div className="rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Giờ ra</div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {dayjs(employeeData.checkoutTime).format('HH:mm')}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {dayjs(employeeData.checkoutTime).format('DD/MM/YYYY')}
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-lg p-4 border border-indigo-200 dark:border-indigo-700">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Hiệu suất làm việc:
                                    </span>
                                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                        {employeeData.workEfficiency?.toFixed(2) || '0.00'}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {checkOvertimeTasks(reports, employeeData?.endDateTime) && (
                            <div className="rounded-xl shadow-sm border border-red-200 dark:border-red-700 p-6 mb-6">
                                {overtimeSent ? (
                                    <div className="flex items-center gap-3">
                                        <svg
                                            className="w-6 h-6 text-green-600 dark:text-green-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <span className="text-green-700 dark:text-green-300 font-medium">
                                            Bạn đã gửi yêu cầu tăng ca
                                        </span>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <svg
                                                className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                />
                                            </svg>
                                            <div>
                                                <p className="text-red-700 dark:text-red-300 font-medium">
                                                    Bạn có công việc vượt giờ làm
                                                </p>
                                                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                                                    Bạn có muốn yêu cầu tăng ca không?
                                                </p>
                                            </div>
                                        </div>
                                        {overtimeInfo && (
                                            <Button
                                                type="primary"
                                                danger
                                                onClick={handleOvertimeClick}
                                                className="flex items-center gap-2 h-10 px-6 shadow-md"
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                Gửi yêu cầu tăng ca
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {isEmployeeOnly ? (
                    <div className="rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                                Báo cáo công việc
                            </h3>
                            <Select
                                value={employeeViewMode}
                                onChange={setEmployeeViewMode}
                                options={[
                                    { value: 'table', label: '📋 Dạng bảng' },
                                    { value: 'gantt', label: '📊 Dạng Gantt' },
                                ]}
                                className="w-40"
                            />
                        </div>

                        {reports.length > 0 ? (
                            employeeViewMode === 'gantt' ? (
                                reports.filter((r) => r.startDateTime && r.endDateTime).length > 0 ? (
                                    <div className="gantt-wrapper rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                                        <Gantt
                                            tasks={reports
                                                .filter((r) => r.startDateTime && r.endDateTime)
                                                .map(mapToGanttTask)}
                                            viewMode={ViewMode.Hour}
                                            listCellWidth=""
                                            columnWidth={65}
                                            rowHeight={40}
                                            fontSize={12}
                                            TooltipContent={CustomTooltip}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <svg
                                            className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                                            Không có công việc hợp lệ để hiển thị
                                        </p>
                                    </div>
                                )
                            ) : (
                                <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
                                    <Table
                                        rowKey="id"
                                        columns={[
                                            {
                                                title: 'STT',
                                                dataIndex: 'index',
                                                render: (_, __, idx) => (
                                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                        {idx + 1}
                                                    </span>
                                                ),
                                                align: 'center',
                                                width: 60,
                                            },
                                            {
                                                title: 'Nội dung công việc',
                                                dataIndex: 'taskDescription',
                                                render: (text) => (
                                                    <span className="text-gray-800 dark:text-gray-200">{text}</span>
                                                ),
                                            },
                                            {
                                                title: 'Thời gian bắt đầu',
                                                dataIndex: 'startDateTime',
                                                align: 'center',
                                                width: 120,
                                                render: (value) => {
                                                    if (!value) return <span className="text-gray-400">—</span>;
                                                    const date = dayjs(value).format('DD/MM/YYYY');
                                                    const time = dayjs(value).format('HH:mm');
                                                    return (
                                                        <Tooltip title={date}>
                                                            <span className="font-medium text-blue-600 dark:text-blue-400 cursor-help">
                                                                {time}
                                                            </span>
                                                        </Tooltip>
                                                    );
                                                },
                                            },
                                            {
                                                title: 'Thời gian kết thúc',
                                                dataIndex: 'endDateTime',
                                                align: 'center',
                                                width: 120,
                                                render: (value) => {
                                                    if (!value) return <span className="text-gray-400">—</span>;
                                                    const date = dayjs(value).format('DD/MM/YYYY');
                                                    const time = dayjs(value).format('HH:mm');
                                                    return (
                                                        <Tooltip title={date}>
                                                            <span className="font-medium text-green-600 dark:text-green-400 cursor-help">
                                                                {time}
                                                            </span>
                                                        </Tooltip>
                                                    );
                                                },
                                            },
                                            {
                                                title: 'Hình ảnh',
                                                dataIndex: 'filePath',
                                                align: 'center',
                                                width: 120,
                                                render: (_, r) =>
                                                    r.filePath ? (
                                                        <Image
                                                            width={80}
                                                            src={`${process.env.REACT_APP_UPLOAD_URL}/${r.filePath}`}
                                                            className="rounded-lg"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    ),
                                            },
                                            {
                                                title: 'Hành động',
                                                dataIndex: 'action',
                                                align: 'center',
                                                width: 120,
                                                render: (_, rec) => {
                                                    const isWithin24Hours = rec.createdAt
                                                        ? dayjs().diff(dayjs(rec.createdAt), 'hour') < 24
                                                        : false;
                                                    const canEdit =
                                                        authService.hasRole('SUPERADMIN') || isWithin24Hours;

                                                    return (
                                                        <Space size="small">
                                                            <Button
                                                                onClick={() => handleEdit({ ...rec, employeeId })}
                                                                disabled={!canEdit}
                                                                title={
                                                                    !canEdit
                                                                        ? 'Chỉ có thể sửa báo cáo trong vòng 24 giờ'
                                                                        : 'Chỉnh sửa'
                                                                }
                                                                icon={<EditOutlined />}
                                                                className="flex items-center justify-center hover:border-blue-500 hover:text-blue-600"
                                                            />
                                                            <Popconfirm
                                                                title="Xác nhận xóa"
                                                                description="Bạn có chắc muốn xóa công việc này không?"
                                                                onConfirm={() => handleDelete(rec)}
                                                                okText="Xóa"
                                                                cancelText="Hủy"
                                                                disabled={!canEdit}
                                                            >
                                                                <Button
                                                                    danger
                                                                    icon={<DeleteOutlined />}
                                                                    disabled={!canEdit}
                                                                    title={
                                                                        !canEdit
                                                                            ? 'Chỉ có thể xóa báo cáo trong vòng 24 giờ'
                                                                            : 'Xóa'
                                                                    }
                                                                    className="flex items-center justify-center"
                                                                />
                                                            </Popconfirm>
                                                        </Space>
                                                    );
                                                },
                                            },
                                        ]}
                                        dataSource={reports}
                                        pagination={false}
                                        size="small"
                                        className="custom-table"
                                    />
                                </div>
                            )
                        ) : (
                            <div className="text-center py-16">
                                <svg
                                    className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                <p className="text-gray-500 dark:text-gray-400 text-lg">
                                    Không có báo cáo công việc trong ngày này
                                </p>
                                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                                    Hãy thêm công việc mới bằng nút "Thêm công việc" ở trên
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="hidden md:block rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <EmployeeReportsTable
                            reports={reports}
                            rowViewModes={rowViewModes}
                            onViewModeChange={handleRowViewModeChange}
                            isAdmin={isAdmin}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </div>
                )}

                <WorkReportFormModal
                    visible={isModalVisible}
                    submitting={submitting}
                    onCancel={() => {
                        setIsModalVisible(false);
                        setEditingRecord(null);
                        form.resetFields();
                    }}
                    onSubmit={() => {
                        form.validateFields()
                            .then((values) => handleSubmit(values))
                            .catch(() => message.warning('Vui lòng nhập đầy đủ thông tin trước khi lưu.'));
                    }}
                    form={form}
                    editingRecord={editingRecord}
                    employees={isPrivilegedUser ? employees : undefined}
                    canSelectEmployee={isPrivilegedUser}
                />

                {isEmployeeOnly && (
                    <OvertimeRequestModal
                        visible={overtimeModalVisible}
                        onClose={() => setOvertimeModalVisible(false)}
                        type="REQUEST"
                        initialData={
                            overtimeInfo
                                ? {
                                      startTime: overtimeInfo.startTime,
                                      endTime: overtimeInfo.endTime,
                                      reason: overtimeInfo.reason,
                                  }
                                : null
                        }
                        onSuccess={() => setOvertimeSent(true)}
                    />
                )}
            </div>

            {(isAdmin || isManager) && (
                <div className="block md:hidden">
                    <MobileAdminList
                        reports={reports}
                        onSelectEmployee={(emp) => {
                            setSelectedEmployeeDetail(emp);
                            setEmployeeDetailModalVisible(true);
                        }}
                    />
                </div>
            )}

            <Modal
                title={
                    selectedEmployeeDetail
                        ? `${selectedEmployeeDetail.employeeName || selectedEmployeeDetail.name} - ${selectedEmployeeDetail.employeeCode || selectedEmployeeDetail.code}`
                        : 'Chi tiết nhân viên'
                }
                visible={employeeDetailModalVisible}
                onCancel={() => {
                    setEmployeeDetailModalVisible(false);
                    setSelectedEmployeeDetail(null);
                }}
                footer={null}
                width={500}
            >
                {selectedEmployeeDetail && (
                    <div className="space-y-4">
                        <div className="rounded-lg p-4 border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                                Thông tin ca làm việc
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-blue-800 dark:text-blue-200">Giờ bắt đầu ca:</span>
                                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                                        {dayjs(selectedEmployeeDetail.startDateTime).format('HH:mm')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-blue-800 dark:text-blue-200">Giờ kết thúc ca:</span>
                                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                                        {dayjs(selectedEmployeeDetail.endDateTime).format('HH:mm')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg p-4 border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900">
                            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">Giờ check-in/out</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-green-800 dark:text-green-200">Giờ vào:</span>
                                    <span className="font-semibold text-green-900 dark:text-green-100">
                                        {selectedEmployeeDetail.checkinTime
                                            ? dayjs(selectedEmployeeDetail.checkinTime).format('HH:mm')
                                            : '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-green-800 dark:text-green-200">Giờ ra:</span>
                                    <span className="font-semibold text-green-900 dark:text-green-100">
                                        {selectedEmployeeDetail.checkoutTime
                                            ? dayjs(selectedEmployeeDetail.checkoutTime).format('HH:mm')
                                            : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg p-4 border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                                    Hiệu suất làm việc:
                                </span>
                                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                    {(selectedEmployeeDetail.workEfficiency || 0).toFixed(2)}%
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                                Danh sách công việc ({(selectedEmployeeDetail.reports || []).length})
                            </h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {(selectedEmployeeDetail.reports || []).length > 0 ? (
                                    (selectedEmployeeDetail.reports || []).map((report, idx) => (
                                        <div
                                            key={report.id}
                                            className="p-3 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
                                        >
                                            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                                {idx + 1}. {report.taskDescription}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                {dayjs(report.startDateTime).format('HH:mm')} →{' '}
                                                {dayjs(report.endDateTime).format('HH:mm')}
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <Button
                                                    size="small"
                                                    onClick={() =>
                                                        handleEdit({
                                                            ...report,
                                                            employeeId:
                                                                selectedEmployeeDetail.employeeId ||
                                                                selectedEmployeeDetail.id,
                                                        })
                                                    }
                                                    icon={<EditOutlined />}
                                                    className="flex-1 text-xs"
                                                >
                                                    Sửa
                                                </Button>
                                                <Popconfirm
                                                    title="Xóa"
                                                    description="Chắc chắn xóa?"
                                                    onConfirm={() => handleDelete(report)}
                                                    okText="Xóa"
                                                    cancelText="Hủy"
                                                >
                                                    <Button
                                                        size="small"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        className="flex-1 text-xs"
                                                    >
                                                        Xóa
                                                    </Button>
                                                </Popconfirm>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                                        Không có công việc
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </Spin>
    );
};

export default WorkReportPage;

const MobileAdminList = ({ reports, onSelectEmployee }) => (
    <div className="space-y-4 px-4 py-6">
        {reports && reports.filter((emp) => emp.reports && emp.reports.length > 0).length > 0 ? (
            reports
                .filter((emp) => emp.reports && emp.reports.length > 0)
                .map((emp, empIdx) => (
                    <div
                        key={`emp-${emp.id || empIdx}`}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-slate-800"
                        onClick={() => onSelectEmployee && onSelectEmployee(emp)}
                    >
                        <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
                            <div className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                                {emp.employeeName || emp.name || `Nhân viên ${empIdx + 1}`}
                            </div>
                            <div className="text-xs text-blue-700 dark:text-blue-300">
                                {emp.employeeCode || emp.code || '—'}
                            </div>
                        </div>
                    </div>
                ))
        ) : (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Không có nhân viên nào báo cáo trong ngày.</p>
            </div>
        )}
    </div>
);
