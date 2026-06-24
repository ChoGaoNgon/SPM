import { UploadOutlined } from '@ant-design/icons';
import { Button, Checkbox, DatePicker, message, Modal, Typography, Upload } from 'antd';
import dayjs from 'dayjs';
import { CalendarDaysIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import PageHeader from '~/components/PageHeader';
import authService from '~/modules/auth/services/authService';
import departmentScheduleLockService from '~/modules/work-schedule/services/departmentScheduleLockService';
import workScheduleService from '~/modules/work-schedule/services/workScheduleService';
import ActionCard from './components/card/ActionCard';
import AutoScheduleCard from './components/card/AutoScheduleCard';
import CommonSettingsCard from './components/card/CommonSettingsCard';
import ScheduleTable from './components/table/ScheduleTable';
import { useShiftPatterns } from './hooks/useShiftPatterns';
import { useWorkScheduleData } from './hooks/useWorkScheduleData';
import './styles/WorkSchedule.css';

const { Title } = Typography;

export default function WorkScheduleEnhanced() {
    const employee = authService.getEmployee();
    const departmentId = employee?.departmentId;

    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [globalDefaultShift, setGlobalDefaultShift] = useState(null);
    const [selectedPatternCode, setSelectedPatternCode] = useState('-- Vui lòng chọn ca làm --');
    const [anchorStart, setAnchorStart] = useState(null);
    const [anchorEnd, setAnchorEnd] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [isLocked, setIsLocked] = useState(false);

    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [syncModalOpen, setSyncModalOpen] = useState(false);
    const [syncDate, setSyncDate] = useState(dayjs());
    const [useCodeHcns, setUseCodeHcns] = useState(true);

    const { data, setData, shifts, shiftById, loading, setLoading } = useWorkScheduleData(
        departmentId,
        selectedDate,
        searchText,
    );

    const { shiftPatterns, loading: patternsLoading } = useShiftPatterns();

    useEffect(() => {
        const checkLock = async () => {
            if (!departmentId) return;

            try {
                const locked = await departmentScheduleLockService.checkLock(
                    departmentId,
                    selectedDate.year(),
                    selectedDate.month() + 1,
                );
                setIsLocked(locked);
            } catch (error) {
                message.error(error.message);
            }
        };

        checkLock();
    }, [departmentId, selectedDate]);

    const handleMonthChange = (date) => setSelectedDate(date);

    const handleGlobalDefaultShiftChange = (value) => {
        setGlobalDefaultShift(value);
        const newData = data.map((row) => ({ ...row, defaultShift: value }));
        setData(newData);
    };

    const autoGenerateSchedule = (patternCode) => {
        if (isLocked) return;
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn ít nhất một nhân viên để áp dụng lịch!');
            return;
        }
        if (!anchorStart || !anchorEnd) {
            message.warning('Vui lòng chọn khoảng ngày bắt đầu và kết thúc!');
            return;
        }

        const daysInMonth = selectedDate.daysInMonth();
        const patternObj = shiftPatterns.find((p) => p.code === patternCode);
        if (!patternObj) {
            message.warning('Không tìm thấy mẫu ca làm việc!');
            return;
        }

        const pattern = patternObj.pattern;
        const cycleLen = pattern.length;
        const startDay = dayjs(anchorStart).date();
        const endDay = dayjs(anchorEnd).date();

        const ntShiftId = shifts.find((s) => s.shiftCode === 'NT')?.id || null;
        const koShiftId = shifts.find((s) => s.shiftCode === 'KO')?.id || null;
        const kdShiftId = shifts.find((s) => s.shiftCode === 'KD')?.id || null;

        const kipPatternList = ['KO_42', 'KD_42', 'KO_61', 'KD_61'];
        const sundayOffList = ['HCT1', 'HCT2', 'HCT3', 'C1', 'C2', 'C3', 'KO_61', 'KD_61'];

        const isKipPattern = kipPatternList.includes(patternCode);
        const hasSundayOff = sundayOffList.includes(patternCode);

        const anchorOffset = hasSundayOff ? (dayjs(anchorStart).day() === 0 ? 6 : dayjs(anchorStart).day() - 1) : 0;

        const newData = data.map((row) => {
            if (!selectedRowKeys.includes(row.key)) return row;
            const updated = { ...row };

            for (let i = startDay; i <= endDay && i <= daysInMonth; i++) {
                const currentDate = selectedDate.date(i);
                const dayOfWeek = currentDate.day();

                const adjustedIndex = (((i - startDay + anchorOffset) % cycleLen) + cycleLen) % cycleLen;
                const cycleRound = Math.floor((i - startDay + anchorOffset) / cycleLen);
                const flip = cycleRound % 2 === 1;

                let isWork = pattern.charAt(adjustedIndex) === '1';
                if (hasSundayOff && dayOfWeek === 0) isWork = false;

                let currentShiftId = null;
                if (isWork) {
                    if (isKipPattern) {
                        currentShiftId =
                            patternObj.defaultShift === 'KO'
                                ? flip
                                    ? kdShiftId
                                    : koShiftId
                                : flip
                                  ? koShiftId
                                  : kdShiftId;
                    } else {
                        currentShiftId =
                            row.defaultShift ||
                            globalDefaultShift ||
                            shifts.find((s) => s.shiftCode === patternObj.defaultShift)?.id ||
                            null;
                    }
                } else {
                    currentShiftId = ntShiftId;
                }

                updated[`day${i}`] = currentShiftId;
            }

            return updated;
        });

        setData(newData);
        message.success(`Đã sinh lịch "${patternObj.name}" cho ${selectedRowKeys.length} nhân viên.`);
    };

    const handleSave = async () => {
        if (isLocked) return;
        try {
            setLoading(true);
            const daysInMonth = selectedDate.daysInMonth();
            const payload = data.map((row) => {
                const daysObj = {};
                for (let i = 1; i <= daysInMonth; i++) {
                    const dateStr = selectedDate.date(i).format('YYYY-MM-DD');
                    const shiftId = row[`day${i}`] || null;
                    daysObj[dateStr] = shiftId;
                }
                return { employeeId: row.key, days: daysObj };
            });

            await workScheduleService.saveSchedulesOnce(payload);
            message.success('Đã lưu lịch làm việc!');
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImportClick = () => {
        if (isLocked) {
            message.warning('Tháng này đã bị khóa, không thể import!');
            return;
        }
        setImportModalOpen(true);
    };

    const handleImport = async () => {
        if (!importFile) {
            message.warning('Vui lòng chọn file Excel!');
            return;
        }

        try {
            setLoading(true);

            await workScheduleService.importWorkSchedule(importFile, selectedDate.month() + 1, selectedDate.year());

            message.success('Import lịch thành công!');
        } catch (err) {
            message.error(err.message);
        } finally {
            setLoading(false);
            setImportModalOpen(false);
            setImportFile(null);
        }
    };

    const handleSyncClick = () => {
        setSyncModalOpen(true);
    };

    const handleSync = async () => {
        try {
            setLoading(true);
            const year = syncDate.year();
            const month = syncDate.month() + 1;

            await workScheduleService.syncWorkSchedule(year, month, useCodeHcns);

            message.success(`Đã đồng bộ lịch làm việc tháng ${month}/${year} thành công!`);

            if (year === selectedDate.year() && month === selectedDate.month() + 1) {
                setSelectedDate(dayjs(selectedDate));
            }
        } catch (err) {
            message.error(err.message);
        } finally {
            setLoading(false);
            setSyncModalOpen(false);
        }
    };

    return (
        <div className="work-schedule enhanced">
            <PageHeader
                icon={CalendarDaysIcon}
                title="Xếp lịch làm việc nhân viên"
                description="Xem và quản lý lịch làm việc của nhân viên trong công ty"
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                    <CommonSettingsCard
                        selectedDate={selectedDate}
                        handleMonthChange={handleMonthChange}
                        globalDefaultShift={globalDefaultShift}
                        handleGlobalDefaultShiftChange={handleGlobalDefaultShiftChange}
                        shifts={shifts}
                        handleImportClick={handleImportClick}
                        isLocked={isLocked}
                    />
                </div>

                <div className="md:col-span-2">
                    <AutoScheduleCard
                        anchorStart={anchorStart}
                        anchorEnd={anchorEnd}
                        setAnchorStart={setAnchorStart}
                        setAnchorEnd={setAnchorEnd}
                        selectedPatternCode={selectedPatternCode}
                        setSelectedPatternCode={setSelectedPatternCode}
                        autoGenerateSchedule={autoGenerateSchedule}
                        shiftPatterns={shiftPatterns}
                        patternsLoading={patternsLoading}
                    />
                </div>

                <div className="md:col-span-1">
                    <ActionCard
                        handleSave={handleSave}
                        loading={loading}
                        setSearchText={setSearchText}
                        isLocked={isLocked}
                        handleSyncClick={handleSyncClick}
                    />
                </div>
            </div>

            <div className="mt-4">
                <ScheduleTable
                    data={data}
                    setData={setData}
                    shifts={shifts}
                    shiftById={shiftById}
                    selectedDate={selectedDate}
                    selectedRowKeys={selectedRowKeys}
                    setSelectedRowKeys={setSelectedRowKeys}
                />
            </div>

            <Modal
                title="Import lịch làm việc"
                open={importModalOpen}
                onCancel={() => setImportModalOpen(false)}
                onOk={handleImport}
                okText="Import"
                cancelText="Hủy"
            >
                <Upload
                    beforeUpload={(file) => {
                        setImportFile(file);
                        return false;
                    }}
                    maxCount={1}
                >
                    <Button icon={<UploadOutlined />}>Chọn file Excel</Button>
                </Upload>

                {importFile && <p className="mt-2">📄 File đã chọn: {importFile.name}</p>}
            </Modal>

            <Modal
                title="Đồng bộ lịch làm việc từ API bên ngoài"
                open={syncModalOpen}
                onCancel={() => setSyncModalOpen(false)}
                onOk={handleSync}
                okText="Đồng bộ"
                cancelText="Hủy"
                confirmLoading={loading}
            >
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>Chọn tháng/năm cần đồng bộ:</label>
                    <DatePicker
                        picker="month"
                        value={syncDate}
                        onChange={(date) => setSyncDate(date)}
                        format="MM/YYYY"
                        style={{ width: '100%' }}
                    />
                </div>
                <div>
                    <Checkbox checked={useCodeHcns} onChange={(e) => setUseCodeHcns(e.target.checked)}>
                        Sử dụng mã HCNS (code_hcns)
                    </Checkbox>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                        Nếu bỏ chọn, hệ thống sẽ dùng mã ca làm việc (shift_code)
                    </div>
                </div>
                <div style={{ marginTop: 16, padding: 12, background: '#f0f0f0', borderRadius: 4 }}>
                    <strong>Lưu ý:</strong> Chức năng này sẽ gọi API bên ngoài (http://10.0.10.5:3000/api/shiftplan) và
                    đồng bộ dữ liệu lịch làm việc vào hệ thống.
                </div>
            </Modal>
        </div>
    );
}
