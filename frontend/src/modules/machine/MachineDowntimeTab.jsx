import {
    Alert,
    Button,
    Card,
    DatePicker,
    Empty,
    Select,
    Space,
    Statistic,
    Switch,
    Tag,
    Tooltip,
    Typography,
    message,
} from 'antd';
import dayjs from 'dayjs';
import { Activity, AlertTriangle, Clock3, PauseCircle, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import machineDowntimeService from '~/modules/machine/service/machineDowntimeService';
import './MachineDowntimeTab.css';

const SHIFT_START_HOUR = 8;
const SHIFT_TOTAL_HOURS = 24;

const HOUR_MARKERS = Array.from({ length: 13 }, (_, index) => {
    const offsetHours = index * 2;
    const absoluteHour = (SHIFT_START_HOUR + offsetHours) % 24;
    return {
        label: `${String(absoluteHour).padStart(2, '0')}:00`,
        leftPercent: (offsetHours / SHIFT_TOTAL_HOURS) * 100,
    };
});

const formatDuration = (totalSeconds = 0) => {
    const safeSeconds = Number(totalSeconds) || 0;
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }

    return `${seconds}s`;
};

const formatDateTime = (value) => {
    if (!value) {
        return 'Đang cập nhật';
    }

    return dayjs(value).format('HH:mm:ss');
};

const getEventType = (event) => {
    if (event?.reason === 'error' || event?.errorState === 1) {
        return 'error';
    }

    if (event?.reason === 'manual_stop' || event?.stopState === 1) {
        return 'manual';
    }

    return 'unknown';
};

const getEventColor = (event) => {
    const eventType = getEventType(event);

    if (eventType === 'error') {
        return '#dc2626';
    }

    if (eventType === 'manual') {
        return '#d97706';
    }

    return '#475569';
};

const buildMachineOptions = (downtimeData) => {
    const machineSet = new Set();

    (downtimeData?.machines || []).forEach((machineId) => machineSet.add(machineId));
    (downtimeData?.timeline || []).forEach((item) => machineSet.add(item.machineId));

    return Array.from(machineSet)
        .sort((left, right) => left.localeCompare(right))
        .map((machineId) => ({ label: machineId, value: machineId }));
};

const getPercentFromTime = (date, isoValue) => {
    if (!isoValue) {
        return 0;
    }

    const shiftStart = dayjs(date).hour(SHIFT_START_HOUR).minute(0).second(0).millisecond(0);
    const current = dayjs(isoValue);
    const diffSeconds = current.diff(shiftStart, 'second');
    const secondsInShift = SHIFT_TOTAL_HOURS * 60 * 60;
    return Math.min(100, Math.max(0, (diffSeconds / secondsInShift) * 100));
};

const getWidthPercent = (date, event) => {
    if (typeof event?.widthPercent === 'number') {
        return event.widthPercent;
    }

    const start = dayjs(event?.startTime);
    const end = dayjs(event?.displayEnd || event?.endTime || start);
    const secondsInShift = SHIFT_TOTAL_HOURS * 60 * 60;
    return Math.max(0, (end.diff(start, 'second') / secondsInShift) * 100);
};

const renderEventTooltip = (event) => (
    <div style={{ display: 'grid', gap: 4 }}>
        <strong>{event.machineId}</strong>
        <span>Lý do: {event.reasonLabel || 'Không xác định'}</span>
        <span>Bắt đầu: {formatDateTime(event.startTime)}</span>
        <span>Kết thúc: {formatDateTime(event.displayEnd || event.endTime)}</span>
        <span>Thời lượng: {formatDuration(event.durationSeconds)}</span>
        <span>Trạng thái: {event.isOpen ? 'Đang dừng' : 'Đã kết thúc'}</span>
    </div>
);

