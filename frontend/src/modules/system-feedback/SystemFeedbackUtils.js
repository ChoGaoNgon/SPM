import { Tag } from 'antd';

export function getSystemFeedbackStatusMeta(status) {
    switch (status) {
        case 'PENDING':
            return { label: 'Chờ xử lý', shortLabel: 'Chờ', className: 'bg-blue-100 text-blue-700 border-blue-300' };
        case 'IN_PROGRESS':
            return {
                label: 'Đang xử lý',
                shortLabel: 'Đang',
                className: 'bg-orange-100 text-orange-700 border-orange-300',
            };
        case 'DONE':
            return {
                label: 'Hoàn thành',
                shortLabel: 'Xong',
                className: 'bg-green-100 text-green-700 border-green-300',
            };
        case 'REJECTED':
            return { label: 'Từ chối', shortLabel: 'Từ chối', className: 'bg-red-100 text-red-700 border-red-300' };
        default:
            return {
                label: 'Chưa có',
                shortLabel: 'Chưa có',
                className: 'bg-slate-100 text-slate-600 border-slate-300',
            };
    }
}

export function renderStatusTag(status) {
    const meta = getSystemFeedbackStatusMeta(status);

    return (
        <Tag className={`${meta.className} font-medium px-2 py-0.5`} bordered={false}>
            {meta.label}
        </Tag>
    );
}

export function getSystemFeedbackPriorityMeta(priority) {
    switch (priority) {
        case 'LOW':
            return { label: 'Thấp', className: 'bg-green-100 text-green-700 border-green-300' };
        case 'MEDIUM':
            return { label: 'Trung bình', className: 'bg-orange-100 text-orange-700 border-orange-300' };
        case 'HIGH':
            return { label: 'Cao', className: 'bg-red-100 text-red-700 border-red-300' };
        default:
            return { label: 'Chưa đánh giá', className: 'bg-slate-100 text-slate-600 border-slate-300' };
    }
}

export function renderPriorityTag(priority) {
    const meta = getSystemFeedbackPriorityMeta(priority);

    return (
        <Tag className={`${meta.className} font-medium px-2 py-0.5`} bordered={false}>
            {meta.label}
        </Tag>
    );
}

export function formatSystemFeedbackDateTime(value) {
    if (!value) {
        return 'Chưa có';
    }

    return new Date(value).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function renderSystemType(type) {
    switch (type) {
        case 'IMPROVEMENT':
            return <Tag color="green">Cải tiến</Tag>;
        case 'BUG':
            return <Tag color="red">Lỗi</Tag>;
        case 'REQUEST':
            return <Tag color="orange">Yêu cầu</Tag>;
        case 'OTHER':
            return <Tag color="blue">Khác</Tag>;
        default:
            return <Tag color="default">Chưa có</Tag>;
    }
}

export const systemFeedbackType = [
    { value: 'IMPROVEMENT', label: <Tag color="green">Cải tiến</Tag> },
    { value: 'BUG', label: <Tag color="red">Lỗi</Tag> },
    { value: 'REQUEST', label: <Tag color="orange">Yêu cầu</Tag> },
    { value: 'OTHER', label: <Tag color="blue">Khác</Tag> },
];

export const systemModules = [
    { value: 'Tổng quan', label: 'Tổng quan' },
    { value: 'Quản lý nhân viên', label: 'Quản lý nhân viên' },
    { value: 'Quản lý chức vụ', label: 'Quản lý chức vụ' },
    { value: 'Quản lý phòng ban', label: 'Quản lý phòng ban' },
    { value: 'Chấm công', label: 'Chấm công' },
    { value: 'Lịch làm việc', label: 'Lịch làm việc' },
    { value: 'Báo cáo công việc', label: 'Báo cáo công việc' },
    { value: 'Đơn hàng', label: 'Đơn hàng' },
    { value: 'Quản lý New-model', label: 'Quản lý New-model' },
    { value: 'Quản lý khuôn', label: 'Quản lý khuôn' },
    { value: 'Khách hàng', label: 'Khách hàng' },
    { value: 'Phân quyền', label: 'Phân quyền' },
    { value: 'Thông báo', label: 'Thông báo' },
    { value: 'Góp ý hệ thống', label: 'Góp ý hệ thống' },
    { value: 'Hệ thống 2', label: 'Hệ thống 2' },
    { value: 'Khác', label: 'Khác' },
];
