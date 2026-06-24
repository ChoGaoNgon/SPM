import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { AutoComplete, Button, DatePicker, Form, Input, InputNumber, Select, Table, Tooltip } from 'antd';
import React from 'react';

const MachineDetailFormTable = ({ fields, add, remove, detailFieldOptions, loadingDistinctOptions }) => {
    const detailColumns = [
        {
            title: 'Tên chi tiết',
            width: '15%',
            render: (_, field) => (
                <Form.Item
                    name={[field.name, 'name']}
                    rules={[{ required: true, message: 'Nhập tên' }]}
                    style={{ marginBottom: 0 }}
                >
                    <Select
                        showSearch
                        allowClear
                        placeholder="Chọn tên chi tiết"
                        options={detailFieldOptions.name}
                        loading={loadingDistinctOptions}
                        optionFilterProp="label"
                    />
                </Form.Item>
            ),
        },
        {
            title: 'Model',
            width: '14%',
            render: (_, field) => (
                <Form.Item name={[field.name, 'model']} style={{ marginBottom: 0 }}>
                    <AutoComplete
                        allowClear
                        placeholder="Chọn hoặc nhập model"
                        options={detailFieldOptions.model}
                        filterOption={(inputValue, option) =>
                            (option?.label || '').toLowerCase().includes(inputValue.toLowerCase())
                        }
                    >
                        <Input loading={loadingDistinctOptions} />
                    </AutoComplete>
                </Form.Item>
            ),
        },
        {
            title: 'Maker',
            width: '10%',
            render: (_, field) => (
                <Form.Item name={[field.name, 'maker']} style={{ marginBottom: 0 }}>
                    <AutoComplete
                        allowClear
                        placeholder="Chọn hoặc nhập maker"
                        options={detailFieldOptions.maker}
                        filterOption={(inputValue, option) =>
                            (option?.label || '').toLowerCase().includes(inputValue.toLowerCase())
                        }
                    >
                        <Input loading={loadingDistinctOptions} />
                    </AutoComplete>
                </Form.Item>
            ),
        },
        {
            title: 'Serial',
            width: '14%',
            render: (_, field) => (
                <Form.Item name={[field.name, 'serial']} style={{ marginBottom: 0 }}>
                    <Input placeholder="SN0001" />
                </Form.Item>
            ),
        },
        {
            title: 'Voltage',
            width: '10%',
            render: (_, field) => (
                <Form.Item name={[field.name, 'voltage']} style={{ marginBottom: 0 }}>
                    <AutoComplete
                        allowClear
                        placeholder="Chọn hoặc nhập voltage"
                        options={detailFieldOptions.voltage}
                        filterOption={(inputValue, option) =>
                            String(option?.label || '')
                                .toLowerCase()
                                .includes(inputValue.toLowerCase())
                        }
                    >
                        <Input loading={loadingDistinctOptions} />
                    </AutoComplete>
                </Form.Item>
            ),
        },

        {
            title: 'Công suất điện',
            width: '12%',
            render: (_, field) => (
                <Form.Item name={[field.name, 'electricPower']} style={{ marginBottom: 0 }}>
                    <InputNumber className="w-full" min={0} precision={3} placeholder="VD: 2.2" addonAfter="kW" />
                </Form.Item>
            ),
        },
        {
            title: 'BĐ sản xuất',
            width: '15%',
            render: (_, field) => (
                <Form.Item name={[field.name, 'productionStartTime']} style={{ marginBottom: 0 }}>
                    <DatePicker className="w-full" placeholder="Chọn ngày" format="DD/MM/YYYY" />
                </Form.Item>
            ),
        },
        {
            title: 'Ngày xuất',
            width: '15%',
            render: (_, field) => (
                <Form.Item name={[field.name, 'dispatchTime']} style={{ marginBottom: 0 }}>
                    <DatePicker className="w-full" placeholder="Chọn ngày" format="DD/MM/YYYY" />
                </Form.Item>
            ),
        },
        {
            title: '',
            width: 70,
            align: 'center',
            render: (_, field) => (
                <Tooltip title="Xóa dòng">
                    <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                </Tooltip>
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Chi tiết máy</div>
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() =>
                        add({
                            name: '',
                            model: '',
                            serial: '',
                            voltage: undefined,
                            maker: '',
                            electricPower: undefined,
                            productionStartTime: undefined,
                            dispatchTime: undefined,
                        })
                    }
                >
                    Thêm dòng chi tiết
                </Button>
            </div>
            <Table
                rowKey={(field) => field.key}
                columns={detailColumns}
                dataSource={fields}
                pagination={false}
                size="small"
                locale={{ emptyText: 'Chưa có dòng chi tiết' }}
            />
        </div>
    );
};

export default MachineDetailFormTable;
