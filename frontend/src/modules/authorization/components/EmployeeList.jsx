import { message } from 'antd';
import { Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import DepartmentTree from '~/components/DepartmentTree';
import employeeService from '~/modules/employee/services/employeeService';

export default function EmployeeList({ onSelect }) {
    const [allEmployees, setAllEmployees] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState('');
    const [departmentId, setDepartmentId] = useState(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                let data = [];
                if (departmentId) {
                    data = await employeeService.getEmployeesByDepartment(departmentId, null);
                } else {
                    data = await employeeService.getAllEmployees();
                }
                setAllEmployees(data);
                setEmployees(data);
            } catch (error) {
                message.error(error.message || 'Có lỗi xảy ra khi tải danh sách nhân viên');
            }
        };
        fetchEmployees();
    }, [departmentId]);

    const onSearch = (value) => {
        const keyword = value.toLowerCase();
        setSearch(keyword);

        if (!keyword) {
            setEmployees(allEmployees);
            return;
        }

        setEmployees(
            allEmployees.filter(
                (e) => e.name.toLowerCase().includes(keyword) || e.code.toLowerCase().includes(keyword),
            ),
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="hidden lg:block lg:col-span-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border-b border-slate-200 dark:border-slate-600">
                        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Users size={18} />
                            Phòng Ban
                        </h3>
                    </div>
                    <div
                        className="custom-scrollbar p-4"
                        style={{
                            maxHeight: 'calc(100vh - 297px)',
                            overflowY: 'auto',
                        }}
                    >
                        <DepartmentTree onSelectDepartment={(depId) => setDepartmentId(depId)} />
                    </div>
                </div>
            </div>

            <div className="lg:col-span-6 w-full">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
                    <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border-b border-slate-200 dark:border-slate-600">
                        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Users size={18} />
                            Danh Sách Nhân Viên
                        </h3>
                    </div>

                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-600">
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                            />
                            <input
                                type="text"
                                placeholder="Tìm nhân viên..."
                                onChange={(e) => onSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            />
                        </div>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar max-h-[calc(100vh-600px)] lg:max-h-[calc(100vh-339px)]">
                        {employees.length > 0 ? (
                            <div className="space-y-2">
                                {employees.map((emp) => (
                                    <div
                                        key={emp.id}
                                        onClick={() => onSelect(emp)}
                                        className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-xs font-semibold text-blue-700 dark:text-blue-300 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                                                {emp.code}
                                            </div>
                                            <span className="font-medium text-slate-900 dark:text-white truncate">
                                                {emp.name}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Users size={40} className="text-slate-300 dark:text-slate-600 mb-2" />
                                <p className="text-slate-500 dark:text-slate-400">
                                    {search ? 'Không tìm thấy nhân viên' : 'Không có nhân viên'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
