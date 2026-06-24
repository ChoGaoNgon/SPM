import { ExclamationCircleOutlined, FileExcelOutlined } from '@ant-design/icons';
import { message, Modal } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import authService from '~/modules/auth/services/authService';
import OvertimePlanningModal from './components/modal/OvertimePlanningModal';
import OvertimeRequestModal from './components/modal/OvertimeRequestModal';
import OvertimeAssignHistoryTab from './components/tab/OvertimeAssignHistoryTab';
import OvertimeHistoryTab from './components/tab/OvertimeHistoryTab';
import OvertimePendingTab from './components/tab/OvertimePendingTab';
import overtimeService from './services/overtimeService';

const { confirm } = Modal;
const OvertimeManager = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [requestHistoryByCreator, setRequestHistoryByCreator] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [historyRequests, setHistoryRequests] = useState([]);
    const [loadingAssignHistory, setLoadingAssignHistory] = useState(false);
    const [loadingPending, setLoadingPending] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('day')]);
    const [typeOvertime, setTypeOvertime] = useState('ASSIGN');
    const [overtimePlanningModalVisible, setOvertimePlanningModalVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [activeTab, setActiveTabState] = useState(searchParams.get('tab') || 'assign_history');

    const [overtimeModalVisible, setOvertimeModalVisible] = useState(false);

    const setActiveTab = (tabKey) => {
        setActiveTabState(tabKey);
        setSearchParams({ tab: tabKey }, { replace: true });
    };

    const fetchRequestHistoryByCreator = useCallback(async () => {
        try {
            setLoadingAssignHistory(true);
            const approverId = authService.getEmployeeId();
            const res = await overtimeService.getOvertimeRequestHistoryByCreator(approverId);

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

            setRequestHistoryByCreator(formatted);
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoadingAssignHistory(false);
        }
    }, []);

    const fetchPendingRequests = useCallback(async () => {
        try {
            setLoadingPending(true);
            const approverId = authService.getEmployeeId();
            const res = await overtimeService.getPendingRequests(approverId);

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

            setPendingRequests(formatted);
        } catch (error) {
            message.error('Không thể tải danh sách đơn chờ duyệt: ' + error.message);
        } finally {
            setLoadingPending(false);
        }
    }, []);

    const fetchHistoryRequests = useCallback(async () => {
        try {
            if (!dateRange || dateRange.length < 2) return;
            setLoadingHistory(true);
            const approverId = authService.getEmployeeId();
            const startDate = dateRange[0].format('YYYY-MM-DD');
            const endDate = dateRange[1].format('YYYY-MM-DD');

            const res = await overtimeService.getProcessedRequests(approverId, startDate, endDate);

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

            setHistoryRequests(formatted);
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoadingHistory(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchRequestHistoryByCreator();
    }, [fetchRequestHistoryByCreator]);

    useEffect(() => {
        if (activeTab === 'pending') {
            fetchPendingRequests();
        }
    }, [activeTab, fetchPendingRequests]);

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistoryRequests();
        }
    }, [activeTab, dateRange, fetchHistoryRequests]);

    const handleAction = async (record, action) => {
        try {
            const approverId = authService.getEmployeeId();

            await overtimeService.approveRequest({
                requestId: record.id,
                approverId,
                action,
                comment: '',
            });

            message.success(action === 'APPROVED' ? 'Đã duyệt' : 'Đã từ chối');

            fetchPendingRequests();
            fetchHistoryRequests();
        } catch (error) {
            message.error(error.message);
        }
    };

    const handleBatchAction = (action) => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn ít nhất một đơn để xử lý');
            return;
        }

        const actionText = action === 'APPROVED' ? 'duyệt' : 'từ chối';
        const selectedRecords = pendingRequests.filter((r) => selectedRowKeys.includes(r.key));
        const pendingOnly = selectedRecords.filter((r) => r.status?.startsWith('PENDING'));

        if (pendingOnly.length === 0) {
            message.warning('Không có đơn nào đang chờ duyệt trong danh sách đã chọn');
            return;
        }

        confirm({
            title: `Xác nhận ${actionText} ${pendingOnly.length} đơn?`,
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <p>
                        Bạn đang {actionText} {pendingOnly.length} đơn tăng ca:
                    </p>
                    <ul style={{ maxHeight: 200, overflowY: 'auto' }}>
                        {pendingOnly.map((r) => (
                            <li key={r.id}>
                                {r.name} - {dayjs(r.startTime).format('DD/MM/YYYY HH:mm')}
                            </li>
                        ))}
                    </ul>
                </div>
            ),
            okText: action === 'APPROVED' ? 'Duyệt tất cả' : 'Từ chối tất cả',
            okType: action === 'APPROVED' ? 'primary' : 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const approverId = authService.getEmployeeId();
                    let successCount = 0;
                    let failCount = 0;

                    for (const record of pendingOnly) {
                        try {
                            await overtimeService.approveRequest({
                                requestId: record.id,
                                approverId,
                                action,
                                comment: '',
                            });
                            successCount++;
                        } catch (error) {
                            failCount++;
                        }
                    }

                    if (successCount > 0) {
                        message.success(`Đã ${actionText} thành công ${successCount} đơn`);
                    }
                    if (failCount > 0) {
                        message.error(`Có ${failCount} đơn xử lý thất bại`);
                    }

                    setSelectedRowKeys([]);
                    fetchPendingRequests();
                    fetchHistoryRequests();
                } catch (error) {
                    message.error(error.message);
                }
            },
        });
    };

    const handleOpenOvertimeModal = () => {
        setOvertimeModalVisible(true);
    };

    const handleExportApprovedOvertime = async () => {
        try {
            if (!dateRange || dateRange.length < 2) {
                message.warning('Vui lòng chọn khoảng ngày hợp lệ để xuất');
                return;
            }
            const startDate = dateRange[0];
            const endDate = dateRange[1];

            await overtimeService.exportApprovedOvertime(startDate, endDate);
            message.success('Xuất Excel đơn đã duyệt thành công');
        } catch (error) {
            message.error(error.message);
        }
    };

    return (
        <div className="">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quản lý tăng ca</h1>

            <div className="flex flex-wrap gap-3 mb-4">
                <button
                    onClick={() => setOvertimePlanningModalVisible(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    Lập danh sách tăng ca
                </button>
                <button
                    onClick={() => {
                        setTypeOvertime('ASSIGN');
                        handleOpenOvertimeModal();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                    Phân công nhân viên
                </button>
                <button
                    onClick={() => {
                        setTypeOvertime('DIRECT_ASSIGN');
                        handleOpenOvertimeModal();
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                >
                    Chỉ định tăng ca
                </button>
                <button
                    onClick={handleExportApprovedOvertime}
                    className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 flex items-center gap-2 transition"
                >
                    <FileExcelOutlined /> Xuất Excel
                </button>
            </div>

            <div className="border-b border-gray-300">
                <nav className="flex space-x-6">
                    <button
                        className={`py-2 px-3 font-medium rounded-t-lg ${
                            activeTab === 'assign_history'
                                ? 'bg-white text-blue-600 shadow'
                                : 'text-gray-600 hover:text-blue-600'
                        }`}
                        onClick={() => setActiveTab('assign_history')}
                    >
                        Lịch sử phân công
                    </button>
                    <button
                        className={`py-2 px-3 font-medium rounded-t-lg ${
                            activeTab === 'pending'
                                ? 'bg-white text-blue-600 shadow'
                                : 'text-gray-600 hover:text-blue-600'
                        }`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Đơn đang chờ duyệt
                    </button>
                    <button
                        className={`py-2 px-3 font-medium rounded-t-lg ${
                            activeTab === 'history'
                                ? 'bg-white text-blue-600 shadow'
                                : 'text-gray-600 hover:text-blue-600'
                        }`}
                        onClick={() => setActiveTab('history')}
                    >
                        Lịch sử đã xử lý
                    </button>
                </nav>
            </div>

            <div className="bg-white p-4 rounded-b-lg shadow">
                {activeTab === 'assign_history' && (
                    <OvertimeAssignHistoryTab dataSource={requestHistoryByCreator} loading={loadingAssignHistory} />
                )}
                {activeTab === 'pending' && (
                    <OvertimePendingTab
                        dataSource={pendingRequests}
                        loading={loadingPending}
                        selectedRowKeys={selectedRowKeys}
                        onSelectionChange={setSelectedRowKeys}
                        onBatchApprove={() => handleBatchAction('APPROVED')}
                        onBatchReject={() => handleBatchAction('REJECTED')}
                        onClearSelection={() => setSelectedRowKeys([])}
                        onAction={handleAction}
                    />
                )}
                {activeTab === 'history' && (
                    <OvertimeHistoryTab
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                        dataSource={historyRequests}
                        loading={loadingHistory}
                    />
                )}
            </div>

            <OvertimeRequestModal
                visible={overtimeModalVisible}
                onClose={() => setOvertimeModalVisible(false)}
                type={typeOvertime}
                onSuccess={() => {
                    fetchPendingRequests();
                    fetchHistoryRequests();
                    fetchRequestHistoryByCreator();
                }}
            />
            <OvertimePlanningModal
                open={overtimePlanningModalVisible}
                onCancel={() => setOvertimePlanningModalVisible(false)}
            />
        </div>
    );
};

export default OvertimeManager;
