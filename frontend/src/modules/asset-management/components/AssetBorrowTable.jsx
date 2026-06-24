import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, UndoOutlined } from '@ant-design/icons';
import { Button, Input, message, Modal, Space, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import assetBorrowService from '~/services/assetBorrowService';

const AssetBorrowTable = ({
    borrowList,
    loading,
    pagination,
    onTableChange,
    onRefresh,
    onEditBorrow,
    highlightKeyword,
    currentUserId,
    canApproveBorrow,
    canRejectBorrow,
    canReturnBorrow,
    canDeleteBorrow,
    canUpdateBorrow,
    canManageAllBorrows,
}) => {
    const navigate = useNavigate();

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectingId, setRejectingId] = useState(null);

    const isPending = (record) => record.status === 'PENDING';
    const isOwner = (record) => record.requestedById === currentUserId;
    const canApprove = (record) => canApproveBorrow && isPending(record);
    const canReject = (record) => canRejectBorrow && isPending(record);
    const canEdit = (record) => canUpdateBorrow && isPending(record) && (canManageAllBorrows || isOwner(record));
    const canDelete = (record) => canDeleteBorrow && isPending(record) && (canManageAllBorrows || isOwner(record));

    const HighlightText = ({ text, highlight }) => {
        if (!highlight || !text) return text || '—';

        const parts = text.toString().split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')})`, 'gi'));

        return (
            <span>
                {parts.map((part, index) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <span
                            key={index}
                            style={{
                                backgroundColor: '#ffeb3b',
                                color: '#000',
                                padding: '0 2px',
                                borderRadius: '2px',
                            }}
                        >
                            {part}
                        </span>
                    ) : (
                        part
                    ),
                )}
            </span>
        );
    };

    const handleDeleteBorrow = (id) => {
        Modal.confirm({
            title: 'Xóa đơn mượn',
            content: 'Bạn chắc chắn muốn xóa đơn mượn này?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await assetBorrowService.deleteAssetBorrow(id);
                    message.success('Xóa thành công');
                    onRefresh();
                } catch (error) {
                    message.error(error.message);
                }
            },
        });
    };

    const handleApproveBorrow = (id) => {
        Modal.confirm({
            title: 'Phê duyệt',
            content: 'Xác nhận duyệt đơn mượn?',
            okText: 'Duyệt',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await assetBorrowService.approveAssetBorrow(id);
                    message.success('Đã duyệt');
                    onRefresh();
                } catch (error) {
                    message.error(error.message);
                }
            },
        });
    };

    const handleRejectBorrow = (id) => {
        setRejectingId(id);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    const handleConfirmReject = async () => {
        if (!rejectReason.trim()) {
            message.error('Nhập lý do từ chối');
            return;
        }

        try {
            await assetBorrowService.rejectAssetBorrow(rejectingId, {
                remark: rejectReason,
            });

            message.success('Đã từ chối');
            setIsRejectModalOpen(false);
            onRefresh();
        } catch (error) {
            message.error(error.message);
        }
    };

    const handleReturnAsset = (id) => {
        Modal.confirm({
            title: 'Trả tài sản',
            content: 'Xác nhận đã trả?',
            okText: 'Xác nhận',
            onOk: async () => {
                try {
                    await assetBorrowService.returnAsset(id);
                    message.success('Đã xác nhận trả');
                    onRefresh();
                } catch (error) {
                    message.error(error.message);
                }
            },
        });
    };

    const getStatusTag = (status) => {
        const map = {
            PENDING: { color: 'orange', label: 'Chờ duyệt' },
            APPROVED: { color: 'blue', label: 'Đã duyệt' },
            RETURNED: { color: 'green', label: 'Đã trả' },
            REJECTED: { color: 'red', label: 'Từ chối' },
        };

        const c = map[status] || { color: 'default', label: status };

        return <Tag color={c.color}>{c.label}</Tag>;
    };

    const columns = [
        {
            title: 'STT',
            render: (_, __, i) => (pagination.current - 1) * pagination.pageSize + i + 1,
            width: 60,
        },
        {
            title: 'Mã tài sản',
            dataIndex: 'assetCode',
            render: (text, record) => (
                <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => navigate(`/assets-management/assets/${record.assetId}`)}
                >
                    <HighlightText text={text} highlight={highlightKeyword} />
                </button>
            ),
        },
        {
            title: 'Người mượn',
            render: (_, r) => (
                <div>
                    <div>{r.requestedByName}</div>
                    <div className="text-xs text-gray-500">{r.requestedByCode}</div>
                </div>
            ),
        },
        {
            title: 'Người duyệt',
            render: (_, r) =>
                r.approvedByName ? (
                    <div>
                        <div>{r.approvedByName}</div>
                        <div className="text-xs text-gray-500">{r.approvedByCode}</div>
                    </div>
                ) : (
                    '-'
                ),
        },
        {
            title: 'Mục đích',
            dataIndex: 'purpose',
            render: (text) => <HighlightText text={text} highlight={highlightKeyword} />,
        },
        {
            title: 'Ngày mượn',
            dataIndex: 'borrowAt',
            render: (v) => (v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '-'),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: getStatusTag,
        },

        {
            title: 'Thao tác',
            fixed: 'right',
            width: 320,
            render: (_, record) => (
                <Space>
                    {(canApprove(record) || canReject(record)) && (
                        <>
                            {canApprove(record) && (
                                <Button
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    size="small"
                                    onClick={() => handleApproveBorrow(record.id)}
                                >
                                    Duyệt
                                </Button>
                            )}

                            {canReject(record) && (
                                <Button
                                    danger
                                    icon={<CloseOutlined />}
                                    size="small"
                                    onClick={() => handleRejectBorrow(record.id)}
                                >
                                    Từ chối
                                </Button>
                            )}

                            {canEdit(record) && (
                                <Button icon={<EditOutlined />} size="small" onClick={() => onEditBorrow(record)}>
                                    Sửa
                                </Button>
                            )}
                        </>
                    )}

                    {record.status === 'APPROVED' && canReturnBorrow && (
                        <Button
                            type="primary"
                            icon={<UndoOutlined />}
                            size="small"
                            onClick={() => handleReturnAsset(record.id)}
                        >
                            Trả
                        </Button>
                    )}

                    {!(canApprove(record) || canReject(record)) && canEdit(record) && (
                        <Button icon={<EditOutlined />} size="small" onClick={() => onEditBorrow(record)}>
                            Sửa
                        </Button>
                    )}

                    {canDelete(record) && (
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={() => handleDeleteBorrow(record.id)}
                        >
                            Xóa
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <>
            <Table
                loading={loading}
                rowKey="id"
                dataSource={borrowList}
                columns={columns}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                }}
                onChange={onTableChange}
                scroll={{ x: 1200 }}
            />

            <Modal
                title="Từ chối đơn mượn"
                open={isRejectModalOpen}
                onOk={handleConfirmReject}
                onCancel={() => setIsRejectModalOpen(false)}
            >
                <Input.TextArea
                    rows={4}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Nhập lý do..."
                />
            </Modal>
        </>
    );
};

export default AssetBorrowTable;
