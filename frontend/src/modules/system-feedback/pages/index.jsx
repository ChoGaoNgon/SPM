import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Space, message } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import SystemFeedbackModal from '../components/SystemFeedbackModal';
import SystemFeedbackAssignModal from '../components/SystemFeedbackAssignModal';
import SystemFeedbackMasterDetail from '../components/SystemFeedbackMasterDetail';
import authService from '~/modules/auth/services/authService';
import PageHeader from '~/components/PageHeader';
import { Lightbulb } from 'lucide-react';
import systemFeedbackService from '../services/systemFeedbackService';

const DEFAULT_STATUS_FILTERS = ['PENDING', 'IN_PROGRESS'];

const SystemFeedbackPage = () => {
    const [openSystemFeedbackModal, setOpenSystemFeedbackModal] = useState(false);
    const [systemFeedbackModalData, setSystemFeedbackModalData] = useState(null);
    const [reloadTable, setReloadTable] = useState(false);
    const [openSystemFeedbackAssignModal, setOpenSystemFeedbackAssignModal] = useState(false);
    const [systemFeedbackAssignModalData, setSystemFeedbackAssignModalData] = useState(null);
    const [stats, setStats] = useState({ pending: 0, inProgress: 0, done: 0 });
    const [feedbackList, setFeedbackList] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [loadingList, setLoadingList] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilters, setStatusFilters] = useState(DEFAULT_STATUS_FILTERS);
    const canAssignFeedback = authService.hasPermission('SYSTEM_FEEDBACK_ASSIGN');
    const currentEmployeeCode = authService.getEmployeeCode();
    const hasITDepartmentRole = authService.hasDepartmentCode('IT') || authService.hasDepartmentCode('P-IT&ERP');
    const detailRequestRef = useRef(0);
    const selectedItemIdRef = useRef(null);

    const updateStats = useCallback((items) => {
        setStats({
            pending: items.filter((item) => item.status === 'PENDING').length,
            inProgress: items.filter((item) => item.status === 'IN_PROGRESS').length,
            done: items.filter((item) => item.status === 'DONE').length,
        });
    }, []);

    const fetchFeedbackDetail = useCallback(async (id) => {
        if (!id) {
            setSelectedDetail(null);
            return null;
        }

        const requestId = detailRequestRef.current + 1;
        detailRequestRef.current = requestId;
        setLoadingDetail(true);

        try {
            const detail = await systemFeedbackService.getSystemFeedbackById(id);

            if (detailRequestRef.current === requestId) {
                setSelectedDetail(detail);
            }

            return detail;
        } catch (error) {
            if (detailRequestRef.current === requestId) {
                setSelectedDetail(null);
            }
            message.error(error.message || 'Không thể tải chi tiết góp ý');
            return null;
        } finally {
            if (detailRequestRef.current === requestId) {
                setLoadingDetail(false);
            }
        }
    }, []);

    const fetchFeedbackList = useCallback(
        async (keyword = '', statuses = DEFAULT_STATUS_FILTERS) => {
            setLoadingList(true);

            try {
                const employeeCode = canAssignFeedback || hasITDepartmentRole ? null : currentEmployeeCode;
                const [items, statsItems] = await Promise.all([
                    systemFeedbackService.searchSystemFeedbacks(keyword, employeeCode, statuses),
                    systemFeedbackService.searchSystemFeedbacks(keyword, employeeCode),
                ]);

                setFeedbackList(items);
                updateStats(statsItems);

                if (items.length === 0) {
                    selectedItemIdRef.current = null;
                    setSelectedItem(null);
                    setSelectedDetail(null);
                    return;
                }

                const nextSelectedItem = selectedItemIdRef.current
                    ? items.find((item) => item.id === selectedItemIdRef.current)
                    : items[0];
                const normalizedSelectedItem = nextSelectedItem || items[0];

                selectedItemIdRef.current = normalizedSelectedItem.id;
                setSelectedItem(normalizedSelectedItem);
                await fetchFeedbackDetail(normalizedSelectedItem.id);
            } catch (error) {
                message.error(error.message || 'Không thể tải danh sách góp ý');
            } finally {
                setLoadingList(false);
            }
        },
        [canAssignFeedback, currentEmployeeCode, fetchFeedbackDetail, hasITDepartmentRole, updateStats],
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchFeedbackList(searchText.trim(), statusFilters);
        }, 350);

        return () => clearTimeout(timer);
    }, [fetchFeedbackList, reloadTable, searchText, statusFilters]);

    const openSystemFeedbackModalForEdit = (record) => {
        setOpenSystemFeedbackModal(true);
        setSystemFeedbackModalData(record);
    };

    const openSystemFeedbackAssignModalForEdit = (record) => {
        setOpenSystemFeedbackAssignModal(true);
        setSystemFeedbackAssignModalData(record);
    };

    const handleSelectItem = async (item) => {
        selectedItemIdRef.current = item.id;
        setSelectedItem(item);
        await fetchFeedbackDetail(item.id);
    };

    const handleDelete = async (id) => {
        try {
            await systemFeedbackService.deleteSystemFeedback(id);
            if (selectedItemIdRef.current === id) {
                selectedItemIdRef.current = null;
            }
            message.success('Xóa góp ý thành công');
            setReloadTable((prev) => !prev);
        } catch (error) {
            message.error(error?.message || 'Xóa góp ý thất bại');
        }
    };

    const handleOpenEdit = async (record) => {
        const detail = record?.content ? record : await fetchFeedbackDetail(record?.id || selectedItem?.id);

        if (!detail) {
            return;
        }

        openSystemFeedbackModalForEdit(detail);
    };

    const handleOpenAssign = async (record) => {
        const detail = record?.content ? record : await fetchFeedbackDetail(record?.id || selectedItem?.id);

        if (!detail) {
            return;
        }

        openSystemFeedbackAssignModalForEdit(detail);
    };

    const handleToggleStatusFilter = (status) => {
        setStatusFilters((prev) => {
            if (prev.length === 1 && prev[0] === status) {
                return DEFAULT_STATUS_FILTERS;
            }

            return [status];
        });
    };

    return (
        <Space direction="vertical" size={16} style={{ display: 'flex' }}>
            <Row gutter={[16, 16]} align="middle" justify="space-between">
                <Col flex="auto">
                    <PageHeader
                        icon={Lightbulb}
                        title="Quản lý góp ý hệ thống"
                        description="Quản lý góp ý từ người dùng về hệ thống, theo dõi trạng thái và phân công xử lý"
                    />
                </Col>

                <Col>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setSystemFeedbackModalData(null);
                            setOpenSystemFeedbackModal(true);
                        }}
                    >
                        Thêm Góp Ý
                    </Button>
                </Col>
            </Row>

            <SystemFeedbackMasterDetail
                items={feedbackList}
                stats={stats}
                selectedItem={selectedItem}
                detail={selectedDetail}
                loadingList={loadingList}
                loadingDetail={loadingDetail}
                searchText={searchText}
                onSearchChange={setSearchText}
                onSelect={handleSelectItem}
                onRefresh={() => setReloadTable((prev) => !prev)}
                onEdit={handleOpenEdit}
                onAssign={handleOpenAssign}
                onDelete={handleDelete}
                statusFilters={statusFilters}
                onToggleStatusFilter={handleToggleStatusFilter}
                canAssignFeedback={canAssignFeedback}
                hasITDepartmentRole={hasITDepartmentRole}
            />

            <SystemFeedbackModal
                open={openSystemFeedbackModal}
                initialValues={systemFeedbackModalData}
                onCancel={() => {
                    setOpenSystemFeedbackModal(false);
                    setSystemFeedbackModalData(null);
                }}
                onSuccess={() => {
                    setReloadTable((prev) => !prev);
                    setSystemFeedbackModalData(null);
                    setOpenSystemFeedbackModal(false);
                }}
            />

            <SystemFeedbackAssignModal
                open={openSystemFeedbackAssignModal}
                initialValues={systemFeedbackAssignModalData}
                onCancel={() => setOpenSystemFeedbackAssignModal(false)}
                onSuccess={() => {
                    setReloadTable((prev) => !prev);
                    setOpenSystemFeedbackAssignModal(false);
                }}
            />
        </Space>
    );
};

export default SystemFeedbackPage;
