import { Alert, Col, message, Row, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useIsMobile } from '~/hook/useIsMobile';
import mpCheckListService from '../../services/mpCheckListService';
import ApprovalCard from '../ApprovalCard';
import CreateMpCheckListModal from '../modal/CreateMpCheckListModal';
import MpCheckList from '../table/MpCheckList';

const { Title, Text } = Typography;

const MPTab = ({ productId, product, reloadTrigger, onCreate }) => {
    const isMobile = useIsMobile();
    const [mpCheckList, setMpCheckList] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDelayModal, setShowDelayModal] = useState(false);
    const [daysLate, setDaysLate] = useState(0);

    const fetchMpCheckList = async () => {
        setLoading(true);
        try {
            const data = await mpCheckListService.getByProductId(productId);
            if (!data || (data.checkItems && data.checkItems.length === 0)) {
                setMpCheckList(null);
            } else {
                setMpCheckList(data);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (approvalId, comment) => {
        try {
            await mpCheckListService.approveCheckList(approvalId, comment);
            await fetchMpCheckList();
        } catch (error) {
            throw new Error(error.message || 'Có lỗi khi phê duyệt');
        }
    };

    const handleReject = async (approvalId, comment) => {
        try {
            await mpCheckListService.rejectCheckList(approvalId, comment);
            await fetchMpCheckList();
        } catch (error) {
            throw new Error(error.message || 'Có lỗi khi từ chối');
        }
    };

    useEffect(() => {
        fetchMpCheckList();
    }, [productId, reloadTrigger]);

    const handleCreateMpCheckList = async (delayReason = '') => {
        try {
            setLoading(true);
            await mpCheckListService.createMpCheckList(productId, delayReason);
            message.success('Tạo danh sách kiểm tra MP thành công');
            await fetchMpCheckList();
            setShowDelayModal(false);
        } catch (error) {
            message.error(error.message || 'Có lỗi khi tạo danh sách kiểm tra MP');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClick = () => {
        if (product?.mpTargetDate) {
            const targetDate = dayjs(product.mpTargetDate).startOf('day');
            const today = dayjs().startOf('day');
            const diffDays = today.diff(targetDate, 'day');

            if (diffDays > 0) {
                setDaysLate(diffDays);
                setShowDelayModal(true);
                return;
            }
        }

        handleCreateMpCheckList('');
    };

    const createdAtText = mpCheckList?.createdAt ? dayjs(mpCheckList.createdAt).format('HH:mm DD/MM/YYYY') : '---';

    const delayInfo = React.useMemo(() => {
        if (!mpCheckList || !product?.mpTargetDate || !mpCheckList.createdAt) {
            return null;
        }

        const targetDate = dayjs(product.mpTargetDate).startOf('day');
        const createdDate = dayjs(mpCheckList.createdAt).startOf('day');
        const diffDays = createdDate.diff(targetDate, 'day');

        if (diffDays > 0) {
            return {
                daysLate: diffDays,
                delayReason: mpCheckList.delayReason || 'Không có lý do',
            };
        }

        return null;
    }, [mpCheckList, product?.mpTargetDate]);

    return (
        <Spin spinning={loading}>
            {delayInfo && (
                <Alert
                    message={`Cảnh báo: Tạo MP trễ ${delayInfo.daysLate} ngày`}
                    description={
                        <div>
                            <p style={{ marginBottom: 4 }}>
                                <strong>Lý do trễ:</strong> {delayInfo.delayReason}
                            </p>
                            <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                                Ngày mục tiêu MP: {dayjs(product.mpTargetDate).format('DD/MM/YYYY')} | Ngày tạo thực tế:{' '}
                                {dayjs(mpCheckList.createdAt).format('DD/MM/YYYY')}
                            </p>
                        </div>
                    }
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

            {mpCheckList?.approvals && mpCheckList.approvals.length > 0 && (
                <ApprovalCard approvals={mpCheckList.approvals} onApprove={handleApprove} onReject={handleReject} />
            )}

            {mpCheckList && (
                <Row gutter={isMobile ? [8, 8] : [16, 16]}>
                    <Col span={24}>
                        <Row
                            justify="space-between"
                            align={isMobile ? 'start' : 'middle'}
                            style={{
                                marginTop: isMobile ? 8 : 12,
                                flexDirection: isMobile ? 'column' : 'row',
                                gap: isMobile ? 10 : 16,
                            }}
                        >
                            <Title level={isMobile ? 5 : 4} style={{ color: '#555', margin: 0 }}>
                                {isMobile
                                    ? 'Danh sách kiểm tra MP'
                                    : 'Danh sách kiểm tra MP (Mass Production Check List)'}
                            </Title>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: isMobile ? 'flex-start' : 'center',
                                    justifyContent: isMobile ? 'flex-start' : 'flex-end',
                                    flexWrap: 'wrap',
                                    gap: isMobile ? 6 : 10,
                                }}
                            >
                                <div>
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            color: '#8c8c8c',
                                        }}
                                    >
                                        Mã NV tạo MP:
                                    </Text>
                                    <Text style={{ marginLeft: 6, fontWeight: 600, color: '#1f2937' }}>
                                        {mpCheckList.createdBy?.code || '---'}
                                    </Text>
                                </div>
                                <Text style={{ color: '#d9d9d9' }}>|</Text>
                                <div>
                                    <Text style={{ fontSize: 12, color: '#8c8c8c' }}>Tên NV tạo MP:</Text>
                                    <Text style={{ marginLeft: 6, fontWeight: 600, color: '#1f2937' }}>
                                        {mpCheckList.createdBy?.name || '---'}
                                    </Text>
                                </div>
                                <Text style={{ color: '#d9d9d9' }}>|</Text>
                                <div>
                                    <Text style={{ fontSize: 12, color: '#8c8c8c' }}>Thời gian tạo MP:</Text>
                                    <Text style={{ marginLeft: 6, fontWeight: 600, color: '#1f2937' }}>
                                        {createdAtText}
                                    </Text>
                                </div>
                            </div>
                        </Row>
                    </Col>
                </Row>
            )}

            <MpCheckList
                productId={productId}
                mpCheckList={mpCheckList}
                reloadTrigger={reloadTrigger}
                onCreate={handleCreateClick}
                onSuccess={() => fetchMpCheckList()}
                onDelete={() => setMpCheckList(null)}
            />

            <CreateMpCheckListModal
                open={showDelayModal}
                onCancel={() => setShowDelayModal(false)}
                onConfirm={handleCreateMpCheckList}
                daysLate={daysLate}
            />
        </Spin>
    );
};

export default MPTab;
