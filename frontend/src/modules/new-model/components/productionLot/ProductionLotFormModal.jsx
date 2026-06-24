import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, InputNumber, message, Modal, Row, Select, Spin } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import employeeService from '~/modules/employee/services/employeeService';
import productionLotService from '../../services/productionLot/productionLotService';
import defectCodeService from '../../services/QCService';

const { Option } = Select;

const ProductionLotFormModal = ({ open, onCancel, productPlanId, initialValues, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [defectCodes, setDefectCodes] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    const isEditing = Boolean(initialValues?.id);

    const loadReferenceData = async () => {
        setLoadingData(true);
        try {
            const [employeesRes, defectCodesRes] = await Promise.all([
                employeeService.getAllEmployees(),
                defectCodeService.getAllDefectCodes(),
            ]);

            setEmployees(employeesRes || []);
            setDefectCodes(defectCodesRes || []);
        } catch (error) {
            message.error(error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const formData = {
                ...values,
                productPlanId,
                productionDate: values.productionDate?.format('YYYY-MM-DD'),
                defectDetails:
                    values.defectDetails?.filter((detail) => detail && detail.defectCodeId && detail.quantity > 0) ||
                    [],
            };

            delete formData.ngQuantity;

            if (isEditing) {
                await productionLotService.updateProductionLot(initialValues.id, formData);
                message.success('Cập nhật lot sản xuất thành công');
            } else {
                await productionLotService.createProductionLot(formData);
                message.success('Tạo lot sản xuất thành công');
            }

            form.resetFields();
            onSuccess();
            onCancel();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định';
            message.error(
                isEditing
                    ? `Lỗi khi cập nhật lot sản xuất: ${errorMessage}`
                    : `Lỗi khi tạo lot sản xuất: ${errorMessage}`,
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            loadReferenceData();

            if (isEditing && initialValues) {
                form.setFieldsValue({
                    ...initialValues,
                    productionDate: initialValues.productionDate ? dayjs(initialValues.productionDate) : null,
                    defectDetails:
                        initialValues.defectDetails?.map((detail) => ({
                            defectCodeId: detail.defectCodeId,
                            quantity: detail.quantity,
                        })) || [],
                    checkedById: initialValues.checkedBy?.id,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, initialValues, isEditing, form]);

    return (
        <Modal
            title={isEditing ? 'Cập nhật lot sản xuất' : 'Tạo lot sản xuất mới'}
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={handleSubmit}
            confirmLoading={loading}
            width={800}
            destroyOnClose
        >
            <Spin spinning={loadingData}>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        defectDetails: [],
                    }}
                >
                    <Form.Item
                        name="productionDate"
                        label="Ngày sản xuất"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày sản xuất!' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sản xuất" />
                    </Form.Item>

                    <Form.Item
                        name="quantity"
                        label="Số lượng sản xuất"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số lượng!' },
                            { type: 'number', min: 0, message: 'Số lượng phải >= 0!' },
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Nhập số lượng"
                            min={0}
                            formatter={(value) => (value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                            parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, '') : '')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="qcCheckResult"
                        label="Kết quả kiểm tra QC"
                        rules={[{ required: true, message: 'Vui lòng chọn kết quả kiểm tra!' }]}
                    >
                        <Select placeholder="Chọn kết quả kiểm tra">
                            <Option value="OK">OK</Option>
                            <Option value="NG">NG</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="checkedById" label="Người kiểm tra">
                        <Select
                            placeholder="Chọn người kiểm tra"
                            showSearch
                            allowClear
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {employees.map((emp) => (
                                <Option key={emp.id} value={emp.id}>
                                    {emp.name} ({emp.code})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.List name="defectDetails">
                        {(fields, { add, remove }) => (
                            <div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 16,
                                    }}
                                >
                                    <h4 style={{ margin: 0 }}>Chi tiết lỗi sản phẩm</h4>
                                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                                        Thêm mã lỗi
                                    </Button>
                                </div>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Row key={key} gutter={8} style={{ marginBottom: 16 }} align="middle">
                                        <Col span={12}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'defectCodeId']}
                                                label="Mã lỗi"
                                                rules={[{ required: true, message: 'Vui lòng chọn mã lỗi!' }]}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Select
                                                    placeholder="Chọn mã lỗi"
                                                    showSearch
                                                    filterOption={(input, option) =>
                                                        option.children.toLowerCase().includes(input.toLowerCase())
                                                    }
                                                >
                                                    {defectCodes.map((code) => (
                                                        <Option key={code.id} value={code.id}>
                                                            {code.code} - {code.description}
                                                        </Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'quantity']}
                                                label="Số lượng lỗi"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập số lượng!' },
                                                    { type: 'number', min: 1, message: 'Số lượng phải > 0!' },
                                                ]}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <InputNumber style={{ width: '100%' }} placeholder="Số lượng" min={1} />
                                            </Form.Item>
                                        </Col>
                                        <Col
                                            span={4}
                                            style={{ display: 'flex', justifyContent: 'center', paddingTop: 30 }}
                                        >
                                            <Button
                                                type="text"
                                                icon={<DeleteOutlined />}
                                                onClick={() => remove(name)}
                                                danger
                                                size="small"
                                            />
                                        </Col>
                                    </Row>
                                ))}
                            </div>
                        )}
                    </Form.List>
                </Form>
            </Spin>
        </Modal>
    );
};

export default ProductionLotFormModal;
