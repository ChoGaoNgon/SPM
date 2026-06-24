import React, { useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

import WorkScheduleTab from './components/tab/WorkScheduleTab';
import ShiftConfigTab from './components/tab/ShiftConfigTab';
import authService from '../auth/services/authService';
import PageHeader from '~/components/PageHeader';
import { Calendar } from 'lucide-react';

const EmployeeSchedule = () => {
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [activeTab, setActiveTab] = useState('work');

    const tabs = [
        {
            key: 'work',
            label: 'Xem lịch làm việc',
            show: true,
        },
        {
            key: 'shift',
            label: 'Cấu hình giờ làm',
            show: authService.hasRole('SUPERADMIN'),
        },
    ];

    return (
        <div className="w-full">
            <PageHeader
                icon={Calendar}
                title="Lịch làm việc nhân viên"
                description="Xem và quản lý lịch làm việc của nhân viên trong công ty"
            />

            <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-700 mb-4">
                {tabs
                    .filter((t) => t.show)
                    .map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all
                ${
                    activeTab === tab.key
                        ? 'text-accent-600 dark:text-accent-400 border-b-2 border-accent-600 dark:border-accent-400'
                        : 'text-slate-600 dark:text-slate-300 hover:text-accent-500 dark:hover:text-accent-400'
                }
              `}
                        >
                            {tab.label}
                        </button>
                    ))}
            </div>

            <div className="rounded-xl">
                {activeTab === 'work' && (
                    <WorkScheduleTab selectedMonth={selectedMonth} onChangeMonth={setSelectedMonth} />
                )}

                {activeTab === 'shift' && <ShiftConfigTab />}
            </div>
        </div>
    );
};

export default EmployeeSchedule;
