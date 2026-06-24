import React from 'react';
import { Select } from 'antd';

const ResinSelect = ({
    mode,
    value,
    onChange,
    placeholder,
    disabled,
    allowClear = true,
    showSearch = true,
    loading,
    options = [],
    ...rest
}) => {
    const selectOptions = options.map((resin) => ({
        label: `${resin.code} - ${resin.type} - ${resin.colorName} (${resin.grade})`,
        value: resin.code,
        key: resin.code,
    }));

    return (
        <Select
            mode={mode}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            allowClear={allowClear}
            showSearch={showSearch}
            optionFilterProp="label"
            loading={loading}
            options={selectOptions}
            {...rest}
        />
    );
};

export default ResinSelect;