const MachineDowntimeTab = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedMachines, setSelectedMachines] = useState([]);
    const [openOnly, setOpenOnly] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [downtimeData, setDowntimeData] = useState(null);

    const fetchDowntimeData = async (dateValue) => {
        setLoading(true);
        setErrorText('');

        try {
            const formattedDate = dateValue.format('YYYY-MM-DD');
            const response = await machineDowntimeService.getDailyDowntime(formattedDate);
            setDowntimeData(response);

            const availableMachines = buildMachineOptions(response).map((item) => item.value);
            setSelectedMachines((previousValue) =>
                previousValue.filter((machineId) => availableMachines.includes(machineId)),
            );
        } catch (error) {
            const nextMessage = error.message || 'Không tải được dữ liệu dừng máy';
            setErrorText(nextMessage);
            message.error(nextMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDowntimeData(selectedDate);
    }, [selectedDate]);

    const machineOptions = buildMachineOptions(downtimeData);
    const allRows = (downtimeData?.timeline || [])
        .slice()
        .sort((left, right) => left.machineId.localeCompare(right.machineId));
    const filteredRows = allRows.filter((item) => {
        const machineMatched = selectedMachines.length === 0 || selectedMachines.includes(item.machineId);
        const openMatched = !openOnly || (item.events || []).some((event) => event.isOpen);
        return machineMatched && openMatched;
    });

    const visibleTotalDowntime = filteredRows.reduce((total, item) => total + (item.totalDowntimeSeconds || 0), 0);
    const openStopCount = filteredRows.reduce(
        (total, item) => total + (item.events || []).filter((event) => event.isOpen).length,
        0,
    );

    return (
        <div className="machine-downtime-tab">
            <Card>
                <div className="machine-downtime-toolbar">
                    <div>
                        <Typography.Title level={4} style={{ marginBottom: 4 }}>
                            Sơ đồ thời gian dừng máy
                        </Typography.Title>
                        <Typography.Text type="secondary">
                            Theo dõi các khoảng dừng trong ca từ 08:00 đến 08:00 ngày hôm sau.
                        </Typography.Text>
                    </div>

                    <div className="machine-downtime-toolbar__controls">
                        <DatePicker
                            allowClear={false}
                            format="DD/MM/YYYY"
                            value={selectedDate}
                            onChange={(value) => {
                                if (value) {
                                    setSelectedDate(value);
                                }
                            }}
                        />

                        <Select
                            allowClear
                            maxTagCount="responsive"
                            mode="multiple"
                            placeholder="Lọc theo máy"
                            style={{ minWidth: 280 }}
                            value={selectedMachines}
                            options={machineOptions}
                            onChange={setSelectedMachines}
                            showSearch
                            optionFilterProp="label"
                        />

                        <Space size="small">
                            <Typography.Text type="secondary">Chỉ sự cố đang mở</Typography.Text>
                            <Switch checked={openOnly} onChange={setOpenOnly} />
                        </Space>

                        <Button
                            loading={loading}
                            icon={<RefreshCw size={16} />}
                            onClick={() => fetchDowntimeData(selectedDate)}
                        >
                            Làm mới
                        </Button>
                    </div>
                </div>
            </Card>

            {errorText && (
                <Alert showIcon type="error" message="Không lấy được dữ liệu downtime" description={errorText} />
            )}

            <div className="machine-downtime-summary">
                <Card>
                    <Statistic title="Máy đang hiển thị" value={filteredRows.length} prefix={<Activity size={16} />} />
                </Card>

                <Card>
                    <Statistic
                        title="Tổng thời gian dừng"
                        value={formatDuration(visibleTotalDowntime)}
                        prefix={<Clock3 size={16} />}
                    />
                </Card>

                <Card>
                    <Statistic
                        title="Lỗi"
                        value={downtimeData?.summary?.errorStops || 0}
                        prefix={<AlertTriangle size={16} />}
                    />
                </Card>

                <Card>
                    <Statistic
                        title="Dừng do lệnh"
                        value={downtimeData?.summary?.manualStops || 0}
                        prefix={<PauseCircle size={16} />}
                    />
                </Card>

                <Card>
                    <Statistic title="Sự kiện đang mở" value={openStopCount} />
                </Card>
            </div>

            <Card className="machine-downtime-board" bodyStyle={{ paddingBottom: 12 }}>
                <div className="machine-downtime-board__legend">
                    <Tag color="red">Dừng do lỗi</Tag>
                    <Tag color="orange">Dừng do lệnh</Tag>
                    <Tag color="default">Không xác định</Tag>
                    <Tag color="blue">Thanh sọc: sự kiện đang mở</Tag>
                </div>

                <div className="machine-downtime-board__scroll">
                    <div className="machine-downtime-board__inner">
                        <div className="machine-downtime-axis">
                            <div>
                                <Typography.Text strong>Máy</Typography.Text>
                            </div>
                            <div className="machine-downtime-axis__timeline">
                                {HOUR_MARKERS.map((marker) => (
                                    <div
                                        key={marker.label}
                                        className="machine-downtime-axis__marker"
                                        style={{ left: `${marker.leftPercent}%` }}
                                    >
                                        {marker.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {filteredRows.length === 0 && (
                            <div className="machine-downtime-empty">
                                <Empty description="Không có máy phù hợp với bộ lọc hiện tại" />
                            </div>
                        )}

                        {filteredRows.map((item) => (
                            <div className="machine-downtime-row" key={item.machineId}>
                                <div className="machine-downtime-row__meta">
                                    <strong>{item.machineId}</strong>
                                    <span>{formatDuration(item.totalDowntimeSeconds)}</span>
                                </div>

                                <div className="machine-downtime-track">
                                    {Array.from({ length: 24 }, (_, index) => (
                                        <div
                                            key={`${item.machineId}-hour-${index}`}
                                            className="machine-downtime-track__hour"
                                            style={{ left: `${(index / 24) * 100}%` }}
                                        />
                                    ))}

                                    {(item.events || []).map((event, index) => {
                                        const startPercent =
                                            typeof event?.startPercent === 'number'
                                                ? event.startPercent
                                                : getPercentFromTime(selectedDate, event?.startTime);

                                        const widthPercent = Math.max(0.35, getWidthPercent(selectedDate, event));

                                        return (
                                            <Tooltip
                                                key={`${item.machineId}-${event.startTime}-${index}`}
                                                title={renderEventTooltip(event)}
                                            >
                                                <div
                                                    className={`machine-downtime-event ${event.isOpen ? 'machine-downtime-event--open' : ''}`}
                                                    style={{
                                                        left: `${startPercent}%`,
                                                        width: `${widthPercent}%`,
                                                        backgroundColor: getEventColor(event),
                                                    }}
                                                />
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default MachineDowntimeTab;
