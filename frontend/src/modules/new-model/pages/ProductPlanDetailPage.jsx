import { CheckOutlined, DeleteOutlined, EditOutlined, PlusOutlined, ToolOutlined } from '@ant-design/icons';
import {
    Alert,
    Button,
    Card,
    Col,
    Descriptions,
    Empty,
    Form,
    Input,
    List,
    message,
    Modal,
    Popconfirm,
    Row,
    Space,
    Spin,
    Table,
    Tabs,
    Tag,
    Typography,
} from 'antd';
import TabPane from 'antd/es/tabs/TabPane';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import authService from '~/modules/auth/services/authService';
import socket, { acquireSocketConnection, releaseSocketConnection } from '~/modules/notification/socket';
import productPlanDelayLogService from '../services/productPlanDelayLogService';
import productPlanService from '../services/productPlanService';

import { Info, QrCode } from 'lucide-react';
import { renderApprovedStatusTag } from '~/utils/renderTag';
import ApproveConditionFileModal from '../components/modal/ApproveConditionFileModal';
import FaDeliveryFormModal from '../components/modal/FaDeliveryFormModal';
import FaInspectionFormModal from '../components/modal/InspectionFormModal';
import MoldIssuesFromModal from '../components/modal/IssuesFromModal';
import MoldTrialPlanKTModal from '../components/modal/PlanKTModal';
import MoldTrialPlanLOGModal from '../components/modal/PlanLOGModal';
import PlanPcUpdateModal from '../components/modal/PlanPcUpdateModal';
import ProductPlanModal from '../components/modal/ProductPlanModal';
import PlanApprovalModal from '../components/PlanApprovalModal';
import PlanApprovalProgress from '../components/PlanApprovalProgress';
import MoldTrialPlanApproveResults from '../components/PlanApproveResults';
import ProductionLotFormModal from '../components/productionLot/ProductionLotFormModal';
import ProductionLotTable from '../components/productionLot/ProductionLotTable';
import MoldTrialPlanIssueTable from '../components/table/MoldTrialPlanIssueTable';
import ProductPlanDelayLogTable from '../components/table/ProductPlanDelayLogTable';
import { NOT_AVAILABLE_PLACEHOLDER, TAB_KEYS } from '../constants/constants';
import { usePlanData } from '../hooks/usePlanData';
import faInspectionService from '../services/faInspectionService';
import { mapDeliveryInformation, mapDetailInformation, mapGeneralInformation } from '../utils/moldTrialPlanDataMapper';

const { Title } = Typography;

const generalDescriptionsLabelStyle = {
    width: '16.66%',
    fontWeight: 500,
    verticalAlign: 'top',
    padding: '12px 16px',
};

const generalDescriptionsContentStyle = {
    width: '16.66%',
    verticalAlign: 'top',
    padding: '12px 16px',
};

const detailDescriptionsLabelStyle = {
    width: '25%',
    minWidth: '25%',
    fontWeight: 500,
    verticalAlign: 'top',
    padding: '12px 16px',
};

const detailDescriptionsContentStyle = {
    width: '25%',
    verticalAlign: 'top',
    padding: '12px 16px',
};

const detailValueWrapperStyle = {
    width: '100%',
    lineHeight: 1.6,
};

const inspectionPanelStyle = {
    height: '100%',
    borderRadius: 16,
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
};

const contentCardStyle = {
    marginBottom: '20px',
    borderRadius: 18,
    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    overflow: 'hidden',
};

const nestedCardStyle = {
    borderRadius: 16,
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.07)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    overflow: 'hidden',
};

const cardHoverHandlers = {
    onMouseEnter: (event) => {
        event.currentTarget.style.transform = 'translateY(-4px)';
        event.currentTarget.style.boxShadow = '0 18px 40px rgba(15, 23, 42, 0.14)';
    },
    onMouseLeave: (event) => {
        event.currentTarget.style.transform = 'translateY(0)';
        event.currentTarget.style.boxShadow = event.currentTarget.dataset.baseShadow || '';
    },
};

const getCardHoverProps = (style, shouldHover = true) =>
    shouldHover
        ? {
              hoverable: true,
              style,
              'data-base-shadow': style.boxShadow,
              ...cardHoverHandlers,
          }
        : {
              hoverable: false,
              style: {
                  ...style,
                  cursor: 'default',
                  transition: 'none',
              },
          };

const getStaticCardProps = (style) => ({
    hoverable: false,
    style: {
        ...style,
        cursor: 'default',
        transition: 'none',
    },
});

const inspectionDescriptionsProps = {
    column: 1,
    size: 'small',
    labelStyle: { width: '50%', fontWeight: 500 },
    contentStyle: { width: '50%' },
};

const halfDescriptionsLabelStyle = {
    width: '25%',
    fontWeight: 500,
    verticalAlign: 'top',
};

const halfDescriptionsContentStyle = {
    width: '25%',
    verticalAlign: 'top',
};

const formatInspectionEmployee = (code, name) => {
    if (!code && !name) return NOT_AVAILABLE_PLACEHOLDER;
    if (!code) return name;
    if (!name) return code;
    return `${code} - ${name}`;
};

const formatInspectionDate = (value) => (value ? dayjs(value).format('DD/MM/YYYY') : NOT_AVAILABLE_PLACEHOLDER);

const renderInspectionResultTag = (result) => {
    if (!result) {
        return <Tag color="default">Chưa cập nhật</Tag>;
    }

    const colorMap = {
        OK: 'success',
        NG: 'error',
        NGA: 'warning',
    };

    return <Tag color={colorMap[result] || 'processing'}>{result}</Tag>;
};

const renderInspectionDefectList = (details) => {
    if (!Array.isArray(details) || details.length === 0) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có lỗi được ghi nhận" />;
    }

    return (
        <List
            size="small"
            dataSource={details}
            renderItem={(detail, index) => (
                <List.Item key={`${detail?.id || 'detail'}-${index}`}>
                    <Space direction="vertical" size={2} style={{ width: '100%' }}>
                        <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
                            <Typography.Text strong>
                                {detail?.defectCode || 'Chưa có mã'}
                                {detail?.defectCodeDescription ? ` - ${detail.defectCodeDescription}` : ''}
                            </Typography.Text>
                            <Tag color="gold" style={{ marginInlineEnd: 0 }}>
                                SL {detail?.quantity || 0}
                            </Tag>
                        </Space>
                        {detail?.note ? (
                            <Typography.Text type="secondary">Ghi chú: {detail.note}</Typography.Text>
                        ) : null}
                    </Space>
                </List.Item>
            )}
        />
    );
};

