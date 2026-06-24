import { message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import employeeService from '~/modules/employee/services/employeeService';
import shiftService from '~/modules/work-schedule/services/shiftService';
import workScheduleService from '~/modules/work-schedule/services/workScheduleService';

export function useWorkScheduleData(departmentId, selectedDate, searchText) {
    const [employees, setEmployees] = useState([]);
    const [data, setData] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!departmentId) return;
        (async () => {
            try {
                setLoading(true);
                const [emps, shiftsRes, schedulesRes] = await Promise.all([
                    employeeService.getEmployeesByDepartment(departmentId, null),
                    shiftService.getAllShifts(),
                    workScheduleService.getWorkScheduleByDepartment(
                        departmentId,
                        selectedDate.month() + 1,
                        selectedDate.year(),
                    ),
                ]);
                setEmployees(emps);
                setShifts(shiftsRes);
                setData(transformEmployeesToTableData(emps, selectedDate, schedulesRes, shiftsRes, searchText));
            } catch (error) {
                message.error(error.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [departmentId, selectedDate, searchText]);

    const shiftById = useMemo(() => {
        const m = new Map();
        shifts.forEach((s) => m.set(s.id, s));
        return m;
    }, [shifts]);

    return { employees, data, setData, shifts, shiftById, loading, setLoading };
}

function transformEmployeesToTableData(employees, selectedDate, schedules, shifts, searchText = '') {
    const daysInMonth = selectedDate.daysInMonth();
    const shiftMapByCode = new Map(shifts.map((s) => [s.shiftCode, s.id]));

    const scheduleMap = new Map((schedules || []).map((s) => [s.employeeId, s.days]));
    return employees
        .filter((e) => e.name?.toLowerCase().includes(searchText.toLowerCase()))
        .map((emp, index) => {
            const empSchedule = scheduleMap.get(emp.id) || {};
            const row = {
                key: emp.id,
                stt: index + 1,
                name: emp.name,
                employeeCode: emp.code || '',
                defaultShift: null,
            };
            for (let i = 1; i <= daysInMonth; i++) {
                const dateStr = selectedDate.date(i).format('YYYY-MM-DD');
                const shiftCode = empSchedule[dateStr];
                row[`day${i}`] = shiftCode ? (shiftMapByCode.get(shiftCode) ?? null) : null;
            }
            return row;
        });
}
