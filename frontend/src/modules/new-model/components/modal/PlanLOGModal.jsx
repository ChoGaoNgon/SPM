import { Form, Input, InputNumber, message, Modal, Table, Tag } from 'antd';
import { useEffect } from 'react';
import productMoldTrialPlanService from '../../services/productPlanService';

const PlanLOGModal = ({ open, onCancel, initialValues, onSuccess }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open && (initialValues?.plastics || initialValues?.supplies)) {
            const fieldValues = {};

            (initialValues.plastics || []).forEach((plastic) => {
                fieldValues[`plastic_${plastic.id}`] = plastic.plasticActualWeight;
                fieldValues[`plastic_remark_${plastic.id}`] = plastic.remark || null;
            });

            (initialValues.supplies || []).forEach((supply) => {
                fieldValues[`supply_${supply.id}`] = supply.supplyActualQuantity;
                fieldValues[`supply_remark_${supply.id}`] = supply.remark || null;
            });

            form.setFieldsValue(fieldValues);
            return;
        }

        form.resetFields();
    }, [open, initialValues, form]);

    const handleSaveLog = async () => {
        try {
            const values = await form.validateFields();

            const actualPlastics = (initialValues?.plastics || []).map((plastic) => ({
                id: plastic.id,
                plasticActualWeight: values[`plastic_${plastic.id}`] ?? null,
                remark: values[`plastic_remark_${plastic.id}`] || null,
            }));

            const actualSupplies = (initialValues?.supplies || []).map((supply) => ({
                id: supply.id,
                supplyActualQuantity: values[`supply_${supply.id}`] ?? null,
                remark: values[`supply_remark_${supply.id}`] || null,
            }));

            const res = await productMoldTrialPlanService.updateMoldTrialPlanForSX(initialValues.id, {
                actualPlastics,
                supplies: actualSupplies,
            });

            message.success(res?.message || 'Ghi nhận Log thử khuôn thành công!');
            form.resetFields();
            onCancel();
            onSuccess?.();
        } catch (error) {
            message.error(error?.message || error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật dữ liệu!');
        }
    };

    const columns = [
        {
            title: 'STT',
            key: 'stt',
            width: 60,
            align: 'center',
            render: (_, __, index) => <strong>#{index + 1}</strong>,
        },
        {
            title: 'Mã nhựa',
            dataIndex: 'resin',
            key: 'resinCode',
            width: 140,
            align: 'center',
            render: (resin) => (
                <span style={{ fontWeight: 600, color: '#1890ff' }}>
                    {resin?.code || <span style={{ color: '#bfbfbf' }}>-</span>}
                </span>
            ),
        },
        {
            title: 'Phân loại',
            dataIndex: 'isRecycle',
            key: 'isRecycle',
            width: 120,
            align: 'center',
            render: (isRecycle) => (
                <Tag color={isRecycle ? 'blue' : 'green'}>{isRecycle ? 'Tái sinh' : 'Nguyên chất'}</Tag>
            ),
        },
        {
            title: 'Khối lượng dự kiến',
            dataIndex: 'plasticExpectedWeight',
            key: 'plasticExpectedWeight',
            width: 150,
            align: 'center',
            render: (text) => (
                <span style={{ fontWeight: 500 }}>
                    {text != null ? `${text} Kg` : <span style={{ color: '#bfbfbf' }}>Chưa nhập</span>}
                </span>
            ),
        },
        {
            title: 'Khối lượng thực tế',
            dataIndex: 'id',
            key: 'plasticActualWeight',
            width: 180,
            render: (id) => (
                <Form.Item
                    name={`plastic_${id}`}
                    style={{ marginBottom: 0 }}
                    rules={[
                        {
                            validator: (_, value) => {
                                if (value !== undefined && value !== null && value < 0) {
                                    return Promise.reject(new Error('Không được nhập số âm'));
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        placeholder="Nhập khối lượng"
                        addonAfter="Kg"
                        precision={2}
                    />
                </Form.Item>
            ),
        },
        {
            title: 'Ghi chú',
            dataIndex: 'id',
            key: 'remark',
            width: 250,
            render: (id) => (
                <Form.Item name={`plastic_remark_${id}`} style={{ marginBottom: 0 }}>
                    <Input.TextArea placeholder="Ghi chú cho loại nhựa này..." autoSize={{ minRows: 1, maxRows: 3 }} />
                </Form.Item>
            ),
        },
    ];

    const suppliesColumns = [
        {
            title: 'STT',
            key: 'stt',
            width: 60,
            align: 'center',
            render: (_, __, index) => <strong>#{index + 1}</strong>,
        },
        {
            title: 'Mã vật tư',
            dataIndex: 'supply',
            key: 'code',
            width: 150,
            render: (supply) => (
                <span style={{ fontWeight: 500, color: '#1890ff' }}>
                    {supply?.code || <span style={{ color: '#bfbfbf' }}>Chưa có mã</span>}
                </span>
            ),
        },
        {
            title: 'Tên vật tư',
            dataIndex: 'supply',
            key: 'name',
            width: 200,
            render: (supply) => (
                <span style={{ fontWeight: 500 }}>
                    {supply?.name || <span style={{ color: '#bfbfbf' }}>Chưa nhập</span>}
                </span>
            ),
        },
        {
            title: 'Số lượng dự kiến',
            dataIndex: 'supplyExpectedQuantity',
            key: 'supplyExpectedQuantity',
            width: 150,
            align: 'center',
            render: (text, record) => {
                const unit = record.supply?.unit || record.unit || '';
                return (
                    <span style={{ fontWeight: 500 }}>
                        {text != null ? `${text} ${unit}` : <span style={{ color: '#bfbfbf' }}>Chưa nhập</span>}
                    </span>
                );
            },
        },
        {
            title: 'Số lượng thực tế',
            dataIndex: 'id',
            key: 'supplyActualQuantity',
            width: 180,
            render: (id, record) => {
                const unit = record.supply?.unit || record.unit || '';
                return (
                    <Form.Item
                        name={`supply_${id}`}
                        style={{ marginBottom: 0 }}
                        rules={[
                            {
                                validator: (_, value) => {
                                    if (value !== undefined && value !== null && value < 0) {
                                        return Promise.reject(new Error('Không được nhập số âm'));
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            placeholder="Nhập số lượng"
                            addonAfter={unit}
                            precision={2}
                        />
                    </Form.Item>
                );
            },
        },
        {
            title: 'Ghi chú',
            dataIndex: 'id',
            key: 'remark',
            width: 250,
            render: (id) => (
                <Form.Item name={`supply_remark_${id}`} style={{ marginBottom: 0 }}>
                    <Input.TextArea placeholder="Ghi chú cho vật tư này..." autoSize={{ minRows: 1, maxRows: 3 }} />
                </Form.Item>
            ),
        },
    ];

    const plasticsList = initialValues?.plastics || [];
    const suppliesList = initialValues?.supplies || [];
    const isDataEmpty = plasticsList.length === 0 && suppliesList.length === 0;
    const canSubmitLog = plasticsList.length > 0 || suppliesList.length > 0;

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            onOk={handleSaveLog}
            okText="Lưu"
            cancelText="Hủy"
            width={1200}
            title={`Ghi nhận số liệu thực tế: [${initialValues?.name || 'N/A'}] của sản phẩm [${initialValues?.productCode || 'N/A'}]`}
            footer={isDataEmpty || !canSubmitLog ? null : undefined}
        >
            <Form form={form} name="moldTrialLogForm" autoComplete="off">
                {plasticsList.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <h4 style={{ marginBottom: 12, color: '#1890ff' }}>Khối lượng nhựa thực tế</h4>
                        <Table
                            columns={columns}
                            dataSource={plasticsList}
                            rowKey="id"
                            pagination={false}
                            bordered
                            size="small"
                            locale={{ emptyText: 'Không có dữ liệu nhựa' }}
                        />
                    </div>
                )}

                {suppliesList.length > 0 && (
                    <div>
                        <h4 style={{ marginBottom: 12, color: '#1890ff' }}>Danh sách vật tư sử dụng</h4>
                        <Table
                            columns={suppliesColumns}
                            dataSource={suppliesList}
                            rowKey="id"
                            pagination={false}
                            bordered
                            size="small"
                            locale={{ emptyText: 'Không có dữ liệu vật tư' }}
                        />
                    </div>
                )}

                {isDataEmpty && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        Không có dữ liệu nhựa hoặc vật tư để cập nhật
                    </div>
                )}
            </Form>
        </Modal>
    );
};

export default PlanLOGModal;
