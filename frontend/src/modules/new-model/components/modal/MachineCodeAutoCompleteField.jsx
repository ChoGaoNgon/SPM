import React, { useCallback } from 'react';
import { Form, Select } from 'antd';

import { buildMachineAutoCompleteOptions } from '../../utils/machineSelectOptions';

const MachineCodeAutoCompleteField = ({
    form,
    machines,
    disabled,
    label = 'Máy số',
    placeholder = 'Chọn hoặc nhập mã máy',
    machineIdName = 'machineId',
    machineNoName = 'machineNo',
    machineCodeName = 'machineCode',
    machineCapacityTonName = 'machineCapacityTon',
    required = true,
    onMachineChange,
}) => {
    const applyMachineValues = useCallback(
        (machine) => {
            form.setFieldsValue({
                [machineCodeName]: machine?.code || null,
                [machineIdName]: machine?.id || null,
                [machineNoName]: machine?.machineNo || null,
                [machineCapacityTonName]: machine?.capacityTon || null,
            });

            if (onMachineChange) {
                onMachineChange(machine || null);
            }
        },
        [form, machineCodeName, machineIdName, machineNoName, machineCapacityTonName, onMachineChange],
    );

    const handleSelect = useCallback(
        (_, option) => {
            const selectedMachine = machines.find((machine) => machine.id === option?.machineId) || null;
            applyMachineValues(selectedMachine);
        },
        [machines, applyMachineValues],
    );

    const handleChange = useCallback(
        (value) => {
            if (!value) {
                form.setFieldsValue({
                    [machineCodeName]: null,
                    [machineIdName]: null,
                    [machineNoName]: null,
                    [machineCapacityTonName]: null,
                });

                if (onMachineChange) {
                    onMachineChange(null);
                }
            }
        },
        [form, machineCodeName, machineIdName, machineNoName, machineCapacityTonName, onMachineChange],
    );

    return (
        <Form.Item label={label} style={{ marginBottom: 0 }}>
            <Form.Item name={machineIdName} hidden rules={required ? [{ required: true, message: 'Chọn máy!' }] : []} />
            <Form.Item name={machineNoName} hidden />
            <Form.Item name={machineCodeName} noStyle>
                <Select
                    showSearch
                    allowClear
                    options={buildMachineAutoCompleteOptions(machines).map((option) => ({
                        ...option,
                        label: option.value || 'Chưa có mã máy',
                    }))}
                    placeholder={placeholder}
                    onSelect={handleSelect}
                    onChange={handleChange}
                    disabled={disabled}
                    optionFilterProp="searchText"
                    filterOption={(inputValue, option) =>
                        (option?.searchText || '').toUpperCase().includes(inputValue.toUpperCase())
                    }
                    optionRender={(option) => {
                        const machineNo = option?.data?.machineNo;
                        const capacityTon = option?.data?.machineCapacityTon;
                        const position = option?.data?.machinePosition;

                        return (
                            <div style={{ lineHeight: 1.4 }}>
                                <div style={{ fontWeight: 600 }}>{option?.data?.value || 'Chưa có mã máy'}</div>
                                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                    {machineNo ? `Máy số: ${machineNo}` : 'Máy số: ---'}
                                    {' | '}
                                    {capacityTon ? `Công suất: ${capacityTon} tấn` : 'Công suất: ---'}
                                    {' | '}
                                    {position ? `Vị trí: ${position}` : 'Vị trí: ---'}
                                </div>
                            </div>
                        );
                    }}
                />
            </Form.Item>
            <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                    prevValues?.[machineIdName] !== currentValues?.[machineIdName] ||
                    prevValues?.[machineNoName] !== currentValues?.[machineNoName] ||
                    prevValues?.[machineCapacityTonName] !== currentValues?.[machineCapacityTonName]
                }
            >
                {() => {
                    const machineId = form.getFieldValue(machineIdName);
                    const machineNo = form.getFieldValue(machineNoName);
                    const capacityTon = form.getFieldValue(machineCapacityTonName);
                    const selectedMachine = machines.find((machine) => machine.id === machineId) || null;
                    const position = selectedMachine?.position;

                    if (!machineNo && !capacityTon && !position) {
                        return null;
                    }

                    return (
                        <div style={{ marginTop: 6, fontSize: 12, color: '#8c8c8c', lineHeight: 1.5 }}>
                            {machineNo ? `Máy số: ${machineNo}` : 'Máy số: ---'}
                            {' | '}
                            {capacityTon ? `Công suất: ${capacityTon} tấn` : 'Công suất: ---'}
                            {' | '}
                            {position ? `Vị trí: ${position}` : 'Vị trí: ---'}
                        </div>
                    );
                }}
            </Form.Item>
        </Form.Item>
    );
};

export default MachineCodeAutoCompleteField;
