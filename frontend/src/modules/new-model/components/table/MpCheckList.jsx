import {
    CarOutlined,
    CheckSquareOutlined,
    DeleteOutlined,
    DollarOutlined,
    EditOutlined,
    FileTextOutlined,
    PlusOutlined,
    SafetyOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Empty, List, message, Popconfirm, Row, Space, Table, Tag, Tooltip } from 'antd';
import { useMemo, useState } from 'react';
import { useIsMobile } from '~/hook/useIsMobile';
import authService from '~/modules/auth/services/authService';
import mpCheckListService from '../../services/mpCheckListService';
import MpHandoverUpdateModal from '../modal/MpHandoverUpdateModal';
import './MpCheckListStyle.css';

const MP_TYPE_OPTIONS = [
    {
        value: 'SAFETY',
        label: 'An toàn',
        color: '#ff4d4f',
        bgColor: '#fff1f0',
        icon: <SafetyOutlined />,
    },
    {
        value: 'QUALITY',
        label: 'Chất lượng',
        color: '#1890ff',
        bgColor: '#e6f7ff',
        icon: <CheckSquareOutlined />,
    },
    {
        value: 'COST',
        label: 'Chi phí',
        color: '#fa8c16',
        bgColor: '#fff7e6',
        icon: <DollarOutlined />,
    },
    {
        value: 'DELIVERY',
        label: 'Giao hàng',
        color: '#52c41a',
        bgColor: '#f6ffed',
        icon: <CarOutlined />,
    },
    {
        value: 'DOCUMENT',
        label: 'Tài liệu',
        color: '#722ed1',
        bgColor: '#f9f0ff',
        icon: <FileTextOutlined />,
    },
];

