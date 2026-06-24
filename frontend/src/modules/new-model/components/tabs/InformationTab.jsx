import { DeleteOutlined, EditOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Image, Row, Space, Table, Tag } from 'antd';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TitleHightlight from '~/components/utils/TitleHightlight';
import { useIsMobile } from '~/hook/useIsMobile';
import authService from '~/modules/auth/services/authService';
import highlightText from '~/utils/highlightText';
import { renderNmdStatusTag } from '~/utils/renderTag';
import { EMPTY_PLACEHOLDER } from '../../constants/constants';
import ProductEventHistoryModal from '../ProductEventHistoryModal';
import ProductFieldHistoryBadge from '../ProductFieldHistoryBadge';
import ProductMaterialHistoryModal from '../ProductMaterialHistoryModal';

const renderProductCategory = (product) => {
    const categoryName = product?.categoryName || product?.productCategory?.replace(/_/g, ' ') || EMPTY_PLACEHOLDER;
    const categoryColor = product?.categoryColor || 'default';

    if (categoryName === EMPTY_PLACEHOLDER) {
        return EMPTY_PLACEHOLDER;
    }

    return <Tag color={categoryColor}>{categoryName}</Tag>;
};

const getMarketTypeLabel = (marketType) => {
    if (marketType === 'PRODUCTION_EXPORT') return 'Sản xuất xuất khẩu';
    if (marketType === 'VAT_BUSINESS') return 'Kinh doanh (VAT)';
    return EMPTY_PLACEHOLDER;
};

const renderProductStatus = (product) => {
    if (!product.isApprovedByHeadKD) {
        return (
            <Tag color="orange" className="px-2 py-1">
                Đợi phòng KD duyệt
            </Tag>
        );
    }

    return renderNmdStatusTag(product);
};

