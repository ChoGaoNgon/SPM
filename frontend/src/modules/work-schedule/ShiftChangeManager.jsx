import React, { useEffect, useState, useCallback } from "react";
import { Table, Button, Space, message, Card, Tag, Modal, Input, DatePicker, Tabs, Spin } from "antd";
import shiftChangeService from "~/modules/work-schedule/services/shiftChangeService";
import authService from "~/modules/auth/services/authService";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import ShiftChangeRequestModal from "./components/modal/ShiftChangeRequestModal";

const { confirm } = Modal;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const ShiftChangeManager = () => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [historyRequests, setHistoryRequests] = useState([]);
    const [loadingPending, setLoadingPending] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [dateRange, setDateRange] = useState([dayjs().startOf("month"), dayjs().endOf("day")]);
    const [requestHistoryByCreator, setRequestHistoryByCreator] = useState([]);
    const [shiftChangeModalVisible, setShiftChangeModalVisible] = useState(false);
    const [shiftChangeModalType, setShiftChangeModalType] = useState("DEFAULT");


    const fetchPendingRequests = useCallback(async () => {
        try {
            setLoadingPending(true);
            const approverId = authService.getEmployeeId();
            const res = await shiftChangeService.getPendingRequests(approverId);

            const formatted = res.map((r) => ({
                key: r.id,
                id: r.id,
                msnv: r.employee?.code,
                name: r.employee?.name,
                department: r.employee?.departmentName,
                date: r.workDate,
                currentShift: r.currentShift?.shiftCode,
                requestedShift: r.requestedShift?.shiftCode,
                reason: r.reason,
                status: r.status,
            }));

            setPendingRequests(formatted);
        } catch (error) {
            message.error("Không thể tải danh sách đơn chờ duyệt: " + error.message);
        } finally {
            setLoadingPending(false);
        }
    }, []);

    const fetchHistoryRequests = useCallback(async () => {
        try {
            setLoadingHistory(true);
            const approverId = authService.getEmployeeId();
            const startDate = dateRange[0].format("YYYY-MM-DD");
            const endDate = dateRange[1].format("YYYY-MM-DD");

            const res = await shiftChangeService.getShiftChangeProcessedRequests(approverId, startDate, endDate);

            const formatted = res.map((r) => ({
                key: r.id,
                id: r.id,
                msnv: r.employee?.code,
                name: r.employee?.name,
                department: r.employee?.departmentName,
                date: r.workDate,
                currentShift: r.currentShift?.shiftCode,
                requestedShift: r.requestedShift?.shiftCode,
                reason: r.reason,
                status: r.status,
            }));

            setHistoryRequests(formatted);
        } catch (error) {
            message.error("Không thể tải lịch sử đơn đã xử lý: " + error.message);
        } finally {
            setLoadingHistory(false);
        }
    }, [dateRange]);

    const fetchRequestHistoryByCreator = useCallback(async () => {
        try {
            setLoadingPending(true);
            const approverId = authService.getEmployeeId();
            const res = await shiftChangeService.getShiftChangeRequestHistoryByCreator(approverId);

            const formatted = res.map((r) => ({
                key: r.id,
                id: r.id,
                msnv: r.employee?.code,
                name: r.employee?.name,
                department: r.employee?.departmentName,
                date: r.workDate,
                currentShift: r.currentShift?.shiftCode,
                requestedShift: r.requestedShift?.shiftCode,
                reason: r.reason,
                status: r.status,
            }));

            setRequestHistoryByCreator(formatted);
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoadingPending(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingRequests();
        fetchHistoryRequests();
        fetchRequestHistoryByCreator();
    }, [fetchPendingRequests, fetchHistoryRequests]);

    const handleAction = (record, action) => {
        confirm({
            title: action === "APPROVED" ? "Xác nhận duyệt đơn đổi ca này?" : "Xác nhận từ chối đơn đổi ca này?",
            icon: <ExclamationCircleOutlined />,
            content: (
                <>
                    <p>Nhân viên: <b>{record.name}</b></p>
                    <p>Ngày: <b>{record.date}</b> — Ca hiện tại: <b>{record.currentShift}</b> → Ca yêu cầu: <b>{record.requestedShift}</b></p>
                    <TextArea rows={3} placeholder="Nhập ghi chú (không bắt buộc)" id="approval-comment" />
                </>
            ),
            okText: action === "APPROVED" ? "Duyệt" : "Từ chối",
            okType: action === "APPROVED" ? "primary" : "danger",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    const approverId = authService.getEmployeeId();
                    const comment = document.getElementById("approval-comment")?.value || "";

                    await shiftChangeService.approveRequest({ requestId: record.id, approverId, action, comment });
                    message.success(action === "APPROVED" ? "Đã duyệt yêu cầu đổi ca" : "Đã từ chối yêu cầu đổi ca");

                    fetchPendingRequests();
                    fetchHistoryRequests();
                } catch (error) {
                    message.error(error.message);
                }
            },
        });
    };

    const pendingColumns = [
        { title: "STT", key: "stt", align: "center", render: (text, record, index) => index + 1 },
        { title: "MSNV", dataIndex: "msnv", key: "msnv" },
        { title: "Họ và Tên", dataIndex: "name", key: "name" },
        { title: "Phòng ban", dataIndex: "department", key: "department" },
        { title: "Ngày", dataIndex: "date", key: "date" },
        { title: "Ca hiện tại", dataIndex: "currentShift", key: "currentShift", align: "center" },
        { title: "Ca yêu cầu", dataIndex: "requestedShift", key: "requestedShift", align: "center" },
        { title: "Lý do", dataIndex: "reason", key: "reason" },
        {
            title: "Trạng thái", dataIndex: "status", key: "status", align: "center",
            render: (status) => {
                if (status === "ASSIGN_DIRECT") return <Tag color="purple">Chỉ định</Tag>;
                if (status === "PENDING_MANAGER") return <Tag color="yellow">Chờ quản lý duyệt</Tag>;
                if (status === "PENDING_HEAD") return <Tag color="blue">Chờ trưởng phòng duyệt</Tag>;
                if (status === "APPROVED") return <Tag color="green">Đã duyệt</Tag>;
                if (status === "REJECTED") return <Tag color="red">Từ chối</Tag>;
                return status;
            },
        },
        {
            title: "Hành động", key: "action", align: "center",
            render: (_, record) => (
                <Space>
                    <Button type="primary" size="small" disabled={!record.status?.startsWith("PENDING")} onClick={() => handleAction(record, "APPROVED")}>Duyệt</Button>
                    <Button danger size="small" disabled={!record.status?.startsWith("PENDING")} onClick={() => handleAction(record, "REJECTED")}>Từ chối</Button>
                </Space>
            ),
        },
    ];

    const historyColumns = [
        { title: "STT", key: "stt", align: "center", render: (text, record, index) => index + 1 },
        { title: "MSNV", dataIndex: "msnv", key: "msnv" },
        { title: "Họ và Tên", dataIndex: "name", key: "name" },
        { title: "Phòng ban", dataIndex: "department", key: "department" },
        { title: "Ngày", dataIndex: "date", key: "date" },
        { title: "Ca hiện tại", dataIndex: "currentShift", key: "currentShift", align: "center" },
        { title: "Ca yêu cầu", dataIndex: "requestedShift", key: "requestedShift", align: "center" },
        { title: "Lý do", dataIndex: "reason", key: "reason" },
        {
            title: "Trạng thái", dataIndex: "status", key: "status", align: "center",
            render: (status) => {
                if (status === "ASSIGN_DIRECT") return <Tag color="purple">Chỉ định</Tag>;
                if (status === "APPROVED") return <Tag color="green">Đã duyệt</Tag>;
                if (status === "REJECTED") return <Tag color="red">Từ chối</Tag>;
                return status;
            },
        },
    ];

    return (
        <>
            <Tabs defaultActiveKey="1" type="card">
                <Tabs.TabPane tab="Đơn đang chờ duyệt" key="1">
                    {loadingPending ? (
                        <div style={{ textAlign: "center", padding: 50 }}><Spin size="large" /></div>
                    ) : (
                        <Table columns={pendingColumns} dataSource={pendingRequests} pagination={false} bordered size="middle" />
                    )}
                </Tabs.TabPane>

                <Tabs.TabPane tab="Lịch sử đơn đã xử lý" key="2">
                    <div style={{ marginBottom: 16, display: "flex", alignItems: "center" }}>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates)}
                            format="DD-MM-YYYY"
                            style={{ marginRight: 8 }}
                        />
                    </div>
                    {loadingHistory ? (
                        <div style={{ textAlign: "center", padding: 50 }}><Spin size="large" /></div>
                    ) : (
                        <Table columns={historyColumns} dataSource={historyRequests} pagination={false} bordered size="middle" />
                    )}
                </Tabs.TabPane>

                <Tabs.TabPane tab="Chỉ định đổi ca" key="3">
                    <Space style={{ marginBottom: 16 }}>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates)}
                            format="DD-MM-YYYY"
                            style={{ marginRight: 8 }}
                        />
                        <Button type="primary" onClick={() => {
                            setShiftChangeModalType("DIRECT_ASSIGN");
                            setShiftChangeModalVisible(true);
                        }}>Chỉ định đổi ca</Button>
                        <Button type="primary" onClick={() => {
                            setShiftChangeModalType("DEFAULT");
                            setShiftChangeModalVisible(true);
                        }}>Đổi ca mặc định</Button>
                    </Space>
                    {loadingHistory ? (
                        <div style={{ textAlign: "center", padding: 50 }}><Spin size="large" /></div>
                    ) : (
                        <Table columns={historyColumns} dataSource={requestHistoryByCreator} pagination={false} bordered size="middle" />
                    )}
                </Tabs.TabPane>
            </Tabs>

            <ShiftChangeRequestModal
                visible={shiftChangeModalVisible}
                onClose={() => setShiftChangeModalVisible(false)}
                onSuccess={() => fetchRequestHistoryByCreator()}
                type={shiftChangeModalType}
            />

        </>
    );
};

export default ShiftChangeManager;
