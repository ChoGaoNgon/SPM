import { KeyOutlined, SyncOutlined, TeamOutlined, UserDeleteOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Input, message, Popconfirm, Space, Spin, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { UserCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '~/components/PageHeader';
import { useTheme } from '~/contexts/ThemeContext';
import authService from '~/modules/auth/services/authService';
import roleService from '~/modules/authorization/services/roleService';
import departmentService from '~/modules/department/services/departmentService';
import employeeService from '~/modules/employee/services/employeeService';
import positionService from '~/modules/position/services/positionService';

function EmployeeManagerPage() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState([]);
    const [statusFilter, setStatusFilter] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [statusStats, setStatusStats] = useState({});
    const [statsLoading, setStatsLoading] = useState(false);
    const [departmentFilter, setDepartmentFilter] = useState([]);
    const [positionFilter, setPositionFilter] = useState(null);
    const [roleFilter, setRoleFilter] = useState(null);
    const [employeeTypeFilter, setEmployeeTypeFilter] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [sortBy, setSortBy] = useState('id');
    const [sortDirection, setSortDirection] = useState('ASC');

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const pageSize = 50;

    const collectNestedDepartmentIds = useCallback((departmentNodes = []) => {
        return departmentNodes.flatMap((department) => [
            department.id,
            ...collectNestedDepartmentIds(department.subDepartments || []),
        ]);
    }, []);

    const collectDepartmentIds = useCallback(
        (departmentId, departmentNodes = departments || []) => {
            for (const department of departmentNodes) {
                if (department.id === departmentId) {
                    return [department.id, ...collectNestedDepartmentIds(department.subDepartments || [])];
                }

                const nestedIds = collectDepartmentIds(departmentId, department.subDepartments || []);
                if (nestedIds.length > 0) {
                    return nestedIds;
                }
            }

            return [];
        },
        [collectNestedDepartmentIds, departments],
    );

    const flattenDepartmentFilters = useCallback((departmentNodes = []) => {
        return departmentNodes.flatMap((department) => {
            return [
                { text: department.name, value: department.id },
                ...flattenDepartmentFilters(department.subDepartments || []),
            ];
        });
    }, []);

    const getAntdSortOrder = useCallback(
        (field) => {
            if (sortBy !== field) {
                return null;
            }

            return sortDirection === 'DESC' ? 'descend' : 'ascend';
        },
        [sortBy, sortDirection],
    );

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const data = await roleService.getAllRoles();
            setRoles(data);
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployeeStats = async () => {
        setStatsLoading(true);
        try {
            const data = await employeeService.getEmployeeStats();
            setStatusStats(data);
            setTotalEmployees(data.total || 0);
        } catch (error) {
            message.error(error.message);
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchEmployees = useCallback(
        async (pageNumber = 0, append = false) => {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            setIsSearching(false);
            try {
                const departmentIds = Array.from(
                    new Set((departmentFilter || []).flatMap((departmentId) => collectDepartmentIds(departmentId))),
                );
                const searchRequest = {
                    keyword: searchText || null,
                    status: statusFilter || null,
                    role: roleFilter || null,
                    employeeType: employeeTypeFilter || null,
                    departmentIds: departmentIds.length > 0 ? departmentIds : null,
                    positionId: positionFilter || null,
                    withDepartment: true,
                    withPosition: true,
                };
                const response = await employeeService.searchEmployeesWithPagination(
                    searchRequest,
                    pageNumber,
                    pageSize,
                    sortBy,
                    sortDirection,
                );

                const nextEmployees = response?.content || [];

                if (append) {
                    setEmployees((prev) => [...prev, ...nextEmployees]);
                } else {
                    setEmployees(nextEmployees);
                }

                setPage(pageNumber);
                setHasMore(!response?.last);
            } catch (error) {
                message.error(error.message);
            } finally {
                if (append) {
                    setLoadingMore(false);
                } else {
                    setLoading(false);
                }
            }
        },
        [
            collectDepartmentIds,
            departmentFilter,
            employeeTypeFilter,
            pageSize,
            positionFilter,
            roleFilter,
            searchText,
            sortBy,
            sortDirection,
            statusFilter,
        ],
    );

    const fetchDepartments = async () => {
        try {
            const data = await departmentService.getRootDepartments();
            setDepartments(data || []);
        } catch (error) {
            message.error(error.message);
        }
    };

    const fetchPositions = async () => {
        try {
            const data = await positionService.getAllPositions();
            setPositions(data || []);
        } catch (error) {
            message.error(error.message);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await Promise.all([fetchDepartments(), fetchPositions(), fetchRoles(), fetchEmployeeStats()]);
            } catch (error) {
            }
        };
        fetchInitialData();
    }, []);

    const handleTableScroll = useCallback(
        (e) => {
            const target = e.target;
            if (!target) return;

            const scrollTop = target.scrollTop;
            const scrollHeight = target.scrollHeight;
            const clientHeight = target.clientHeight;
            const scrollThreshold = 100;

            if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {
                if (!loadingMore && hasMore && !loading) {
                    fetchEmployees(page + 1, true);
                }
            }
        },
        [loadingMore, hasMore, loading, page, fetchEmployees],
    );

    useEffect(() => {
        const tableBody = document.querySelector('.ant-table-body');
        if (tableBody) {
            tableBody.addEventListener('scroll', handleTableScroll);
            return () => tableBody.removeEventListener('scroll', handleTableScroll);
        }
    }, [handleTableScroll]);

    useEffect(() => {
        const timeoutId = setTimeout(
            () => {
                setPage(0);
                setHasMore(true);
                fetchEmployees(0, false);
            },
            searchText ? 300 : 0,
        );

        return () => clearTimeout(timeoutId);
    }, [fetchEmployees, searchText]);

    const handleTableChange = useCallback(
        (_, filters, sorter) => {
            const nextDepartmentFilter = filters?.departmentId ?? [];
            const nextPositionFilter = filters?.position?.[0] ?? null;
            const nextStatusFilter = filters?.status?.[0] ?? null;
            const nextRoleFilter = filters?.role?.[0] ?? null;

            setDepartmentFilter(nextDepartmentFilter);
            setPositionFilter(nextPositionFilter);
            setStatusFilter(nextStatusFilter);
            setRoleFilter(nextRoleFilter);

            if (sorter?.order) {
                const nextSortBy = sorter.columnKey === 'employee' ? 'code' : sorter.field || 'id';
                setSortBy(nextSortBy);
                setSortDirection(sorter.order === 'descend' ? 'DESC' : 'ASC');
            } else {
                setSortBy('id');
                setSortDirection('ASC');
            }

            if (searchText) {
                setIsSearching(false);
            }
        },
        [searchText],
    );

    const handleSync = async () => {
        try {
            setLoading(true);
            await employeeService.syncEmployeeData();
            message.success('Đồng bộ nhân viên thành công');
            setPage(0);
            setHasMore(true);
            await Promise.all([fetchEmployees(0, false), fetchEmployeeStats()]);
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (employee) => {
        try {
            const resultMessage = await employeeService.resetEmployeePassword(employee.id);
            message.success(resultMessage || `Đã reset mật khẩu cho ${employee.name}`);
        } catch (error) {
            message.error(error.message);
        }
    };

    const roleColors = {
        SUPERADMIN: 'red',
        ADMIN: 'volcano',
        MANAGER: 'blue',
        HEAD: 'geekblue',
        DIRECTOR: 'purple',
        LEADER: 'cyan',
        HR: 'green',
        EMPLOYEE: 'default',
    };

    const statusTextMap = {
        ACTIVE: 'Đang làm việc',
        INACTIVE: 'Đã nghỉ việc',
        PROBATION: 'Thử việc',
        RESIGNED: 'Từ chức',
    };

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: '100px',
            align: 'center',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'NHÂN VIÊN',
            dataIndex: 'name',
            fixed: 'left',
            key: 'employee',
            width: '200px',
            sorter: true,
            sortOrder: getAntdSortOrder('code'),
            render: (text, record) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {record.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <div className={`font-semibold text-xs text-gray-800 ${isDark ? 'text-white' : ''}`}>
                            {text}
                        </div>
                        <div className="text-xs text-gray-500">{record.code}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'PHÒNG BAN / BỘ PHẬN',
            key: 'departmentId',
            dataIndex: 'departmentId',
            width: '120px',
            filters: flattenDepartmentFilters(departments || []),
            filterMultiple: true,
            filteredValue: departmentFilter,
            render: (departmentId, record) => (
                <div className="text-xs text-gray-700">{record.departmentName || '-'}</div>
            ),
        },
        {
            title: 'CHỨC VỤ',
            key: 'position',
            dataIndex: 'positionId',
            width: '80px',
            filters: (positions || []).map((p) => ({ text: p.name, value: p.id })),
            filterMultiple: false,
            filteredValue: positionFilter ? [positionFilter] : null,
            render: (_, record) => <div className="text-xs text-gray-600">{record.positionName || '-'}</div>,
        },
        {
            title: 'LIÊN HỆ',
            key: 'contact',
            width: '120px',
            render: (_, record) => (
                <div className="flex flex-col">
                    <div className="text-xs text-gray-700">{record.phone || '-'}</div>
                    <div className="text-xs text-gray-500">{record.email || '-'}</div>
                </div>
            ),
        },
        {
            title: 'GIỚI TÍNH',
            dataIndex: 'gender',
            key: 'gender',
            width: '50px',
            render: (_, record) => (
                <div className="text-xs text-gray-700">{record.gender === 'MALE' ? 'Nam' : 'Nữ' || '-'}</div>
            ),
        },
        {
            title: 'NGÀY SINH',
            dataIndex: 'dateOfBirth',
            key: 'dateOfBirth',
            width: '8px',
            render: (_, record) => (
                <div className="text-xs text-gray-700">{dayjs(record.dateOfBirth).format('DD/MM/YYYY') || '-'}</div>
            ),
        },
        {
            title: 'NGÀY VÀO CÔNG TY',
            dataIndex: 'dateOfJoining',
            key: 'dateOfJoining',
            width: '50px',
            render: (_, record) => (
                <div className="text-xs text-gray-700">{dayjs(record.dateOfJoining).format('DD/MM/YYYY') || '-'}</div>
            ),
        },
        {
            title: 'TÌNH TRẠNG',
            dataIndex: 'status',
            key: 'status',
            width: '120px',
            filters: [
                { text: 'Đang làm việc', value: 'ACTIVE' },
                { text: 'Đã nghỉ việc', value: 'INACTIVE' },
                { text: 'Thử việc', value: 'PROBATION' },
                { text: 'Từ chức', value: 'RESIGNED' },
            ],
            filterMultiple: false,
            filteredValue: statusFilter ? [statusFilter] : null,
            render: (status) => {
                const statusText = statusTextMap[status] || status;

                let badgeColor = 'bg-green-100 text-green-700 border-green-300';
                if (status === 'INACTIVE') badgeColor = 'bg-red-100 text-red-700 border-red-300';
                else if (status === 'PROBATION') badgeColor = 'bg-yellow-100 text-yellow-700 border-yellow-300';

                return (
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${badgeColor}`}>
                        {statusText}
                    </span>
                );
            },
        },
        {
            title: 'VAI TRÒ',
            dataIndex: 'role',
            key: 'role',
            width: '12px',
            filters: (roles || []).map((r) => ({ text: r.description, value: r.code })),
            filterMultiple: false,
            filteredValue: roleFilter ? [roleFilter] : null,
            render: (role) => <Tag color={roleColors[role] || 'default'}>{role}</Tag>,
        },
        ...(authService.hasRole('SUPERADMIN')
            ? [
                  {
                      title: 'THAO TÁC',
                      key: 'actions',
                      width: 140,
                      fixed: 'right',
                      render: (_, record) => (
                          <Space>
                              <Popconfirm
                                  title="Reset mật khẩu nhân viên"
                                  description={`Mật khẩu của ${record.name} sẽ được reset về Htmp1234 và đăng xuất khỏi mọi phiên đang hoạt động.`}
                                  okText="Reset"
                                  cancelText="Hủy"
                                  onConfirm={() => handleResetPassword(record)}
                              >
                                  <Button icon={<KeyOutlined />} size="small">
                                      Reset mật khẩu
                                  </Button>
                              </Popconfirm>
                          </Space>
                      ),
                  },
              ]
            : []),
    ];

    const handleStatusFilterClick = useCallback((status) => {
        setStatusFilter((prev) => (prev === status ? null : status));
    }, []);

    return (
        <div className="bg-gradient-to-br  to-blue-50 min-h-screen">
            <PageHeader
                title="Quản lý nhân viên"
                description="Quản lý nhân viên trong công ty, bao gồm thông tin cá nhân, phòng ban, chức vụ và vai trò."
                icon={UserCircle}
            />

            <div className="flex gap-2 mb-3">
                <div className="w-48">
                    <div
                        className={`
                            bg-gradient-to-br from-green-400 to-green-600 rounded shadow-sm p-2 transition-all duration-300 cursor-pointer ${
                                statusFilter === 'ACTIVE' ? 'ring-2 ring-white shadow-lg' : ''
                            }`}
                        onClick={() => handleStatusFilterClick('ACTIVE')}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white text-[10px] font-medium opacity-90">Đang làm việc</p>
                                {statsLoading ? (
                                    <div className="animate-pulse h-4 w-10 bg-white bg-opacity-30 rounded"></div>
                                ) : (
                                    <h2 className="text-white text-base lg:text-lg font-bold">
                                        {statusStats?.statusCount?.ACTIVE || 0}
                                    </h2>
                                )}
                            </div>
                            <div className="bg-white bg-opacity-20 p-1 rounded hidden lg:block">
                                <UserOutlined className="text-white text-sm" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-48">
                    <div
                        className={`bg-gradient-to-br from-blue-400 to-blue-600 rounded shadow-sm p-2 transition-all duration-300 cursor-pointer ${
                            statusFilter === null ? 'ring-2 ring-white shadow-lg' : ''
                        }`}
                        onClick={() => setStatusFilter(null)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white text-[10px] font-medium opacity-90">Tổng số nhân viên</p>
                                <h2 className="text-white text-base lg:text-lg font-bold">{totalEmployees}</h2>
                            </div>
                            <div className="bg-white bg-opacity-20 p-1 rounded hidden lg:block">
                                <TeamOutlined className="text-white text-sm" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-48">
                    <div
                        className={`bg-gradient-to-br from-red-400 to-red-600 rounded shadow-sm p-2 transition-all duration-300 cursor-pointer ${
                            statusFilter === 'INACTIVE' ? 'ring-2 ring-white shadow-lg' : ''
                        }`}
                        onClick={() => handleStatusFilterClick('INACTIVE')}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white text-[10px] font-medium opacity-90">Đã nghỉ việc</p>
                                {statsLoading ? (
                                    <div className="animate-pulse h-4 w-10 bg-white bg-opacity-30 rounded"></div>
                                ) : (
                                    <h2 className="text-white text-base lg:text-lg font-bold">
                                        {statusStats?.statusCount?.INACTIVE || 0}
                                    </h2>
                                )}
                            </div>
                            <div className="bg-white bg-opacity-20 p-1 rounded hidden lg:block">
                                <UserDeleteOutlined className="text-white text-sm" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={`rounded-xl shadow-xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                style={{ display: 'flex', flexDirection: 'column' }}
            >
                <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Tìm kiếm theo tên, mã, số điện thoại..."
                                prefix={<span className={isDark ? 'text-slate-500' : 'text-gray-400'}>🔍</span>}
                                suffix={isSearching && <span className="text-blue-500">⏱️</span>}
                                className={`rounded-lg ${isDark ? 'dark:bg-slate-700 dark:border-slate-600' : ''}`}
                                value={searchText}
                                onChange={(e) => {
                                    setSearchText(e.target.value);
                                    setIsSearching(true);
                                }}
                            />
                        </div>
                        <div className="flex gap-2">
                            {authService.hasPermission('EMPLOYEE_SYNC') && (
                                <Button icon={<SyncOutlined />} onClick={handleSync}>
                                    Đồng bộ
                                </Button>
                            )}
                            {authService.hasRole('SUPERADMIN') && (
                                <Button onClick={() => navigate('/admin/permissions')}>Cấu hình quyền</Button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="mb-5">
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={employees}
                        loading={loading}
                        onChange={handleTableChange}
                        size="small"
                        bordered={true}
                        scroll={{ x: 'max-content', y: 'calc(100vh - 280px)' }}
                        className={`custom-table ${isDark ? 'dark' : ''}`}
                        pagination={false}
                    />

                    {loadingMore && (
                        <div style={{ textAlign: 'center', padding: '12px' }}>
                            <Spin tip="Đang tải thêm dữ liệu..." />
                        </div>
                    )}

                    {!hasMore && !loading && employees.length > 0 && (
                        <div style={{ textAlign: 'center', padding: '12px', color: '#999' }}>
                            Đã hiển thị tất cả {employees.length} nhân viên
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EmployeeManagerPage;
