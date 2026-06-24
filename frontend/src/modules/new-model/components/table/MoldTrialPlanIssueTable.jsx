import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Image, message, Popconfirm, Space, Table, Tag } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import VideoPreview from '~/components/VideoPreview';
import VideoThumbnail from '~/components/VideoThumbnail';
import authService from '~/modules/auth/services/authService';
import productMoldTrialPlanIssueService from '../../services/productPlanIssueService';

const MoldTrialPlanIssueTable = ({ moldTrialPlanId, onEdit, reloadTrigger }) => {
    const [previewVideo, setPreviewVideo] = useState(null);

    const canEditIssue = authService.hasPermission('NMD_PRODUCT_PLAN_ISSUE_UPDATE');
    const canDeleteIssue = authService.hasPermission('NMD_PRODUCT_PLAN_ISSUE_DELETE');

    const [issues, setIssues] = useState([]);

    const fetchIssues = useCallback(async () => {
        try {
            const data = await productMoldTrialPlanIssueService.getAllIssueByMoldTrialId(moldTrialPlanId);
            setIssues(data || []);
        } catch (error) {
            message.error(error?.message || String(error));
        }
    }, [moldTrialPlanId]);

    useEffect(() => {
        fetchIssues();
    }, [fetchIssues, reloadTrigger]);

    const handleDelete = async (issueId) => {
        try {
            const res = await productMoldTrialPlanIssueService.deleteIssue(issueId);
            message.success(res.message || 'Xóa vấn đề thành công');
            fetchIssues();
        } catch (error) {
            message.error(error?.message || 'Lỗi khi xóa vấn đề');
        }
    };

    const columns = [
        { title: 'STT', key: 'index', render: (_, __, index) => index + 1, width: '60px', align: 'center' },
        {
            title: 'Loại lỗi',
            dataIndex: 'issueType',
            align: 'center',
            key: 'issueType',
            width: '100px',
            filters: [
                { text: 'Lỗi khuôn', value: 'MOLD_ERROR' },
                { text: 'Lỗi sản phẩm', value: 'PRODUCT_ERROR' },
            ],
            onFilter: (value, record) => record.issueType === value,
            render: (issueType) => {
                if (issueType === 'MOLD_ERROR') return <Tag color="orange">Lỗi khuôn</Tag>;
                if (issueType === 'PRODUCT_ERROR') return <Tag color="blue">Lỗi sản phẩm</Tag>;
                return '-';
            },
        },
        {
            title: 'Mô tả lỗi',
            dataIndex: 'issueDescription',
            align: 'center',
            key: 'issueDescription',
            width: '200px',
        },
        {
            title: 'Mã lỗi',
            dataIndex: 'defectCodes',
            align: 'center',
            key: 'defectCodes',
            width: '200px',
            render: (defectCodes) => {
                if (!defectCodes || defectCodes.length === 0)
                    return <span style={{ color: '#999' }}>Chưa có mã lỗi</span>;
                return (
                    <div>
                        {defectCodes.map((dc, index) => (
                            <div key={index}>
                                <Tag color="red">
                                    {dc.defectCode} ({dc.defectCodeDescription || 'Không có mô tả'}): {dc.quantity}
                                </Tag>
                            </div>
                        ))}
                    </div>
                );
            },
        },
        {
            title: 'Nguyên nhân',
            align: 'center',
            dataIndex: 'cause',
            key: 'cause',
            width: '200px',
        },
        {
            title: 'Hướng xử lý',
            align: 'center',
            dataIndex: 'improvePlan',
            key: 'improvePlan',
            width: '200px',
        },
        {
            title: 'Deadline sửa',
            align: 'center',
            dataIndex: 'repairDeadline',
            key: 'repairDeadline',
            width: '200px',
            render: (deadline) => {
                if (!deadline) return '-';
                return new Date(deadline).toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                });
            },
        },
        {
            title: 'Trạng thái',
            align: 'center',
            dataIndex: 'implemented',
            key: 'implemented',
            width: '100px',
            render: (implemented) =>
                implemented ? <Tag color="green">Đã thực hiện</Tag> : <Tag color="default">Chưa thực hiện</Tag>,
        },

        {
            title: 'Ảnh (Trước)',
            dataIndex: 'files',
            key: 'imagesBefore',
            align: 'center',
            width: '200px',
            render: (files) => {
                if (!files || files.length === 0) return <span style={{ color: '#999' }}>Không có ảnh</span>;

                const imageFiles = files.filter(
                    (file) =>
                        file.filePath &&
                        file.status === 'BEFORE' &&
                        ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(file.filePath.split('.').pop().toLowerCase()),
                );

                if (imageFiles.length === 0) return <span style={{ color: '#999' }}>Không có ảnh</span>;

                return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Image.PreviewGroup>
                            {imageFiles.map((file, index) => (
                                <div
                                    key={index}
                                    style={{ width: '50%', display: 'flex', justifyContent: 'center', padding: 4 }}
                                >
                                    <Image
                                        src={`${process.env.REACT_APP_UPLOAD_URL}/${file.filePath}`}
                                        preview={{ mask: <EyeOutlined /> }}
                                        style={{ width: 80, height: 'auto', objectFit: 'cover' }}
                                    />
                                </div>
                            ))}
                        </Image.PreviewGroup>
                    </div>
                );
            },
        },

        {
            title: 'Ảnh (Sau)',
            dataIndex: 'files',
            key: 'imagesAfter',
            align: 'center',
            width: '200px',
            render: (files) => {
                if (!files || files.length === 0) return <span style={{ color: '#999' }}>Không có ảnh</span>;

                const imageFiles = files.filter(
                    (file) =>
                        file.filePath &&
                        file.status === 'AFTER' &&
                        ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(file.filePath.split('.').pop().toLowerCase()),
                );

                if (imageFiles.length === 0) return <span style={{ color: '#999' }}>Không có ảnh</span>;

                return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Image.PreviewGroup>
                            {imageFiles.map((file, index) => (
                                <div
                                    key={index}
                                    style={{ width: '50%', display: 'flex', justifyContent: 'center', padding: 4 }}
                                >
                                    <Image
                                        src={`${process.env.REACT_APP_UPLOAD_URL}/${file.filePath}`}
                                        preview={{ mask: <EyeOutlined /> }}
                                        style={{ width: 80, height: 'auto', objectFit: 'cover' }}
                                    />
                                </div>
                            ))}
                        </Image.PreviewGroup>
                    </div>
                );
            },
        },

        {
            title: 'Video (Trước)',
            dataIndex: 'files',
            key: 'videosBefore',
            align: 'center',
            width: '200px',
            render: (files) => {
                if (!files || files.length === 0) return <span style={{ color: '#999' }}>Không có video</span>;

                const videoFiles = files.filter(
                    (file) =>
                        file.filePath &&
                        file.status === 'BEFORE' &&
                        ['mp4', 'webm', 'ogg'].includes(file.filePath.split('.').pop().toLowerCase()),
                );

                if (!videoFiles || videoFiles.length === 0)
                    return <span style={{ color: '#999' }}>Không có video</span>;

                return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {videoFiles.map((file, index) => (
                            <div
                                key={index}
                                style={{ width: '50%', display: 'flex', justifyContent: 'center', padding: 4 }}
                            >
                                <div style={{ width: 80, height: 'auto', display: 'flex', justifyContent: 'center' }}>
                                    <VideoThumbnail file={file} onClick={() => setPreviewVideo(file)} />
                                </div>
                            </div>
                        ))}
                    </div>
                );
            },
        },

        {
            title: 'Video (Sau)',
            dataIndex: 'files',
            key: 'videosAfter',
            align: 'center',
            width: '200px',
            render: (files) => {
                if (!files || files.length === 0) return <span style={{ color: '#999' }}>Không có video</span>;

                const videoFiles = files.filter(
                    (file) =>
                        file.filePath &&
                        file.status === 'AFTER' &&
                        ['mp4', 'webm', 'ogg'].includes(file.filePath.split('.').pop().toLowerCase()),
                );

                if (!videoFiles || videoFiles.length === 0)
                    return <span style={{ color: '#999' }}>Không có video</span>;

                return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {videoFiles.map((file, index) => (
                            <div
                                key={index}
                                style={{ width: '50%', display: 'flex', justifyContent: 'center', padding: 4 }}
                            >
                                <div style={{ width: 80, height: 'auto', display: 'flex', justifyContent: 'center' }}>
                                    <VideoThumbnail file={file} onClick={() => setPreviewVideo(file)} />
                                </div>
                            </div>
                        ))}
                    </div>
                );
            },
        },
        ...(canEditIssue || canDeleteIssue
            ? [
                  {
                      title: 'Hành động',
                      align: 'center',
                      key: 'actions',
                      width: '10%',
                      fixed: 'right',
                      render: (_, record) => (
                          <Space>
                              {canEditIssue && (
                                  <Button icon={<EditOutlined />} onClick={() => onEdit?.(record)}>
                                      Cập nhật
                                  </Button>
                              )}
                              {canDeleteIssue && (
                                  <Popconfirm
                                      title={`Bạn có chắc muốn xóa vấn đề "${record.id}"?`}
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
                          </Space>
                      ),
                  },
              ]
            : []),
    ];

    return (
        <div>
            <Table
                rowKey="id"
                columns={columns}
                dataSource={issues}
                scroll={{ x: 'max-content', y: 400 }}
                bordered
                pagination={false}
                size="small"
            />

            {previewVideo && (
                <VideoPreview visible={!!previewVideo} file={previewVideo} onCancel={() => setPreviewVideo(null)} />
            )}
        </div>
    );
};

export default MoldTrialPlanIssueTable;