const MpCheckList = ({ productId, mpCheckList, onCreate, onSuccess, onDelete }) => {
    const isMobile = useIsMobile();
    const canDeleteMpCheckList = authService.hasPermission('NMD_PRODUCT_MP_CHECKLIST_DELETE');

    const canCreateMpCheckList = authService.hasPermission('NMD_PRODUCT_MP_CHECKLIST_CREATE');

    const [loading, setLoading] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const isSuperAdmin = authService.hasRole('SUPERADMIN');
    const userDeptCode = authService.getParentDepartmentCode() ?? authService.getDepartmentCode();

    const isRowHighlighted = (record) => {
        if (isSuperAdmin) return false;

        return (
            (record.responsibility1Code && record.responsibility1Code === userDeptCode) ||
            (record.responsibility2Code && record.responsibility2Code === userDeptCode)
        );
    };

    const renderPlaceholder = (text = '---') => <span style={{ color: '#999' }}>{text}</span>;

    const renderResultTag = (result) => {
        if (!result) return null;
        if (result === 'OK') return <Tag color="success">OK</Tag>;
        if (result === 'NG') return <Tag color="error">NG</Tag>;
        return <Tag>{result}</Tag>;
    };

    const renderDeptTag = (code, name, color) => (
        <Tooltip title={name || 'Chưa có'}>
            <Tag color={color}>{code || '---'}</Tag>
        </Tooltip>
    );

    const canEditItem = (record) => {
        if (!authService.hasPermission('NMD_PRODUCT_MP_ITEM_APPROVAL')) return false;
        if (isSuperAdmin) return true;

        if (record.responsibility1Code && record.responsibility1Code === userDeptCode) return true;

        if (record.responsibility2Code && record.responsibility2Code === userDeptCode) {
            return record.resultByResponsibility1 === 'OK';
        }

        return false;
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await mpCheckListService.deleteByProductId(productId);
            message.success('Xóa danh sách kiểm tra MP thành công');
            onDelete();
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getTypeInfo = (type) => {
        return MP_TYPE_OPTIONS.find((opt) => opt.value === type) || {};
    };

    const handleEdit = (record) => {
        setEditingItem(record);
        setEditModalVisible(true);
    };

    const handleEditCancel = () => {
        setEditModalVisible(false);
    };

    const handleEditSuccess = () => {
        setEditModalVisible(false);
        setEditingItem(null);
        onSuccess();
    };

    const processedData = useMemo(() => {
        if (!mpCheckList?.checkItems) return [];

        const items = [...mpCheckList.checkItems];

        const typeOrder = {
            SAFETY: 1,
            QUALITY: 2,
            COST: 3,
            DELIVERY: 4,
            DOCUMENT: 5,
        };

        items.sort((a, b) => {
            const orderA = typeOrder[a.type] || 999;
            const orderB = typeOrder[b.type] || 999;
            if (orderA !== orderB) return orderA - orderB;

            return 0;
        });

        const typeCount = {};
        items.forEach((item) => {
            typeCount[item.type] = (typeCount[item.type] || 0) + 1;
        });

        const nameCount = {};
        items.forEach((item) => {
            const key = `${item.type}_${item.name}`;
            nameCount[key] = (nameCount[key] || 0) + 1;
        });

        let currentType = null;
        let typeIndex = {};
        let currentName = null;
        let nameIndex = {};

        return items.map((item, index) => {
            if (item.type !== currentType) {
                currentType = item.type;
                typeIndex[item.type] = 0;
            }
            const isFirstOfType = typeIndex[item.type] === 0;
            typeIndex[item.type]++;

            const nameKey = `${item.type}_${item.name}`;
            if (nameKey !== currentName) {
                currentName = nameKey;
                nameIndex[nameKey] = 0;
            }
            const isFirstOfName = nameIndex[nameKey] === 0;
            nameIndex[nameKey]++;

            return {
                ...item,
                typeRowSpan: isFirstOfType ? typeCount[item.type] : 0,
                nameRowSpan: isFirstOfName ? nameCount[nameKey] : 0,
            };
        });
    }, [mpCheckList]);

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
            title: 'Loại',
            key: 'type',
            dataIndex: 'type',
            align: 'center',
            width: '150px',
            fixed: 'left',
            render: (value, record) => {
                const typeInfo = getTypeInfo(value);
                const obj = {
                    children: (
                        <div
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg"
                            style={{ backgroundColor: typeInfo.bgColor }}
                        >
                            <span style={{ color: typeInfo.color, fontSize: '18px' }}>{typeInfo.icon}</span>
                            <span style={{ color: typeInfo.color, fontWeight: 'bold' }}>{typeInfo.label}</span>
                        </div>
                    ),
                    props: {},
                };

                if (record.typeRowSpan === 0) {
                    obj.props.rowSpan = 0;
                } else {
                    obj.props.rowSpan = record.typeRowSpan;
                }

                return obj;
            },
        },
        {
            title: 'Hạng mục kiểm tra',
            key: 'name',
            dataIndex: 'name',
            align: 'left',
            width: '250px',
            fixed: 'left',
            render: (value, record) => {
                const obj = {
                    children: value,
                    props: {},
                };

                if (record.nameRowSpan === 0) {
                    obj.props.rowSpan = 0;
                } else {
                    obj.props.rowSpan = record.nameRowSpan;
                }

                return obj;
            },
        },
        {
            title: 'Nội dung yêu cầu',
            key: 'requestContent',
            dataIndex: 'requestContent',
            align: 'left',
            width: '250px',
            render: (value) => value || <span style={{ color: '#999' }}>---</span>,
        },
        {
            title: 'Tiêu chuẩn',
            key: 'standard',
            dataIndex: 'standard',
            align: 'left',
            width: '250px',
            render: (value) => value || <span style={{ color: '#999' }}>---</span>,
        },
        {
            title: 'BP phụ trách 1',
            key: 'responsibility1',
            align: 'center',
            width: '150px',
            render: (_, record) => renderDeptTag(record.responsibility1Code, record.responsibility1Name, 'geekblue'),
        },
        {
            title: 'Kết quả BP 1',
            key: 'resultByResponsibility1',
            align: 'center',
            width: '150px',
            render: (_, record) => {
                const resultNode = renderResultTag(record.resultByResponsibility1);
                if (!resultNode) return renderPlaceholder();
                const deptName = record.responsibility1Name || 'BP 1';
                return <Tooltip title={`Kết quả của ${deptName}`}>{resultNode}</Tooltip>;
            },
        },
        {
            title: 'BP phụ trách 2',
            key: 'responsibility2',
            align: 'center',
            width: '150px',
            render: (_, record) => {
                if (!record.responsibility2Code) return renderPlaceholder();
                return renderDeptTag(record.responsibility2Code, record.responsibility2Name, 'purple');
            },
        },
        {
            title: 'Kết quả BP 2',
            key: 'resultByResponsibility2',
            align: 'center',
            width: '150px',
            render: (_, record) => {
                const resultNode = renderResultTag(record.resultByResponsibility2);
                if (!resultNode) return renderPlaceholder();
                const deptName = record.responsibility2Name || 'BP 2';
                return <Tooltip title={`Kết quả của ${deptName}`}>{resultNode}</Tooltip>;
            },
        },
        {
            title: 'Kết quả cuối',
            key: 'finalResult',
            dataIndex: 'finalResult',
            align: 'center',
            width: '120px',
            render: (value) => renderResultTag(value) || renderPlaceholder('Chưa có'),
        },
        {
            title: 'Ghi chú',
            key: 'remark',
            dataIndex: 'remark',
            align: 'left',
            width: '200px',
            render: (value) => value || <span style={{ color: '#999', fontStyle: 'italic' }}>Chưa có</span>,
        },
        {
            title: 'Người giao',
            key: 'assignByName',
            dataIndex: 'assignByName',
            align: 'center',
            width: '150px',
            render: (value) => value || <span style={{ color: '#999' }}>---</span>,
        },
        {
            title: 'Người nhận',
            key: 'receivedByName',
            dataIndex: 'receivedByName',
            align: 'center',
            width: '150px',
            render: (value) => value || <span style={{ color: '#999' }}>---</span>,
        },
        {
            title: 'File đính kèm',
            key: 'files',
            dataIndex: 'files',
            align: 'center',
            width: '120px',
            render: (files) => {
                if (!files || files.length === 0) {
                    return <span style={{ color: '#999' }}>Không có</span>;
                }
                return (
                    <Tooltip
                        title={
                            <div>
                                {files.map((file, index) => (
                                    <div key={index} style={{ marginBottom: 4 }}>
                                        <a
                                            href={`${process.env.REACT_APP_UPLOAD_URL}/${file.filePath}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: '#fff' }}
                                        >
                                            📎 {file.filePath ? file.filePath.split('/').pop() : 'Unknown file'}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        }
                    >
                        <Tag color="blue" style={{ cursor: 'pointer' }}>
                            {files.length} file
                        </Tag>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            width: '150px',
            fixed: 'right',
            render: (_, record) => {
                if (!canEditItem(record)) {
                    return <span style={{ color: '#999' }}>---</span>;
                }

                return (
                    <Space>
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => handleEdit(record)}
                            />
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    if (!mpCheckList && !loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Empty description="Chưa có danh sách kiểm tra MP" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    {onCreate && canCreateMpCheckList && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
                            Tạo danh sách kiểm tra MP
                        </Button>
                    )}
                </Empty>
            </div>
        );
    }

    const renderMobileList = () => {
        const groupedByType = {};
        processedData.forEach((item) => {
            if (!groupedByType[item.type]) {
                groupedByType[item.type] = [];
            }
            groupedByType[item.type].push(item);
        });

        return (
            <>
                {canDeleteMpCheckList && mpCheckList && (
                    <Popconfirm
                        title="Xóa danh sách?"
                        description="Hành động này không thể hoàn tác!"
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                        onConfirm={handleDelete}
                    >
                        <Button danger icon={<DeleteOutlined />} block size="small">
                            Xóa danh sách kiểm tra MP
                        </Button>
                    </Popconfirm>
                )}

                {Object.entries(groupedByType).map(([type, items]) => {
                    const typeInfo = getTypeInfo(type);
                    return (
                        <Card
                            key={type}
                            style={{ marginBottom: 12 }}
                            size="small"
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ color: typeInfo.color, fontSize: 16 }}>{typeInfo.icon}</span>
                                    <strong style={{ color: typeInfo.color }}>{typeInfo.label}</strong>
                                </div>
                            }
                            headStyle={{
                                backgroundColor: typeInfo.bgColor,
                                borderBottom: `2px solid ${typeInfo.color}`,
                            }}
                        >
                            <List
                                dataSource={items}
                                renderItem={(item, index) => (
                                    <div
                                        key={item.id}
                                        style={{
                                            marginBottom: 16,
                                            paddingBottom: 16,
                                            borderBottom: index < items.length - 1 ? '1px solid #f0f0f0' : 'none',
                                        }}
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                                            <div>
                                                <strong style={{ color: '#1890ff' }}>{item.name}</strong>
                                            </div>

                                            {item.requestContent && (
                                                <div style={{ fontSize: 12 }}>
                                                    <strong>Yêu cầu:</strong> {item.requestContent}
                                                </div>
                                            )}

                                            {item.standard && (
                                                <div style={{ fontSize: 12 }}>
                                                    <strong>Tiêu chuẩn:</strong> {item.standard}
                                                </div>
                                            )}

                                            <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                                                <Col span={12}>
                                                    <div style={{ fontSize: 11 }}>
                                                        <strong>BP 1:</strong>{' '}
                                                        {renderDeptTag(
                                                            item.responsibility1Code,
                                                            item.responsibility1Name,
                                                            'geekblue',
                                                        )}
                                                    </div>
                                                    {renderResultTag(item.resultByResponsibility1) && (
                                                        <div style={{ marginTop: 4 }}>
                                                            {renderResultTag(item.resultByResponsibility1)}
                                                        </div>
                                                    )}
                                                </Col>

                                                {item.responsibility2Code && (
                                                    <Col span={12}>
                                                        <div style={{ fontSize: 11 }}>
                                                            <strong>BP 2:</strong>{' '}
                                                            {renderDeptTag(
                                                                item.responsibility2Code,
                                                                item.responsibility2Name,
                                                                'purple',
                                                            )}
                                                        </div>
                                                        {renderResultTag(item.resultByResponsibility2) && (
                                                            <div style={{ marginTop: 4 }}>
                                                                {renderResultTag(item.resultByResponsibility2)}
                                                            </div>
                                                        )}
                                                    </Col>
                                                )}
                                            </Row>

                                            {item.remark && (
                                                <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                                                    <strong>Ghi chú:</strong> {item.remark}
                                                </div>
                                            )}

                                            {canEditItem(item) && (
                                                <Button
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    onClick={() => handleEdit(item)}
                                                    style={{ marginTop: 4 }}
                                                >
                                                    Cập nhật
                                                </Button>
                                            )}
                                        </Space>
                                    </div>
                                )}
                            />
                        </Card>
                    );
                })}
            </>
        );
    };

    if (isMobile) {
        return (
            <>
                {renderMobileList()}
                <MpHandoverUpdateModal
                    open={editModalVisible}
                    onCancel={handleEditCancel}
                    editingItem={editingItem}
                    onSuccess={handleEditSuccess}
                />
            </>
        );
    }

    return (
        <>
            {canDeleteMpCheckList && mpCheckList && (
                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa toàn bộ danh sách kiểm tra MP này?"
                        description="Hành động này không thể hoàn tác!"
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                        onConfirm={handleDelete}
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Xóa danh sách kiểm tra MP
                        </Button>
                    </Popconfirm>
                </div>
            )}
            <Table
                className="mp-handover-table"
                columns={columns}
                dataSource={processedData}
                rowKey={(record) => record.id}
                pagination={false}
                loading={loading}
                bordered
                scroll={{ x: 'max-content', y: 'calc(100vh - 300px)' }}
            />

            <MpHandoverUpdateModal
                open={editModalVisible}
                onCancel={handleEditCancel}
                editingItem={editingItem}
                onSuccess={handleEditSuccess}
            />
        </>
    );
};

export default MpCheckList;
