import React, { useMemo } from "react";
import { Table, Button, Space, Tag } from "antd";
import dayjs from "dayjs";
import OvertimeStatusTag from "./OvertimeStatusTag";

const OvertimePendingTab = ({
    dataSource,
    loading,
    selectedRowKeys,
    onSelectionChange,
    onBatchApprove,
    onBatchReject,
    onClearSelection,
    onAction,
}) => {
    const departmentFilters = useMemo(() => {
        return Array.from(new Set(dataSource.map((item) => item.department))).map((dept) => ({
            text: dept,
            value: dept,
        }));
    }, [dataSource]);

    const columns = useMemo(() => ([
        {
            title: "STT",
            key: "stt",
            align: "center",
            width: 60,
            fixed: "left",
            render: (_, __, index) => index + 1,
        },
        { title: "MSNV", dataIndex: "msnv", key: "msnv", width: 100, align: "center", fixed: "left" },
        { title: "Họ và Tên", dataIndex: "name", key: "name", width: 200, fixed: "left" },
        {
            title: "Phòng ban",
            dataIndex: "department",
            key: "department",
            width: 150,
            filters: departmentFilters,
            onFilter: (value, record) => record.department === value,
        },
        { title: "Ngày", dataIndex: "workDate", key: "workDate", width: 120, align: "center" },
        {
            title: "Từ",
            dataIndex: "startTime",
            key: "startTime",
            align: "center",
            width: 200,
            render: (value) => (
                <div>
                    <Tag color="blue">{dayjs(value).format("HH:mm")}</Tag>
                    <Tag color="default">{dayjs(value).format("DD/MM/YYYY")}</Tag>
                </div>
            ),
        },
        {
            title: "Đến",
            dataIndex: "endTime",
            key: "endTime",
            align: "center",
            width: 200,
            render: (value) => (
                <div>
                    <Tag color="blue">{dayjs(value).format("HH:mm")}</Tag>
                    <Tag color="default">{dayjs(value).format("DD/MM/YYYY")}</Tag>
                </div>
            ),
        },
        { title: "Lý do", dataIndex: "reason", key: "reason", width: 400 },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            align: "center",
            width: 150,
            filters: [
                { text: "Chỉ định", value: "ASSIGN_DIRECT" },
                { text: "Chờ quản lý duyệt", value: "PENDING_MANAGER" },
                { text: "Chờ trưởng phòng duyệt", value: "PENDING_HEAD" },
                { text: "Đã duyệt", value: "APPROVED" },
                { text: "Từ chối", value: "REJECTED" },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => <OvertimeStatusTag status={status} />,
        },
        {
            title: "Hành động",
            key: "action",
            align: "center",
            width: 150,
            fixed: "right",
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        disabled={!record.status?.startsWith("PENDING")}
                        onClick={() => onAction(record, "APPROVED")}
                    >
                        Duyệt
                    </Button>
                    <Button
                        danger
                        size="small"
                        disabled={!record.status?.startsWith("PENDING")}
                        onClick={() => onAction(record, "REJECTED")}
                    >
                        Từ chối
                    </Button>
                </Space>
            ),
        },
    ]), [departmentFilters, onAction]);

    return (
        <>
            {selectedRowKeys.length > 0 && (
                <Space style={{ marginBottom: 16 }}>
                    <span>Đã chọn {selectedRowKeys.length} đơn</span>
                    <Button type="primary" size="small" onClick={onBatchApprove}>
                        Duyệt hàng loạt
                    </Button>
                    <Button danger size="small" onClick={onBatchReject}>
                        Từ chối hàng loạt
                    </Button>
                    <Button size="small" onClick={onClearSelection}>
                        Bỏ chọn
                    </Button>
                </Space>
            )}

            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                bordered
                loading={loading}
                size="middle"
                scroll={{ x: "max-content", y: "calc(100vh - 336px)" }}
                rowSelection={{
                    selectedRowKeys,
                    onChange: onSelectionChange,
                    getCheckboxProps: (record) => ({
                        disabled: !record.status?.startsWith("PENDING"),
                    }),
                }}
            />
        </>
    );
};

export default OvertimePendingTab;
