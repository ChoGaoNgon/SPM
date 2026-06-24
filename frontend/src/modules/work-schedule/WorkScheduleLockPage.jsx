import {
    ApartmentOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    LockOutlined,
    UnlockOutlined,
} from '@ant-design/icons';
import { Button, DatePicker, message, Modal, Spin, Switch } from 'antd';
import dayjs from 'dayjs';
import { LockKeyholeIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import PageHeader from '~/components/PageHeader';
import departmentScheduleLockService from '~/modules/work-schedule/services/departmentScheduleLockService';

const { confirm } = Modal;

export default function WorkScheduleLockPage() {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filterStatus, setFilterStatus] = useState(null);

    const toggleFilter = (value) => {
        setFilterStatus((prev) => (prev === value ? null : value));
    };

    const filteredDepartments = React.useMemo(() => {
        if (filterStatus === null) return departments;
        return departments.filter((d) => d.locked === filterStatus);
    }, [departments, filterStatus]);

    const fetchDepartments = React.useCallback(async () => {
        try {
            setLoading(true);
            const data = await departmentScheduleLockService.getDepartmentsWithLockStatus(
                selectedDate.year(),
                selectedDate.month() + 1,
            );
            setDepartments(data || []);
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    const handleToggle = async (deptId, checked) => {
        setLoading(true);
        try {
            if (checked) {
                await departmentScheduleLockService.lock(deptId, selectedDate.year(), selectedDate.month() + 1);
                message.success('Đã khóa phòng');
            } else {
                await departmentScheduleLockService.unlock(deptId, selectedDate.year(), selectedDate.month() + 1);
                message.success('Đã mở khóa phòng');
            }
            setDepartments((prev) => prev.map((d) => (d.id === deptId ? { ...d, locked: checked } : d)));
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLockAll = (lock) => {
        confirm({
            title: lock ? 'Khóa toàn bộ phòng ban?' : 'Mở khóa toàn bộ phòng ban?',
            icon: <ExclamationCircleOutlined />,
            okText: lock ? 'Khóa tất cả' : 'Mở tất cả',
            cancelText: 'Hủy',
            okButtonProps: { danger: lock },
            onOk: async () => {
                setLoading(true);
                try {
                    const allIds = departments.map((d) => d.id);
                    if (lock) {
                        await departmentScheduleLockService.lockDepartments(
                            allIds,
                            selectedDate.year(),
                            selectedDate.month() + 1,
                        );
                    } else {
                        await departmentScheduleLockService.unlockDepartments(
                            allIds,
                            selectedDate.year(),
                            selectedDate.month() + 1,
                        );
                    }
                    setDepartments((prev) => prev.map((d) => ({ ...d, locked: lock })));
                    message.success(lock ? 'Đã khóa toàn bộ' : 'Đã mở toàn bộ');
                } catch (err) {
                    message.error('Lỗi khi cập nhật');
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const total = departments.length;
    const lockedCount = departments.filter((d) => d.locked).length;
    const unlockedCount = total - lockedCount;
    const percentLocked = total > 0 ? Math.round((lockedCount / total) * 100) : 0;

    return (
        <>
            <PageHeader
                icon={LockKeyholeIcon}
                title="Quản lý khóa lịch làm việc"
                description="Khóa hoặc mở khóa lịch làm việc cho các phòng ban trong công ty"
            />
            <div className="flex flex-col gap-6">
                <div
                    className="
                    grid 
                    grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 
                    gap-4
                "
                >
                    <div
                        onClick={() => toggleFilter(null)}
                        className={`
                        bg-white dark:bg-neutral-800 rounded-xl shadow p-4 flex items-center gap-4 cursor-pointer
                        ${filterStatus === null ? 'ring-2 ring-blue-500' : ''}
                    `}
                    >
                        <ApartmentOutlined className="text-3xl text-blue-500" />
                        <div>
                            <div className="text-2xl font-semibold">{total}</div>
                            <div className="text-gray-600 dark:text-gray-300">Tổng phòng ban</div>
                        </div>
                    </div>

                    <div
                        onClick={() => toggleFilter(true)}
                        className={`
                        bg-white dark:bg-neutral-800 rounded-xl shadow p-4 flex items-center gap-4 cursor-pointer
                        ${filterStatus === true ? 'ring-2 ring-red-500' : ''}
                    `}
                    >
                        <LockOutlined className="text-3xl text-red-500" />
                        <div>
                            <div className="text-2xl font-semibold">{lockedCount}</div>
                            <div className="text-gray-600 dark:text-gray-300">Đã khóa</div>
                        </div>
                    </div>

                    <div
                        onClick={() => toggleFilter(false)}
                        className={`
                        bg-white dark:bg-neutral-800 rounded-xl shadow p-4 flex items-center gap-4 cursor-pointer
                        ${filterStatus === false ? 'ring-2 ring-green-500' : ''}
                    `}
                    >
                        <UnlockOutlined className="text-3xl text-green-600" />
                        <div>
                            <div className="text-2xl font-semibold">{unlockedCount}</div>
                            <div className="text-gray-600 dark:text-gray-300">Chưa khóa</div>
                        </div>
                    </div>

                    <div
                        onClick={() => toggleFilter(true)}
                        className={`
                        bg-white dark:bg-neutral-800 rounded-xl shadow p-4 flex items-center gap-4 cursor-pointer
                    `}
                    >
                        <CheckCircleOutlined className="text-3xl text-purple-600" />
                        <div>
                            <div className="text-2xl font-semibold">{percentLocked}%</div>
                            <div className="text-gray-600 dark:text-gray-300">Tỷ lệ đã khóa</div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <DatePicker
                            picker="month"
                            value={selectedDate}
                            onChange={setSelectedDate}
                            format="MM-YYYY"
                            allowClear={false}
                            className="h-10"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="primary"
                            danger
                            icon={<LockOutlined />}
                            onClick={() => handleLockAll(true)}
                            disabled={loading}
                        >
                            Khóa toàn bộ
                        </Button>
                        <Button
                            icon={<UnlockOutlined />}
                            className="border-green-600 text-green-600"
                            onClick={() => handleLockAll(false)}
                            disabled={loading}
                        >
                            Mở toàn bộ
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center pt-10">
                        <Spin />
                    </div>
                ) : (
                    <div
                        className="
                        grid
                        grid-cols-2 sm:grid-cols-2 md:grid-cols-3
                        lg:grid-cols-4 xl:grid-cols-8
                        gap-4
                    "
                    >
                        {filteredDepartments.map((dept) => (
                            <div
                                key={dept.id}
                                className={`
                                p-4 rounded-xl shadow-sm
                                border transition cursor-pointer
                                ${
                                    dept.locked
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                }
                            `}
                            >
                                <div className="text-center font-semibold mb-2">{dept.name}</div>

                                <div className="flex justify-center">
                                    <Switch
                                        checkedChildren={<LockOutlined />}
                                        unCheckedChildren={<UnlockOutlined />}
                                        checked={dept.locked}
                                        onChange={(checked) => handleToggle(dept.id, checked)}
                                    />
                                </div>

                                <div
                                    className={`mt-3 text-center text-sm font-medium 
                                    ${dept.locked ? 'text-red-600' : 'text-green-700'}
                                `}
                                >
                                    {dept.locked ? 'Đã khóa' : 'Chưa khóa'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
