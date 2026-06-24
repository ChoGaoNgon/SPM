import {
    BulbOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CommentOutlined,
    DeleteOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
    FileOutlined,
    FolderOpenOutlined,
    InfoCircleOutlined,
    ProfileOutlined,
    ReloadOutlined,
    SearchOutlined,
    SendOutlined,
    SyncOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Button,
    Card,
    Descriptions,
    Empty,
    Grid,
    Image,
    Input,
    List,
    Popconfirm,
    Skeleton,
    Space,
    Statistic,
    Tag,
    Typography,
} from 'antd';
import {
    formatSystemFeedbackDateTime,
    getSystemFeedbackStatusMeta,
    renderPriorityTag,
    renderStatusTag,
    renderSystemType,
} from '../SystemFeedbackUtils';

const { Paragraph, Text, Title } = Typography;
const { useBreakpoint } = Grid;

const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

const STATUS_CARD_CONFIG = [
    { key: 'PENDING', title: 'Chờ', icon: ClockCircleOutlined, color: '#1677ff', valueKey: 'pending' },
    { key: 'IN_PROGRESS', title: 'Đang', icon: SyncOutlined, color: '#fa8c16', valueKey: 'inProgress', spin: true },
    { key: 'DONE', title: 'Xong', icon: CheckCircleOutlined, color: '#52c41a', valueKey: 'done' },
];

