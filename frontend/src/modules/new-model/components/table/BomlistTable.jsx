import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import { Button, message, Modal, Popconfirm, Space, Table, Tag, Tooltip } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import fileDownload from 'js-file-download';
import { useCallback, useEffect, useState } from 'react';
import authService from '~/modules/auth/services/authService';
import { formatDateTime } from '~/utils/formatter';
import bomlistService from '../../services/bomlistService';

const BomlistTable = ({ modelId, onEdit, reloadTrigger }) => {
    const canEditBomlist = true;
    const canDeleteBomlist = true;
    const canAprroveBomlist = authService.hasPermission('NMD_BOMLIST_APPROVE');

    const [bomlists, setBomlists] = useState([]);

    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [feedback, setFeedback] = useState('');

    const openApproveModal = (record) => {
        setCurrentRecord(record);
        setFeedback(record?.content || '');
        setApproveModalOpen(true);
    };

    const handleApprove = async (approve) => {
        try {
            const data = {
                content: feedback,
                isApprove: approve,
            };
            const res = await bomlistService.approveBomlist(currentRecord.id, data);

            message.success(res.message);

            setApproveModalOpen(false);
            setFeedback('');
            fetchBomlist();
        } catch (err) {
            message.error('Lỗi khi phê duyệt!');
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await bomlistService.deleteBomlist(id);
            message.success(res.message || 'Xóa vấn đề thành công');
            fetchBomlist();
        } catch (error) {
            message.error(error?.message || 'Lỗi khi xóa vấn đề!');
        }
    };

    const fetchBomlist = useCallback(async () => {
        try {
            const data = await bomlistService.getAllBomlistByModel(modelId);
            setBomlists(data || []);
        } catch (error) {}
    }, [modelId]);

    useEffect(() => {
        fetchBomlist();
    }, [fetchBomlist, reloadTrigger]);

    const columns = [
        {
            title: 'STT',
            key: 'index',
            render: (_, __, index) => index + 1,
            width: '60px',
            align: 'center',
            fixed: 'left',
        },
        {
            title: 'Phiên bản',
            dataIndex: 'version',
            align: 'center',
            key: 'version',
            width: '100px',
        },
        {
            title: 'Giai đoạn',
            dataIndex: 'phase',
            align: 'center',
            key: 'phase',
            width: '150px',
        },

        {
            title: 'Ngày kiểm tra',
            dataIndex: 'checkAt',
            align: 'center',
            key: 'checkAt',
            width: '250px',
            render: (value) => (value ? formatDateTime(value) : <span style={{ color: '#999' }}>Chưa có</span>),
        },
        {
            title: 'NV kiểm tra',
            dataIndex: 'checkedByCode',
            align: 'center',
            key: 'checkedByCode',
            width: '130px',
            render: (_, record) => {
                const code = record.checkedByCode || '---';
                const fullName = record.checkedByName || 'Chưa có tên';

                return (
                    <Tooltip title={fullName} placement="right">
                        <Tag color="default" style={{ cursor: 'pointer' }}>
                            {code}
                        </Tag>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Nội dung phản hồi',
            dataIndex: 'content',
            align: 'center',
            key: 'content',
            width: '350px',
        },
        {
            title: 'Ngày chấp thuận',
            dataIndex: 'approvalAt',
            align: 'center',
            key: 'approvalAt',
            width: '250px',
            render: (value) => (value ? formatDateTime(value) : <span style={{ color: '#999' }}>Chưa có</span>),
        },
        {
            title: 'NV chấp thuận',
            dataIndex: 'approvedByCode',
            align: 'center',
            key: 'approvedByCode',
            width: '130px',
            render: (_, record) => {
                const code = record.approvedByCode || '---';
                const fullName = record.approvedByName || 'Chưa có tên';

                return (
                    <Tooltip title={fullName} placement="right">
                        <Tag color="default" style={{ cursor: 'pointer' }}>
                            {code}
                        </Tag>
                    </Tooltip>
                );
            },
        },
        {
            title: 'File',
            dataIndex: 'fileUrl',
            align: 'center',
            key: 'fileUrl',
            width: '200px',
            render: (fileUrl) => {
                if (!fileUrl) {
                    return <span style={{ color: '#999' }}>Chưa có file</span>;
                }

                const fileName = fileUrl.split('/').pop();

                return (
                    <Tooltip title="Nhấn để tải xuống">
                        <Button
                            type="link"
                            icon={<FileTextOutlined />}
                            onClick={async () => {
                                try {
                                    const encodedUrl = encodeURI(fileUrl);

                                    const resp = await fetch(encodedUrl, {
                                        method: 'GET',
                                        credentials: 'same-origin',
                                    });

                                    if (!resp.ok) {
                                        message.error('Không tìm thấy tệp trên trang');
                                        return;
                                    }

                                    const blob = await resp.blob();

                                    fileDownload(blob, fileName);

                                    message.success('Đang tải xuống file...');
                                } catch (error) {
                                    message.error(error);
                                }
                            }}
                        >
                            {fileName}
                        </Button>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            width: '250px',
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    {canEditBomlist && (
                        <Button icon={<EditOutlined />} onClick={() => onEdit?.(record)}>
                            Cập nhật
                        </Button>
                    )}
                    {canDeleteBomlist && (
                        <Popconfirm
                            title={`Bạn có chắc muốn xóa bomlist "${record.id}"?`}
                            onConfirm={() => handleDelete(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button danger icon={<DeleteOutlined />}>
                                Xóa
                            </Button>
                        </Popconfirm>
                    )}
                    {canAprroveBomlist && (
                        <Button
                            icon={<CheckCircleOutlined />}
                            style={{ color: '#52c41a', borderColor: '#52c41a' }}
                            onClick={() => openApproveModal(record)}
                            disabled={record.approvalAt ? true : false}
                        >
                            Phê duyệt
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <>
            <Modal
                open={approveModalOpen}
                onCancel={() => setApproveModalOpen(false)}
                footer={[
                    <Button key="reject" danger icon={<CloseCircleOutlined />} onClick={() => handleApprove(false)}>
                        Từ chối
                    </Button>,
                    <Button
                        key="approve"
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleApprove(true)}
                    >
                        Chấp thuận
                    </Button>,
                ]}
                title={`Phê duyệt phiên bản ${currentRecord?.version}`}
            >
                <TextArea
                    rows={4}
                    placeholder="Nhập nội dung phản hồi"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                />
            </Modal>
            <Table
                rowKey="id"
                columns={columns}
                dataSource={bomlists}
                scroll={{ x: 'max-content', y: 400 }}
                bordered
                pagination={false}
            ></Table>
        </>
    );
};

export default BomlistTable;
