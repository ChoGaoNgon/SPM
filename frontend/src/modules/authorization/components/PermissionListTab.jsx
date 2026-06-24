import React from 'react';
import { Table, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function PermissionListTab({
    permissions,
    permissionColumns,
    expandedPermissionKeys,
    onExpand,
    renderPermissionEmployees,
    onOpenCreate,
}) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bảng danh sách quyền hạn</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Tổng cộng {permissions.length} quyền</p>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={onOpenCreate}>
                    Thêm quyền mới
                </Button>
            </div>
            <div className="p-4">
                <Table
                    columns={permissionColumns}
                    dataSource={permissions}
                    rowKey="code"
                    pagination={{ pageSize: 10 }}
                    expandable={{
                        expandedRowKeys: expandedPermissionKeys,
                        onExpand,
                        expandedRowRender: (record) => renderPermissionEmployees(record.code),
                    }}
                />
            </div>
        </div>
    );
}
