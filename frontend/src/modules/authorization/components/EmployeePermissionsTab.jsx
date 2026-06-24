import React from 'react';

import EmployeeList from './EmployeeList';
import PermissionDetailCard from './PermissionDetailCard';

export default function EmployeePermissionsTab({ onSelectEmployee, detailProps }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 max-h-[499px] overflow-y-auto custom-scrollbar">
                        <EmployeeList onSelect={onSelectEmployee} />
                    </div>
                </div>
            </div>
            <div className="lg:col-span-2">
                <PermissionDetailCard {...detailProps} />
            </div>
        </div>
    );
}
