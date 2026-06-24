import { DatePicker, message, Select } from 'antd';
import dayjs from 'dayjs';
import { Bell, Laptop, RefreshCw, Tag as TagIcon, User, Wrench } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '~/modules/notification/services/notificationService';

const getTagColor = (type) => {
    if (!type) return 'bg-gray-200 text-gray-800 border-gray-300';
    switch (type.toUpperCase()) {
        case 'NEW_MODEL':
            return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'IT':
            return 'bg-green-50 text-green-700 border-green-200';
        case 'HCNS':
            return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'SHIFT_CHANGE':
            return 'bg-purple-50 text-purple-700 border-purple-200';
        default:
            return 'bg-gray-50 text-gray-700 border-gray-200';
    }
};

const getTagIcon = (type) => {
    switch ((type || '').toUpperCase()) {
        case 'NEW_MODEL':
            return <Wrench size={16} className="inline mr-1 text-blue-500" />;
        case 'IT':
            return <Laptop size={16} className="inline mr-1 text-green-500" />;
        case 'HCNS':
            return <User size={16} className="inline mr-1 text-orange-500" />;
        case 'SHIFT_CHANGE':
            return <RefreshCw size={16} className="inline mr-1 text-purple-500" />;
        default:
            return <TagIcon size={16} className="inline mr-1 text-gray-400" />;
    }
};

export default function NotificationPage() {
    const [notificationsByDate, setNotificationsByDate] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTag, setSelectedTag] = useState('all');
    const navigate = useNavigate();

    const fetchAllNotification = async () => {
        try {
            const data = await notificationService.getAllNotification();
            if (!data || !Array.isArray(data)) return;

            const grouped = data.reduce((acc, item) => {
                const date = dayjs(item.createdAt).format('YYYY-MM-DD');
                if (!acc[date]) acc[date] = [];
                acc[date].push(item);
                return acc;
            }, {});
            setNotificationsByDate(grouped);
        } catch (error) {
            message.error(error);
        }
    };

    useEffect(() => {
        fetchAllNotification();
    }, []);

    const allTags = useMemo(() => {
        const tags = new Set();
        Object.values(notificationsByDate)
            .flat()
            .forEach((n) => tags.add(n.type));
        return Array.from(tags);
    }, [notificationsByDate]);

    const filteredNotifications = useMemo(() => {
        let filtered = { ...notificationsByDate };
        if (selectedDate) {
            const dateKey = dayjs(selectedDate).format('YYYY-MM-DD');
            filtered = { [dateKey]: filtered[dateKey] || [] };
        }
        if (selectedTag !== 'all') {
            Object.keys(filtered).forEach((date) => {
                filtered[date] = filtered[date].filter((n) => n.type === selectedTag);
                if (filtered[date].length === 0) delete filtered[date];
            });
        }
        return filtered;
    }, [notificationsByDate, selectedDate, selectedTag]);

    const handleNotiClick = async (notificationId, url) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotificationsByDate((prev) => {
                const newState = { ...prev };
                Object.keys(newState).forEach((date) => {
                    newState[date] = newState[date].map((n) =>
                        n.notificationId === notificationId ? { ...n, isRead: true } : n,
                    );
                });
                return newState;
            });
            navigate(`${url}`, { replace: true });
        } catch (error) {
            message.error(error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotificationsByDate((prev) => {
                const newState = { ...prev };
                Object.keys(newState).forEach((date) => {
                    newState[date] = newState[date].map((n) => ({ ...n, isRead: true }));
                });
                return newState;
            });
        } catch (error) {
            message.error(error);
        }
    };

    const unreadCount = useMemo(() => {
        let count = 0;
        Object.values(notificationsByDate).forEach((arr) => {
            arr.forEach((n) => {
                if (!n.isRead) count++;
            });
        });
        return count;
    }, [notificationsByDate]);

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Bell size={28} className="text-blue-500" />
                    <h1 className="text-2xl font-bold text-gray-800">Thông báo</h1>
                    {unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500 text-white animate-bounce">
                            {unreadCount} mới
                        </span>
                    )}
                </div>
                <button
                    onClick={handleMarkAllAsRead}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors text-sm font-semibold"
                >
                    Đánh dấu tất cả đã đọc
                </button>
            </div>

            <div className="flex flex-wrap gap-2 items-center mb-4">
                <DatePicker
                    allowClear
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày"
                    value={selectedDate ? dayjs(selectedDate) : null}
                    onChange={(date) => setSelectedDate(date ? date.toDate() : null)}
                    className="!rounded !px-2"
                    style={{ minWidth: 140 }}
                />
                <Select value={selectedTag} onChange={setSelectedTag} style={{ minWidth: 140 }} className="!rounded">
                    <Select.Option value="all">Tất cả loại</Select.Option>
                    {allTags.map((tag) => (
                        <Select.Option key={tag} value={tag}>
                            {tag}
                        </Select.Option>
                    ))}
                </Select>
                <button
                    onClick={() => {
                        setSelectedDate(null);
                        setSelectedTag('all');
                    }}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                    Đặt lại
                </button>
            </div>

            {Object.keys(filteredNotifications).length === 0 && <p className="text-gray-500">Chưa có thông báo nào.</p>}

            {Object.keys(filteredNotifications)
                .sort((a, b) => dayjs(b).unix() - dayjs(a).unix())
                .map((date) => (
                    <div key={date} className="space-y-2">
                        <h2 className="text-sm font-semibold text-gray-500 border-b border-gray-200 pb-1 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                            {dayjs(date).format('DD/MM/YYYY')}
                        </h2>

                        <div className="space-y-3">
                            {filteredNotifications[date].map((item) => (
                                <div
                                    key={item.notificationId}
                                    onClick={() => handleNotiClick(item.notificationId, item.url)}
                                    className={`relative cursor-pointer p-4 border rounded-xl shadow-sm hover:shadow-lg transition-all bg-white dark:bg-gray-800 flex items-start gap-3 ${item.isRead ? 'border-gray-200 opacity-70' : 'border-blue-300'}`}
                                    style={{ boxShadow: item.isRead ? 'none' : '0 2px 12px 0 rgba(59,130,246,0.08)' }}
                                >
                                    <div className="flex-shrink-0 mt-1">{getTagIcon(item.type)}</div>
                                    <div className="flex flex-col gap-1 w-full">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getTagColor(item.type)}`}
                                            >
                                                {item.type}
                                            </span>
                                            <span
                                                className={`font-medium ${item.isRead ? 'text-gray-500' : 'text-gray-900'}`}
                                            >
                                                {item.title}
                                            </span>
                                        </div>
                                        {item.message && (
                                            <p
                                                className={`text-sm ${item.isRead ? 'text-gray-400' : 'text-gray-700'} line-clamp-2`}
                                            >
                                                <span dangerouslySetInnerHTML={{ __html: item.message }} />
                                            </p>
                                        )}
                                        <span className={`text-xs ${item.isRead ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {item.departmentName} - {dayjs(item.createdAt).format('HH:mm, DD/MM/YYYY')}
                                        </span>
                                    </div>
                                    {!item.isRead && (
                                        <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
        </div>
    );
}
