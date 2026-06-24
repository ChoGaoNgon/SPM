import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Radio, Button, message, Space, Tag, Divider, Row, Col, Spin, Tooltip } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    SaveOutlined,
    ReloadOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { isEqual } from 'lodash';
import approveResultDepartmentService from '../services/approveResultDepartmentService';
import authService from '~/modules/auth/services/authService';
import planApproveResultService from '../services/planApproveResultService';

const { TextArea } = Input;

const defaultApproveCardShadow = '0 10px 24px rgba(15, 23, 42, 0.08)';
const activeApproveCardShadow = '0 18px 36px rgba(15, 23, 42, 0.14)';

const getApproveCardStyle = (result) => ({
    height: '100%',
    position: 'relative',
    borderRadius: '14px',
    boxShadow: defaultApproveCardShadow,
    transition: 'transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease',
    overflow: 'hidden',
    border: result ? (result === 'OK' ? '2px solid #52c41a' : '2px solid #ff4d4f') : '1px solid #d9d9d9',
});

const handleApproveCardMouseEnter = (event) => {
    event.currentTarget.style.transform = 'translateY(-6px)';
    event.currentTarget.style.boxShadow = activeApproveCardShadow;
};

const handleApproveCardMouseLeave = (event) => {
    event.currentTarget.style.transform = 'translateY(0)';
    event.currentTarget.style.boxShadow = defaultApproveCardShadow;
};

const formatApprovedByDisplay = (approveResult) => {
    if (!approveResult) {
        return null;
    }

    const code = approveResult.approvedByCode?.trim();
    const name = approveResult.approvedByName?.trim();

    if (code && name) {
        return `${code} - ${name}`;
    }

    return code || name || null;
};

