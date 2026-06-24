import { Button, Col, DatePicker, Form, Input, InputNumber, message, Modal, Row, Select, Upload } from 'antd';

import { DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import authService from '~/modules/auth/services/authService';
import employeeService from '~/modules/employee/services/employeeService';
import { formatDate, formatDateTime } from '~/utils/formatter';
import { HtmpResult } from '~/utils/selectOptions';
import faInspectionService from '../../services/faInspectionService';
import defectCodeService from '../../services/QCService';

const normalizeDefectDetails = (details) =>
    Array.isArray(details)
        ? details.map((detail) => ({
              defectCodeId: detail?.defectCodeId,
              quantity: detail?.quantity ?? 1,
              note: detail?.note || '',
          }))
        : [];

const DefectDetailsSection = ({ detailFieldName, title, defectCodes }) => (
    <Row gutter={16}>
        <Col span={24}>
            <Form.List name={detailFieldName}>
                {(fields, { add, remove }) => (
                    <div
                        style={{
                            border: '1px solid #f0f0f0',
                            borderRadius: 8,
                            padding: 16,
                            marginBottom: 16,
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: fields.length > 0 ? 12 : 0,
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 600 }}>{title}</div>
                                <div style={{ color: '#8c8c8c', fontSize: 12 }}>
                                    Có thể thêm lỗi dù kết quả đánh giá là OK hoặc NG.
                                </div>
                            </div>
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={() => add({ quantity: 1, note: '' })}
                            >
                                Thêm mã lỗi
                            </Button>
                        </div>

                        {fields.map(({ key, name, ...restField }) => (
                            <Row key={key} gutter={8} style={{ marginBottom: 12 }} align="middle">
                                <Col span={10}>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'defectCodeId']}
                                        label="Mã lỗi"
                                        rules={[{ required: true, message: 'Vui lòng chọn mã lỗi!' }]}
                                        style={{ marginBottom: 0 }}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="Chọn mã lỗi"
                                            optionFilterProp="label"
                                            options={defectCodes.map((dc) => ({
                                                value: dc.id,
                                                label: `${dc.code} - ${dc.description}`,
                                            }))}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={5}>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'quantity']}
                                        label="Số lượng lỗi"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập số lượng!' },
                                            { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!' },
                                        ]}
                                        style={{ marginBottom: 0 }}
                                    >
                                        <InputNumber min={1} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={7}>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'note']}
                                        label="Ghi chú"
                                        style={{ marginBottom: 0 }}
                                    >
                                        <Input placeholder="Nhập ghi chú" />
                                    </Form.Item>
                                </Col>
                                <Col span={2} style={{ display: 'flex', justifyContent: 'center', paddingTop: 30 }}>
                                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                                </Col>
                            </Row>
                        ))}
                    </div>
                )}
            </Form.List>
        </Col>
    </Row>
);

