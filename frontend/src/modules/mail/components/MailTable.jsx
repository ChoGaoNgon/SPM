import React from 'react';
import { Table, Button, Space } from 'antd';

const MailTable = ({ data, loading, onEdit, onDelete }) => {
    const columns = [
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Tên hiển thị', dataIndex: 'displayName', key: 'displayName' },
        { title: 'Phòng ban', dataIndex: 'departmentName', key: 'departmentName' },
        {
            title: 'Hoạt động',
            dataIndex: 'active',
            key: 'active',
            render: (val) => (val ? 'Có' : 'Không'),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => onEdit(record)}>
                        Sửa
                    </Button>
                    <Button size="small" danger onClick={() => onDelete(record)}>
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return <Table columns={columns} dataSource={data} loading={loading} pagination={{ pageSize: 10 }} />;
};

export default MailTable;
