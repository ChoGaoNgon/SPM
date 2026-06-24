import React, { useEffect, useState, useCallback } from 'react';
import { Button, Card, message, Input, Select, DatePicker } from 'antd';
import PageHeader from '~/components/PageHeader';
import assetBorrowService from '~/services/assetBorrowService';
import AssetBorrowModal from '../components/AssetBorrowModal';
import AssetBorrowTable from '../components/AssetBorrowTable';
import EmployeeSelect from '~/components/select/EmployeeSelect';
import authService from '~/modules/auth/services/authService';
import { Blend } from 'lucide-react';
import { PlusOutlined } from '@ant-design/icons';

const AssetBorrowPage = () => {
    const [borrowList, setBorrowList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBorrow, setSelectedBorrow] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [filters, setFilters] = useState({
        keyword: '',
        requestById: undefined,
        date: undefined,
        borrowDate: undefined,
        status: undefined,
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const currentUserId = authService.getEmployeeId();
    const canCreateBorrow = true;
    const canApproveBorrow = authService.hasPermission('ASSET_BORROW_APPROVE');
    const canRejectBorrow = canApproveBorrow;
    const canReturnBorrow = authService.hasPermission('ASSET_BORROW_RETURN');
    const canDeleteBorrow = true;
    const canUpdateBorrow = true;
    const canManageAllBorrows = canApproveBorrow || canRejectBorrow || canReturnBorrow;

    const fetchBorrowList = useCallback(
        async (page = 1, pageSize = 10, filters = {}) => {
            setLoading(true);
            try {
                const params = {
                    page: page - 1,
                    size: pageSize,
                    ...(filters.keyword && { keyword: filters.keyword }),
                    ...(canManageAllBorrows && filters.requestById && { requestById: filters.requestById }),
                    ...(filters.date && { date: filters.date.format('YYYY-MM-DD') }),
                    ...(filters.borrowDate && { borrowDate: filters.borrowDate.format('YYYY-MM-DD') }),
                    ...(filters.status && { status: filters.status }),
                };
                const data = await assetBorrowService.getAllAssetBorrows(params);
                const list = data.content || [];
                const visibleList = canManageAllBorrows
                    ? list
                    : list.filter((item) => item.requestedById === currentUserId);
                setBorrowList(visibleList);
                setPagination({
                    current: page,
                    pageSize: pageSize,
                    total: canManageAllBorrows ? data.totalElements || 0 : visibleList.length,
                });
            } catch (error) {
                message.error(error.message || 'Không tải được danh sách đơn mượn');
            } finally {
                setLoading(false);
            }
        },
        [canManageAllBorrows, currentUserId],
    );

    useEffect(() => {
        fetchBorrowList(1, pagination.pageSize, filters);
    }, [fetchBorrowList, filters, pagination.pageSize]);

    const handleOpenCreateModal = () => {
        setIsEdit(false);
        setSelectedBorrow(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (record) => {
        setIsEdit(true);
        setSelectedBorrow(record);
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        setIsModalOpen(false);
        setSelectedBorrow(null);
        fetchBorrowList(pagination.current, pagination.pageSize, filters);
    };

    const handleTableChange = (page) => {
        fetchBorrowList(page.current, page.pageSize, filters);
    };

    const handleRefreshTable = () => {
        fetchBorrowList(pagination.current, pagination.pageSize, filters);
    };

    return (
        <div>
            <PageHeader
                icon={Blend}
                title="Quản lý mượn tài sản"
                description="Quản lý việc mượn các thiết bị và dụng cụ trong công ty"
            />

            <Card
                title={
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span>Danh sách đơn mượn</span>
                        {canCreateBorrow && (
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateModal}>
                                Tạo đơn mượn
                            </Button>
                        )}
                    </div>
                }
            >
                <div className="flex flex-wrap gap-3 mb-4">
                    <Input.Search
                        allowClear
                        placeholder="Tìm kiếm theo mục đích, ghi chú, mã/tên tài sản"
                        className="w-80"
                        onSearch={(value) => setFilters((f) => ({ ...f, keyword: value }))}
                        onChange={(e) => {
                            if (!e.target.value) {
                                setFilters((f) => ({ ...f, keyword: '' }));
                            }
                        }}
                    />

                    {canManageAllBorrows && (
                        <EmployeeSelect
                            allowClear
                            className="w-56"
                            placeholder="Chọn người mượn"
                            value={filters.requestById}
                            onChange={(value) => setFilters((f) => ({ ...f, requestById: value }))}
                        />
                    )}

                    <DatePicker
                        allowClear
                        className="w-48"
                        placeholder="Chọn ngày (bất kỳ hoạt động)"
                        value={filters.date}
                        onChange={(date) => setFilters((f) => ({ ...f, date }))}
                        format="DD/MM/YYYY"
                    />

                    <DatePicker
                        allowClear
                        className="w-48"
                        placeholder="Chọn ngày mượn cụ thể"
                        value={filters.borrowDate}
                        onChange={(borrowDate) => setFilters((f) => ({ ...f, borrowDate }))}
                        format="DD/MM/YYYY"
                    />

                    <Select
                        allowClear
                        className="w-48"
                        placeholder="Chọn trạng thái"
                        options={[
                            { value: 'PENDING', label: 'Chờ duyệt' },
                            { value: 'APPROVED', label: 'Đã duyệt' },
                            { value: 'REJECTED', label: 'Từ chối' },
                            { value: 'RETURNED', label: 'Đã trả' },
                        ]}
                        value={filters.status}
                        onChange={(value) => setFilters((f) => ({ ...f, status: value }))}
                    />
                </div>

                <AssetBorrowTable
                    borrowList={borrowList}
                    loading={loading}
                    pagination={pagination}
                    onTableChange={handleTableChange}
                    onRefresh={handleRefreshTable}
                    onEditBorrow={handleOpenEditModal}
                    highlightKeyword={filters.keyword}
                    currentUserId={currentUserId}
                    canApproveBorrow={canApproveBorrow}
                    canRejectBorrow={canRejectBorrow}
                    canReturnBorrow={canReturnBorrow}
                    canDeleteBorrow={canDeleteBorrow}
                    canUpdateBorrow={canUpdateBorrow}
                    canManageAllBorrows={canManageAllBorrows}
                />
            </Card>

            <AssetBorrowModal
                open={isModalOpen}
                isEdit={isEdit}
                borrow={selectedBorrow}
                onCancel={() => {
                    setIsModalOpen(false);
                    setSelectedBorrow(null);
                }}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
};

export default AssetBorrowPage;