const InformationTab = ({
    product,
    highlightKeyword,
    onDelete,
    canEdit,
    canBusinessApprove,
    canNMDApprove,
    canDelete,
    onOpenNmdStatusModal,
    handleApproveProduct,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile(768);
    const isTablet = useIsMobile(1024);
    const isSuperAdmin = authService.hasRole('SUPERADMIN');
    const isNmdInfoReceived = product?.nmdInfoStatus === 'RECEIVED';
    const canShowEditButton = canEdit || isSuperAdmin;

    const [showEventHistoryModal, setShowEventHistoryModal] = useState(false);
    const [showMaterialHistoryModal, setShowMaterialHistoryModal] = useState(false);

    const creatorDisplay = (() => {
        const code = product?.createdByCode || product?.createdBy;
        const name = product?.createdByName;
        const department = product?.createdByDepartmentName;

        if (!code && !name && !department) {
            return EMPTY_PLACEHOLDER;
        }

        const identity = [code, name].filter(Boolean).join(' - ');
        return department ? `${identity} (${department})` : identity;
    })();

    const attachmentFiles = Array.isArray(product?.files) ? product.files : [];

    const getFieldHistoryCount = (fieldName) => {
        if (!product?.historySummary || !Array.isArray(product.historySummary)) return 0;
        const summary = product.historySummary.find((item) => item.fieldName === fieldName);
        return summary?.count || 0;
    };

    const getEventRequirementsHistoryCount = () => {
        if (!product?.historySummary || !Array.isArray(product.historySummary)) return 0;
        return product.historySummary
            .filter((item) => item.fieldName.startsWith('eventRequirements.'))
            .reduce((sum, item) => sum + (item.count || 0), 0);
    };

    const getMaterialsHistoryCount = () => {
        if (!product?.historySummary || !Array.isArray(product.historySummary)) return 0;
        return product.historySummary
            .filter((item) => item.fieldName.startsWith('materials.'))
            .reduce((sum, item) => sum + (item.count || 0), 0);
    };

    const renderLabelWithHistory = (label, fieldName) => {
        const count = getFieldHistoryCount(fieldName);
        return (
            <span style={{ display: 'flex', alignItems: 'center' }}>
                {label}
                {count > 0 && (
                    <ProductFieldHistoryBadge
                        productId={product?.id}
                        fieldName={fieldName}
                        count={count}
                        fieldLabel={label}
                    />
                )}
            </span>
        );
    };

    const productFields = [
        {
            label: renderLabelWithHistory('Mã khuôn', 'moldCode'),
            value: highlightText(product.moldCode, highlightKeyword, {
                emptyFallback: EMPTY_PLACEHOLDER,
                textKeyPrefix: `product-detail-mold-${product?.id || 'unknown'}`,
            }),
        },
        { label: renderLabelWithHistory('Loại sản phẩm', 'productCategory'), value: renderProductCategory(product) },
        { label: renderLabelWithHistory('Loại hình kinh doanh', 'marketType'), value: getMarketTypeLabel(product.marketType) },
        {
            label: renderLabelWithHistory('Năm vòng đời', 'lifecycleYear'),
            value: product.lifecycleYear ? `${product.lifecycleYear} năm` : EMPTY_PLACEHOLDER,
        },
        {
            label: renderLabelWithHistory('Sản lượng hàng tháng', 'monthlyOutput'),
            value: product.monthlyOutput ? `${product.monthlyOutput} pcs` : EMPTY_PLACEHOLDER,
        },
        { label: renderLabelWithHistory('MOQ', 'moq'), value: product.moq || EMPTY_PLACEHOLDER },
        { label: renderLabelWithHistory('MDQ', 'mdq'), value: product.mdq || EMPTY_PLACEHOLDER },
        {
            label: renderLabelWithHistory('Ngày nhận thông tin', 'infoReceivedDate'),
            value: product.infoReceivedDate
                ? new Date(product.infoReceivedDate).toLocaleDateString('vi-VN')
                : EMPTY_PLACEHOLDER,
        },
        {
            label: renderLabelWithHistory('Ngày mục tiêu MP', 'mpTargetDate'),
            value: product.mpTargetDate
                ? new Date(product.mpTargetDate).toLocaleDateString('vi-VN')
                : EMPTY_PLACEHOLDER,
        },
        {
            label: 'Files',
            span: 2,
            value:
                attachmentFiles.length > 0 ? (
                    <Space direction="vertical" size={2}>
                        {attachmentFiles.map((file, index) => {
                            const filePath = file?.filePath || file?.url || file;
                            const fileName =
                                file?.remark || file?.name || filePath?.split('/')?.pop() || `File ${index + 1}`;

                            if (!filePath) {
                                return (
                                    <span
                                        key={`empty-file-${index}`}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                    >
                                        <PaperClipOutlined />
                                        <span>{fileName}</span>
                                    </span>
                                );
                            }

                            return (
                                <a
                                    key={`${filePath}-${index}`}
                                    href={`${process.env.REACT_APP_UPLOAD_URL}/${filePath}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                >
                                    <PaperClipOutlined />
                                    <span>{fileName}</span>
                                </a>
                            );
                        })}
                    </Space>
                ) : (
                    EMPTY_PLACEHOLDER
                ),
        },
        { label: renderLabelWithHistory('Ghi chú', 'remark'), value: product.remark || EMPTY_PLACEHOLDER, span: 2 },
        {
            label: renderLabelWithHistory('Ghi chú NMD', 'nmdInfoNote'),
            value: product.nmdInfoNote || EMPTY_PLACEHOLDER,
            span: 2,
        },
    ];

    const materialColumns = [
        {
            title: 'Loại',
            dataIndex: 'isQuotation',
            key: 'isQuotation',
            width: 100,
            render: (isQuotation) => (
                <span
                    style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: isQuotation ? '#e6f7ff' : '#fff7e6',
                        color: isQuotation ? '#1890ff' : '#fa8c16',
                        border: `1px solid ${isQuotation ? '#91d5ff' : '#ffd591'}`,
                    }}
                >
                    {isQuotation ? 'Báo giá' : 'Khách gửi'}
                </span>
            ),
        },
        { title: 'Loại NVL', dataIndex: 'matType', key: 'matType', render: (text) => text || EMPTY_PLACEHOLDER },
        { title: 'Grade', dataIndex: 'matGrade', key: 'matGrade', render: (text) => text || EMPTY_PLACEHOLDER },
        {
            title: 'Mã màu',
            dataIndex: 'matColorCode',
            key: 'matColorCode',
            render: (text) => text || EMPTY_PLACEHOLDER,
        },
        {
            title: 'Tên màu',
            dataIndex: 'matColorName',
            key: 'matColorName',
            render: (text) => text || EMPTY_PLACEHOLDER,
        },
        { title: 'Nhà cung cấp', dataIndex: 'matMaker', key: 'matMaker', render: (text) => text || EMPTY_PLACEHOLDER },
        {
            title: 'Tỷ lệ tái chế (%)',
            dataIndex: 'recyclingRate',
            key: 'recyclingRate',
            render: (text) => (text !== null && text !== undefined ? `${text}%` : EMPTY_PLACEHOLDER),
        },
        { title: 'MOQ', dataIndex: 'matMoq', key: 'matMoq', render: (text) => text || EMPTY_PLACEHOLDER },
        { title: 'Ghi chú', dataIndex: 'remark', key: 'remark', render: (text) => text || EMPTY_PLACEHOLDER },
    ];

    const ProductResinMappingColumns = [
        {
            title: 'Mã nhựa',
            dataIndex: 'code',
            key: 'code',
            render: (text) => text || EMPTY_PLACEHOLDER,
        },
        {
            title: 'Loại nhựa',
            dataIndex: 'type',
            key: 'type',
            render: (text) => (
                <span
                    style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: '#e6f7ff',
                        color: '#1890ff',
                        border: '1px solid #91d5ff',
                    }}
                >
                    {text || 'Không có'}
                </span>
            ),
        },
        {
            title: 'Màu sắc',
            dataIndex: 'colorName',
            key: 'colorName',
            render: (text) => text || EMPTY_PLACEHOLDER,
        },
        {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
            render: (text) => text || EMPTY_PLACEHOLDER,
        },
    ];

    const insertColumns = [
        {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
            render: (text) => text || EMPTY_PLACEHOLDER,
        },
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            render: (text) => text || EMPTY_PLACEHOLDER,
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (text) => text || EMPTY_PLACEHOLDER,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (text) => text ?? EMPTY_PLACEHOLDER,
        },
        { title: 'Đơn vị', dataIndex: 'unit', key: 'unit', render: (text) => text || EMPTY_PLACEHOLDER },
        { title: 'Nhà cung cấp', dataIndex: 'supplier', key: 'supplier', render: (text) => text || EMPTY_PLACEHOLDER },
    ];

    const machineFields = product.productMachine
        ? [
              {
                  label: renderLabelWithHistory('Công suất báo giá', 'machine.machineCapacityQuotation'),
                  value: product.productMachine.machineCapacityQuotation || EMPTY_PLACEHOLDER,
              },
              {
                  label: renderLabelWithHistory('Công suất mục tiêu', 'machine.machineCapacityTarget'),
                  value: product.productMachine.machineCapacityTarget || EMPTY_PLACEHOLDER,
              },
              {
                  label: renderLabelWithHistory('Công suất thực tế', 'machine.machineCapacityActual'),
                  value: product.productMachine.machineCapacityActual || EMPTY_PLACEHOLDER,
              },

              {
                  label: renderLabelWithHistory('Thời gian chu kỳ báo giá', 'machine.cycleTimeQuotation'),
                  value: product.productMachine.cycleTimeQuotation || EMPTY_PLACEHOLDER,
              },
              {
                  label: renderLabelWithHistory('Thời gian chu kỳ mục tiêu', 'machine.cycleTimeTarget'),
                  value: product.productMachine.cycleTimeTarget || EMPTY_PLACEHOLDER,
              },
              {
                  label: renderLabelWithHistory('Thời gian chu kỳ thực tế', 'machine.cycleTimeActual'),
                  value: product.productMachine.cycleTimeActual || EMPTY_PLACEHOLDER,
              },
              {
                  label: 'Trọng lượng runner ',
                  value: product.productMachine.runnerWeightG ? (
                      <span>
                          {product.productMachine.runnerWeightG} <span className="text-gray-500">g/shot</span>
                      </span>
                  ) : (
                      EMPTY_PLACEHOLDER
                  ),
              },
              {
                  label: 'Trọng lượng runner thực tế ',
                  value: product.productMachine.runnerWeightActualG ? (
                      <span>
                          {product.productMachine.runnerWeightActualG} <span className="text-gray-500">g/shot</span>
                      </span>
                  ) : (
                      EMPTY_PLACEHOLDER
                  ),
              },
              {
                  label: 'Trọng lượng sản phẩm ',
                  value: product.productMachine.productWeightG ? (
                      <span>
                          {product.productMachine.productWeightG} <span className="text-gray-500">g/pcs</span>
                      </span>
                  ) : (
                      EMPTY_PLACEHOLDER
                  ),
              },
              {
                  label: 'Trọng lượng SP thực tế ',
                  value: product.productMachine.productWeightActualG ? (
                      <span>
                          {product.productMachine.productWeightActualG} <span className="text-gray-500">g/pcs</span>
                      </span>
                  ) : (
                      EMPTY_PLACEHOLDER
                  ),
              },

              {
                  label: renderLabelWithHistory('Loại gate', 'machine.gateType'),
                  value: product.productMachine.gateType || EMPTY_PLACEHOLDER,
              },
              {
                  label: 'Tổng (g)/pcs',
                  value:
                      product.productMachine.runnerWeightG &&
                      product.productMachine.productWeightG &&
                      product.productMachine.cavity
                          ? product.productMachine.runnerWeightG +
                            product.productMachine.productWeightG / product.productMachine.cavity
                          : EMPTY_PLACEHOLDER,
              },
              {
                  label: renderLabelWithHistory('Số cavity', 'machine.cavity'),
                  value: product.productMachine.cavity || EMPTY_PLACEHOLDER,
              },
              { label: 'Ghi chú', value: product.productMachine.machineRemark || EMPTY_PLACEHOLDER },
          ]
        : [];

    const packingFields = product.productPacking
        ? [
              {
                  label: renderLabelWithHistory('Loại hộp', 'packing.boxType'),
                  value: product.productPacking.boxType || EMPTY_PLACEHOLDER,
              },
              {
                  label: renderLabelWithHistory('Loại cover', 'packing.coverType'),
                  value: product.productPacking.coverType || EMPTY_PLACEHOLDER,
              },
              {
                  label: renderLabelWithHistory('PCS / Cover', 'packing.pcsPerCover'),
                  value: product.productPacking.pcsPerCover || EMPTY_PLACEHOLDER,
              },
              {
                  label: renderLabelWithHistory('Cover / Box', 'packing.coverPerBox'),
                  value: product.productPacking.coverPerBox || EMPTY_PLACEHOLDER,
              },
              {
                  label: 'PCS / Thùng',
                  value:
                      product.productPacking.pcsPerCover && product.productPacking.coverPerBox
                          ? product.productPacking.pcsPerCover * product.productPacking.coverPerBox
                          : EMPTY_PLACEHOLDER,
              },
              {
                  label: renderLabelWithHistory('Số lượng thùng đầu tư', 'packing.boxInvestQty'),
                  value: product.productPacking.boxInvestQty || EMPTY_PLACEHOLDER,
              },
              {
                  label: renderLabelWithHistory('Loại thùng', 'packing.isOneTimeBox'),
                  value:
                      product.productPacking.isOneTimeBox !== null && product.productPacking.isOneTimeBox !== undefined
                          ? product.productPacking.isOneTimeBox
                              ? 'Thùng dùng 1 lần'
                              : 'Thùng xoay vòng'
                          : EMPTY_PLACEHOLDER,
              },
              { label: 'Ghi chú', value: product.productPacking.remark || EMPTY_PLACEHOLDER },
          ]
        : [];

    const depreciationFields = product.productMoldDepreciation
        ? [
              {
                  label: renderLabelWithHistory('Số lượng', 'depreciation.quantityPcs'),
                  value: product.productMoldDepreciation.quantityPcs || EMPTY_PLACEHOLDER,
              },
              {
                  label: renderLabelWithHistory('Năm khấu hao', 'depreciation.year'),
                  value: product.productMoldDepreciation.depreciationYear || EMPTY_PLACEHOLDER,
              },
              { label: 'Ghi chú', value: product.productMoldDepreciation.depreciationRemark || EMPTY_PLACEHOLDER },
          ]
        : [];

    const insertFields = product.productInsert
        ? [
              { label: 'Mã linh kiện', value: product.productInsert.code || EMPTY_PLACEHOLDER },
              { label: 'Tên linh kiện', value: product.productInsert.name || EMPTY_PLACEHOLDER },
              { label: 'Số lượng', value: product.productInsert.quantity || EMPTY_PLACEHOLDER },
              { label: 'Nhà cung cấp', value: product.productInsert.supplier || EMPTY_PLACEHOLDER },
          ]
        : [];
    const eventColumns = [
        {
            title: 'Tên event',
            dataIndex: 'name',
            key: 'name',
            render: (text) => text || EMPTY_PLACEHOLDER,
        },
        {
            title: 'Ngày giao hàng',
            dataIndex: 'deliveryDate',
            key: 'deliveryDate',
            render: (text) => (text ? new Date(text).toLocaleDateString('vi-VN') : EMPTY_PLACEHOLDER),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (text) => (text !== null && text !== undefined ? `${text} pcs` : EMPTY_PLACEHOLDER),
        },
    ];

    return (
        <>
            <Row
                justify="space-between"
                style={{
                    marginBottom: isMobile ? 12 : 16,
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 8 : 0,
                }}
            >
                <div className="flex items-center gap-2">
                    {product.code ? (
                        <div className="px-2">
                            <div className="flex item-center gap-2">
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        padding: '4px 10px',
                                        borderRadius: 999,
                                        border: '1px solid #8dbbff',
                                        backgroundColor: '#eef5ff',
                                        color: '#0a4fa8',
                                        fontWeight: 700,
                                        fontSize: 13,
                                        letterSpacing: 0.4,
                                    }}
                                >
                                    Mã: {product.code}
                                </div>
                                <div
                                    style={{
                                        color: '#111827',
                                        fontWeight: 800,
                                        fontSize: isMobile ? 18 : 24,
                                    }}
                                >
                                    <TitleHightlight>{product.name || EMPTY_PLACEHOLDER}</TitleHightlight>
                                </div>
                            </div>
                            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Người tạo: {creatorDisplay}</div>
                        </div>
                    ) : (
                        EMPTY_PLACEHOLDER
                    )}
                </div>
                <Space direction={isMobile ? 'vertical' : 'horizontal'} style={{ width: isMobile ? '100%' : 'auto' }}>
                    {!product?.isApprovedByHeadKD && (authService.hasRole('SUPERADMIN') || canBusinessApprove) && (
                        <Button
                            type="primary"
                            onClick={() => handleApproveProduct && handleApproveProduct(product.id)}
                            block={isMobile}
                            size={isMobile ? 'middle' : 'default'}
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        >
                            Duyệt thông tin sản phẩm
                        </Button>
                    )}
                    {(authService.hasRole('SUPERADMIN') || (product?.isApprovedByHeadKD && canNMDApprove)) && (
                        <Button
                            type="primary"
                            onClick={onOpenNmdStatusModal}
                            disabled={isNmdInfoReceived}
                            block={isMobile}
                            size={isMobile ? 'middle' : 'default'}
                        >
                            Cập nhật trạng thái NMD
                        </Button>
                    )}
                    {canShowEditButton && (
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => navigate(`${location.pathname}/edit`)}
                            block={isMobile}
                            size={isMobile ? 'middle' : 'default'}
                        >
                            Sửa
                        </Button>
                    )}
                    {canDelete && (
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => onDelete(product.id)}
                            block={isMobile}
                            size={isMobile ? 'middle' : 'default'}
                        >
                            Xóa
                        </Button>
                    )}
                </Space>
            </Row>

            <Card
                title={
                    <div className="flex items-center justify-between">
                        <div>Thông tin sản phẩm</div>
                        <div>{renderProductStatus(product)}</div>
                    </div>
                }
                style={{ marginBottom: isMobile ? 12 : 20 }}
                size={isMobile ? 'small' : 'default'}
            >
                {product.image && (
                    <Image
                        src={`${process.env.REACT_APP_UPLOAD_URL}/${product.image}`}
                        alt="Hình sản phẩm"
                        width={isMobile ? '100%' : 200}
                        style={{ marginBottom: isMobile ? 12 : 20 }}
                    />
                )}
                <Descriptions
                    bordered
                    column={isMobile ? 1 : 2}
                    size="small"
                    labelStyle={{ width: isMobile ? '120px' : isTablet ? '160px' : '220px', fontWeight: 500 }}
                >
                    {productFields.map((field, index) => (
                        <Descriptions.Item label={field.label} key={index} span={field.span || 1}>
                            {field.value}
                        </Descriptions.Item>
                    ))}
                </Descriptions>
            </Card>

            {product.ProductResinMappings && product.ProductResinMappings.length > 0 && (
                <Card
                    title="Thông tin nhựa HTMP"
                    style={{ marginBottom: isMobile ? 12 : 20 }}
                    size={isMobile ? 'small' : 'default'}
                >
                    <Table
                        dataSource={product.ProductResinMappings}
                        columns={ProductResinMappingColumns}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        bordered
                        scroll={isMobile ? { x: 'max-content' } : undefined}
                    />
                </Card>
            )}

            {product.productMaterials && product.productMaterials.length > 0 && (
                <Card
                    title={
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            Danh sách nguyên vật liệu
                            {getMaterialsHistoryCount() > 0 && (
                                <span
                                    onClick={() => setShowMaterialHistoryModal(true)}
                                    style={{
                                        marginLeft: 8,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        padding: '2px 8px',
                                        borderRadius: 10,
                                        backgroundColor: '#f0f5ff',
                                        border: '1px solid #d6e4ff',
                                        fontSize: 12,
                                        color: '#1890ff',
                                        fontWeight: 500,
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#e6f7ff';
                                        e.currentTarget.style.borderColor = '#91d5ff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f0f5ff';
                                        e.currentTarget.style.borderColor = '#d6e4ff';
                                    }}
                                >
                                    <span style={{ fontSize: 12 }}>🧪</span>
                                    <span>{getMaterialsHistoryCount()} thay đổi</span>
                                </span>
                            )}
                        </span>
                    }
                    style={{ marginBottom: isMobile ? 12 : 20 }}
                    size={isMobile ? 'small' : 'default'}
                >
                    <Table
                        dataSource={[...product.productMaterials].sort((a, b) => {
                            if (a.isQuotation === b.isQuotation) return 0;
                            return a.isQuotation ? 1 : -1;
                        })}
                        columns={materialColumns}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        bordered
                        scroll={isMobile ? { x: 'max-content' } : undefined}
                    />
                </Card>
            )}
            {product.productInserts && product.productInserts.length > 0 && (
                <Card
                    title="Danh sách 2nd Process / Insert"
                    style={{ marginBottom: isMobile ? 12 : 20 }}
                    size={isMobile ? 'small' : 'default'}
                >
                    <Table
                        dataSource={product.productInserts}
                        columns={insertColumns}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        bordered
                        scroll={isMobile ? { x: 'max-content' } : undefined}
                    />
                </Card>
            )}

            <Card
                title={
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                        Khai báo event
                        {getEventRequirementsHistoryCount() > 0 && (
                            <span
                                onClick={() => setShowEventHistoryModal(true)}
                                style={{
                                    marginLeft: 8,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '2px 8px',
                                    borderRadius: 10,
                                    backgroundColor: '#f0f5ff',
                                    border: '1px solid #d6e4ff',
                                    fontSize: 12,
                                    color: '#1890ff',
                                    fontWeight: 500,
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#e6f7ff';
                                    e.currentTarget.style.borderColor = '#91d5ff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f0f5ff';
                                    e.currentTarget.style.borderColor = '#d6e4ff';
                                }}
                            >
                                <span style={{ fontSize: 12 }}>📝</span>
                                <span>{getEventRequirementsHistoryCount()} thay đổi</span>
                            </span>
                        )}
                    </span>
                }
                style={{ marginBottom: isMobile ? 12 : 20 }}
                size={isMobile ? 'small' : 'default'}
            >
                <Table
                    dataSource={product.productEventRequirements || []}
                    columns={eventColumns}
                    rowKey={(record, index) => record.name || `event-${index}`}
                    pagination={false}
                    size="small"
                    bordered
                    locale={{ emptyText: 'Chưa có event nào được khai báo' }}
                    scroll={isMobile ? { x: 'max-content' } : undefined}
                />
            </Card>

            <ProductEventHistoryModal
                open={showEventHistoryModal}
                onCancel={() => setShowEventHistoryModal(false)}
                productId={product?.id}
                historySummary={product?.historySummary}
            />

            <ProductMaterialHistoryModal
                open={showMaterialHistoryModal}
                onCancel={() => setShowMaterialHistoryModal(false)}
                productId={product?.id}
                historySummary={product?.historySummary}
            />

            {insertFields.length > 0 && (
                <Card
                    title="Thông tin 2nd Process / Insert (Cũ)"
                    style={{ marginBottom: isMobile ? 12 : 20 }}
                    size={isMobile ? 'small' : 'default'}
                >
                    <Descriptions
                        bordered
                        column={isMobile ? 1 : 2}
                        size="small"
                        labelStyle={{ width: isMobile ? '120px' : isTablet ? '160px' : '220px', fontWeight: 500 }}
                    >
                        {insertFields.map((field, index) => (
                            <Descriptions.Item label={field.label} key={index}>
                                {field.value}
                            </Descriptions.Item>
                        ))}
                    </Descriptions>
                </Card>
            )}

            {machineFields.length > 0 && (
                <Card
                    title="Thông tin sản phẩm và máy"
                    style={{ marginBottom: isMobile ? 12 : 20 }}
                    size={isMobile ? 'small' : 'default'}
                >
                    <Descriptions
                        bordered
                        column={isMobile ? 1 : isTablet ? 2 : 3}
                        size="small"
                        labelStyle={{
                            fontWeight: 500,
                            width: isMobile ? '120px' : isTablet ? '150px' : '140px',
                            whiteSpace: 'nowrap',
                        }}
                        contentStyle={{ minWidth: 80 }}
                    >
                        {machineFields.map((field, index) => (
                            <Descriptions.Item label={field.label} key={index}>
                                {field.value}
                            </Descriptions.Item>
                        ))}
                    </Descriptions>
                </Card>
            )}

            {depreciationFields.length > 0 && (
                <Card
                    title="Thông tin khấu hao khuôn"
                    style={{ marginBottom: isMobile ? 12 : 20 }}
                    size={isMobile ? 'small' : 'default'}
                >
                    <Descriptions
                        bordered
                        column={isMobile ? 1 : 2}
                        size="small"
                        labelStyle={{ width: isMobile ? '120px' : isTablet ? '160px' : '220px', fontWeight: 500 }}
                    >
                        {depreciationFields.map((field, index) => (
                            <Descriptions.Item label={field.label} key={index}>
                                {field.value}
                            </Descriptions.Item>
                        ))}
                    </Descriptions>
                </Card>
            )}

            {packingFields.length > 0 && (
                <Card
                    title="Thông tin đóng gói"
                    style={{ marginBottom: isMobile ? 12 : 20 }}
                    size={isMobile ? 'small' : 'default'}
                >
                    <Descriptions
                        bordered
                        column={isMobile ? 1 : 2}
                        size="small"
                        labelStyle={{ width: isMobile ? '120px' : isTablet ? '160px' : '220px', fontWeight: 500 }}
                    >
                        {packingFields.map((field, index) => (
                            <Descriptions.Item label={field.label} key={index}>
                                {field.value}
                            </Descriptions.Item>
                        ))}
                    </Descriptions>
                </Card>
            )}
        </>
    );
};

export default InformationTab;