const hasInspectionValue = (...values) =>
    values.some((value) => {
        if (Array.isArray(value)) {
            return value.length > 0;
        }

        return value !== null && value !== undefined && value !== '';
    });

const InspectionSection = ({ title, checkedBy, result, defects, hasData }) => (
    <Card size="small" title={title} extra={renderInspectionResultTag(result)}>
        <Descriptions {...inspectionDescriptionsProps} style={{ marginBottom: 12 }}>
            <Descriptions.Item label="Nhân viên">{checkedBy}</Descriptions.Item>
        </Descriptions>
        <Typography.Text strong>Lỗi ghi nhận</Typography.Text>
        <div style={{ marginTop: 8 }}>{renderInspectionDefectList(defects)}</div>
    </Card>
);

const ProductPlanDetailPage = () => {
    const canUpdatePlan = authService.hasPermission('NMD_PRODUCT_PLAN_UPDATE');
    const canDeletePlan =
        authService.hasPermission('NMD_PRODUCT_PLAN_DELETE') ||
        authService.hasPermission('NMD_PRODUCT_PLAN_DELETE_NOT_APPROVED');
    const canCancelPlan = authService.hasPermission('NMD_PRODUCT_PLAN_CANCEL');
    const canCreateIssue = authService.hasPermission('NMD_PRODUCT_PLAN_ISSUE_CREATE');
    const canCreateFaInspection = authService.hasPermission('NMD_PRODUCT_PLAN_FA_INSPECTION_CREATE');
    const canUpdateFaInspection = authService.hasPermission('NMD_PRODUCT_PLAN_FA_INSPECTION_UPDATE');
    const canDeleteFaInspection = authService.hasPermission('NMD_PRODUCT_PLAN_FA_INSPECTION_DELETE');
    const canUpdateFaDelivery = authService.hasPermission('NMD_PRODUCT_PLAN_FA_DELIVERY_UPDATE');
    const canDeleteFaDelivery = authService.hasPermission('NMD_PRODUCT_PLAN_FA_DELIVERY_DELETE');
    const canApproveFaDelivery = authService.hasPermission('NMD_PRODUCT_PLAN_FA_DELIVERY_APPROVE');
    const canUpdateActualPlan = authService.hasPermission('NMD_PRODUCT_PLAN_ACTUAL_UPDATE');
    const canUpdateMasterialPlan = authService.hasPermission('NMD_PRODUCT_PLAN_MASTERIAL_UPDATE');
    const isSuperAdmin = authService.hasRole('SUPERADMIN');
    const canUpdateRequestTime = isSuperAdmin || authService.hasPermission('NMD_PRODUCT_PLAN_REQUEST_TIME_UPDATE');

    const canApproveChecker = authService.hasPermission('NMD_PRODUCT_PLAN_APPROVE_CHECKER');
    const canApproveResin = authService.hasPermission('NMD_PRODUCT_PLAN_APPROVE_RESIN');
    const canApproveHeadNMD = authService.hasPermission('NMD_PRODUCT_PLAN_APPROVE_HEAD_NMD');
    const canApprovePC = authService.hasPermission('NMD_PRODUCT_PLAN_APPROVE_PC');

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { id: modelId, productId, planId } = useParams();
    const initialTab = searchParams.get('tab') || TAB_KEYS.INFO_DETAILS;

    const [activeTab, setActiveTab] = useState(initialTab);
    const [reloadIssues, setReloadIssues] = useState(false);
    const [reloadInspection, setReloadInspection] = useState(false);
    const [reloadDelivery, setReloadDelivery] = useState(false);
    const [reloadPlans, setReloadPlans] = useState(false);
    const [reloadDelayLogs, setReloadDelayLogs] = useState(false);
    const [openModalIssue, setOpenModalIssue] = useState(false);
    const [openModalInspection, setOpenModalInspection] = useState(false);
    const [openModalDelivery, setOpenModalDelivery] = useState(false);
    const [openApproveModal, setOpenApproveModal] = useState(false);
    const [openPlanModal, setOpenPlanModal] = useState(false);
    const [openPlanModalForKT, setOpenPlanModalForKT] = useState(false);
    const [openPlanModalForLOG, setOpenPlanModalForLOG] = useState(false);
    const [openRequestTimeModal, setOpenRequestTimeModal] = useState(false);
    const [openCancelPlanModal, setOpenCancelPlanModal] = useState(false);

    const [openApprovalModal, setOpenApprovalModal] = useState(false);
    const [selectedApproval, setSelectedApproval] = useState(null);

    const [openProductionLotModal, setOpenProductionLotModal] = useState(false);
    const [reloadProductionLots, setReloadProductionLots] = useState(false);
    const [editingProductionLot, setEditingProductionLot] = useState(null);

    const [editingIssue, setEditingIssue] = useState(null);
    const [editingInspection, setEditingInspection] = useState(null);
    const [editingDelivery, setEditingDelivery] = useState(null);
    const [delayLogCount, setDelayLogCount] = useState(0);
    const [receivingSample, setReceivingSample] = useState(false);

    const handleReceiveSample = async () => {
        if (!plan?.id) return;
        try {
            setReceivingSample(true);
            await faInspectionService.receiveFaInspection(plan.id);
            message.success('Nhận mẫu thành công');
            await fetchInspection();
        } catch (error) {
            message.error(error?.message || 'Nhận mẫu thất bại');
        } finally {
            setReceivingSample(false);
        }
    };

    const { plan, inspection, delivery, loading, employeeName, fetchPlan, fetchInspection, fetchDelivery, cancelPlan } =
        usePlanData(planId);

    const [cancelForm] = Form.useForm();

    useEffect(() => {
        fetchPlan();
    }, [planId, reloadPlans]);

    useEffect(() => {
        if (!plan?.id) return;
        fetchInspection();
    }, [reloadInspection, plan?.id]);

    useEffect(() => {
        if (!plan?.id) return;
        fetchDelivery();
    }, [reloadDelivery, plan?.id]);

    useEffect(() => {
        if (!plan?.id) return;
        const fetchDelayLogCount = async () => {
            try {
                const delayLogs = await productPlanDelayLogService.getDelayLogsByPlanId(plan.id);
                setDelayLogCount(Array.isArray(delayLogs) ? delayLogs.length : 0);
            } catch (error) {
                setDelayLogCount(0);
            }
        };
        fetchDelayLogCount();
    }, [plan?.id, reloadDelayLogs]);

    useEffect(() => {
        const currentTab = searchParams.get('tab') || TAB_KEYS.INFO_DETAILS;
        setActiveTab(currentTab);
    }, [searchParams]);

    useEffect(() => {
        const currentUser = authService.getUserInfo();
        if (!currentUser?.id || !planId) return;

        acquireSocketConnection(currentUser.id);

        const handleNotification = (data) => {
            const notif = data?.notification;
            if (!notif || !notif.url) return;

            const isRelatedToPlan =
                notif.url.includes(`/plans/${planId}`) ||
                notif.url.includes(`plan/${planId}`) ||
                notif.url.includes(`planId=${planId}`);

            if (isRelatedToPlan) {
                fetchPlan();

                if (plan?.id) {
                    fetchInspection();
                    fetchDelivery();
                }

                setReloadIssues((prev) => !prev);
                setReloadDelayLogs((prev) => !prev);
                setReloadProductionLots((prev) => !prev);

                message.info({
                    content: notif.message || 'Kế hoạch đã được cập nhật',
                    duration: 3,
                    key: `plan-update-${planId}`,
                });
            }
        };

        socket.on('notification', handleNotification);

        return () => {
            socket.off('notification', handleNotification);
            releaseSocketConnection();
        };
    }, [planId, fetchPlan, fetchInspection, fetchDelivery, plan?.id]);

    const handleTabChange = useCallback(
        async (key) => {
            setActiveTab(key);
            setSearchParams({ tab: key });

            if (!plan?.id) return;

            switch (key) {
                case TAB_KEYS.FA_INSPECTION:
                    if (!inspection) await fetchInspection();
                    break;
                case TAB_KEYS.FA_SUBMIT:
                    if (!delivery) await fetchDelivery();
                    break;
                default:
                    break;
            }
        },
        [plan?.id, inspection, delivery, fetchInspection, fetchDelivery, setSearchParams],
    );

    const handleOpenInspectionModal = useCallback(() => {
        setEditingInspection(inspection || null);
        setOpenModalInspection(true);
    }, [inspection]);

    const handleOpenDeliveryModal = useCallback(() => {
        if (!inspection) {
            message.warning('Chưa có thông tin kiểm tra FA, vui lòng tạo thông tin kiểm tra FA trước!');
            return;
        }

        if (!inspection.finalResult || inspection.finalResult === 'NG') {
            message.warning('Kết quả kiểm tra FA chưa đạt hoặc chưa có. Không thể tạo thông tin giao hàng!');
            return;
        }

        setEditingDelivery(delivery || null);
        setOpenModalDelivery(true);
    }, [inspection, delivery]);

    const handleCancelPlan = useCallback(
        async (id, remark) => {
            await cancelPlan(id, remark);
            setOpenCancelPlanModal(false);
            cancelForm.resetFields();
        },
        [cancelPlan, cancelForm],
    );

    const handleDelete = async (id) => {
        try {
            await productPlanService.deleteMoldTrialPlan(id);
            message.success('Xóa kế hoạch thành công!');
            navigate(`/product-manager/models/${modelId}/products/${productId}?tab=plan`);
        } catch (error) {
            message.error(error?.message || 'Xóa kế hoạch thất bại');
        }
    };

    //

    const handleOpenIssueModal = useCallback((record = null) => {
        setEditingIssue(record);
        setOpenModalIssue(true);
    }, []);

    const handleOpenPlanKTModal = useCallback(() => {
        setOpenPlanModalForKT(true);
    }, []);

    const handleOpenPlanLOGModal = useCallback(() => {
        setOpenPlanModalForLOG(true);
    }, []);

    const handleOpenRequestTimeModal = useCallback(() => {
        setOpenRequestTimeModal(true);
    }, []);

    const handleOpenProductionLotModal = useCallback((record = null) => {
        setEditingProductionLot(record);
        setOpenProductionLotModal(true);
    }, []);

    const hasApprovalPermission = useCallback((requiredPermission) => {
        if (!requiredPermission) return true;
        return authService.hasPermission(requiredPermission);
    }, []);

    const handleApproveClick = useCallback((approval) => {
        if (approval.requiredPermission && !authService.hasPermission(approval.requiredPermission)) {
            message.error('Bạn không có quyền phê duyệt bước này');
            return;
        }
        setSelectedApproval(approval);
        setOpenApprovalModal(true);
    }, []);

    const handleApprovalSubmit = useCallback(
        async (data) => {
            try {
                await productPlanService.approveProductPlanApproval(planId, data);
                message.success('Phê duyệt thành công');
                setOpenApprovalModal(false);
                setSelectedApproval(null);

                setReloadPlans((prev) => !prev);
            } catch (error) {
                message.error(error.message || 'Có lỗi xảy ra khi phê duyệt');
            }
        },
        [planId],
    );

    if (loading || !plan) {
        return (
            <Spin tip="Đang tải dữ liệu...">
                <Alert message="Đang tải thông tin kế hoạch thử khuôn" type="info" />
            </Spin>
        );
    }

    const approvedConditionFile = delivery?.conditionFileApprovalResult === 'OK';
    const isPlanCancelled = plan?.status === 'CANCELLED';
    const isPcApproved =
        plan?.approvals?.some(
            (approval) =>
                approval?.requiredPermission === 'NMD_PRODUCT_PLAN_APPROVE_PC' && approval?.status === 'APPROVED',
        ) || false;
    const isAllApprovalsApproved =
        Array.isArray(plan?.approvals) &&
        plan.approvals.length > 0 &&
        plan.approvals.every((approval) => approval?.status === 'APPROVED');
    const canShowUpdatePlanButton = canUpdatePlan && !isAllApprovalsApproved;

    const isEventType = plan?.typePlan === 'EVENT';
    const isMoldTrialType = plan?.typePlan === 'MOLD_TRIAL' || plan?.typePlan === 'THU_KHUON';

    const generalInfomation = mapGeneralInformation(plan);
    const detailInfomation4Col = mapDetailInformation(plan);
    const deliveryInfomation = mapDeliveryInformation(delivery, plan?.typePlan);
    const createdAtValue = plan?.createdAt || plan?.createdDate || plan?.createDate;
    const createdAtText = createdAtValue ? dayjs(createdAtValue).format('HH:mm DD/MM/YYYY') : 'Chưa có thời gian tạo';
    const creatorCode = plan?.createdByCode || plan?.createdBy || '---';
    const creatorName = plan?.createdByName || employeeName || 'Chưa có tên';
    const creatorDisplay = `${creatorCode} - ${creatorName}`;
    const hasInspectionGeneralData = hasInspectionValue(
        inspection?.receivedByEmployeeCode,
        inspection?.receivedByEmployeeName,
        inspection?.receivedDate,
        inspection?.inspectionDate,
        inspection?.inspectedQuantity,
    );
    const hasVisualInspectionData = hasInspectionValue(
        inspection?.visualCheckedByCode,
        inspection?.visualCheckedByName,
        inspection?.visualResult,
        inspection?.visualDefectDetails,
    );
    const hasDimensionInspectionData = hasInspectionValue(
        inspection?.dimensionCheckedByCode,
        inspection?.dimensionCheckedByName,
        inspection?.dimensionResult,
        inspection?.dimensionDefectDetails,
    );
    const hasFinalInspectionData = hasInspectionValue(
        inspection?.finalCheckedByCode,
        inspection?.finalCheckedByName,
        inspection?.finalResult,
        inspection?.ngQuantity,
        inspection?.ngRate,
    );
    const hasInspectionAttachmentData = hasInspectionValue(inspection?.qcNote, inspection?.filePath);

    const insertTableColumns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            width: 60,
            align: 'center',
            render: (stt) => <span style={{ fontWeight: 500, color: '#595959' }}>#{stt}</span>,
        },
        {
            title: 'Mã Linh kiện / NVL',
            dataIndex: 'code',
            key: 'code',
            align: 'center',
            render: (code) => (
                <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    {code || <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>Chưa nhập</span>}
                </span>
            ),
        },

        {
            title: 'Tên Linh kiện / NVL',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
            render: (name) => (
                <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    {name || <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>Chưa nhập</span>}
                </span>
            ),
        },
        {
            title: 'Số lượng dự kiến',
            dataIndex: 'quantityExpected',
            key: 'quantityExpected',
            align: 'center',
            render: (quantity) =>
                quantity ? `${quantity} cái` : <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>Chưa nhập</span>,
        },
        {
            title: 'Nơi cấp',
            dataIndex: 'supplier',
            key: 'supplier',
            align: 'center',
            render: (supplier) => supplier || <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>-</span>,
        },
        {
            title: 'Ghi chú',
            dataIndex: 'description',
            key: 'description',
            align: 'left',
            render: (description) => description || <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>-</span>,
        },
    ];

    const plasticsTableColumns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            width: 60,
            align: 'center',
            render: (stt) => <span style={{ fontWeight: 500, color: '#595959' }}>#{stt}</span>,
        },
        {
            title: 'Mã nhựa HTMP',
            dataIndex: 'resin',
            key: 'resinCode',
            align: 'center',
            render: (resin) =>
                resin?.code ? (
                    <span style={{ fontWeight: 600, color: '#1890ff' }}>{resin.code}</span>
                ) : (
                    <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>Chưa chọn</span>
                ),
        },
        {
            title: 'Màu nhựa',
            dataIndex: 'resin',
            key: 'colorName',
            align: 'center',
            render: (resin) => resin?.colorName || <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>-</span>,
        },
        {
            title: 'Loại nhựa',
            dataIndex: 'resin',
            key: 'type',
            align: 'center',
            render: (resin) => resin?.type || <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>-</span>,
        },
        {
            title: 'Grade nhựa',
            dataIndex: 'resin',
            key: 'grade',
            align: 'center',
            render: (resin) => resin?.grade || <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>-</span>,
        },
        {
            title: 'Phân loại',
            dataIndex: 'isRecycle',
            key: 'isRecycle',
            align: 'center',
            render: (isRecycle) => (
                <span
                    style={{
                        backgroundColor: isRecycle ? '#e6f7ff' : '#f6ffed',
                        color: isRecycle ? '#0050b3' : '#389e0d',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        border: isRecycle ? '1px solid #91d5ff' : '1px solid #b7eb8f',
                        display: 'inline-block',
                    }}
                >
                    {isRecycle ? 'Tái sinh' : 'Nguyên chất'}
                </span>
            ),
        },
        {
            title: 'Khối lượng dự kiến (Kg)',
            dataIndex: 'plasticExpectedWeight',
            key: 'plasticExpectedWeight',
            align: 'center',
            render: (expected) => expected ?? <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>Chưa nhập</span>,
        },
        {
            title: 'Khối lượng thực tế (Kg)',
            dataIndex: 'plasticActualWeight',
            key: 'plasticActualWeight',
            align: 'center',
            render: (actual) =>
                actual != null ? (
                    <span
                        style={{
                            color: '#1890ff',
                            fontWeight: 600,
                            backgroundColor: '#e6f7ff',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            border: '1px solid #91d5ff',
                            display: 'inline-block',
                        }}
                    >
                        {actual}
                    </span>
                ) : (
                    <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>Chưa cập nhật</span>
                ),
        },
        {
            title: 'Ghi chú',
            dataIndex: 'resin',
            key: 'description',
            align: 'left',
            render: (resin) => resin?.description || <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>-</span>,
        },
    ];

    const supplyTableColumns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            width: 60,
            align: 'center',
            render: (stt) => <span style={{ fontWeight: 500, color: '#595959' }}>{stt}</span>,
        },
        {
            title: 'Mã vật tư',
            dataIndex: 'supply',
            key: 'supplyCode',
            align: 'center',
            render: (supply) =>
                supply?.code ? (
                    <span>{supply.code}</span>
                ) : (
                    <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>Chưa có mã</span>
                ),
        },
        {
            title: 'Tên vật tư',
            dataIndex: 'supply',
            key: 'supplyName',
            align: 'center',
            render: (supply) =>
                supply?.name ? (
                    <span>{supply.name}</span>
                ) : (
                    <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>Chưa có tên</span>
                ),
        },

        {
            title: 'Số lượng dự kiến',
            dataIndex: 'supplyExpectedQuantity',
            key: 'supplyExpectedQuantity',
            align: 'center',
            render: (quantity, record) =>
                quantity != null ? (
                    <span style={{ fontWeight: 600, color: '#111827' }}>
                        {quantity} {record.supply?.unit || ''}
                    </span>
                ) : (
                    <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>Chưa nhập</span>
                ),
        },
        {
            title: 'Số lượng thực tế',
            dataIndex: 'supplyActualQuantity',
            key: 'supplyActualQuantity',
            align: 'center',
            render: (quantity, record) =>
                quantity != null ? (
                    <span style={{ fontWeight: 600, color: '#1890ff' }}>
                        {quantity} {record.supply?.unit || ''}
                    </span>
                ) : (
                    <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>Chưa cập nhật</span>
                ),
        },
        {
            title: 'Ghi chú',
            dataIndex: 'remark',
            key: 'remark',
            align: 'left',
            render: (remark) => remark || <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>-</span>,
        },
    ];

    return (
        <div>
            <MoldIssuesFromModal
                open={openModalIssue}
                onCancel={() => {
                    setOpenModalIssue(false);
                    setEditingIssue(null);
                }}
                planId={plan.id}
                planName={plan.name}
                initialValues={editingIssue}
                onSuccess={() => setReloadIssues((prev) => !prev)}
            />
            <MoldTrialPlanKTModal
                open={openPlanModalForKT}
                onCancel={() => setOpenPlanModalForKT(false)}
                productCode={plan.productCode}
                typePlan={plan?.typePlan || 'MOLD_TRIAL'}
                initialValues={plan}
                onSuccess={() => {
                    setReloadPlans((prev) => !prev);
                    setReloadDelayLogs((prev) => !prev);
                }}
            />
            <MoldTrialPlanLOGModal
                open={openPlanModalForLOG}
                onCancel={() => setOpenPlanModalForLOG(false)}
                productCode={plan.productCode}
                initialValues={plan}
                onSuccess={() => setReloadPlans((prev) => !prev)}
            />
            <FaInspectionFormModal
                open={openModalInspection}
                onCancel={() => {
                    setOpenModalInspection(false);
                    setEditingInspection(null);
                }}
                trialPlanId={plan.id}
                trialPlanName={plan.name}
                initialValues={editingInspection}
                onSuccess={() => setReloadInspection((prev) => !prev)}
            />
            <FaDeliveryFormModal
                open={openModalDelivery}
                onCancel={() => {
                    setOpenModalDelivery(false);
                    setEditingDelivery(null);
                }}
                faInspectionId={inspection?.id}
                trialPlanName={plan.name}
                initialValues={editingDelivery}
                onSuccess={() => setReloadDelivery((prev) => !prev)}
                typePlan={plan?.typePlan}
            />
            <ApproveConditionFileModal
                open={openApproveModal}
                onCancel={() => setOpenApproveModal(false)}
                deliveryId={delivery?.id}
                onSuccess={() => setReloadDelivery((prev) => !prev)}
            />{' '}
            <ProductionLotFormModal
                open={openProductionLotModal}
                onCancel={() => {
                    setOpenProductionLotModal(false);
                    setEditingProductionLot(null);
                }}
                productPlanId={plan.id}
                initialValues={editingProductionLot}
                onSuccess={() => setReloadProductionLots((prev) => !prev)}
            />{' '}
            <ProductPlanModal
                open={openPlanModal}
                onCancel={() => setOpenPlanModal(false)}
                productId={productId}
                productCode={plan?.productCode}
                initialValues={plan}
                onSuccess={() => setReloadPlans((prev) => !prev)}
                planType={plan?.typePlan || 'MOLD_TRIAL'}
            />
            <PlanPcUpdateModal
                open={openRequestTimeModal}
                onCancel={() => {
                    setOpenRequestTimeModal(false);
                }}
                plan={plan}
                onSuccess={() => setReloadPlans((prev) => !prev)}
            />
            <Tabs activeKey={activeTab} onChange={handleTabChange} type="card">
                <TabPane tab="Thông tin chung & chi tiết" key={TAB_KEYS.INFO_DETAILS}>
                    {plan.approvals && plan.approvals.length > 0 && (
                        <PlanApprovalProgress
                            approvals={plan.approvals}
                            onApprove={isPlanCancelled ? undefined : handleApproveClick}
                            hasPermission={hasApprovalPermission}
                        />
                    )}
                    <PlanApprovalModal
                        visible={openApprovalModal}
                        approval={selectedApproval}
                        onSubmit={handleApprovalSubmit}
                        onCancel={() => {
                            setOpenApprovalModal(false);
                            setSelectedApproval(null);
                        }}
                    />
                    <Row justify="space-between" align="middle" style={{ marginBottom: 12, marginTop: 16 }}>
                        <div></div>
                        <Space wrap>
                            {canShowUpdatePlanButton && (
                                <Button
                                    icon={<EditOutlined />}
                                    onClick={() => setOpenPlanModal(true)}
                                    disabled={isPlanCancelled}
                                >
                                    Cập nhật
                                </Button>
                            )}
                            {canUpdateActualPlan &&
                                (isSuperAdmin || (!isSuperAdmin && plan.status !== 'WAITTINGAPPROVALPLAN')) && (
                                    <Button
                                        icon={<EditOutlined />}
                                        onClick={handleOpenPlanKTModal}
                                        disabled={isPlanCancelled}
                                    >
                                        Cập nhật tiến độ thực tế
                                    </Button>
                                )}
                            {canUpdateMasterialPlan &&
                                (isSuperAdmin || (!isSuperAdmin && plan.status !== 'WAITTINGAPPROVALPLAN')) && (
                                    <Button
                                        icon={<EditOutlined />}
                                        onClick={handleOpenPlanLOGModal}
                                        disabled={isPlanCancelled}
                                    >
                                        Cập nhật nguyên vật liệu và linh kiện thực tế
                                    </Button>
                                )}
                            {canUpdateRequestTime && (
                                <Button
                                    icon={<EditOutlined />}
                                    onClick={handleOpenRequestTimeModal}
                                    disabled={isPlanCancelled}
                                >
                                    PC chỉnh sửa thông tin
                                </Button>
                            )}
                            {canCancelPlan && (
                                <>
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        disabled={isPlanCancelled}
                                        onClick={() => setOpenCancelPlanModal(true)}
                                    >
                                        {plan.status === 'CANCELLED' ? 'Đã hủy kế hoạch' : 'Hủy kế hoạch'}
                                    </Button>
                                    <Modal
                                        title="Hủy kế hoạch"
                                        open={openCancelPlanModal}
                                        onCancel={() => {
                                            setOpenCancelPlanModal(false);
                                            cancelForm.resetFields();
                                        }}
                                        okText="Xác nhận hủy"
                                        okButtonProps={{ danger: true }}
                                        onOk={async () => {
                                            try {
                                                const values = await cancelForm.validateFields();
                                                await handleCancelPlan(plan.id, {
                                                    remark: values.remark,
                                                });
                                            } catch (error) {}
                                        }}
                                    >
                                        <Form form={cancelForm} layout="vertical">
                                            <Form.Item name="remark" label="Lý do hủy kế hoạch">
                                                <Input.TextArea
                                                    rows={4}
                                                    placeholder="Nhập lý do chi tiết về việc hủy kế hoạch này..."
                                                    showCount
                                                    maxLength={500}
                                                />
                                            </Form.Item>
                                        </Form>
                                    </Modal>
                                </>
                            )}

                            {canDeletePlan && (
                                <Popconfirm
                                    title="Xóa kế hoạch"
                                    description="Bạn có chắc chắn muốn xóa kế hoạch này?"
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    okButtonProps={{ danger: true }}
                                    onConfirm={() => handleDelete(plan.id)}
                                >
                                    <Button danger icon={<DeleteOutlined />}>
                                        Xóa
                                    </Button>
                                </Popconfirm>
                            )}
                        </Space>
                    </Row>
                    <Card title="Thông tin chung" {...getStaticCardProps(contentCardStyle)}>
                        {delayLogCount > 0 && (
                            <Alert
                                message="Kế hoạch này có log trễ"
                                description={`Có ${delayLogCount} bản ghi log trễ kế hoạch. Vui lòng kiểm tra tab "Log trễ kế hoạch sản xuất" để biết chi tiết.`}
                                type="warning"
                                showIcon
                                closable
                                style={{ marginBottom: '16px' }}
                            />
                        )}
                        <div className="flex flex-wrap gap-4 items-center mb-4">
                            <div
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)',
                                }}
                                className="bg-primary-gradient"
                            >
                                <ToolOutlined style={{ fontSize: '16px', color: '#fff' }} />
                                <span
                                    style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px', marginRight: '4px' }}
                                >
                                    Tên kế hoạch:
                                </span>
                                <span
                                    style={{
                                        color: '#fff',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        letterSpacing: '0.3px',
                                    }}
                                >
                                    {plan.name}
                                </span>
                            </div>

                            <div
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)',
                                }}
                                className="bg-primary-gradient"
                            >
                                <QrCode style={{ fontSize: '16px', color: '#fff' }} />
                                <span
                                    style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px', marginRight: '4px' }}
                                >
                                    Mã khuôn:
                                </span>
                                <span
                                    style={{
                                        color: '#fff',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        letterSpacing: '0.3px',
                                    }}
                                >
                                    {plan.moldCode || 'Không có mã khuôn'}
                                </span>
                            </div>

                            {plan?.status && (
                                <div
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.12)',
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                    }}
                                >
                                    <Info style={{ fontSize: '16px', color: '#475569' }} />
                                    <span style={{ color: '#64748b', fontSize: '13px', marginRight: '4px' }}>
                                        Trạng thái:
                                    </span>
                                    {renderApprovedStatusTag(plan.status)}
                                </div>
                            )}

                            <div
                                style={{
                                    marginLeft: 'auto',
                                    color: '#475569',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                }}
                            >
                                {creatorDisplay} tạo lúc {createdAtText}
                            </div>
                        </div>
                        <Descriptions
                            bordered
                            column={3}
                            size="small"
                            labelStyle={generalDescriptionsLabelStyle}
                            contentStyle={generalDescriptionsContentStyle}
                        >
                            {generalInfomation.map((field, index) => (
                                <Descriptions.Item label={field.label} key={index}>
                                    {field.value}
                                </Descriptions.Item>
                            ))}
                        </Descriptions>
                    </Card>
                    <Card title="Thông tin chi tiết" {...getStaticCardProps(contentCardStyle)}>
                        <Descriptions
                            bordered
                            column={2}
                            size="small"
                            labelStyle={detailDescriptionsLabelStyle}
                            contentStyle={detailDescriptionsContentStyle}
                        >
                            {detailInfomation4Col.map((field, index) => (
                                <Descriptions.Item label={field.label} key={index} span={field.span || 1}>
                                    <div style={detailValueWrapperStyle}>{field.value}</div>
                                </Descriptions.Item>
                            ))}
                        </Descriptions>
                    </Card>

                    {plan.typePlan !== 'SECOND_PROCESS' && (
                        <Card title="Danh sách nhựa sử dụng" {...getStaticCardProps(contentCardStyle)}>
                            <Table
                                dataSource={
                                    plan?.plastics?.map((plastic, index) => ({
                                        key: index,
                                        stt: plan.plastics
                                            .slice(0, index + 1)
                                            .filter((p) => (p?.isRecycle || false) === (plastic.isRecycle || false))
                                            .length,
                                        ...plastic,
                                    })) || []
                                }
                                columns={plasticsTableColumns}
                                size="small"
                                bordered
                                locale={{
                                    emptyText: (
                                        <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>
                                            Chưa có thông tin nhựa
                                        </span>
                                    ),
                                }}
                            />
                        </Card>
                    )}
                    <Card title="Danh sách vật tư sử dụng" {...getStaticCardProps(contentCardStyle)}>
                        <Table
                            dataSource={
                                plan?.supplies?.map((supply, index) => ({
                                    key: index,
                                    stt: index + 1,
                                    ...supply,
                                })) || []
                            }
                            columns={supplyTableColumns}
                            size="small"
                            bordered
                            locale={{
                                emptyText: (
                                    <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>
                                        Chưa có thông tin vật tư
                                    </span>
                                ),
                            }}
                        />
                    </Card>
                </TabPane>

                {(plan.approvedPlan ||
                    isAllApprovalsApproved ||
                    plan.status === 'PLANNED' ||
                    plan.status === 'DELAYED' ||
                    plan.status === 'COMPLETED') && (
                    <>
                        {isMoldTrialType && (
                            <TabPane tab="Lỗi phát sinh" key={TAB_KEYS.ISSUES}>
                                <Row gutter={16}>
                                    <Col span={24}>
                                        <Card
                                            title="Danh sách vấn đề"
                                            extra={
                                                <Space wrap>
                                                    {canCreateIssue &&
                                                        (isSuperAdmin || plan.status !== 'CANCELLED') && (
                                                            <Button
                                                                type="primary"
                                                                icon={<PlusOutlined />}
                                                                disabled={isPlanCancelled}
                                                                onClick={() => {
                                                                    setEditingIssue(null);
                                                                    setOpenModalIssue(true);
                                                                }}
                                                            >
                                                                Thêm vấn đề phát sinh
                                                            </Button>
                                                        )}
                                                </Space>
                                            }
                                            {...getStaticCardProps(contentCardStyle)}
                                        >
                                            <MoldTrialPlanIssueTable
                                                moldTrialPlanId={plan.id}
                                                onEdit={isPlanCancelled ? undefined : handleOpenIssueModal}
                                                reloadTrigger={reloadIssues}
                                            />
                                        </Card>
                                    </Col>
                                </Row>
                            </TabPane>
                        )}

                        {isEventType && (
                            <TabPane tab="Lot sản xuất hàng ngày" key={TAB_KEYS.PRODUCTION_LOTS}>
                                <Row justify="space-between" align="middle">
                                    <Title level={4} style={{ color: '#555', margin: 0 }}>
                                        Danh sách lot sản xuất
                                    </Title>
                                </Row>
                                <ProductionLotTable
                                    productPlanId={plan.id}
                                    onEdit={isPlanCancelled ? undefined : handleOpenProductionLotModal}
                                    onAdd={isPlanCancelled ? undefined : () => handleOpenProductionLotModal(null)}
                                    reloadTrigger={reloadProductionLots}
                                />
                            </TabPane>
                        )}
                        <TabPane tab="Log trễ kế hoạch" key={TAB_KEYS.DELAY_LOGS}>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Card title="Log trễ kế hoạch sản xuất" {...getStaticCardProps(contentCardStyle)}>
                                        <ProductPlanDelayLogTable
                                            productPlanId={plan.id}
                                            reloadTrigger={reloadDelayLogs}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </TabPane>
                        <TabPane tab="Kết quả kiểm tra" key={TAB_KEYS.FA_INSPECTION}>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Card
                                        title={
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                <span>Kết quả kiểm tra</span>
                                                {inspection?.inspectionDeadline && (
                                                    <Tag
                                                        color="magenta"
                                                        style={{ fontWeight: 600, fontSize: 15, letterSpacing: 0.5 }}
                                                    >
                                                        Deadline kiểm tra:{' '}
                                                        {dayjs(inspection.inspectionDeadline).format('DD/MM/YYYY')}
                                                    </Tag>
                                                )}
                                            </span>
                                        }
                                        extra={
                                            <Space wrap>
                                                {(canCreateFaInspection || canUpdateFaInspection) &&
                                                    (isSuperAdmin || plan.status !== 'CANCELLED') &&
                                                    (!inspection ? (
                                                        <Button
                                                            type="primary"
                                                            icon={<CheckOutlined />}
                                                            loading={receivingSample}
                                                            onClick={handleReceiveSample}
                                                            disabled={isPlanCancelled}
                                                        >
                                                            Nhận mẫu
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            icon={<EditOutlined />}
                                                            onClick={handleOpenInspectionModal}
                                                            disabled={isPlanCancelled}
                                                        >
                                                            Cập nhật
                                                        </Button>
                                                    ))}
                                                {canDeleteFaInspection &&
                                                    (isSuperAdmin || plan.status !== 'CANCELLED') && (
                                                        <Popconfirm
                                                            title={`Bạn có chắc muốn xóa?`}
                                                            okText="Xóa"
                                                            cancelText="Hủy"
                                                            okButtonProps={{ danger: true }}
                                                        >
                                                            <Button
                                                                danger
                                                                icon={<DeleteOutlined />}
                                                                disabled={isPlanCancelled}
                                                                onClick={() =>
                                                                    message.warning('Chức năng đang phát triển')
                                                                }
                                                            >
                                                                Xóa
                                                            </Button>
                                                        </Popconfirm>
                                                    )}
                                            </Space>
                                        }
                                        {...getStaticCardProps(contentCardStyle)}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            <Card size="small" title="Thông tin gửi mẫu sản phẩm">
                                                <Descriptions
                                                    bordered
                                                    column={2}
                                                    size="small"
                                                    labelStyle={halfDescriptionsLabelStyle}
                                                    contentStyle={halfDescriptionsContentStyle}
                                                >
                                                    <Descriptions.Item label="Người gửi mẫu">
                                                        {plan?.productSampleSubmitterCode &&
                                                        plan?.productSampleSubmitterName
                                                            ? `${plan.productSampleSubmitterCode} - ${plan.productSampleSubmitterName}`
                                                            : NOT_AVAILABLE_PLACEHOLDER}
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label="Ngày gửi mẫu">
                                                        {plan?.productSampleSubmitDate
                                                            ? dayjs(plan.productSampleSubmitDate).format(
                                                                  'DD/MM/YYYY HH:mm',
                                                              )
                                                            : NOT_AVAILABLE_PLACEHOLDER}
                                                        {plan?.expectedFaSubmitDate &&
                                                            plan?.productSampleSubmitDate &&
                                                            dayjs(plan.productSampleSubmitDate).isAfter(
                                                                dayjs(plan.expectedFaSubmitDate),
                                                                'day',
                                                            ) && (
                                                                <Tag color="error" style={{ marginLeft: 8 }}>
                                                                    Trễ
                                                                </Tag>
                                                            )}
                                                    </Descriptions.Item>
                                                    {plan?.faSubmitDelayReason && (
                                                        <Descriptions.Item label="Lý do chậm gửi mẫu" span={2}>
                                                            <span style={{ color: '#d4380d' }}>
                                                                {plan.faSubmitDelayReason}
                                                            </span>
                                                        </Descriptions.Item>
                                                    )}
                                                </Descriptions>
                                            </Card>

                                            {!inspection ? (
                                                <Empty description="Chưa có dữ liệu kiểm tra" />
                                            ) : (
                                                <>
                                                    <Card size="small" title="Thông tin kiểm tra">
                                                        <Descriptions
                                                            bordered
                                                            column={2}
                                                            size="small"
                                                            labelStyle={halfDescriptionsLabelStyle}
                                                            contentStyle={halfDescriptionsContentStyle}
                                                        >
                                                            <Descriptions.Item label="Nhân viên nhận mẫu">
                                                                {formatInspectionEmployee(
                                                                    inspection.receivedByEmployeeCode,
                                                                    inspection.receivedByEmployeeName,
                                                                )}
                                                            </Descriptions.Item>
                                                            <Descriptions.Item label="Ngày nhận mẫu">
                                                                {formatInspectionDate(inspection.receivedDate)}
                                                            </Descriptions.Item>
                                                            <Descriptions.Item label="Ngày kiểm tra thực tế">
                                                                {formatInspectionDate(inspection.inspectionDate)}
                                                                {inspection.inspectionDeadline &&
                                                                    inspection.inspectionDate &&
                                                                    dayjs(inspection.inspectionDate).isAfter(
                                                                        dayjs(inspection.inspectionDeadline),
                                                                        'day',
                                                                    ) && (
                                                                        <Tag color="error" style={{ marginLeft: 8 }}>
                                                                            Trễ
                                                                        </Tag>
                                                                    )}
                                                            </Descriptions.Item>
                                                            <Descriptions.Item label="Số lượng kiểm tra">
                                                                {inspection.inspectedQuantity
                                                                    ? `${inspection.inspectedQuantity} pcs`
                                                                    : NOT_AVAILABLE_PLACEHOLDER}
                                                            </Descriptions.Item>
                                                            {inspection.delayReason && (
                                                                <Descriptions.Item label="Lý do trễ" span={2}>
                                                                    <span style={{ color: '#d4380d' }}>
                                                                        {inspection.delayReason}
                                                                    </span>
                                                                </Descriptions.Item>
                                                            )}
                                                        </Descriptions>
                                                    </Card>

                                                    <Row gutter={[16, 16]}>
                                                        <Col xs={24} lg={8}>
                                                            <InspectionSection
                                                                title="Đánh giá ngoại quan"
                                                                checkedBy={formatInspectionEmployee(
                                                                    inspection.visualCheckedByCode,
                                                                    inspection.visualCheckedByName,
                                                                )}
                                                                result={inspection.visualResult}
                                                                defects={inspection.visualDefectDetails}
                                                                hasData={hasVisualInspectionData}
                                                            />
                                                        </Col>
                                                        <Col xs={24} lg={8}>
                                                            <InspectionSection
                                                                title="Đánh giá kích thước"
                                                                checkedBy={formatInspectionEmployee(
                                                                    inspection.dimensionCheckedByCode,
                                                                    inspection.dimensionCheckedByName,
                                                                )}
                                                                result={inspection.dimensionResult}
                                                                defects={inspection.dimensionDefectDetails}
                                                                hasData={hasDimensionInspectionData}
                                                            />
                                                        </Col>
                                                        <Col xs={24} lg={8}>
                                                            <Card
                                                                size="small"
                                                                title="Kết luận cuối cùng"
                                                                extra={renderInspectionResultTag(
                                                                    inspection.finalResult,
                                                                )}
                                                            >
                                                                <Descriptions {...inspectionDescriptionsProps}>
                                                                    <Descriptions.Item label="Nhân viên">
                                                                        {formatInspectionEmployee(
                                                                            inspection.finalCheckedByCode,
                                                                            inspection.finalCheckedByName,
                                                                        )}
                                                                    </Descriptions.Item>
                                                                    <Descriptions.Item label="Số lượng NG">
                                                                        {inspection.ngQuantity
                                                                            ? `${inspection.ngQuantity} pcs${inspection.ngRate ? ` - ${inspection.ngRate} %` : ''}`
                                                                            : NOT_AVAILABLE_PLACEHOLDER}
                                                                    </Descriptions.Item>
                                                                </Descriptions>
                                                            </Card>
                                                        </Col>
                                                    </Row>

                                                    <Card size="small" title="Ghi chú và tệp đính kèm">
                                                        <Descriptions
                                                            bordered
                                                            column={2}
                                                            size="small"
                                                            labelStyle={halfDescriptionsLabelStyle}
                                                            contentStyle={halfDescriptionsContentStyle}
                                                        >
                                                            <Descriptions.Item label="Ghi chú QC">
                                                                {inspection.qcNote || 'Không có ghi chú'}
                                                            </Descriptions.Item>
                                                            <Descriptions.Item label="File đính kèm">
                                                                {inspection.filePath ? (
                                                                    <a
                                                                        href={`${process.env.REACT_APP_UPLOAD_URL}/${inspection.filePath}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        {inspection.filePath.split('/').pop()}
                                                                    </a>
                                                                ) : (
                                                                    'Không có file đính kèm'
                                                                )}
                                                            </Descriptions.Item>
                                                        </Descriptions>
                                                    </Card>
                                                </>
                                            )}
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </TabPane>
                        <TabPane tab="Kết quả đánh giá kế hoạch" key={TAB_KEYS.APPROVE_RESULTS}>
                            <MoldTrialPlanApproveResults
                                moldTrialPlanId={plan.id}
                                typePlan={plan?.typePlan}
                                approvePlan={plan.approvedPlan}
                            />
                        </TabPane>

                        <TabPane
                            tab={plan?.typePlan === 'MOLD_TRIAL' ? 'Gửi mẫu' : 'Giao hàng'}
                            key={TAB_KEYS.FA_SUBMIT}
                        >
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Card
                                        title={
                                            plan?.typePlan === 'MOLD_TRIAL'
                                                ? 'Thông tin gửi mẫu'
                                                : 'Thông tin giao hàng'
                                        }
                                        extra={
                                            <Space wrap>
                                                {(isSuperAdmin || canUpdateFaDelivery) &&
                                                    (isSuperAdmin || plan.status !== 'CANCELLED') && (
                                                        <Button
                                                            icon={<EditOutlined />}
                                                            onClick={handleOpenDeliveryModal}
                                                            disabled={isPlanCancelled}
                                                        >
                                                            Cập nhật
                                                        </Button>
                                                    )}
                                                {delivery &&
                                                    (isSuperAdmin || canApproveFaDelivery) &&
                                                    (isSuperAdmin || plan.status !== 'CANCELLED') && (
                                                        <Button
                                                            icon={<CheckOutlined />}
                                                            onClick={() => {
                                                                if (!delivery?.conditionFileUrl) {
                                                                    message.warning(
                                                                        'Chưa có file điều kiện đúc để duyệt!',
                                                                    );
                                                                    return;
                                                                }
                                                                setOpenApproveModal(true);
                                                            }}
                                                            type="primary"
                                                            disabled={
                                                                isPlanCancelled ||
                                                                approvedConditionFile ||
                                                                !delivery?.conditionFileUrl
                                                            }
                                                            title={
                                                                !delivery?.conditionFileUrl
                                                                    ? 'Chưa có file điều kiện đúc'
                                                                    : ''
                                                            }
                                                        >
                                                            {approvedConditionFile
                                                                ? 'Đã duyệt'
                                                                : 'Duyệt file điều kiện đúc'}
                                                        </Button>
                                                    )}
                                                {canUpdateActualPlan && (
                                                    <Popconfirm
                                                        title={`Bạn có chắc muốn xóa?`}
                                                        okText="Xóa"
                                                        cancelText="Hủy"
                                                        okButtonProps={{ danger: true }}
                                                    >
                                                        <Button
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            disabled={isPlanCancelled}
                                                            onClick={() => message.warning('Chức năng đang phát triển')}
                                                        >
                                                            Xóa
                                                        </Button>
                                                    </Popconfirm>
                                                )}
                                            </Space>
                                        }
                                    >
                                        <Descriptions
                                            bordered
                                            column={2}
                                            size="small"
                                            labelStyle={halfDescriptionsLabelStyle}
                                            contentStyle={halfDescriptionsContentStyle}
                                        >
                                            {deliveryInfomation.map((field, index) => (
                                                <Descriptions.Item label={field.label} key={index}>
                                                    {field.value}
                                                </Descriptions.Item>
                                            ))}
                                        </Descriptions>
                                    </Card>
                                </Col>
                            </Row>
                        </TabPane>
                    </>
                )}
            </Tabs>
        </div>
    );
};

export default ProductPlanDetailPage;