const InspectionFormModal = ({ open, onCancel, initialValues, trialPlanName, trialPlanId, onSuccess }) => {
    const [form] = Form.useForm();
    const [employees, setEmployees] = useState([]);
    const [fullEmployees, setFullEmployees] = useState([]);
    const [saving, setSaving] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [defectCodes, setDefectCodes] = useState([]);

    useEffect(() => {
        if (open) {
            if (initialValues) {
                const toDayjs = (val) => {
                    if (!val) return null;
                    if (dayjs.isDayjs(val)) return val;
                    return dayjs(val);
                };
                const values = {
                    ...initialValues,
                    inspectionDate: toDayjs(initialValues.inspectionDate),
                    receivedDate: toDayjs(initialValues.receivedDate),
                    visualDefectDetails: normalizeDefectDetails(initialValues.visualDefectDetails),
                    dimensionDefectDetails: normalizeDefectDetails(initialValues.dimensionDefectDetails),
                };

                form.setFieldsValue(values);

                if (initialValues.filePath) {
                    setFileList([
                        {
                            uid: '-1',
                            name: initialValues.filePath.split('/').pop(),
                            status: 'done',
                            url: `${process.env.REACT_APP_UPLOAD_URL}/${initialValues.filePath}`,
                        },
                    ]);
                } else {
                    setFileList([]);
                }
            } else {
                form.resetFields();
                form.setFieldsValue({ visualDefectDetails: [], dimensionDefectDetails: [] });
                setFileList([]);
            }
        }
    }, [open, initialValues, form]);

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const presentDepartmentId = authService.getDepartmentId();
                const list = await employeeService.getEmployeesByDepartment(presentDepartmentId, null);
                setEmployees(list);
            } catch (error) {
                message.error(error.message);
            }
        };
        loadEmployees();
    }, []);

    useEffect(() => {
        const loadFullEmployees = async () => {
            try {
                const list = await employeeService.getAllEmployees();
                setFullEmployees(list);
            } catch (error) {
                message.error(error.message);
            }
        };
        loadFullEmployees();
    }, []);

    useEffect(() => {
        const loadDefectCodes = async () => {
            try {
                const list = await defectCodeService.getAllDefectCodes();
                setDefectCodes(list);
            } catch (error) {
                message.error(error.message);
            }
        };
        loadDefectCodes();
    }, []);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            const deadline = initialValues?.inspectionDeadline;
            if (deadline && values.inspectionDate && dayjs(values.inspectionDate).isAfter(dayjs(deadline), 'day')) {
                if (!values.delayReason || !values.delayReason.trim()) {
                    form.setFields([
                        {
                            name: 'delayReason',
                            errors: ['Vui lòng nhập lý do trễ khi kiểm tra sau deadline!'],
                        },
                    ]);
                    return;
                }
            }
            setSaving(true);

            const formData = new FormData();

            const formattedValues = {
                ...values,
                inspectionDate: formatDate(values.inspectionDate),
                receivedDate: formatDateTime(values.receivedDate),
                visualDefectDetails: normalizeDefectDetails(values.visualDefectDetails).filter(
                    (detail) => detail.defectCodeId && detail.quantity,
                ),
                dimensionDefectDetails: normalizeDefectDetails(values.dimensionDefectDetails).filter(
                    (detail) => detail.defectCodeId && detail.quantity,
                ),
            };

            formData.append('data', new Blob([JSON.stringify(formattedValues)], { type: 'application/json' }));

            const newFile = fileList.find((file) => file.originFileObj);
            if (newFile) {
                formData.append('file', newFile.originFileObj);
            }

            const res = initialValues
                ? await faInspectionService.updateFaInspection(initialValues.id, formData)
                : await faInspectionService.createFaInspection(trialPlanId, formData);

            message.success(res?.message || 'Lưu thành công');
            onCancel();
            form.resetFields();
            setFileList([]);
            onSuccess?.();
        } catch (error) {
            if (error?.errorFields) {
                return;
            }

            const errorMessage =
                error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi lưu thông tin kiểm tra FA';
            message.error(errorMessage);
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
                    ? `Chỉnh sửa thông tin kiểm tra  cho ${trialPlanName}`
                    : `Thêm thông tin kiểm tra FA cho ${trialPlanName}`
            }
            confirmLoading={saving}
            width={1000}
        >
            <Form form={form} layout="vertical" name="faInspectionForm" autoComplete="off">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="receivedDate"
                            label="Ngày nhận mẫu"
                            rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
                        >
                            <DatePicker showTime format="DD-MM-YYYY HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="inspectionDate"
                            label="Ngày kiểm tra thực tế"
                            rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    {initialValues?.inspectionDeadline && (
                        <Col span={12}>
                            <Form.Item
                                shouldUpdate={(prev, curr) => prev.inspectionDate !== curr.inspectionDate}
                                noStyle
                            >
                                {({ getFieldValue }) => {
                                    const inspectionDate = getFieldValue('inspectionDate');
                                    const deadline = dayjs(initialValues.inspectionDeadline);
                                    if (inspectionDate && dayjs(inspectionDate).isAfter(deadline, 'day')) {
                                        return (
                                            <Form.Item
                                                name="delayReason"
                                                label="Lý do trễ kiểm tra"
                                                rules={[{ required: true, message: 'Vui lòng nhập lý do trễ!' }]}
                                            >
                                                <Input.TextArea rows={2} placeholder="Nhập lý do trễ kiểm tra..." />
                                            </Form.Item>
                                        );
                                    }
                                    return null;
                                }}
                            </Form.Item>
                        </Col>
                    )}
                </Row>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="receivedByEmployeeId"
                            label="Nhân viên nhận mẫu"
                            rules={[{ required: true, message: 'Vui lòng nhập nhân viên!' }]}
                        >
                            <Select
                                showSearch
                                allowClear
                                placeholder="Chọn nhân viên"
                                optionFilterProp="label"
                                options={fullEmployees.map((employee) => ({
                                    value: employee.id,
                                    label: `${employee.code} - ${employee.name}`,
                                }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="inspectedQuantity" label="Số lượng kiểm tra">
                            <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="ngQuantity" label="Số lượng NG">
                            <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="qcNote" label="Ghi chú QC">
                            <Input.TextArea rows={3} placeholder="Nhập ghi chú thông tin kiểm tra QC" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="visualCheckedById"
                            label="Nhân viên kiểm tra ngoại quan"
                            dependencies={['visualResult']}
                            rules={[
                                ({ getFieldValue }) => ({
                                    required: !!getFieldValue('visualResult'),
                                    message: 'Vui lòng chọn nhân viên kiểm tra ngoại quan khi đã có kết quả!',
                                }),
                            ]}
                        >
                            <Select
                                showSearch
                                allowClear
                                placeholder="Chọn nhân viên"
                                optionFilterProp="label"
                                options={employees.map((employee) => ({
                                    value: employee.id,
                                    label: `${employee.code} - ${employee.name}`,
                                }))}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="visualResult" label="Kết quả kiểm tra ngoại quan">
                            <Select showSearch allowClear placeholder="Kết quả " options={HtmpResult} />
                        </Form.Item>
                    </Col>
                </Row>
                <DefectDetailsSection
                    detailFieldName="visualDefectDetails"
                    title="Mã lỗi ngoại quan"
                    defectCodes={defectCodes}
                />
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="dimensionCheckedById"
                            label="Nhân viên kiểm tra kích thước"
                            dependencies={['dimensionResult']}
                            rules={[
                                ({ getFieldValue }) => ({
                                    required: !!getFieldValue('dimensionResult'),
                                    message: 'Vui lòng chọn nhân viên kiểm tra kích thước khi đã có kết quả!',
                                }),
                            ]}
                        >
                            <Select
                                showSearch
                                allowClear
                                placeholder="Chọn nhân viên"
                                optionFilterProp="label"
                                optionLabelProp="label"
                                options={employees.map((employee) => ({
                                    value: employee.id,
                                    label: `${employee.code} - ${employee.name}`,
                                }))}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="dimensionResult" label="Kết quả kiểm tra kích thước">
                            <Select showSearch allowClear placeholder="Kết quả " options={HtmpResult} />
                        </Form.Item>
                    </Col>
                </Row>
                <DefectDetailsSection
                    detailFieldName="dimensionDefectDetails"
                    title="Mã lỗi kích thước"
                    defectCodes={defectCodes}
                />
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="finalCheckedById"
                            label="Nhân viên đánh giá cuối cùng"
                            dependencies={['finalResult']}
                            rules={[
                                ({ getFieldValue }) => ({
                                    required: !!getFieldValue('finalResult'),
                                    message: 'Vui lòng chọn nhân viên đánh giá cuối cùng khi đã có kết quả!',
                                }),
                            ]}
                        >
                            <Select
                                showSearch
                                allowClear
                                placeholder="Chọn nhân viên"
                                optionFilterProp="label"
                                options={employees.map((employee) => ({
                                    value: employee.id,
                                    label: `${employee.code} - ${employee.name}`,
                                }))}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="finalResult" label="Kết quả đánh giá cuối cùng">
                            <Select showSearch allowClear placeholder="Kết quả " options={HtmpResult} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Tải lên file đính kèm">
                    <Upload
                        maxCount={1}
                        listType="text"
                        beforeUpload={() => false}
                        fileList={fileList}
                        onChange={({ fileList: nextFileList }) => setFileList(nextFileList)}
                        onRemove={() => setFileList([])}
                    >
                        <Button type="default" icon={<UploadOutlined />}>
                            Chọn file
                        </Button>
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default InspectionFormModal;
