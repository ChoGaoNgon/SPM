import React, { useCallback, useEffect, useState } from 'react';
import { message, Table, Typography, Tag } from 'antd';

import productPlanDelayLogService from '../../services/productPlanDelayLogService';
import { formatDateTime } from '~/utils/formatter';

const { Text } = Typography;

const ProductPlanDelayLogTable = ({ productPlanId, reloadTrigger }) => {
    const [loading, setLoading] = useState(false);
    const [delayLogs, setDelayLogs] = useState([]);

    const fetchDelayLogs = useCallback(async () => {
        if (!productPlanId) {
            setDelayLogs([]);
            return;
        }

        setLoading(true);
        try {
            const data = await productPlanDelayLogService.getDelayLogsByPlanId(productPlanId);
            setDelayLogs(Array.isArray(data) ? data : []);
        } catch (error) {
            message.error(error?.message || 'Lỗi khi tải danh sách log trễ kế hoạch');
            setDelayLogs([]);
        } finally {
            setLoading(false);
        }
    }, [productPlanId]);

    useEffect(() => {
        fetchDelayLogs();
    }, [fetchDelayLogs, reloadTrigger]);

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 70,
            align: 'center',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Thời lượng trễ (phút)',
            dataIndex: 'delayDuration',
            key: 'delayDuration',
            width: 180,
            align: 'center',
            render: (value) => (typeof value === 'number' ? value.toLocaleString() : '-'),
        },
        {
            title: 'Loại trễ',
            dataIndex: 'delayTypeDescription',
            key: 'delayTypeDescription',
            width: 200,
            align: 'center',
            render: (value) => (value ? <Tag color="red">{value}</Tag> : <Text type="secondary">-</Text>),
        },
        {
            title: 'Lý do trễ',
            dataIndex: 'reason',
            key: 'reason',
            align: 'left',
            render: (value) => value || <Text type="secondary">Không có</Text>,
        },
        {
            title: 'Người cập nhật',
            dataIndex: 'createdBy',
            key: 'createdBy',
            width: 180,
            align: 'center',
            render: (value) => value || <Text type="secondary">-</Text>,
        },
        {
            title: 'Thời gian trễ',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 190,
            align: 'center',
            render: (value) => (value ? formatDateTime(value) : '-'),
        },
    ];

    return (
        <Table
            rowKey={(record, index) => record?.id || index}
            columns={columns}
            dataSource={delayLogs}
            loading={loading}
            bordered
            size="small"
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
            }}
            locale={{
                emptyText: <Text type="secondary">Chưa có log trễ kế hoạch</Text>,
            }}
            scroll={{ x: 1100 }}
        />
    );
};

export default ProductPlanDelayLogTable;
