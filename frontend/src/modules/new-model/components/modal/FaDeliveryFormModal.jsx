import { UploadOutlined } from '@ant-design/icons';
import { Col, DatePicker, Form, InputNumber, message, Modal, Row, Select, Upload } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { Button } from 'antd/es/radio';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import authService from '~/modules/auth/services/authService';
import { formatDate } from '~/utils/formatter';
import { HtmpResult } from '~/utils/selectOptions';
import faDeliveryService from '../../services/productDelivery';

const FaDeliveryFormModal = ({
    open,
    onCancel,
    initialValues,
    trialPlanName,
    faInspectionId,
    onSuccess,
    typePlan = 'MOLD_TRIAL',
}) => {
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);
    const isKT = authService.hasDepartmentCode('KT');

    const isMoldTrial = typePlan === 'MOLD_TRIAL' || typePlan === 'THU_KHUON';
    const deliveryLabel = isMoldTrial ? 'gửi mẫu' : 'giao hàng';
    const deliveryLabelCapitalized = isMoldTrial ? 'Gửi mẫu' : 'Giao hàng';

    const isConditionFileApproved =
        initialValues?.conditionFileApprovalResult === 'OK' || initialValues?.conditionFileApprovalResult === 'NG';

    useEffect(() => {
        if (open && initialValues) {
            const toDayjs = (val) => {
                if (!val) return null;
                if (dayjs.isDayjs(val)) return val;
                return dayjs(val);
            };

            const feedbackFileList = initialValues.feedbackFileUrl
                ? [
                      {
                          uid: '1',
                          name: initialValues.feedbackFileUrl.split('/').pop(),
                          status: 'done',
                          url: `${process.env.REACT_APP_UPLOAD_URL}/${initialValues.feedbackFileUrl}`,
                      },
                  ]
                : [];

            const conditionFileList = initialValues.conditionFileUrl
                ? [
                      {
                          uid: '2',
                          name: initialValues.conditionFileUrl.split('/').pop(),
                          status: 'done',
                          url: `${process.env.REACT_APP_UPLOAD_URL}/${initialValues.conditionFileUrl}`,
                      },
                  ]
                : [];

            const values = {
                ...initialValues,
                deliveryDate: toDayjs(initialValues.deliveryDate),
                feedbackDate: toDayjs(initialValues.feedbackDate),
                feedbackAttachments: feedbackFileList,
                conditionAttachments: conditionFileList,
            };

            form.setFieldsValue(values);
        } else {
            form.resetFields();
        }
    }, [open, initialValues, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);
            const formData = new FormData();

            const formattedValues = isKT
                ? {
                      ...(values.deliveryDate ? { deliveryDate: formatDate(values.deliveryDate) } : {}),
                      ...(values.deliveryQuantity !== undefined && values.deliveryQuantity !== null
                          ? { deliveryQuantity: values.deliveryQuantity }
                          : {}),
                      ...(values.deliveryNote ? { deliveryNote: values.deliveryNote } : {}),
                      ...(values.feedbackDate ? { feedbackDate: formatDate(values.feedbackDate) } : {}),
                      ...(values.feedbackComment ? { feedbackComment: values.feedbackComment } : {}),
                      ...(values.feedbackResult ? { feedbackResult: values.feedbackResult } : {}),
                  }
                : {
                      ...values,
                      deliveryDate: formatDate(values.deliveryDate),
                      feedbackDate: formatDate(values.feedbackDate),
                  };

            delete formattedValues.feedbackAttachments;
            delete formattedValues.conditionAttachments;

            formData.append('data', new Blob([JSON.stringify(formattedValues)], { type: 'application/json' }));

            if (values.feedbackAttachments?.length > 0) {
                const fileObj = values.feedbackAttachments[0];
                if (fileObj.originFileObj) {
                    formData.append('feedbackFile', fileObj.originFileObj);
                }
            }

            if (values.conditionAttachments?.length > 0) {
                const fileObj = values.conditionAttachments[0];
                if (fileObj.originFileObj) {
                    formData.append('conditionFile', fileObj.originFileObj);
                }
            }

            const res = initialValues
                ? await faDeliveryService.updateFaDelivery(initialValues.id, formData)
                : await faDeliveryService.createFaDelivery(faInspectionId, formData);

            message.success(res?.message || 'Lưu thành công');
            onCancel();
            form.resetFields();

            onSuccess?.();
        } catch (error) {
            message.error(error?.message || String(error));
        } finally {
            setSaving(false);
        }
    };
    return (
        <Modal
            open={open}
            onCancel={onCancel}
            onOk={handleSave}
            okText="Lưu"
            cancelText="Hủy"
            title={
                initialValues
                    ? `Chỉnh sửa thông tin ${deliveryLabel}cho ${trialPlanName}`
                    : `Thêm thông tin ${deliveryLabel}cho ${trialPlanName}`
            }
            confirmLoading={saving}
            width={900}
        >
            <Form form={form} layout="vertical" name="faInspectionForm" autoComplete="off">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="deliveryDate"
                            label={`Ngày ${deliveryLabel}`}
                            rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="deliveryQuantity" min={0} label="Số lượng vận chuyển">
                            <InputNumber />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="deliveryNote" label={`Ghi chú ${deliveryLabel}`}>
                            <TextArea style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="feedbackDate" label="Ngày KH feedback">
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="feedbackComment" label="Ghi chú">
                            <TextArea />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="feedbackResult" label="Đánh giá của KH">
                            <Select showSearch allowClear placeholder="Kết quả " options={HtmpResult} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="feedbackAttachments"
                            label="File phản hồi từ khách hàng"
                            valuePropName="fileList"
                            getValueFromEvent={(e) => e?.fileList}
                        >
                            <Upload
                                listType="text"
                                beforeUpload={() => false}
                                maxCount={1}
                                onChange={({ fileList }) => {
                                    form.setFieldsValue({ feedbackAttachments: fileList });
                                }}
                                onRemove={(file) => {
                                    form.setFieldsValue({ feedbackAttachments: [] });
                                }}
                            >
                                <Button type="default" icon={<UploadOutlined />}>
                                    Tải lên
                                </Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="conditionAttachments"
                            label={
                                <span>
                                    File điều kiện đúc
                                    {isConditionFileApproved && (
                                        <span style={{ color: '#fa8c16', marginLeft: 8 }}>
                                            (Đã duyệt - Không thể thay đổi)
                                        </span>
                                    )}
                                </span>
                            }
                            valuePropName="fileList"
                            getValueFromEvent={(e) => e?.fileList}
                        >
                            <Upload
                                listType="text"
                                beforeUpload={() => false}
                                maxCount={1}
                                disabled={isConditionFileApproved}
                                onChange={({ fileList }) => {
                                    if (!isConditionFileApproved) {
                                        form.setFieldsValue({ conditionAttachments: fileList });
                                    }
                                }}
                                onRemove={(file) => {
                                    if (!isConditionFileApproved) {
                                        form.setFieldsValue({ conditionAttachments: [] });
                                    }
                                    return !isConditionFileApproved;
                                }}
                            >
                                <Button type="default" icon={<UploadOutlined />} disabled={isConditionFileApproved}>
                                    Tải lên
                                </Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default FaDeliveryFormModal;
