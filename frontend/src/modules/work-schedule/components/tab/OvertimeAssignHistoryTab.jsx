import { SearchOutlined } from '@ant-design/icons';
import { Empty, Input, Spin, Table } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import OvertimeStatusTag from './OvertimeStatusTag';

const columns = [
    { title: 'STT', key: 'stt', align: 'center', width: 50, render: (_, __, index) => index + 1 },
    { title: 'MSNV', dataIndex: 'msnv', key: 'msnv', width: 100 },
    { title: 'Họ và Tên', dataIndex: 'name', key: 'name', width: 180 },
    {
        title: 'Phòng ban',
        dataIndex: 'department',
        key: 'department',
        width: 150,
        filters: [],
        onFilter: (value, record) => record.department === value,
    },
    { title: 'Ngày', dataIndex: 'workDate', key: 'workDate', width: 100 },
    {
        title: 'Từ',
        dataIndex: 'startTime',
        key: 'startTime',
        align: 'center',
        width: 150,
        render: (value) => (
            <div className="text-center">
                <div className="text-xs font-semibold text-blue-600">{dayjs(value).format('HH:mm')}</div>
                <div className="text-xs text-gray-500">{dayjs(value).format('DD/MM')}</div>
            </div>
        ),
    },
    {
        title: 'Đến',
        dataIndex: 'endTime',
        key: 'endTime',
        align: 'center',
        width: 150,
        render: (value) => (
            <div className="text-center">
                <div className="text-xs font-semibold text-green-600">{dayjs(value).format('HH:mm')}</div>
                <div className="text-xs text-gray-500">{dayjs(value).format('DD/MM')}</div>
            </div>
        ),
    },
    { title: 'Lý do', dataIndex: 'reason', key: 'reason', width: 200 },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        width: 140,
        render: (status) => <OvertimeStatusTag status={status} />,
    },
];

const OvertimeAssignHistoryTab = ({ dataSource, loading }) => {
    const [searchText, setSearchText] = useState('');

    const filteredData = dataSource.filter(
        (item) =>
            item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.msnv?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.department?.toLowerCase().includes(searchText.toLowerCase()),
    );

    const stats = {
        total: dataSource.length,
        pending: dataSource.filter((r) => r.status?.startsWith('PENDING')).length,
        approved: dataSource.filter((r) => r.status === 'APPROVED').length,
        rejected: dataSource.filter((r) => r.status === 'REJECTED').length,
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 shadow-xs">
                    <div className="text-xs text-blue-800 font-medium">Tổng phân công</div>
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 shadow-xs">
                    <div className="text-xs text-amber-800 font-medium">Chờ duyệt</div>
                    <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 shadow-xs">
                    <div className="text-xs text-emerald-800 font-medium">Đã duyệt</div>
                    <div className="text-2xl font-bold text-emerald-600">{stats.approved}</div>
                </div>
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 shadow-xs">
                    <div className="text-xs text-rose-800 font-medium">Từ chối</div>
                    <div className="text-2xl font-bold text-rose-600">{stats.rejected}</div>
                </div>
            </div>

            <div className="flex gap-2">
                <Input
                    placeholder="Tìm kiếm theo tên, MSNV, phòng ban..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="flex-1"
                />
            </div>

            <div className="hidden md:block rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    pagination={false}
                    bordered={false}
                    loading={loading}
                    size="middle"
                    locale={{ emptyText: <Empty description="Không có dữ liệu" /> }}
                    scroll={{ x: 1000 }}
                />
            </div>

            <div className="md:hidden space-y-3">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Spin />
                    </div>
                ) : filteredData.length > 0 ? (
                    filteredData.map((item, idx) => (
                        <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="font-semibold text-gray-900">{item.name}</div>
                                    <div className="text-xs text-gray-500">{item.msnv}</div>
                                </div>
                                <OvertimeStatusTag status={item.status} />
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phòng ban:</span>
                                    <span className="font-medium">{item.department}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ngày:</span>
                                    <span className="font-medium">{item.workDate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Từ - Đến:</span>
                                    <span className="font-medium">
                                        {dayjs(item.startTime).format('HH:mm')} → {dayjs(item.endTime).format('HH:mm')}
                                    </span>
                                </div>
                                {item.reason && (
                                    <div>
                                        <span className="text-gray-600 block mb-1">Lý do:</span>
                                        <span className="text-gray-700 text-xs">{item.reason}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-8 text-center">
                        <Empty description="Không có dữ liệu" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default OvertimeAssignHistoryTab;
