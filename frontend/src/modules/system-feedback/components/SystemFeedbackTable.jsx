import {
    BulbOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    SearchOutlined,
    SendOutlined,
} from '@ant-design/icons';
import { Button, Image, Input, message, Popconfirm, Space, Table, Tag, Tooltip } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import authService from '~/modules/auth/services/authService';
import systemFeedbackService from '../services/systemFeedbackService';
import { renderSystemType } from '../SystemFeedbackUtils';

const SystemFeedbackTable = ({ onEdit, onAssign, reloadTrigger, canAssignFeedback, onStatsUpdate }) => {
    const [filteredData, setFilteredData] = useState([]);
    const currentEmployeeCode = authService.getEmployeeCode();
    const hasITDepartmentRole = authService.hasDepartmentCode('IT') || authService.hasDepartmentCode('P-IT&ERP');

    const [searchText, setSearchText] = useState('');
    const [debouncedKeyword, setDebouncedKeyword] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedKeyword(searchText.trim());
        }, 500);

        return () => clearTimeout(handler);
    }, [searchText]);

    const fetchSystemFeedback = useCallback(
        async (keyword = '') => {
            try {
                const employeeCode = canAssignFeedback || hasITDepartmentRole ? null : currentEmployeeCode;

                const res = await systemFeedbackService.searchSystemFeedbacks(keyword, employeeCode);

                setFilteredData(res);

                if (onStatsUpdate) {
                    const stats = {
                        pending: res.filter((i) => i.status === 'PENDING').length,
                        inProgress: res.filter((i) => i.status === 'IN_PROGRESS').length,
                        done: res.filter((i) => i.status === 'DONE').length,
                    };
                    onStatsUpdate(stats);
                }
            } catch (error) {
                message.error(error.message);
            }
        },
        [canAssignFeedback, hasITDepartmentRole, currentEmployeeCode, onStatsUpdate],
    );

    useEffect(() => {
        fetchSystemFeedback(debouncedKeyword);
    }, [fetchSystemFeedback, reloadTrigger, debouncedKeyword]);

    const handleDelete = async (id) => {
        try {
            await systemFeedbackService.deleteSystemFeedback(id);
            fetchSystemFeedback();
        } catch (error) {
            message.error(error?.message || 'Xóa event thất bại');
        }
    };

    const columns = [
        {
            title: 'STT',
            render: (_, __, index) => <span className="text-xs sm:text-sm">{index + 1}</span>,
            width: 50,
            align: 'center',
            responsive: ['sm'],
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            width: 150,
            render: (text) => (
                <span className="font-medium text-slate-700 text-xs sm:text-sm">
                    {highlightText(text, debouncedKeyword)}
                </span>
            ),
        },
        {
            title: 'Chức năng',
            dataIndex: 'module',
            width: 200,
            align: 'center',
            responsive: ['md'],

            render: (module) => (
                <Tag className="text-xs" color="blue">
                    {highlightText(module || 'Chưa phân loại', debouncedKeyword)}
                </Tag>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'content',
            width: 300,
            render: (text) => (
                <div style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
                    {highlightText(text, debouncedKeyword)}
                </div>
            ),
        },

        {
            title: 'Nhân viên xử lý',
            dataIndex: 'assignToEmployeeCode',
            align: 'center',
            width: 130,
            responsive: ['lg'],
            render: (code, record) => (
                <Tooltip title={code || 'Chưa có ai xử lý'} placement="top">
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Tag
                            className={`bg-accent-100 ${record.assignToEmployeeName ? 'text-accent-700 border-accent-300' : 'bg-slate-100 text-slate-600 border-slate-300'} font-medium text-xs sm:text-sm`}
                        >
                            {highlightText(record.assignToEmployeeName || 'Chưa có', debouncedKeyword)}
                        </Tag>
                    </div>
                </Tooltip>
            ),
        },
        {
            title: 'Phản hồi từ IT',
            dataIndex: 'response',
            width: 300,
            ellipsis: true,
            render: (text) => (
                <div
                    className="text-slate-600 text-xs sm:text-sm line-clamp-2"
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                    {highlightText(text, debouncedKeyword)}
                </div>
            ),
        },
        {
            title: 'Loại',
            dataIndex: 'requestType',
            align: 'center',
            width: 100,
            responsive: ['md'],
            filters: [
                { text: 'Yêu cầu', value: 'REQUEST' },
                { text: 'Báo lỗi', value: 'BUG' },
                { text: 'Góp ý', value: 'SUGGESTION' },
            ],
            onFilter: (value, record) => record.requestType === value,
            render: (type) => renderSystemType(type),
        },
        {
            title: 'Ưu tiên',
            dataIndex: 'priority',
            align: 'center',
            width: 150,
            responsive: ['lg'],
            filters: [
                { text: 'Cao', value: 'HIGH' },
                { text: 'Trung bình', value: 'MEDIUM' },
                { text: 'Thấp', value: 'LOW' },
            ],
            onFilter: (value, record) => record.priority === value,
            render: (priority) => {
                let name = '';
                let className = '';
                if (priority === 'LOW') {
                    name = 'Thấp';
                    className = 'bg-green-100 text-green-700 border-green-300';
                } else if (priority === 'MEDIUM') {
                    name = 'Trung bình';
                    className = 'bg-orange-100 text-orange-700 border-orange-300';
                } else if (priority === 'HIGH') {
                    name = 'Cao';
                    className = 'bg-red-100 text-red-700 border-red-300';
                } else {
                    name = 'Chưa đánh giá';
                    className = 'bg-slate-100 text-slate-600 border-slate-300';
                }
                return (
                    <Tag className={`${className} font-medium px-2 py-0.5 text-xs sm:text-sm`} bordered={false}>
                        {name}
                    </Tag>
                );
            },
        },
        {
            title: 'Tạo bởi',
            dataIndex: 'createdByEmployeeCode',
            align: 'center',
            width: 100,
            responsive: ['lg'],
            render: (code, record) => (
                <Tooltip title={code} placement="top">
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Tag className="bg-accent-100 text-accent-700 border-accent-300 font-medium text-xs sm:text-sm">
                            {record.createdByEmployeeName || 'Chưa có'}
                        </Tag>
                    </div>
                </Tooltip>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            align: 'center',
            width: 110,
            filters: [
                { text: 'Chờ xử lý', value: 'PENDING' },
                { text: 'Đang xử lý', value: 'IN_PROGRESS' },
                { text: 'Hoàn thành', value: 'DONE' },
                { text: 'Từ chối', value: 'REJECTED' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => {
                let name = '';
                let shortName = '';
                let className = '';
                if (status === 'PENDING') {
                    name = 'Chờ xử lý';
                    shortName = 'Chờ';
                    className = 'bg-blue-100 text-blue-700 border-blue-300';
                } else if (status === 'IN_PROGRESS') {
                    name = 'Đang xử lý';
                    shortName = 'Đang';
                    className = 'bg-orange-100 text-orange-700 border-orange-300';
                } else if (status === 'DONE') {
                    name = 'Hoàn thành';
                    shortName = 'Xong';
                    className = 'bg-green-100 text-green-700 border-green-300';
                } else if (status === 'REJECTED') {
                    name = 'Từ chối';
                    shortName = 'Từ chối';
                    className = 'bg-red-100 text-red-700 border-red-300';
                }
                return (
                    <Tooltip title={name}>
                        <Tag className={`${className} font-medium px-2 py-0.5 text-xs sm:text-sm`} bordered={false}>
                            <span className="hidden sm:inline">{name}</span>
                            <span className="sm:hidden">{shortName}</span>
                        </Tag>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            width: 120,
            responsive: ['lg'],
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            sortDirections: ['descend', 'ascend'],
            render: (date) => {
                const formattedDate = new Date(date).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });
                return (
                    <Tooltip title={formattedDate}>
                        <span className="text-slate-600 text-xs sm:text-sm whitespace-nowrap">{formattedDate}</span>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Files',
            dataIndex: 'files',
            width: 200,
            responsive: ['md'],
            render: (files) => {
                if (!files || files.length === 0) {
                    return <span className="text-slate-400 italic text-xs sm:text-sm">Không có</span>;
                }

                const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

                const imageFiles = files.filter(
                    (file) => file.filePath && imageExtensions.includes(file.filePath.split('.').pop().toLowerCase()),
                );

                const normalFiles = files.filter(
                    (file) => file.filePath && !imageExtensions.includes(file.filePath.split('.').pop().toLowerCase()),
                );

                return (
                    <div className="max-w-[200px]">
                        {imageFiles.length > 0 && (
                            <Image.PreviewGroup>
                                <div className="flex flex-wrap gap-1">
                                    {imageFiles.map((file, index) => (
                                        <Image
                                            key={index}
                                            height={60}
                                            width={60}
                                            className="rounded object-cover"
                                            src={`${process.env.REACT_APP_UPLOAD_URL}/${file.filePath}`}
                                            preview={{ mask: <EyeOutlined /> }}
                                        />
                                    ))}
                                </div>
                            </Image.PreviewGroup>
                        )}

                        {normalFiles.length > 0 && (
                            <div className="mt-2 space-y-1">
                                {normalFiles.map((file, index) => {
                                    const fileName = file.filePath ? file.filePath.split('/').pop() : 'Unknown file';
                                    const shortName =
                                        fileName.length > 20 ? fileName.substring(0, 20) + '...' : fileName;

                                    return (
                                        <div key={index}>
                                            <Tooltip title={fileName}>
                                                <a
                                                    href={`${process.env.REACT_APP_UPLOAD_URL}/${file.filePath}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 text-xs block truncate"
                                                >
                                                    📄 {shortName}
                                                </a>
                                            </Tooltip>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 100,
            align: 'center',
            fixed: 'right',
            render: (_, record) => {
                return (
                    <Space size="small" className="flex-nowrap">
                        <Tooltip title="Chỉnh sửa" placement="top">
                            <Button
                                size="small"
                                className="border-accent-300 text-accent-600 hover:bg-accent-50 hover:border-accent-500 sm:h-8"
                                icon={<EditOutlined className="text-xs sm:text-sm" />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onEdit) onEdit(record);
                                }}
                            />
                        </Tooltip>
                        {(canAssignFeedback || hasITDepartmentRole) && (
                            <Tooltip title="Giao việc" placement="top">
                                <Button
                                    size="small"
                                    className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-500 sm:h-8"
                                    icon={<SendOutlined className="text-xs sm:text-sm" />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onAssign) onAssign(record);
                                    }}
                                />
                            </Tooltip>
                        )}

                        <Tooltip title="Xóa" placement="top">
                            <Popconfirm
                                title="Bạn có chắc muốn xóa báo cáo này?"
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true, className: 'bg-red-500 hover:bg-red-600' }}
                                onConfirm={() => handleDelete(record.id)}
                            >
                                <Button
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined className="text-xs sm:text-sm" />}
                                    className="hover:bg-red-50 sm:h-8"
                                />
                            </Popconfirm>
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    const highlightText = (text, keyword) => {
        if (!keyword || !text) return text;

        const regex = new RegExp(`(${keyword})`, 'gi');

        return (
            <span>
                {text.split(regex).map((part, index) =>
                    part.toLowerCase() === keyword.toLowerCase() ? (
                        <mark key={index} className="bg-yellow-200 text-slate-900 px-0.5 rounded">
                            {part}
                        </mark>
                    ) : (
                        part
                    ),
                )}
            </span>
        );
    };

    return (
        <div className="overflow-x-auto -mx-2 sm:mx-0 h-full">
            <Input
                placeholder="Tìm kiếm toàn bộ (tiêu đề, mô tả, nhân viên, module, phản hồi...)"
                prefix={<SearchOutlined className="text-slate-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                size="middle"
                className="mb-3"
            />
            <Table
                dataSource={filteredData || []}
                rowKey="id"
                columns={columns}
                bordered={true}
                scroll={{
                    y: 'calc(100vh - 182px - 120px)',
                    x: 'max-content',
                }}
                rowClassName={(record, index) =>
                    index % 2 === 0 ? 'bg-slate-50 hover:bg-accent-50' : 'bg-white hover:bg-accent-50'
                }
                pagination={false}
                size="small"
                locale={{
                    emptyText: (
                        <div className="py-8 text-center">
                            <BulbOutlined className="text-4xl text-slate-300 mb-2" />
                            <p className="text-slate-400 text-sm">Chưa có góp ý nào</p>
                        </div>
                    ),
                }}
            />
        </div>
    );
};

export default SystemFeedbackTable;
