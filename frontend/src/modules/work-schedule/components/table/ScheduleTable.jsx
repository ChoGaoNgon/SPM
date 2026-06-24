import { Select, Table } from 'antd';
import { useIsMobile } from '~/hook/useIsMobile';
import { weekdaysMap } from '../../constants';
const { Option } = Select;

export default function ScheduleTable({
    data,
    setData,
    shifts,
    shiftById,
    selectedDate,
    selectedRowKeys,
    setSelectedRowKeys,
}) {
    const handleShiftChange = (rowIndex, field, value) => {
        const newData = [...data];
        newData[rowIndex][field] = value;
        setData(newData);
    };

    const daysInMonth = selectedDate.daysInMonth();
    const startDate = selectedDate.startOf('month');
    const isMobile = useIsMobile();

    const dayColumns = Array.from({ length: daysInMonth }, (_, i) => {
        const date = startDate.add(i, 'day');
        const weekday = date.day();

        return {
            title: (
                <div className={weekday === 0 ? 'sunday-header' : weekday === 6 ? 'saturday-header' : ''}>
                    {String(i + 1).padStart(2, '0')}
                    <br />
                    <small>({weekdaysMap[weekday]})</small>
                </div>
            ),
            dataIndex: `day${i + 1}`,
            key: `day${i + 1}`,
            align: 'center',
            width: 72,
            render: (value, record, rowIndex) => {
                const shiftCode = value ? shiftById.get(value)?.shiftCode || '' : '';
                const cellClass = shiftCode
                    ? `shift-cell ${shiftCode}`
                    : weekday === 0
                      ? 'sunday'
                      : weekday === 6
                        ? 'saturday'
                        : '';

                return (
                    <div className={cellClass}>
                        <Select
                            value={value}
                            onChange={(val) => handleShiftChange(rowIndex, `day${i + 1}`, val ?? null)}
                            showSearch
                            placeholder="Ca"
                            optionFilterProp="children"
                            allowClear
                            variant={false}
                            size="small"
                            style={{
                                width: '100%',
                                background: 'transparent',
                            }}
                        >
                            {shifts.map((s) => (
                                <Option key={s.id} value={s.id}>
                                    {s.shiftCode}
                                </Option>
                            ))}
                        </Select>
                    </div>
                );
            },
        };
    });

    const totalColumn = {
        title: 'Tổng',
        key: 'total',
        fixed: 'right',
        width: 80,
        align: 'center',
        render: (_, record) => {
            let total = 0;
            for (let i = 1; i <= daysInMonth; i++) if (record[`day${i}`]) total++;
            return <b>{total}</b>;
        },
    };

    const columns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            fixed: isMobile ? undefined : 'left',
            width: 50,
            align: 'center',
        },
        {
            title: 'Họ và Tên',
            dataIndex: 'name',
            key: 'name',
            fixed: isMobile ? undefined : 'left',
            width: 180,
        },
        {
            title: 'MSNV',
            dataIndex: 'employeeCode',
            key: 'employeeCode',
            fixed: isMobile ? undefined : 'left',
            width: 90,
            align: 'center',
        },
        ...dayColumns,
        totalColumn,
    ];

    return (
        <div style={{ marginTop: 12 }}>
            <Table
                rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
                columns={columns}
                dataSource={data}
                bordered
                size="small"
                pagination={false}
                scroll={{ x: Math.max(columns.length * 80, 1200), y: 520 }}
                rowKey="key"
            />
        </div>
    );
}
