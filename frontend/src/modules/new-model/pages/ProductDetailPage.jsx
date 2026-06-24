import { Alert, message, Modal, Spin, Tabs } from 'antd';
import TabPane from 'antd/es/tabs/TabPane';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useIsMobile } from '~/hook/useIsMobile';
import authService from '~/modules/auth/services/authService';
import ApproveMpFormModal from '../components/modal/ApproveMpFormModal';
import MpHandoverFormModal from '../components/modal/MpHandoverFormModal';
import NmdInfoStatusModal from '../components/modal/NmdInfoStatusModal';
import MoldTrialPlanKTModal from '../components/modal/PlanKTModal';
import MoldTrialPlanLOGModal from '../components/modal/PlanLOGModal';
import ProductPlanModal from '../components/modal/ProductPlanModal';
import ToolPreparationModal from '../components/modal/ToolPreparationModal';
import ProductBusinessProcess from '../components/ProductBusinessProcess';
import InformationTab from '../components/tabs/InformationTab';
import MPTab from '../components/tabs/MPTab';
import PlanTab from '../components/tabs/PlanTab';
import ToolPreparationList from '../components/ToolPreparationList';
import productService from '../services/productService';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
    const isMobile = useIsMobile();
    const canEditProduct = authService.hasPermission('NMD_PRODUCT_UPDATE');
    const canDeleteProduct = authService.hasPermission('NMD_PRODUCT_DELETE');
    const canManageNmdInfo = authService.hasRole('SUPERADMIN') || authService.hasDepartmentCode('P-NMD');

    const canBusinessApprove = authService.hasPermission('NMD_PRODUCT_APPROVE_BY_HEAD_KD');
    const canNMDProcessApprove = authService.hasPermission('NMD_PRODUCT_UPDATE_NMD_INFO');

    const canCreatePlan = authService.hasPermission('NMD_PRODUCT_PLAN_CREATE');
    const canCreateMP = authService.hasPermission('NMD_PRODUCT_MP_CHECKLIST_CREATE');
    const canCreateToolPreparation = authService.hasPermission('PRODUCT_TOOL_PREPARATION_CREATE');
    const canEditToolPreparation = authService.hasPermission('PRODUCT_TOOL_PREPARATION_UPDATE');
    const canDeleteToolPreparation = authService.hasPermission('PRODUCT_TOOL_PREPARATION_DELETE');

    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'information';
    const keyword = searchParams.get('kw') || '';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [product, setProduct] = useState(null);
    const { id: modelId, productId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const prevRouteRef = useRef({ pathname: location.pathname, productId });

    const getEventRequirementsStorageKey = useCallback((id) => (id ? `product_event_requirements_${id}` : null), []);

    const [openPlanModalForCreate, setOpenPlanModalForCreate] = useState(false);
    const [openPlanModalForKT, setOpenPlanModalForKT] = useState(false);
    const [openPlanModalForLOG, setOpenPlanModalForLOG] = useState(false);
    const [reloadPlans, setReloadPlans] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [typePlan, setTypePlan] = useState('MOLD_TRIAL');

    const [openEventModal, setOpenEventModal] = useState(false);
    const [reloadEvents, setReloadEvents] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    const [openMpHandoverModal, setOpenMpHandoverModal] = useState(false);
    const [reloadMpHandovers, setReloadMpHandovers] = useState(false);
    const [editingMpHandover, setEditingMpHandover] = useState(null);

    const [openApproveMpModal, setOpenApproveMpModal] = useState(false);
    const [approvingMpHandover, setApprovingMpHandover] = useState(null);
    const [openNmdStatusModal, setOpenNmdStatusModal] = useState(false);

    const [openToolPreparationModal, setOpenToolPreparationModal] = useState(false);
    const [editingToolPreparation, setEditingToolPreparation] = useState(null);
    const [reloadToolPreparations, setReloadToolPreparations] = useState(false);

    const onOpenApproveModal = (record) => {
        setApprovingMpHandover(record);
        setOpenApproveMpModal(true);
    };

    const handleApproveSuccess = () => {
        setReloadMpHandovers((prev) => !prev);
        message.success('Phê duyệt thành công!');
    };

    const handleOpenNmdStatusModal = () => {
        if (product?.nmdInfoStatus === 'RECEIVED') {
            message.info('Sản phẩm đã ở trạng thái Đã nhận thông tin');
            return;
        }
        setOpenNmdStatusModal(true);
    };

    const handleCloseNmdStatusModal = () => {
        setOpenNmdStatusModal(false);
    };

    const handleEditToolPreparation = (record) => {
        if (!canEditToolPreparation) {
            message.warning('Bạn không có quyền sửa dụng cụ!');
            return;
        }
        setEditingToolPreparation(record);
        setOpenToolPreparationModal(true);
    };

    const handleCreateToolPreparation = () => {
        if (!canCreateToolPreparation) {
            message.warning('Bạn không có quyền tạo dụng cụ!');
            return;
        }
        setEditingToolPreparation(null);
        setOpenToolPreparationModal(true);
    };

    const handleToolPreparationSuccess = () => {
        setReloadToolPreparations((prev) => !prev);
    };

    const handleApproveProduct = async (productId) => {
        try {
            await productService.approveProduct(productId);
            message.success('Duyệt thông tin sản phẩm thành công!');
            fetchProduct();
        } catch (error) {
            message.error(error.message);
        }
    };

    const handleDeleteProduct = async (id) => {
        Modal.confirm({
            title: 'Xác nhận xóa sản phẩm',
            content: 'Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await productService.deleteProduct(id);
                    message.success('Xóa sản phẩm thành công');
                    navigate(`/product-manager/models/${modelId}`);
                } catch (error) {
                    message.error(error.message);
                }
            },
            onCancel: () => {},
        });
    };

    const openTrialModalForEdit = (trialPlan) => {
        setTypePlan(trialPlan.typePlan || 'MOLD_TRIAL');
        setEditingPlan(trialPlan);
        setOpenPlanModalForCreate(true);
    };

    const openPlanModalForKTEdit = (trialPlan) => {
        setTypePlan(trialPlan.typePlan || null);
        setEditingPlan(trialPlan);
        setOpenPlanModalForKT(true);
    };

    const openPlanModalForLOGEdit = (trialPlan) => {
        setTypePlan(trialPlan.typePlan || null);
        setEditingPlan(trialPlan);
        setOpenPlanModalForLOG(true);
    };

    const openMpHandoverForEdit = (mp) => {
        setEditingMpHandover(mp);
        setOpenMpHandoverModal(true);
    };
    const fetchProduct = useCallback(async () => {
        try {
            const data = await productService.getProductById(productId, true);
            setProduct({
                ...data,
                files: Array.isArray(data?.files) ? data.files : [],
            });
        } catch (error) {
            message.error(error.message);
        }
    }, [productId]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    useEffect(() => {
        const currentTab = searchParams.get('tab') || 'information';
        setActiveTab(currentTab);
    }, [searchParams]);

    useEffect(() => {
        const storageKey = getEventRequirementsStorageKey(product?.id || productId);
        if (!storageKey) return;

        const eventRequirements = Array.isArray(product?.productEventRequirements)
            ? product.productEventRequirements
            : [];
        localStorage.setItem(storageKey, JSON.stringify(eventRequirements));
    }, [getEventRequirementsStorageKey, product?.id, product?.productEventRequirements, productId]);

    useEffect(() => {
        const prev = prevRouteRef.current;

        if (prev.pathname !== location.pathname) {
            const previousStorageKey = getEventRequirementsStorageKey(prev.productId);
            if (previousStorageKey) {
                localStorage.removeItem(previousStorageKey);
            }
        }

        prevRouteRef.current = { pathname: location.pathname, productId };
    }, [getEventRequirementsStorageKey, location.pathname, productId]);

    useEffect(() => {
        return () => {
            const storageKey = getEventRequirementsStorageKey(productId);
            if (storageKey) {
                localStorage.removeItem(storageKey);
            }
        };
    }, [getEventRequirementsStorageKey, productId]);

    const handleTabChange = async (key) => {
        setActiveTab(key);
        const nextSearchParams = new URLSearchParams(searchParams);
        nextSearchParams.set('tab', key);
        setSearchParams(nextSearchParams);

        if (!product?.id) return;

        switch (key) {
            case 'business-process':
                break;
            case 'information':
                fetchProduct();
                break;
            case 'plan':
                setReloadPlans((prev) => !prev);
                break;
            case 'mp':
                setReloadMpHandovers((prev) => !prev);
                break;
            case 'tool-preparation':
                setReloadToolPreparations((prev) => !prev);
                break;
            default:
                break;
        }
    };

    if (!product)
        return (
            <Spin tip="Loading...">
                <Alert message="Loading..." description="Đang tải thông tin sản phẩm" type="info" />
            </Spin>
        );

    return (
        <div className="product-detail-page">
            <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                type="card"
                tabPosition={isMobile ? 'top' : 'top'}
                size={isMobile ? 'small' : 'default'}
            >
                <TabPane tab="Quy trình nghiệp vụ" key="business-process">
                    <ProductBusinessProcess productId={productId} />
                </TabPane>
                <TabPane tab="Thông tin" key="information">
                    <InformationTab
                        product={product}
                        highlightKeyword={keyword}
                        onDelete={handleDeleteProduct}
                        canEdit={canEditProduct}
                        canBusinessApprove={canBusinessApprove}
                        canNMDApprove={canNMDProcessApprove}
                        canDelete={canDeleteProduct}
                        onOpenNmdStatusModal={canManageNmdInfo ? handleOpenNmdStatusModal : undefined}
                        handleApproveProduct={handleApproveProduct}
                    />
                </TabPane>

                {product?.isApprovedByHeadKD && (
                    <TabPane tab="Chuẩn bị dụng cụ" key="tool-preparation">
                        <ToolPreparationList
                            productId={productId}
                            onCreate={handleCreateToolPreparation}
                            onEdit={handleEditToolPreparation}
                            reload={reloadToolPreparations}
                            canCreate={canCreateToolPreparation}
                            canEdit={canEditToolPreparation}
                            canDelete={canDeleteToolPreparation}
                        />
                    </TabPane>
                )}

                <TabPane tab="Kế hoạch" key="plan">
                    <PlanTab
                        productId={product.id}
                        productCode={product?.code}
                        reloadTrigger={reloadPlans}
                        onEdit={openTrialModalForEdit}
                        onEditKT={openPlanModalForKTEdit}
                        onEditLOG={openPlanModalForLOGEdit}
                        onCreate={() => {
                            setEditingPlan(null);
                            setTypePlan('MOLD_TRIAL');
                            setOpenPlanModalForCreate(true);
                        }}
                        canCreate={canCreatePlan}
                    />
                </TabPane>

                <TabPane tab="Kế hoạch sản xuất hàng loạt (MP)" key="mp">
                    <MPTab
                        productId={productId}
                        product={product}
                        productCode={product?.code}
                        reloadTrigger={reloadMpHandovers}
                        onEdit={openMpHandoverForEdit}
                        onApprove={onOpenApproveModal}
                        onCreate={() => {
                            setEditingMpHandover(null);
                            setOpenMpHandoverModal(true);
                        }}
                        canCreate={canCreateMP}
                    />
                </TabPane>
            </Tabs>

            <MoldTrialPlanKTModal
                open={openPlanModalForKT}
                onCancel={() => {
                    setOpenPlanModalForKT(false);
                    setEditingPlan(null);
                    setTypePlan(null);
                }}
                typePlan={typePlan}
                productCode={product?.code}
                productId={productId}
                initialValues={editingPlan}
                onSuccess={() => {
                    setReloadPlans((prev) => !prev);
                }}
            />

            <MoldTrialPlanLOGModal
                open={openPlanModalForLOG}
                onCancel={() => {
                    setOpenPlanModalForLOG(false);
                    setEditingPlan(null);
                    setTypePlan(null);
                }}
                productCode={product?.code}
                productId={productId}
                initialValues={editingPlan}
                onSuccess={() => {
                    setReloadPlans((prev) => !prev);
                }}
            />

            <ProductPlanModal
                open={openPlanModalForCreate}
                onCancel={() => {
                    setOpenPlanModalForCreate(false);
                    setEditingPlan(null);
                    setTypePlan('MOLD_TRIAL');
                }}
                moldCode={product?.moldCode}
                productCode={product?.code}
                productId={productId}
                planType={typePlan || 'MOLD_TRIAL'}
                initialValues={editingPlan}
                onSuccess={() => {
                    setReloadPlans((prev) => !prev);
                }}
                key={editingPlan?.id || 'new'}
            />

            <ProductPlanModal
                open={openEventModal}
                onCancel={() => {
                    setOpenEventModal(false);
                    setEditingEvent(null);
                }}
                planType="EVENT"
                productId={productId}
                productCode={product?.code}
                initialValues={editingEvent}
                onSuccess={() => {
                    setReloadEvents((prev) => !prev);
                }}
            />

            <MpHandoverFormModal
                open={openMpHandoverModal}
                onCancel={() => {
                    setOpenMpHandoverModal(false);
                    setEditingMpHandover(null);
                }}
                productId={productId}
                productCode={product?.code}
                initialValues={editingMpHandover}
                onSuccess={() => {
                    setReloadMpHandovers((prev) => !prev);
                }}
            />

            <ApproveMpFormModal
                open={openApproveMpModal}
                onCancel={() => {
                    setOpenApproveMpModal(false);
                    setApprovingMpHandover(null);
                }}
                productCode={product?.code}
                initialValues={approvingMpHandover}
                onSuccess={handleApproveSuccess}
            />

            <NmdInfoStatusModal
                open={openNmdStatusModal}
                product={product}
                onCancel={handleCloseNmdStatusModal}
                onSuccess={fetchProduct}
            />

            <ToolPreparationModal
                open={openToolPreparationModal}
                onCancel={() => {
                    setOpenToolPreparationModal(false);
                    setEditingToolPreparation(null);
                }}
                productId={productId}
                initialValues={editingToolPreparation}
                onSuccess={handleToolPreparationSuccess}
            />
        </div>
    );
};

export default ProductDetailPage;
