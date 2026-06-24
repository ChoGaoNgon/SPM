import React from 'react';
import { Spin } from 'antd';
import { Search, UserCheck, X } from 'lucide-react';

import PermissionCard from './PermissionCard';

export default function PermissionDetailCard({
    title,
    selectedItem,
    selectionType,
    roles,
    selectedRole,
    searchQuery,
    isUpdating,
    filteredPermissions,
    itemPermissions,
    onSelectRoleChange,
    onUpdateEmployeeRole,
    onSearchChange,
    onClearSearch,
    onTogglePermission,
}) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
                    </div>
                </div>

                {selectedItem && selectionType === 'employee' && (
                    <div className="mt-2 flex flex-col sm:flex-row gap-3 items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-700 dark:text-slate-300">Vai trò hiện tại:</span>
                            <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white text-xs font-medium">
                                {selectedItem.role || 'EMPLOYEE'}
                            </span>
                        </div>
                        <div className="flex gap-2 items-center">
                            <select
                                value={selectedRole || ''}
                                onChange={(e) => onSelectRoleChange(e.target.value)}
                                className="px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            >
                                <option value="" disabled>
                                    Chọn vai trò mới
                                </option>
                                {roles.map((role) => (
                                    <option key={role.code} value={role.code}>
                                        {role.description}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={onUpdateEmployeeRole}
                                className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
                            >
                                Cập nhật vai trò
                            </button>
                        </div>
                    </div>
                )}

                {selectedItem && (
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm quyền theo mã hoặc mô tả..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                        {searchQuery && (
                            <button
                                onClick={onClearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {selectedItem ? (
                <Spin spinning={isUpdating} tip="Đang cập nhật...">
                    <div className="p-6 max-h-[calc(100vh-400px)] overflow-y-auto custom-scrollbar">
                        {filteredPermissions.length > 0 ? (
                            <>
                                {searchQuery && (
                                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            Tìm thấy <span className="font-semibold">{filteredPermissions.length}</span>{' '}
                                            quyền khớp với "{searchQuery}"
                                        </p>
                                    </div>
                                )}
                                <PermissionCard
                                    permissions={filteredPermissions}
                                    checkedList={itemPermissions}
                                    onToggle={onTogglePermission}
                                />
                            </>
                        ) : (
                            <div className="py-8 text-center">
                                <Search size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                                <p className="text-slate-600 dark:text-slate-400">
                                    Không tìm thấy quyền khớp với "{searchQuery}"
                                </p>
                            </div>
                        )}
                    </div>
                </Spin>
            ) : (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
                        <UserCheck size={48} className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Chọn đối tượng</h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md">
                        Vui lòng chọn một vai trò hoặc nhân viên để xem và chỉnh sửa các quyền hạn.
                    </p>
                </div>
            )}
        </div>
    );
}
