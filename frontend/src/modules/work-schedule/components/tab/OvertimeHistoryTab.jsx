import React from "react";
import { DatePicker, Table, Tag } from "antd";
import dayjs from "dayjs";
import OvertimeStatusTag from "./OvertimeStatusTag";

const { RangePicker } = DatePicker;

const columns = [
    { title: "STT", key: "stt", align: "center", render: (_, __, index) => index + 1 },
    { title: "MSNV", dataIndex: "msnv", key: "msnv" },
    { title: "Họ và Tên", dataIndex: "name", key: "name" },
    { title: "Phòng ban", dataIndex: "department", key: "department" },
    { title: "Ngày", dataIndex: "workDate", key: "workDate" },
    {
        title: "Từ",
        dataIndex: "startTime",
        key: "startTime",
        align: "center",
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
        render: (value) => (
            <div>
                <Tag color="blue">{dayjs(value).format("HH:mm")}</Tag>
                <Tag color="default">{dayjs(value).format("DD/MM/YYYY")}</Tag>
            </div>
        ),
    },
    { title: "Lý do", dataIndex: "reason", key: "reason" },
    {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        align: "center",
        render: (status) => <OvertimeStatusTag status={status} />,
    },
];

const OvertimeHistoryTab = ({ dateRange, onDateRangeChange, dataSource, loading }) => (
    <>
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center" }}>
            <RangePicker
                value={dateRange}
                onChange={onDateRangeChange}
                format="DD-MM-YYYY"
                style={{ marginRight: 8 }}
            />
        </div>
        <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            bordered
            loading={loading}
            size="middle"
        />
    </>
);

export default OvertimeHistoryTab;