const FileSection = ({ files = [] }) => {
    if (!files.length) {
        return <Text type="secondary">Không có tệp đính kèm</Text>;
    }

    const imageFiles = files.filter(
        (file) => file.filePath && imageExtensions.includes(file.filePath.split('.').pop().toLowerCase()),
    );
    const normalFiles = files.filter(
        (file) => file.filePath && !imageExtensions.includes(file.filePath.split('.').pop().toLowerCase()),
    );

    return (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {imageFiles.length > 0 && (
                <Image.PreviewGroup>
                    <Space wrap size={8}>
                        {imageFiles.map((file) => (
                            <Image
                                key={file.id || file.filePath}
                                height={72}
                                width={72}
                                style={{ borderRadius: 12, border: '1px solid #f0f0f0', objectFit: 'cover' }}
                                src={`${process.env.REACT_APP_UPLOAD_URL}/${file.filePath}`}
                                preview={{ mask: <EyeOutlined /> }}
                            />
                        ))}
                    </Space>
                </Image.PreviewGroup>
            )}

            {normalFiles.length > 0 && (
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    {normalFiles.map((file) => {
                        const fileName = file.filePath?.split('/').pop() || 'Tệp đính kèm';

                        return (
                            <a
                                key={file.id || file.filePath}
                                href={`${process.env.REACT_APP_UPLOAD_URL}/${file.filePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '10px 12px',
                                    borderRadius: 12,
                                    border: '1px solid #d9d9d9',
                                    color: '#1677ff',
                                }}
                            >
                                <FileOutlined />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {fileName}
                                </span>
                            </a>
                        );
                    })}
                </Space>
            )}
        </Space>
    );
};

const buildDetailItems = (detail) => [
    {
        key: 'createdBy',
        label: (
            <Space size={6}>
                <UserOutlined />
                Người tạo
            </Space>
        ),
        children:
            detail.createdByEmployeeName || detail.createdByEmployeeCode
                ? `${detail.createdByEmployeeName || ''}${detail.createdByEmployeeName && detail.createdByEmployeeCode ? ' - ' : ''}${detail.createdByEmployeeCode || ''}`
                : 'Chưa có',
    },
    {
        key: 'createdAt',
        label: (
            <Space size={6}>
                <CalendarOutlined />
                Thời gian tạo
            </Space>
        ),
        children: formatSystemFeedbackDateTime(detail.createdAt),
    },
    {
        key: 'assignTo',
        label: (
            <Space size={6}>
                <SendOutlined />
                Nhân viên xử lý
            </Space>
        ),
        children:
            detail.assignToEmployeeName || detail.assignToEmployeeCode
                ? `${detail.assignToEmployeeName || ''}${detail.assignToEmployeeName && detail.assignToEmployeeCode ? ' - ' : ''}${detail.assignToEmployeeCode || ''}`
                : 'Chưa có',
    },
    {
        key: 'startTime',
        label: (
            <Space size={6}>
                <CalendarOutlined />
                Bắt đầu dự kiến
            </Space>
        ),
        children: formatSystemFeedbackDateTime(detail.startTime),
    },
    {
        key: 'endTime',
        label: (
            <Space size={6}>
                <CalendarOutlined />
                Kết thúc dự kiến
            </Space>
        ),
        children: formatSystemFeedbackDateTime(detail.endTime),
    },
    {
        key: 'impactScope',
        span: 2,
        label: (
            <Space size={6}>
                <ExclamationCircleOutlined />
                Phạm vi ảnh hưởng
            </Space>
        ),
        children: detail.impactScope || 'Chưa có',
    },
    {
        key: 'primaryObjective',
        span: 2,
        label: (
            <Space size={6}>
                <ProfileOutlined />
                Mục tiêu chính
            </Space>
        ),
        children: detail.primaryObjective || 'Chưa có',
    },
    {
        key: 'expectedOutcome',
        span: 2,
        label: (
            <Space size={6}>
                <InfoCircleOutlined />
                Kết quả mong đợi
            </Space>
        ),
        children: detail.expectedOutcome || 'Chưa có',
    },
    {
        key: 'remark',
        span: 2,
        label: (
            <Space size={6}>
                <CommentOutlined />
                Ghi chú
            </Space>
        ),
        children: detail.remark || 'Chưa có',
    },
];

const SystemFeedbackMasterDetail = ({
    items,
    stats,
    selectedItem,
    detail,
    loadingList,
    loadingDetail,
    searchText,
    onSearchChange,
    onSelect,
    onRefresh,
    onEdit,
    onAssign,
    onDelete,
    statusFilters,
    onToggleStatusFilter,
    canAssignFeedback,
    hasITDepartmentRole,
}) => {
    const screens = useBreakpoint();

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: screens.xl ? 'minmax(320px, 360px) minmax(0, 1fr)' : 'minmax(0, 1fr)',
                gap: 16,
                alignItems: 'start',
            }}
        >
            <Card bodyStyle={{ padding: 0 }}>
                <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
                    <Space.Compact style={{ width: '100%' }}>
                        <Input
                            placeholder="Tìm tiêu đề, module, người tạo..."
                            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                            value={searchText}
                            onChange={(e) => onSearchChange(e.target.value)}
                            allowClear
                        />
                        <Button icon={<ReloadOutlined />} onClick={onRefresh} />
                    </Space.Compact>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: screens.md ? 'repeat(3, minmax(0, 1fr))' : '1fr',
                            gap: 12,
                            marginTop: 12,
                        }}
                    >
                        {STATUS_CARD_CONFIG.map((item) => {
                            const Icon = item.icon;
                            const isActive = statusFilters.includes(item.key);

                            return (
                                <Card
                                    key={item.key}
                                    hoverable
                                    size="small"
                                    onClick={() => onToggleStatusFilter(item.key)}
                                    styles={{ body: { padding: 14 } }}
                                    style={{
                                        cursor: 'pointer',
                                        borderColor: isActive ? item.color : '#f0f0f0',
                                        boxShadow: isActive ? `0 0 0 1px ${item.color} inset` : undefined,
                                        background: isActive ? `${item.color}12` : '#fff',
                                    }}
                                >
                                    <Statistic
                                        title={item.title}
                                        value={stats?.[item.valueKey] ?? 0}
                                        prefix={<Icon spin={item.spin} style={{ color: item.color }} />}
                                        valueStyle={{ color: '#141414', fontSize: 22 }}
                                    />
                                </Card>
                            );
                        })}
                    </div>
                </div>

                <div style={{ maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
                    {loadingList ? (
                        <Space direction="vertical" size={12} style={{ width: '100%', padding: 16 }}>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Card key={index} size="small">
                                    <Skeleton active paragraph={{ rows: 2 }} title={false} />
                                </Card>
                            ))}
                        </Space>
                    ) : items.length === 0 ? (
                        <div style={{ padding: 32 }}>
                            <Empty description="Không có góp ý phù hợp" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </div>
                    ) : (
                        <List
                            dataSource={items}
                            split={false}
                            style={{ padding: 12 }}
                            renderItem={(item) => {
                                const statusMeta = getSystemFeedbackStatusMeta(item.status);
                                const isActive = selectedItem?.id === item.id;

                                return (
                                    <List.Item style={{ padding: 0, marginBottom: 12 }}>
                                        <Card
                                            hoverable
                                            size="small"
                                            onClick={() => onSelect(item)}
                                            style={{
                                                width: '100%',
                                                borderColor: isActive ? '#1677ff' : '#f0f0f0',
                                                boxShadow: isActive ? '0 0 0 1px #1677ff inset' : undefined,
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <Title level={5} style={{ margin: 0 }} ellipsis>
                                                        {item.title}
                                                    </Title>
                                                    <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                                                        {item.createdByEmployeeName ||
                                                            item.createdByEmployeeCode ||
                                                            'Ẩn danh'}
                                                        {' • '}
                                                        {formatSystemFeedbackDateTime(item.createdAt)}
                                                    </Text>
                                                </div>
                                            </div>
                                            <Space wrap size={[8, 8]} style={{ marginTop: 12 }}>
                                                {renderSystemType(item.requestType)}
                                                {item.priority ? renderPriorityTag(item.priority) : null}
                                                {item.module ? <Tag color="blue">{item.module}</Tag> : null}
                                            </Space>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    gap: 12,
                                                }}
                                            >
                                                <Text type="secondary">
                                                    Xử lý: {item.assignToEmployeeName || 'Chưa phân công'}
                                                </Text>

                                                <Tag
                                                    color={
                                                        item.status === 'PENDING'
                                                            ? 'blue'
                                                            : item.status === 'IN_PROGRESS'
                                                              ? 'orange'
                                                              : item.status === 'DONE'
                                                                ? 'green'
                                                                : 'red'
                                                    }
                                                    style={{
                                                        margin: 0,
                                                        lineHeight: '20px',
                                                    }}
                                                >
                                                    {statusMeta.label}
                                                </Tag>
                                            </div>
                                        </Card>
                                    </List.Item>
                                );
                            }}
                        />
                    )}
                </div>
            </Card>

            <Card bodyStyle={{ padding: 0 }} style={{ minHeight: 520 }}>
                {selectedItem ? (
                    loadingDetail ? (
                        <div style={{ padding: 24 }}>
                            <Skeleton active paragraph={{ rows: 10 }} />
                        </div>
                    ) : detail ? (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ padding: 20, borderBottom: '1px solid #f0f0f0' }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 16,
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <div>
                                        <Title level={3} style={{ margin: '8px 0 0' }}>
                                            {detail.title}
                                        </Title>

                                        <Space wrap size={[16, 8]} style={{ marginTop: 12 }}>
                                            <Space>
                                                <Text type="secondary">Trạng thái:</Text>
                                                {renderStatusTag(detail.status)}
                                            </Space>

                                            <Space>
                                                <Text type="secondary">Loại yêu cầu:</Text>
                                                {renderSystemType(detail.requestType)}
                                            </Space>

                                            <Space>
                                                <Text type="secondary">Mức độ ưu tiên:</Text>
                                                {renderPriorityTag(detail.priority)}
                                            </Space>

                                            <Space>
                                                <Text type="secondary">Module:</Text>
                                                {detail.module && <Tag color="blue">{detail.module}</Tag>}
                                            </Space>
                                        </Space>
                                    </div>
                                    <Space wrap>
                                        <Button icon={<EditOutlined />} onClick={() => onEdit(detail)}>
                                            Chỉnh sửa
                                        </Button>
                                        {(canAssignFeedback || hasITDepartmentRole) && (
                                            <Button icon={<SendOutlined />} onClick={() => onAssign(detail)}>
                                                Phân công
                                            </Button>
                                        )}
                                        <Popconfirm
                                            title="Bạn có chắc muốn xóa góp ý này?"
                                            okText="Xóa"
                                            cancelText="Hủy"
                                            okButtonProps={{ danger: true, className: 'bg-red-500 hover:bg-red-600' }}
                                            onConfirm={() => onDelete(detail.id)}
                                        >
                                            <Button danger icon={<DeleteOutlined />}>
                                                Xóa
                                            </Button>
                                        </Popconfirm>
                                    </Space>
                                </div>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                    <Descriptions
                                        bordered
                                        size="small"
                                        column={{ xs: 1, md: 2 }}
                                        items={buildDetailItems(detail)}
                                    />

                                    <Card
                                        size="small"
                                        title={
                                            <Space size={6}>
                                                <ProfileOutlined />
                                                Mô tả
                                            </Space>
                                        }
                                    >
                                        <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                                            {detail.content || 'Chưa có mô tả'}
                                        </Paragraph>
                                    </Card>

                                    <Card
                                        size="small"
                                        title={
                                            <Space size={6}>
                                                <CommentOutlined />
                                                Phản hồi từ IT
                                            </Space>
                                        }
                                    >
                                        <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                                            {detail.response || 'Chưa có phản hồi'}
                                        </Paragraph>
                                    </Card>

                                    <Card
                                        size="small"
                                        title={
                                            <Space size={6}>
                                                <FolderOpenOutlined />
                                                Tệp đính kèm
                                            </Space>
                                        }
                                    >
                                        <FileSection files={detail.files} />
                                    </Card>
                                </Space>
                            </div>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                height: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 32,
                            }}
                        >
                            <Empty description="Không tải được chi tiết góp ý" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </div>
                    )
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 32,
                        }}
                    >
                        <Empty
                            image={<BulbOutlined style={{ fontSize: 44, color: '#bfbfbf' }} />}
                            description="Chọn một góp ý ở danh sách bên trái để xem chi tiết"
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default SystemFeedbackMasterDetail;
