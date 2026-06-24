import { DeleteOutlined, EditOutlined, UndoOutlined } from '@ant-design/icons';
import { Button, Form, message, Popconfirm, Space, Spin, Table, Tabs } from 'antd';
import { UserCheck } from 'lucide-react';
import { useEffect, useReducer, useState } from 'react';

import TabPane from 'antd/es/tabs/TabPane';
import PageHeader from '~/components/PageHeader';
import authService from '~/modules/auth/services/authService';
import permissionService from '~/modules/authorization/services/permissionService';
import roleService from '~/modules/authorization/services/roleService';
import employeeService from '~/modules/employee/services/employeeService';
import AddPermissionModal from '../components/AddPermissionModal';
import EmployeePermissionsTab from '../components/EmployeePermissionsTab';
import PermissionListTab from '../components/PermissionListTab';
import RolePermissionsTab from '../components/RolePermissionsTab';

const initialState = {
    roles: [],
    permissions: [],
    employees: [],
    allEmployees: [],
    selectedItem: null,
    selectionType: 'role',
    itemPermissions: [],
    isModalOpen: false,
    isUpdating: false,
    loading: true,
    searchQuery: '',
    selectedRole: null,
};

function reducer(state, action) {
    switch (action.type) {
        case 'LOAD_DATA_SUCCESS':
            return {
                ...state,
                roles: action.payload.roles,
                permissions: action.payload.permissions,
                employees: action.payload.employees,
                allEmployees: action.payload.employees,
                loading: false,
            };
        case 'SET_SELECTION':
            return {
                ...state,
                selectionType: action.payload.type,
                selectedItem: action.payload.item,
                itemPermissions: action.payload.permissions,
                selectedRole: action.payload.type === 'employee' ? action.payload.item?.role || null : null,
            };
        case 'TOGGLE_PERMISSION':
            const hasPerm = state.itemPermissions.includes(action.payload.permCode);
            return {
                ...state,
                itemPermissions: hasPerm
                    ? state.itemPermissions.filter((p) => p !== action.payload.permCode)
                    : [...state.itemPermissions, action.payload.permCode],
            };
        case 'SET_UPDATING':
            return {
                ...state,
                isUpdating: action.payload,
            };
        case 'SET_MODAL_OPEN':
            return { ...state, isModalOpen: action.payload };
        case 'FILTER_EMPLOYEES':
            return { ...state, employees: action.payload };
        case 'ADD_PERMISSION_SUCCESS':
            return { ...state, permissions: action.payload };
        case 'SET_SEARCH_QUERY':
            return { ...state, searchQuery: action.payload };
        case 'SET_SELECTED_ROLE':
            return { ...state, selectedRole: action.payload };
        default:
            return state;
    }
}

