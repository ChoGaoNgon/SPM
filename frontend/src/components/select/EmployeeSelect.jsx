import { Select } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import employeeService from '~/modules/employee/services/employeeService';

const { Option } = Select;

const EmployeeSelect = ({
    value,
    onChange,
    placeholder = 'Chọn nhân viên',
    disabled = false,
    multiple = false,

    departmentId = null,
    departmentCode = null,

    valueField = 'id',
    codeField = 'code',
    nameField = 'name',

    ...rest
}) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEmployees = async () => {
            setLoading(true);
            try {
                let data = [];

                if (departmentId || departmentCode) {
                    data = await employeeService.getEmployeesByDepartment(departmentId, departmentCode);
                } else {
                    data = await employeeService.getAllEmployees();
                }

                setEmployees(data || []);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, [departmentId, departmentCode]);

    const options = useMemo(
        () =>
            employees.map((emp) => ({
                key: emp.id,
                value: emp[valueField],
                label: `${emp[codeField]} - ${String(emp[nameField] || '').toUpperCase()}`,
            })),
        [employees, valueField, codeField, nameField],
    );

    return (
        <Select
            mode={multiple ? 'multiple' : undefined}
            showSearch
            allowClear
            loading={loading}
            optionFilterProp="label"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            {...rest}
        >
            {options.map((opt) => (
                <Option key={opt.key} value={opt.value} label={opt.label}>
                    {opt.label}
                </Option>
            ))}
        </Select>
    );
};

export default React.memo(EmployeeSelect);
