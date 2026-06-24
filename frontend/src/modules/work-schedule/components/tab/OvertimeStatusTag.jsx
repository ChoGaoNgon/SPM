import React from "react";
import { Tag } from "antd";

const STATUS_MAP = {
    APPROVED: { color: "green", text: "Đã duyệt" },
    REJECTED: { color: "red", text: "Từ chối" },
    ASSIGN_DIRECT: { color: "purple", text: "Chỉ định" },
    PENDING_MANAGER: { color: "yellow", text: "Chờ quản lý duyệt" },
    PENDING_HEAD: { color: "blue", text: "Chờ trưởng phòng duyệt" },
    ASSIGN_EMPLOYEE: { color: "grey", text: "Chờ phản hồi nhân viên" },
    APPROVED_BY_EMPLOYEE: { color: "green", text: "Đồng ý" },
    REJECTED_BY_EMPLOYEE: { color: "red", text: "Từ chối" },
};

const OvertimeStatusTag = ({ status }) => {
    const tag = STATUS_MAP[status];
    if (!tag) return status ? <Tag>{status}</Tag> : null;
    return <Tag color={tag.color}>{tag.text}</Tag>;
};

export default OvertimeStatusTag;
