import { Tag } from 'antd';

const PROGRESS_STATUS_MAP = {
    CREATION: { text: 'Khởi tạo thông tin sản phẩm', color: '#1668DC' },
    MOLDTRIALPLANNING: { text: 'Lên kế hoạch thử khuôn', color: '#2B4ACB' },
    EVENTPLANNING: { text: 'Lên kế hoạch chạy event', color: '#3AA0FF' },

    MOLDTRIALRUNNING: { text: 'Đang thử khuôn', color: '#009688' },
    EVENTRUNNING: { text: 'Đang chạy event', color: '#13C2C2' },

    MOLDTRIALPENDINGQC: { text: 'Chờ QC đánh giá thử khuôn', color: '#FA8C16' },
    MOLDTRIALPENDINGKH: { text: 'Chờ khách hàng đánh giá thử khuôn', color: '#FFC53D' },
    EVENTPENDINGQC: { text: 'Chờ QC đánh giá event', color: '#FADB14' },

    MOLDTRIALCOMPLETE: { text: 'Hoàn thành thử khuôn', color: '#52C41A' },
    EVENTCOMPLETE: { text: 'Hoàn thành event', color: '#9FDB1D' },
    APPROVEMPCOMPLETE: { text: 'Hoàn thành phê duyệt MP', color: '#389E0D' },

    MOLDTRIALFAILEDQC: { text: 'Thử khuôn không đạt', color: '#FF4D4F' },
    EVENTFAILEDQC: { text: 'Event không đạt', color: '#A8071A' },
    APPROVEMPFAILED: { text: 'Phê duyệt MP không đạt', color: '#E84749' },

    APPROVEMP: { text: 'Phê duyệt MP', color: '#722ED1' },
};

const renderProgressStatus = (statusKey) => {
    if (!statusKey) {
        return <Tag color="default">Chưa có trạng thái</Tag>;
    }

    const statusInfo = PROGRESS_STATUS_MAP[statusKey];

    if (!statusInfo) {
        return <Tag color="gray">{statusKey}</Tag>;
    }

    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
};

export default renderProgressStatus;
