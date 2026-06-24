import { Select } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import departmentService from '~/modules/department/services/departmentService';

const { Option } = Select;

const DepartmentSelect = ({
    value,
    onChange,
    placeholder = 'Chọn một hoặc nhiều phòng ban',
    disabled = false,
    multiple = false,

    valueField = 'id',
    labelField = 'code',

    ...rest
}) => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDepartments = async () => {
            setLoading(true);
            try {
                const data = await departmentService.getRootDepartments();
                setDepartments(data || []);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    const options = useMemo(() => {
        const result = [];

        const walk = (items = [], prefix = '') => {
            items.forEach((item) => {
                result.push({
                    key: item.id,
                    value: item[valueField],
                    label: `${prefix}${item[labelField]}`,
                });

                if (item.subDepartments?.length) {
                    walk(item.subDepartments, `${prefix}└─ `);
                }
            });
        };

        walk(departments);
        return result;
    }, [departments, valueField, labelField]);

    return (
        <Select
            mode={multiple ? 'multiple' : undefined}
            showSearch
            allowClear
            loading={loading}
            maxTagCount="responsive"
            optionFilterProp="children"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            {...rest}
        >
            {options.map((opt) => (
                <Option key={opt.key} value={opt.value}>
                    {opt.label}
                </Option>
            ))}
        </Select>
    );
};

export default React.memo(DepartmentSelect);
