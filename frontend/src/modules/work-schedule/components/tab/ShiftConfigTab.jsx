import { message } from 'antd';
import dayjs from 'dayjs';
import { ChevronDown, ChevronUp, Clock, Edit2, Lock, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import shiftBreakService from '~/modules/work-schedule/services/shiftBreakService';
import shiftService from '~/modules/work-schedule/services/shiftService';
import AddShiftBreakModal from '../modal/AddShiftBreakModal';
import AddShiftModal from '../modal/AddShiftModal';

const ShiftConfigTab = () => {
    const [modalShiftVisible, setModalShiftVisible] = useState(false);
    const [modalShiftBreakVisible, setModalShiftBreakVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [shifts, setShifts] = useState([]);
    const [selectedShift, setSelectedShift] = useState(null);

    const [expandedRowKeys, setExpandedRowKeys] = useState([]);
    const [shiftBreaksByShift, setShiftBreaksByShift] = useState({});
    const [expandLoadingKey, setExpandLoadingKey] = useState(null);

    const [selectedBreak, setSelectedBreak] = useState(null);

    const navigate = useNavigate();

    const fetchShifts = async () => {
        try {
            const response = await shiftService.getAllShifts();
            setShifts(response || []);
        } catch (error) {
            message.error(error.message || 'Lỗi khi tải danh sách ca làm việc');
        }
    };

    useEffect(() => {
        fetchShifts();
    }, []);

    const loadShiftBreaks = async (shiftId) => {
        if (!shiftId) return;
        try {
            setExpandLoadingKey(shiftId);
            const data = await shiftBreakService.getShiftBreaksByShiftId(shiftId);
            setShiftBreaksByShift((prev) => ({ ...prev, [shiftId]: data || [] }));
        } catch (error) {
            message.error(error.message || 'Lỗi khi tải giờ nghỉ của ca');
        } finally {
            setExpandLoadingKey(null);
        }
    };

    const handleAddShift = async (shiftData) => {
        setLoading(true);
        try {
            await shiftService.addShift(shiftData);
            message.success('Thêm ca làm việc thành công!');
            fetchShifts();
            setModalShiftVisible(false);
        } catch (error) {
            message.error(error.message || 'Lỗi khi thêm ca');
        } finally {
            setLoading(false);
        }
    };

    const handleExpand = async (expanded, record) => {
        const key = record.id;
        if (!key) return;
        if (expanded) {
            await loadShiftBreaks(key);
            setExpandedRowKeys([key]);
        } else {
            setExpandedRowKeys([]);
        }
    };

    return (
        <>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Clock size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cấu Hình Ca Làm Việc</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Quản lý ca làm việc và giờ nghỉ</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setModalShiftVisible(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        <Plus size={18} />
                        Thêm Ca Làm Việc
                    </button>

                    <button
                        onClick={() => navigate('/schedules/work-schedule')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-lg transition-colors"
                    >
                        <Clock size={18} />
                        Xếp Lịch Nhân Viên
                    </button>

                    <button
                        onClick={() => navigate('/schedules/department-lock')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-lg transition-colors"
                    >
                        <Lock size={18} />
                        Khóa Đăng Ký Lịch
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {shifts.length > 0 ? (
                    shifts.map((shift) => (
                        <div
                            key={shift.id}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
                        >
                            <button
                                onClick={() => {
                                    if (expandedRowKeys.includes(shift.id)) {
                                        setExpandedRowKeys([]);
                                    } else {
                                        handleExpand(true, shift);
                                    }
                                }}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                            >
                                <div className="flex items-center gap-4 flex-1 text-left">
                                    <div className="flex-shrink-0">
                                        {expandedRowKeys.includes(shift.id) ? (
                                            <ChevronUp size={20} className="text-slate-400" />
                                        ) : (
                                            <ChevronDown size={20} className="text-slate-400" />
                                        )}
                                    </div>

                                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded font-semibold text-sm">
                                        {shift.shiftCode}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {shift.description}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {dayjs(shift.startTime, 'HH:mm').format('HH:mm')} -{' '}
                                            {dayjs(shift.endTime, 'HH:mm').format('HH:mm')}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedShift(shift);
                                        setModalShiftBreakVisible(true);
                                    }}
                                    className="ml-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors flex items-center gap-1"
                                >
                                    <Plus size={16} />
                                    Thêm Giờ Nghỉ
                                </button>
                            </button>

                            {expandedRowKeys.includes(shift.id) && (
                                <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-700/50">
                                    {expandLoadingKey === shift.id ? (
                                        <div className="text-center py-4">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    ) : (shiftBreaksByShift[shift.id] || []).length > 0 ? (
                                        <div className="space-y-2">
                                            {(shiftBreaksByShift[shift.id] || []).map((breakItem) => (
                                                <div
                                                    key={breakItem.id}
                                                    className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg flex items-center justify-between"
                                                >
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-slate-900 dark:text-white">
                                                            {breakItem.breakType}
                                                        </p>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                                            {breakItem.startTime} - {breakItem.endTime} (
                                                            {breakItem.duration} phút)
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                                            {breakItem.isPaid ? '✓ Tính lương' : '✗ Không tính lương'}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-2 ml-4">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedShift({ id: shift.id });
                                                                setSelectedBreak(breakItem);
                                                                setModalShiftBreakVisible(true);
                                                            }}
                                                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded transition-colors"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await shiftBreakService.deleteShiftBreak(
                                                                        breakItem.id,
                                                                    );
                                                                    message.success('Xóa giờ nghỉ thành công!');
                                                                    if (shift.id) {
                                                                        await loadShiftBreaks(shift.id);
                                                                    }
                                                                } catch (error) {
                                                                    message.error(
                                                                        error.message || 'Lỗi khi xóa giờ nghỉ',
                                                                    );
                                                                }
                                                            }}
                                                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                                            Không có giờ nghỉ nào
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-12 text-center">
                        <Clock size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                        <p className="text-slate-600 dark:text-slate-400">
                            Không có ca làm việc nào. Hãy thêm một ca mới!
                        </p>
                    </div>
                )}
            </div>

            <AddShiftModal
                open={modalShiftVisible}
                onCancel={() => setModalShiftVisible(false)}
                onOk={handleAddShift}
                confirmLoading={loading}
                onSuccess={fetchShifts}
            />

            <AddShiftBreakModal
                open={modalShiftBreakVisible}
                onCancel={() => {
                    setModalShiftBreakVisible(false);
                    setSelectedBreak(null);
                    setSelectedShift(null);
                }}
                shift={selectedShift}
                breakData={selectedBreak}
                onSuccess={async () => {
                    if (selectedShift?.id) {
                        await loadShiftBreaks(selectedShift.id);
                    }
                    setSelectedBreak(null);
                }}
            />
        </>
    );
};

export default ShiftConfigTab;
