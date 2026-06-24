import { Tag } from 'antd';

const HTMP_PLAN_STATUSES_STORAGE_KEY = 'htmpPlanStatuses';

function getCachedHtmpStatusMap() {
    try {
        const raw = localStorage.getItem(HTMP_PLAN_STATUSES_STORAGE_KEY);
        const statuses = raw ? JSON.parse(raw) : [];

        if (!Array.isArray(statuses)) {
            return new Map();
        }

        return new Map(
            statuses
                .filter((item) => item?.code)
                .map((item) => [item.code, { description: item.description, color: item.color }]),
        );
    } catch {
        return new Map();
    }
}

function getHtmpStatusMeta(status) {
    const statusMap = getCachedHtmpStatusMap();
    const statusMeta = statusMap.get(status);

    if (statusMeta) {
        return {
            label: statusMeta.description || status,
            color: statusMeta.color || 'default',
        };
    }

    const fallback = {
        PLANNED: { label: 'Đã lên kế hoạch', color: '#64748b' },
        RUNNING: { label: 'Đang chạy', color: '#2563eb' },
        DELAYED: { label: 'Trễ kế hoạch', color: '#ea580c' },
        COMPLETED: { label: 'Hoàn thành', color: '#16a34a' },
        WAITTINGAPPROVALCHEKER: { label: 'Chờ quản lý NMD kiểm tra', color: '#0f766e' },
        WAITTINGAPPROVALHEADNMD: { label: 'Chờ trưởng phòng NMD duyệt', color: '#7c3aed' },
        WAITTINGAPPROVALRESIN: { label: 'Chờ PC duyệt nhựa', color: '#9333ea' },
        WAITTINGAPPROVALPLAN: { label: 'Chờ PC duyệt kế hoạch', color: '#c026d3' },
        WAITTINGAPPROVALTECHNICAL: { label: 'Chờ phòng kỹ thuật duyệt', color: '#0284c7' },
        WAITINGQCCHECK: { label: 'Chờ QC đánh giá', color: '#0284c7' },
        WAITTINGFARESULT: { label: 'Chờ kết quả FA', color: '#d97706' },
        WAITTINGAPPROVALRESULT: { label: 'Chờ duyệt kết quả kế hoạch', color: '#e11d48' },
        REJECTED: { label: 'Từ chối', color: 'red' },
        CANCELLED: { label: 'Đã hủy', color: 'default' },
        CANCELED: { label: 'Đã hủy', color: 'default' },
        WAITTINGAPPROVALHEAD: { label: 'Chờ Trưởng/Phó phòng duyệt', color: 'orange' },
    };

    return fallback[status] || { label: status || 'Chưa có', color: 'default' };
}

export function renderResultTag(status) {
    switch (status) {
        case 'OK':
            return <Tag color="green">OK</Tag>;
        case 'NG':
            return <Tag color="red">NG</Tag>;
        case 'NGA':
            return <Tag color="orange">NGA</Tag>;
        default:
            return <Tag color="default">Chưa có</Tag>;
    }
}

export function renderHtmpStatus(status) {
    const { label, color } = getHtmpStatusMeta(status);
    return <Tag color={color}>{label}</Tag>;
}

export function renderApprovedStatusText(status) {
    const { label } = getHtmpStatusMeta(status);
    return <p>{label}</p>;
}

export function renderAssetAssignmentStatusTag(status) {
    switch (status) {
        case 'AVAILABLE':
            return <Tag color="green">Có sẵn</Tag>;
        case 'IN_USE':
            return <Tag color="blue">Đang sử dụng</Tag>;
        case 'MAINTENANCE':
            return <Tag color="yellow">Đang bảo trì</Tag>;
        case 'BROKEN':
            return <Tag color="red">Hỏng</Tag>;
        case 'LOST':
            return <Tag color="orange">Mất</Tag>;
        default:
            return <Tag color="default">Chưa có</Tag>;
    }
}

export function renderApprovedStatusTag(status) {
    const { label, color } = getHtmpStatusMeta(status);
    return <Tag color={color}>{label}</Tag>;
}

export const renderNmdStatusTag = (product) => {
    if (product?.nmdInfoStatus === 'RETURNED') {
        return <Tag color="red">NMD yêu cầu bổ sung thông tin</Tag>;
    }

    if (product?.nmdInfoStatus === 'RECEIVED') {
        return <Tag color="green">NMD đã nhận thông tin</Tag>;
    }

    return <Tag>NMD chưa xác nhận</Tag>;
};
