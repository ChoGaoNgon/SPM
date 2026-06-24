import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Image, Popconfirm, Progress, Select, Space, Table, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { Gantt, ViewMode } from 'gantt-task-react';
import { useState } from 'react';
import authService from '~/modules/auth/services/authService';
import { mapToGanttTask } from '../utils/gantt';
import CustomTooltip from './CustomTooltip';

const EmployeeReportsTable = ({ reports, rowViewModes, onViewModeChange, isAdmin = false, onEdit, onDelete }) => {
    const [selectedType, setSelectedType] = useState(null);
    const parseReportTypeFirst5 = (taskDescription) => {
        if (!taskDescription) return null;
        const first5 = taskDescription.slice(0, 5);
        if (first5.includes('(PS)')) return 'PS';
        if (first5.includes('(ST)')) return 'ST';
        if (first5.includes('(BD)')) return 'BD';
        if (first5.includes('(K)')) return 'K';
        return null;
    };

    const handleModeChange = (empId, val) => {
        onViewModeChange?.(empId, val);
    };

    const renderChildReports = (record) => {
        const mode = rowViewModes[record.employeeId] || 'table';
        const childReports = record.reports || [];

        const reportStats = childReports.reduce(
            (acc, r) => {
                const type = parseReportTypeFirst5(r.taskDescription);
                if (type === 'PS') acc.PS += 1;
                else if (type === 'ST') acc.ST += 1;
                else if (type === 'BD') acc.BD += 1;
                else if (type === 'K') acc.K += 1;
                return acc;
            },
            { PS: 0, ST: 0, BD: 0, K: 0 },
        );

        const filteredReports = selectedType
            ? childReports.filter((r) => parseReportTypeFirst5(r.taskDescription) === selectedType)
            : childReports;

        return (
            <div className="space-y-4">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Chế độ xem:</label>
                        <Select
                            value={mode}
                            onChange={(val) => handleModeChange(record.employeeId, val)}
                            options={[
                                { value: 'table', label: '📋 Dạng bảng' },
                                { value: 'gantt', label: '📊 Dạng Gantt' },
                            ]}
                            className="w-40"
                        />
                    </div>

                    {authService.hasDepartmentCode('KTL') && (
                        <div className="flex flex-wrap gap-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lọc theo loại:</span>
                            <div className="flex flex-wrap gap-2">
                                <Tag
                                    color="magenta"
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setSelectedType(selectedType === 'PS' ? null : 'PS')}
                                >
                                    Phát sinh (PS): {reportStats.PS}
                                </Tag>
                                <Tag
                                    color="blue"
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setSelectedType(selectedType === 'ST' ? null : 'ST')}
                                >
                                    Setup (ST): {reportStats.ST}
                                </Tag>
                                <Tag
                                    color="green"
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setSelectedType(selectedType === 'BD' ? null : 'BD')}
                                >
                                    Bảo dưỡng (BD): {reportStats.BD}
                                </Tag>
                                <Tag
                                    color="orange"
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setSelectedType(selectedType === 'K' ? null : 'K')}
                                >
                                    Khác (K): {reportStats.K}
                                </Tag>
                            </div>
                        </div>
                    )}
                </div>

                {mode === 'table' ? (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <Table
                            rowKey="id"
                            columns={[
                                {
                                    title: 'STT',
                                    dataIndex: 'index',
                                    render: (_, __, idx) => (
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                                            {idx + 1}
                                        </span>
                                    ),
                                    align: 'center',
                                    width: 60,
                                },
                                {
                                    title: 'Nội dung công việc',
                                    dataIndex: 'taskDescription',
                                    render: (text) => <span className="text-gray-800 dark:text-gray-200">{text}</span>,
                                },
                                {
                                    title: 'Thời gian bắt đầu',
                                    dataIndex: 'startDateTime',
                                    align: 'center',
                                    width: 120,
                                    render: (value) => {
                                        if (!value) return <span className="text-gray-400 dark:text-gray-500">—</span>;
                                        const date = dayjs(value).format('DD/MM/YYYY');
                                        const time = dayjs(value).format('HH:mm');
                                        return (
                                            <Tooltip title={date}>
                                                <span className="font-medium text-blue-600 dark:text-blue-400 cursor-help">
                                                    {time}
                                                </span>
                                            </Tooltip>
                                        );
                                    },
                                },
                                {
                                    title: 'Thời gian kết thúc',
                                    dataIndex: 'endDateTime',
                                    align: 'center',
                                    width: 120,
                                    render: (value) => {
                                        if (!value) return <span className="text-gray-400 dark:text-gray-500">—</span>;
                                        const date = dayjs(value).format('DD/MM/YYYY');
                                        const time = dayjs(value).format('HH:mm');
                                        return (
                                            <Tooltip title={date}>
                                                <span className="font-medium text-green-600 dark:text-green-400 cursor-help">
                                                    {time}
                                                </span>
                                            </Tooltip>
                                        );
                                    },
                                },
                                {
                                    title: 'Hình ảnh',
                                    dataIndex: 'filePath',
                                    align: 'center',
                                    width: 120,
                                    render: (_, r) =>
                                        r.filePath ? (
                                            <Image
                                                width={80}
                                                src={`${process.env.REACT_APP_UPLOAD_URL}/${r.filePath}`}
                                                className="rounded-lg"
                                            />
                                        ) : (
                                            <span className="text-gray-400 dark:text-gray-500">—</span>
                                        ),
                                },
                                {
                                    title: 'Hành động',
                                    dataIndex: 'action',
                                    align: 'center',
                                    width: 120,
                                    render: (_, rec) => {
                                        const isWithin24Hours = rec.createdAt
                                            ? dayjs().diff(dayjs(rec.createdAt), 'hour') < 24
                                            : false;
                                        const canEdit = authService.hasRole('SUPERADMIN') || isWithin24Hours;

                                        return (
                                            <Space size="small">
                                                <Button
                                                    onClick={() => onEdit?.({ ...rec, employeeId: record.employeeId })}
                                                    disabled={!canEdit}
                                                    title={
                                                        !canEdit
                                                            ? 'Chỉ có thể sửa báo cáo trong vòng 24 giờ'
                                                            : 'Chỉnh sửa'
                                                    }
                                                    icon={<EditOutlined />}
                                                    className="flex items-center justify-center hover:border-blue-500 hover:text-blue-600"
                                                />
                                                <Popconfirm
                                                    title="Xác nhận xóa"
                                                    description="Bạn có chắc muốn xóa công việc này không?"
                                                    onConfirm={() => onDelete?.(rec)}
                                                    okText="Xóa"
                                                    cancelText="Hủy"
                                                >
                                                    <Button
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        disabled={!canEdit}
                                                        title={
                                                            !canEdit
                                                                ? 'Chỉ có thể xóa báo cáo trong vòng 24 giờ'
                                                                : 'Xóa'
                                                        }
                                                        className="flex items-center justify-center"
                                                    />
                                                </Popconfirm>
                                            </Space>
                                        );
                                    },
                                },
                            ]}
                            dataSource={filteredReports}
                            pagination={false}
                            size="small"
                            className="custom-table"
                        />
                    </div>
                ) : (
                    <div className="gantt-wrapper rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <Gantt
                            tasks={filteredReports.filter((r) => r.startDateTime && r.endDateTime).map(mapToGanttTask)}
                            viewMode={ViewMode.Hour}
                            listCellWidth=""
                            columnWidth={50}
                            rowHeight={40}
                            fontSize={12}
                            TooltipContent={CustomTooltip}
                        />
                    </div>
                )}
            </div>
        );
    };

    const departmentFilters = Array.from(new Set(reports.map((r) => r.departmentName || ''))).map((name) => ({
        text: name,
        value: name,
    }));

    const columns = [
        {
            title: 'Mã nhân viên',
            dataIndex: 'employeeCode',
            align: 'center',
            render: (text) => <span className="font-medium text-gray-700 dark:text-gray-300">{text}</span>,
        },
        {
            title: 'Tên nhân viên',
            dataIndex: 'employeeName',
            render: (text) => <span className="text-gray-800 dark:text-gray-200">{text}</span>,
        },
        {
            title: 'Nhóm',
            dataIndex: 'departmentName',
            align: 'center',
            filters: departmentFilters,
            onFilter: (value, record) => record.departmentName === value,
            render: (text) => (
                <Tag color="blue" className="m-0">
                    {text}
                </Tag>
            ),
        },
        {
            title: 'Giờ đến',
            dataIndex: 'checkinTime',
            align: 'center',
            render: (value) => {
                if (!value) return <span className="text-gray-400 dark:text-gray-500">—</span>;
                const date = dayjs(value).format('DD/MM/YYYY');
                const time = dayjs(value).format('HH:mm');
                return (
                    <Tooltip title={date}>
                        <span className="font-medium text-blue-600 dark:text-blue-400 cursor-help">{time}</span>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Giờ về',
            dataIndex: 'checkoutTime',
            align: 'center',
            render: (value) => {
                if (!value) return <span className="text-gray-400 dark:text-gray-500">—</span>;
                const date = dayjs(value).format('DD/MM/YYYY');
                const time = dayjs(value).format('HH:mm');
                return (
                    <Tooltip title={date}>
                        <span className="font-medium text-green-600 dark:text-green-400 cursor-help">{time}</span>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Hiệu suất công việc',
            dataIndex: 'workEfficiency',
            align: 'center',
            render: (value) => (
                <div className="flex items-center justify-center">
                    <Progress percent={parseInt(value, 10)} size="small" />
                </div>
            ),
        },
    ];

    return (
        <Table
            rowKey="employeeId"
            columns={columns.map((col) => ({ ...col, fixed: col.fixed || false }))}
            dataSource={reports}
            expandable={{
                expandedRowRender: renderChildReports,
            }}
            pagination={false}
            sticky
            className="custom-table"
        />
    );
};

export default EmployeeReportsTable;
