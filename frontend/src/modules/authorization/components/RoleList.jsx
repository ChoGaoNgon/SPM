import React from "react";
import { Shield } from "lucide-react";

export default function RoleList({ roles, onSelect }) {
    return (
        <div className="space-y-2 max-h-[calc(100vh-485px)] lg:max-h-[calc(100vh-234px)] overflow-y-auto custom-scrollbar">
            {roles.length > 0 ? (
                roles.map((role) => (
                    <div
                        key={role.code}
                        onClick={() => onSelect(role)}
                        className="p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                                <Shield size={18} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-slate-900 dark:text-white truncate">
                                    {role.code}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                    {role.description}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                    Không có vai trò nào
                </div>
            )}
        </div>
    );
}