const PlanApproveResults = ({ moldTrialPlanId, typePlan }) => {
    const [form] = Form.useForm();
    const watchedValues = Form.useWatch([], form);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [approveResults, setApproveResults] = useState([]);
    const [currentUserDepartmentCode, setCurrentUserDepartmentCode] = useState('');
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [initialFormValues, setInitialFormValues] = useState({});
    const [hasChanges, setHasChanges] = useState(false);

    const isSecondProcess = typePlan === 'SECOND_PROCESS';
    const allowedDepartmentCodes = isSecondProcess ? ['QC', 'P-NMD', 'SX'] : null;

    useEffect(() => {
        const role = authService.getRole();
        const departmentCode = authService.getDepartmentCode();

        setCurrentUserDepartmentCode(departmentCode);
        setIsSuperAdmin(role === 'SUPERADMIN');
    }, []);

    useEffect(() => {
        if (moldTrialPlanId) {
            loadData();
        }
    }, [moldTrialPlanId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [departmentsData, approveResultsData] = await Promise.all([
                approveResultDepartmentService.getAllApproveResultDepartments(),
                planApproveResultService.getApproveResultsByMoldTrialPlanId(moldTrialPlanId),
            ]);

            const activeDepartments = departmentsData.filter((dept) => dept.isActive);
            const filteredDepartments = isSecondProcess
                ? activeDepartments.filter((dept) => allowedDepartmentCodes.includes(dept.departmentCode))
                : activeDepartments;

            setDepartments(filteredDepartments);
            setApproveResults(approveResultsData || []);

            const formValues = {};
            approveResultsData?.forEach((result) => {
                if (!isSecondProcess || allowedDepartmentCodes.includes(result.departmentCode)) {
                    formValues[`result_${result.departmentCode}`] = result.result;
                    formValues[`comment_${result.departmentCode}`] = result.comment;
                }
            });

            setInitialFormValues(formValues);
            setHasChanges(false);
            form.setFieldsValue(formValues);
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const checkFormChanges = () => {
        const currentValues = form.getFieldsValue();
        const hasChange = !isEqual(initialFormValues, currentValues);
        setHasChanges(hasChange);
    };

    const onFormValuesChange = () => {
        checkFormChanges();
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            const results = [];
            departments.forEach((dept) => {
                if (canUserApprove(dept.departmentCode)) {
                    const result = values[`result_${dept.departmentCode}`];
                    const comment = values[`comment_${dept.departmentCode}`] || '';

                    if (result) {
                        results.push({
                            departmentCode: dept.departmentCode,
                            result,
                            comment,
                        });
                    }
                }
            });

            if (results.length === 0) {
                message.warning('Vui lòng chọn ít nhất một kết quả phê duyệt');
                return;
            }

            await planApproveResultService.batchUpdateApproveResults(moldTrialPlanId, results);
            message.success('Cập nhật kết quả phê duyệt thành công');
            loadData();
        } catch (error) {
            message.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const getResultTag = (result) => {
        switch (result) {
            case 'OK':
                return (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                        OK
                    </Tag>
                );
            case 'NG':
                return (
                    <Tag icon={<CloseCircleOutlined />} color="error">
                        NG
                    </Tag>
                );
            default:
                return <Tag color="default">Chưa đánh giá</Tag>;
        }
    };

    const canUserApprove = (departmentCode) => {
        if (isSuperAdmin) {
            return true;
        }
        return currentUserDepartmentCode === departmentCode;
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <p style={{ marginTop: '16px' }}>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <Card
            title="Kết quả đánh giá từ các phòng ban"
            extra={
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={loadData} disabled={loading}>
                        Làm mới
                    </Button>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={saving}
                        onClick={handleSave}
                        disabled={!hasChanges}
                    >
                        Lưu kết quả
                    </Button>
                </Space>
            }
        >
            {departments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                    <p>Chưa có phòng ban nào được cấu hình để phê duyệt.</p>
                    <p>Vui lòng liên hệ quản trị viên để cấu hình.</p>
                </div>
            ) : (
                <Form form={form} layout="vertical" onValuesChange={onFormValuesChange}>
                    <Row gutter={[16, 16]}>
                        {departments.map((dept) => {
                            const existingResult = approveResults.find((r) => r.departmentCode === dept.departmentCode);
                            const canApprove = canUserApprove(dept.departmentCode);
                            const approvedByDisplay = formatApprovedByDisplay(existingResult);

                            return (
                                <Col xs={24} sm={12} md={8} lg={6} key={dept.id}>
                                    <Card
                                        size="small"
                                        hoverable
                                        title={
                                            <Space>
                                                <UserOutlined />
                                                {dept.departmentCode}
                                            </Space>
                                        }
                                        extra={getResultTag(existingResult?.result)}
                                        style={getApproveCardStyle(existingResult?.result)}
                                        onMouseEnter={handleApproveCardMouseEnter}
                                        onMouseLeave={handleApproveCardMouseLeave}
                                    >
                                        <Form.Item name={`result_${dept.departmentCode}`} label="Kết quả">
                                            <Radio.Group disabled={!canApprove} size="small">
                                                <Radio.Button
                                                    value="OK"
                                                    style={{
                                                        backgroundColor:
                                                            watchedValues?.[`result_${dept.departmentCode}`] === 'OK'
                                                                ? '#52c41a'
                                                                : undefined,
                                                        borderColor:
                                                            watchedValues?.[`result_${dept.departmentCode}`] === 'OK'
                                                                ? '#52c41a'
                                                                : undefined,
                                                        color:
                                                            watchedValues?.[`result_${dept.departmentCode}`] === 'OK'
                                                                ? 'white'
                                                                : undefined,
                                                    }}
                                                >
                                                    <CheckCircleOutlined /> OK
                                                </Radio.Button>
                                                <Radio.Button
                                                    value="NG"
                                                    style={{
                                                        backgroundColor:
                                                            watchedValues?.[`result_${dept.departmentCode}`] === 'NG'
                                                                ? '#ff4d4f'
                                                                : undefined,
                                                        borderColor:
                                                            watchedValues?.[`result_${dept.departmentCode}`] === 'NG'
                                                                ? '#ff4d4f'
                                                                : undefined,
                                                        color:
                                                            watchedValues?.[`result_${dept.departmentCode}`] === 'NG'
                                                                ? 'white'
                                                                : undefined,
                                                    }}
                                                >
                                                    <CloseCircleOutlined /> NG
                                                </Radio.Button>
                                            </Radio.Group>
                                        </Form.Item>

                                        <Form.Item name={`comment_${dept.departmentCode}`} label="Ghi chú">
                                            <TextArea
                                                rows={2}
                                                placeholder="Nhập ghi chú..."
                                                disabled={!canApprove}
                                                maxLength={500}
                                            />
                                        </Form.Item>

                                        {existingResult && (
                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                <Divider style={{ margin: '8px 0' }} />
                                                <p style={{ margin: 0 }}>
                                                    Cập nhật:{' '}
                                                    {new Date(existingResult.updatedAt).toLocaleString('vi-VN')}
                                                </p>
                                                {approvedByDisplay && (
                                                    <p style={{ margin: 0 }}>Bởi: {approvedByDisplay}</p>
                                                )}
                                            </div>
                                        )}

                                        {!canApprove && (
                                            <Tooltip
                                                title={`Chỉ phòng ban ${dept.departmentCode} mới có thể phê duyệt`}
                                            >
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        background: 'rgba(0,0,0,0.05)',
                                                        borderRadius: '6px',
                                                        cursor: 'not-allowed',
                                                    }}
                                                />
                                            </Tooltip>
                                        )}
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                </Form>
            )}
        </Card>
    );
};

export default PlanApproveResults;