export default function RolePermissionManager() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [form] = Form.useForm();
    const [expandedPermissionKeys, setExpandedPermissionKeys] = useState([]);
    const [permissionEmployees, setPermissionEmployees] = useState({});
    const [permissionEmployeesLoading, setPermissionEmployeesLoading] = useState({});
    const [editingPermissionCode, setEditingPermissionCode] = useState(null);

    const permissionColumns = [
        { title: 'STT', dataIndex: 'index', key: 'index', width: '10%', render: (_, __, index) => index + 1 },
        {
            title: 'Mã quyền',
            dataIndex: 'code',
            key: 'code',
            width: '30%',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Hành động',
            key: 'action',
            width: '20%',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                            form.setFieldsValue({ code: record.code, description: record.description });
                            setEditingPermissionCode(record.code);
                            dispatch({ type: 'SET_MODAL_OPEN', payload: true });
                        }}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa quyền này?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDeletePermission(record.code)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const permissionEmployeeColumns = (permissionCode) => [
        { title: 'Mã NV', dataIndex: 'code', key: 'code', width: '20%' },
        { title: 'Tên nhân viên', dataIndex: 'name', key: 'name' },
        { title: 'Vai trò', dataIndex: 'role', key: 'role', width: '20%' },
        {
            title: 'Hành động',
            key: 'action',
            width: '20%',
            render: (_, record) => (
                <Popconfirm
                    title="Thu hồi quyền này?"
                    onConfirm={() => handleRevokeEmployeePermission(record.id, permissionCode)}
                    okText="Thu hồi"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                >
                    <Button danger icon={<UndoOutlined />}>
                        Thu hồi
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [r, p, e] = await Promise.all([
                roleService.getAllRoles(),
                permissionService.getAllPermissions(),
                employeeService.getAllEmployees(),
            ]);
            dispatch({ type: 'LOAD_DATA_SUCCESS', payload: { roles: r, permissions: p, employees: e } });
        } catch (err) {
            message.error(err.message);
        }
    };

    const handleSelect = async (item, type) => {
        let perms = [];
        let selected = item;
        if (type === 'role') {
            perms = await permissionService.getPermissionsByRole(item.code);
        } else {
            selected = await employeeService.getEmployeeById(item.id);
            perms = await permissionService.getPermissionsByEmployee(item.id);
        }
        dispatch({ type: 'SET_SELECTION', payload: { item: selected, type, permissions: perms } });
    };

    const handleTogglePermission = async (permCode) => {
        const { selectedItem, selectionType, itemPermissions } = state;
        const hasPerm = itemPermissions.includes(permCode);

        dispatch({ type: 'SET_UPDATING', payload: true });
        try {
            if (selectionType === 'role') {
                if (hasPerm) {
                    await permissionService.revokePermissionFromRole(selectedItem.code, permCode);
                } else {
                    await permissionService.assignPermissionToRole(selectedItem.code, permCode);
                }
            } else {
                if (hasPerm) {
                    await permissionService.revokePermissionFromEmployee(selectedItem.id, permCode);
                } else {
                    await permissionService.grantPermissionToEmployee(selectedItem.id, permCode);
                }
            }
            dispatch({ type: 'TOGGLE_PERMISSION', payload: { permCode } });
        } catch (err) {
            message.error('Cập nhật quyền thất bại: ' + err.message);

            handleSelect(selectedItem, selectionType);
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false });
        }
    };

    const handleUpdateEmployeeRole = async () => {
        const { selectedItem, selectedRole } = state;
        if (!selectedItem || !selectedRole) {
            message.warning('Vui lòng chọn nhân viên và vai trò');
            return;
        }
        if (!authService.hasRole('SUPERADMIN')) {
            message.error('Bạn không có quyền thay đổi vai trò nhân viên');
            return;
        }
        dispatch({ type: 'SET_UPDATING', payload: true });
        try {
            await employeeService.updateEmployeeRole(selectedItem.id, selectedRole);
            const refreshed = await employeeService.getEmployeeById(selectedItem.id);
            const perms = await permissionService.getPermissionsByEmployee(selectedItem.id);
            message.success('Cập nhật vai trò nhân viên thành công');

            dispatch({
                type: 'SET_SELECTION',
                payload: { item: refreshed, type: 'employee', permissions: perms },
            });
        } catch (err) {
            message.error('Không thể cập nhật vai trò: ' + err.message);
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false });
        }
    };

    const handleTabChange = (type) => {
        dispatch({ type: 'SET_SELECTION', payload: { item: null, type, permissions: [] } });
        dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
        dispatch({ type: 'SET_SELECTED_ROLE', payload: null });
    };

    const getCardTitle = () => {
        if (!state.selectedItem) {
            return 'Phân quyền chi tiết';
        }
        if (state.selectionType === 'role') {
            return `Quyền cho vai trò: ${state.selectedItem.description}`;
        }
        return `Quyền cho nhân viên: ${state.selectedItem.name}`;
    };

    const getFilteredPermissions = () => {
        if (!state.searchQuery.trim()) {
            return state.permissions;
        }
        const query = state.searchQuery.toLowerCase();
        return state.permissions.filter(
            (perm) => perm.code.toLowerCase().includes(query) || perm.description.toLowerCase().includes(query),
        );
    };

    const handlePermissionExpand = async (expanded, record) => {
        const code = record.code;
        if (expanded) {
            setExpandedPermissionKeys((prev) => [...new Set([...prev, code])]);
            if (!permissionEmployees[code]) {
                setPermissionEmployeesLoading((prev) => ({ ...prev, [code]: true }));
                try {
                    const employees = await permissionService.getEmployeesByPermission(code);
                    setPermissionEmployees((prev) => ({ ...prev, [code]: employees }));
                } catch (err) {
                    message.error(err.message || 'Không thể tải danh sách nhân viên theo quyền');
                } finally {
                    setPermissionEmployeesLoading((prev) => ({ ...prev, [code]: false }));
                }
            }
        } else {
            setExpandedPermissionKeys((prev) => prev.filter((key) => key !== code));
        }
    };

    const renderPermissionEmployees = (code) => {
        if (permissionEmployeesLoading[code]) {
            return (
                <div className="py-4">
                    <Spin />
                </div>
            );
        }

        const employees = permissionEmployees[code] || [];
        if (employees.length === 0) {
            return <div className="py-4 text-slate-600 dark:text-slate-400">Không có nhân viên được cấp quyền này</div>;
        }

        return (
            <Table
                columns={permissionEmployeeColumns(code)}
                dataSource={employees}
                rowKey="id"
                size="small"
                pagination={false}
            />
        );
    };

    const handleRevokeEmployeePermission = async (employeeId, permissionCode) => {
        try {
            await permissionService.revokePermissionFromEmployee(employeeId, permissionCode);
            setPermissionEmployees((prev) => ({
                ...prev,
                [permissionCode]: (prev[permissionCode] || []).filter((emp) => emp.id !== employeeId),
            }));
            if (
                state.selectionType === 'employee' &&
                state.selectedItem?.id === employeeId &&
                state.itemPermissions.includes(permissionCode)
            ) {
                dispatch({ type: 'TOGGLE_PERMISSION', payload: { permCode: permissionCode } });
            }
            message.success('Đã thu hồi quyền khỏi nhân viên');
        } catch (err) {
            message.error(err.message || 'Thu hồi quyền thất bại');
        }
    };

    const handleDeletePermission = async (code) => {
        try {
            await permissionService.deletePermission(code);
            const refreshed = await permissionService.getAllPermissions();
            dispatch({ type: 'ADD_PERMISSION_SUCCESS', payload: refreshed });
            setExpandedPermissionKeys((prev) => prev.filter((key) => key !== code));
            setPermissionEmployees((prev) => {
                const next = { ...prev };
                delete next[code];
                return next;
            });
            if (state.itemPermissions.includes(code)) {
                dispatch({ type: 'TOGGLE_PERMISSION', payload: { permCode: code } });
            }
            message.success('Xóa quyền thành công');
        } catch (err) {
            message.error(err.message || 'Xóa quyền thất bại');
        }
    };

    const handleSubmitPermission = async () => {
        try {
            const v = await form.validateFields();
            if (editingPermissionCode) {
                await permissionService.updatePermission(editingPermissionCode, v.description);
                message.success('Cập nhật quyền thành công');
            } else {
                await permissionService.createPermission(v.code, v.description);
                message.success('Tạo mới thành công');
            }
            const refreshed = await permissionService.getAllPermissions();
            dispatch({ type: 'ADD_PERMISSION_SUCCESS', payload: refreshed });
            dispatch({ type: 'SET_MODAL_OPEN', payload: false });
            setEditingPermissionCode(null);
            form.resetFields();
        } catch (err) {
            message.error(err.message || 'Lưu quyền thất bại');
        }
    };

    const handleOpenCreatePermission = () => {
        setEditingPermissionCode(null);
        form.resetFields();
        dispatch({ type: 'SET_MODAL_OPEN', payload: true });
    };

    const permissionDetailProps = {
        title: getCardTitle(),
        selectedItem: state.selectedItem,
        selectionType: state.selectionType,
        roles: state.roles,
        selectedRole: state.selectedRole,
        searchQuery: state.searchQuery,
        isUpdating: state.isUpdating,
        filteredPermissions: getFilteredPermissions(),
        itemPermissions: state.itemPermissions,
        onOpenCreate: handleOpenCreatePermission,
        onSelectRoleChange: (value) => dispatch({ type: 'SET_SELECTED_ROLE', payload: value }),
        onUpdateEmployeeRole: handleUpdateEmployeeRole,
        onSearchChange: (value) => dispatch({ type: 'SET_SEARCH_QUERY', payload: value }),
        onClearSearch: () => dispatch({ type: 'SET_SEARCH_QUERY', payload: '' }),
        onTogglePermission: handleTogglePermission,
    };

    return (
        <Spin spinning={state.loading}>
            <PageHeader title="Quản lý Quyền Hạn" icon={UserCheck} description="Phân quyền vai trò và nhân viên" />
            <Tabs
                defaultActiveKey="permission-list"
                onChange={(key) =>
                    handleTabChange(
                        key === 'employee-permissions'
                            ? 'employee'
                            : key === 'role-permissions'
                              ? 'role'
                              : state.selectionType,
                    )
                }
            >
                <TabPane
                    tab={
                        <div className="flex items-center gap-2">
                            <UserCheck size={18} />
                            <span>Danh sách quyền hạn</span>
                        </div>
                    }
                    key="permission-list"
                >
                    <PermissionListTab
                        permissions={state.permissions}
                        permissionColumns={permissionColumns}
                        expandedPermissionKeys={expandedPermissionKeys}
                        onExpand={handlePermissionExpand}
                        renderPermissionEmployees={renderPermissionEmployees}
                        onOpenCreate={handleOpenCreatePermission}
                    />
                </TabPane>
                <TabPane
                    tab={
                        <div className="flex items-center gap-2">
                            <UserCheck size={18} />
                            <span>Quyền theo nhân viên</span>
                        </div>
                    }
                    key="employee-permissions"
                >
                    <EmployeePermissionsTab
                        onSelectEmployee={(emp) => handleSelect(emp, 'employee')}
                        detailProps={permissionDetailProps}
                    />
                </TabPane>
                <TabPane
                    tab={
                        <div className="flex items-center gap-2">
                            <UserCheck size={18} />
                            <span>Quyền theo vai trò</span>
                        </div>
                    }
                    key="role-permissions"
                >
                    <RolePermissionsTab
                        roles={state.roles}
                        onSelectRole={(role) => handleSelect(role, 'role')}
                        detailProps={permissionDetailProps}
                    />
                </TabPane>
            </Tabs>
            <AddPermissionModal
                open={state.isModalOpen}
                onCancel={() => {
                    dispatch({ type: 'SET_MODAL_OPEN', payload: false });
                    setEditingPermissionCode(null);
                    form.resetFields();
                }}
                form={form}
                onSubmit={handleSubmitPermission}
                title={editingPermissionCode ? 'Cập nhật quyền' : 'Thêm quyền mới'}
                okText={editingPermissionCode ? 'Cập nhật' : 'Tạo mới'}
                codeDisabled={Boolean(editingPermissionCode)}
            />
        </Spin>
    );
}
