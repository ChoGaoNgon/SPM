import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, message, Spin, Input } from 'antd';
import defectCodeService from '../services/QCService';

const DefectCodeTable = () => {
    const [defectCodes, setDefectCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [debouncedSearchText, setDebouncedSearchText] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const highlightText = (text, searchText) => {
        if (!searchText || !text) return text;
        const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    };

    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            width: 60,
            align: 'center',
            render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: 'Mã lỗi',
            dataIndex: 'code',
            width: 150,
            key: 'code',
            align: 'center',
            sorter: (a, b) => a.code.localeCompare(b.code),
            render: (text) => <span dangerouslySetInnerHTML={{ __html: highlightText(text, debouncedSearchText) }} />,
        },
        {
            title: 'Mô tả lỗi',
            dataIndex: 'description',
            key: 'description',
            render: (text) => <span dangerouslySetInnerHTML={{ __html: highlightText(text, debouncedSearchText) }} />,
        },
    ];

    const fetchDefectCodes = async () => {
        setLoading(true);
        try {
            const data = await defectCodeService.getAllDefectCodes();
            setDefectCodes(data || []);
            setPagination((prev) => ({ ...prev, total: data?.length || 0 }));
        } catch (error) {
            message.error(error.message || 'Có lỗi xảy ra khi tải danh sách mã lỗi');
            setDefectCodes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDefectCodes();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchText(searchText);
            setPagination((prev) => ({ ...prev, current: 1 }));
        }, 300);

        return () => clearTimeout(timer);
    }, [searchText]);

    const filteredData = useMemo(() => {
        if (!debouncedSearchText) return defectCodes;
        return defectCodes.filter(
            (item) =>
                item.code?.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
                item.description?.toLowerCase().includes(debouncedSearchText.toLowerCase()),
        );
    }, [defectCodes, debouncedSearchText]);

    const handleTableChange = (newPagination) => {
        setPagination({
            current: newPagination.current,
            pageSize: newPagination.pageSize,
            total: filteredData.length,
        });
    };

    const handleSearch = useCallback((value) => {
        setSearchText(value);
    }, []);

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Input.Search
                    placeholder="Tìm kiếm theo mã lỗi hoặc mô tả..."
                    allowClear
                    onSearch={handleSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ width: 400 }}
                />
            </div>
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: filteredData.length,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mã lỗi`,
                    }}
                    onChange={handleTableChange}
                    size="middle"
                    bordered
                />
            </Spin>
        </div>
    );
};

export default DefectCodeTable;
