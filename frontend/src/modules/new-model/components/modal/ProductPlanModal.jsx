import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
    AutoComplete,
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Popconfirm,
    Radio,
    Row,
    Select,
    Table,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import dayjs from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import authService from '~/modules/auth/services/authService';
import employeeService from '~/modules/employee/services/employeeService';
import machineService from '~/modules/machine/service/machineService';
import productPlanService from '../../services/productPlanService';
import ProductResinMappingService from '../../services/productResinMappingService';
import ResinSelect from '../ResinSelect';
import MachineCodeAutoCompleteField from './MachineCodeAutoCompleteField';

const { Option } = Select;

const ProductPlanModal = ({
    open,
    onCancel,
    initialValues,
    productId,
    productCode,
    onSuccess,
    planType = 'EVENT',
    moldCode,
}) => {
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [dryerOptions, setDryerOptions] = useState([]);
    const [processStepOptions, setProcessStepOptions] = useState([]);
    const [machines, setMachines] = useState([]);
    const [ProductResinMappings, setProductResinMappings] = useState([]);
    const [suppliesOptions, setSuppliesOptions] = useState([]);
    const [eventRequirements, setEventRequirements] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);
    const [selectedPlanType, setSelectedPlanType] = useState(planType || 'MOLD_TRIAL');

    const cacheTimeoutRef = useRef(null);

    const isEvent = selectedPlanType === 'EVENT';
    const isMoldTrial = selectedPlanType === 'MOLD_TRIAL';
    const isSecondProcess = selectedPlanType === 'SECOND_PROCESS';

    const getCacheKey = useCallback(() => {
        return initialValues
            ? `product_plan_form_edit_${initialValues.id}_${selectedPlanType}`
            : `product_plan_form_create_${productId}_${selectedPlanType}`;
    }, [initialValues, productId, selectedPlanType]);

    const getEventRequirementsStorageKey = useCallback(() => {
        return productId ? `product_event_requirements_${productId}` : null;
    }, [productId]);

    const convertDateToDayjs = useCallback((val) => {
        if (!val) return null;
        if (dayjs.isDayjs(val)) return val;
        return dayjs(val);
    }, []);

    const convertDayjsToString = useCallback((val) => {
        return val ? val.format('YYYY-MM-DD HH:mm') : null;
    }, []);

    const prepareCacheData = useCallback(
        (formValues) => {
            const payload = { ...formValues };
            const dateFields = [
                'requestStartTime',
                'requestEndTime',
                'actualStartTime',
                'actualEndTime',
                'expectedFaSubmitDate',
                'deliveryDate',
            ];

            dateFields.forEach((field) => {
                if (payload[field]) {
                    payload[field] = convertDayjsToString(payload[field]);
                }
            });

            delete payload.machineCapacityTon;
            return payload;
        },
        [convertDayjsToString],
    );

    const restoreCacheData = useCallback(
        (cachedData) => {
            const restored = { ...cachedData };
            const dateFields = [
                'requestStartTime',
                'requestEndTime',
                'actualStartTime',
                'actualEndTime',
                'expectedFaSubmitDate',
                'deliveryDate',
            ];

            dateFields.forEach((field) => {
                if (restored[field]) {
                    restored[field] = convertDateToDayjs(restored[field]);
                }
            });
            return restored;
        },
        [convertDateToDayjs],
    );

    const loadFromCache = useCallback(
        (cacheKey) => {
            try {
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    return restoreCacheData(JSON.parse(cached));
                }
            } catch (error) {
                localStorage.removeItem(cacheKey);
            }
            return null;
        },
        [restoreCacheData],
    );

    const saveToCache = useCallback(
        (cacheKey, formValues) => {
            try {
                const cacheData = prepareCacheData(formValues);
                localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            } catch (error) {}
        },
        [prepareCacheData],
    );

    const clearOldCache = useCallback(() => {
        const allCacheKeys = [
            `product_plan_form_create_${productId}_MOLD_TRIAL`,
            `product_plan_form_create_${productId}_EVENT`,
            `product_plan_form_create_${productId}_SECOND_PROCESS`,
        ];

        allCacheKeys.forEach((key) => {
            if (key !== getCacheKey()) {
                localStorage.removeItem(key);
            }
        });
    }, [productId, getCacheKey]);

    const handleEventNameChange = useCallback(
        (eventName) => {
            const selectedEvent = eventRequirements.find((item) => item?.name === eventName);
            if (!selectedEvent) {
                return;
            }

            form.setFieldsValue({
                deliveryQuantity: selectedEvent.quantity ?? null,
                deliveryDate: selectedEvent.deliveryDate ? dayjs(selectedEvent.deliveryDate) : null,
            });
        },
        [eventRequirements, form],
    );

    const PLAN_LABELS = {
        MOLD_TRIAL: {
            planName: 'thử khuôn',
            action: 'thử khuôn',
            planTitle: 'kế hoạch thử khuôn',
            modalTitle: 'kế hoạch thử khuôn',
            quantityLabel: 'Số lượng mẫu thử',
            quantityUnit: 'PCS',
            deliveryQuantityLabel: 'Số lượng giao hàng',

            startTimeLabel: 'Thời gian bắt đầu thử khuôn yêu cầu',
            endTimeLabel: 'Thời gian kết thúc thử khuôn yêu cầu',
            actualStartTimeLabel: 'Thời gian bắt đầu thử khuôn thực tế',
            actualEndTimeLabel: 'Thời gian kết thúc thử khuôn thực tế',
            purposeLabel: 'Mục đích thử khuôn',
            purposePlaceholder: 'Mục đích hoặc lý do thử khuôn...',
        },
        EVENT: {
            planName: 'event',
            action: 'chạy event',
            planTitle: 'sự kiện (Event)',
            modalTitle: 'sự kiện (Event)',
            quantityLabel: 'Số lượng sản xuất',
            deliveryQuantityLabel: 'Số lượng giao hàng',
            quantityUnit: 'PCS',
            startTimeLabel: 'Thời gian bắt đầu chạy event yêu cầu',
            endTimeLabel: 'Thời gian kết thúc chạy event yêu cầu',
            deliveryDateLabel: 'Ngày giao hàng',
            actualStartTimeLabel: 'Ngày bắt đầu chạy event thực tế',
            actualEndTimeLabel: 'Ngày kết thúc chạy event thực tế',
            purposeLabel: 'Mục đích chạy event',
            purposePlaceholder: 'Mục đích hoặc lý do chạy event...',
        },
        SECOND_PROCESS: {
            planName: '2nd process',
            action: 'secondProcess',
            planTitle: 'kế hoạch 2nd Process',
            modalTitle: 'kế hoạch 2nd Process',
            quantityLabel: 'Số lượng gia công',
            deliveryQuantityLabel: 'Số lượng giao hàng',
            quantityUnit: 'PCS',
            startTimeLabel: 'Thời gian bắt đầu secondProcess yêu cầu',
            endTimeLabel: 'Thời gian kết thúc secondProcess yêu cầu',
            actualStartTimeLabel: 'Thời gian bắt đầu secondProcess thực tế',
            actualEndTimeLabel: 'Thời gian kết thúc secondProcess thực tế',
            purposeLabel: 'Mục đích secondProcess',
            purposePlaceholder: 'Mục đích hoặc lý do secondProcess...',
        },
    };

    const labels = PLAN_LABELS[selectedPlanType] || PLAN_LABELS.MOLD_TRIAL;

    const getPlanTypeName = () => labels.planName;
    const getPlanTypeAction = () => labels.action;

    const handleCacheForm = useCallback(
        (_, allValues) => {
            if (cacheTimeoutRef.current) {
                clearTimeout(cacheTimeoutRef.current);
            }

            cacheTimeoutRef.current = setTimeout(() => {
                const cacheKey = getCacheKey();
                saveToCache(cacheKey, allValues);
            }, 300);
        },
        [getCacheKey, saveToCache],
    );

    useEffect(() => {
        return () => {
            if (cacheTimeoutRef.current) {
                clearTimeout(cacheTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!open) return;

        const fetchEmployees = async () => {
            try {
                let data;
                if (isMoldTrial) {
                    const presentDepartmentId = authService.getDepartmentId();
                    data = await employeeService.getEmployeesByDepartment(presentDepartmentId, null);
                } else {
                    data = await employeeService.getAllEmployees();
                }
                setEmployees(data);
            } catch (error) {
                message.error(error?.message || 'Lỗi tải danh sách nhân viên');
            }
        };
        fetchEmployees();
    }, [open, isMoldTrial]);

    useEffect(() => {
        if (!open) return;

        const fetchProductResinMappings = async () => {
            try {
                const data = await ProductResinMappingService.getAllProductResinMapping();
                setProductResinMappings(Array.isArray(data) ? data : data.content || []);
            } catch (error) {}
        };

        const fetchSupplies = async () => {
            try {
                const data = await ProductResinMappingService.getAllSupplies();
                setSuppliesOptions(Array.isArray(data) ? data : data.content || []);
            } catch (error) {}
        };

        fetchProductResinMappings();
        fetchSupplies();
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const loadOptions = async () => {
            try {
                const [dryers, processSteps] = await Promise.all([
                    productPlanService.getAllDistinctDryer(),
                    productPlanService.getAllDistinctProcessStep(),
                ]);
                setDryerOptions(dryers);
                setProcessStepOptions(processSteps);
            } catch (error) {
                message.error(error);
            }
        };
        loadOptions();
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const storageKey = getEventRequirementsStorageKey();
        if (!storageKey) {
            setEventRequirements([]);
            return;
        }

        try {
            const rawData = localStorage.getItem(storageKey);
            const parsed = rawData ? JSON.parse(rawData) : [];
            setEventRequirements(Array.isArray(parsed) ? parsed : []);
        } catch (error) {
            setEventRequirements([]);
        }
    }, [open, getEventRequirementsStorageKey]);

    useEffect(() => {
        if (!open) return;

        const loadMachines = async () => {
            try {
                const data = await machineService.getAllMachines({
                    page: 0,
                    size: 1000,
                    sort: 'id,desc',
                    machineTypeId: 1, //máy ép nhựa
                });
                setMachines(data?.content || []);
            } catch (error) {
                message.error(error);
            }
        };
        loadMachines();
    }, [open]);

    useEffect(() => {
        if (!open) {
            setEmployees([]);
            setDryerOptions([]);
            setProcessStepOptions([]);
            setMachines([]);
            setProductResinMappings([]);
            setErrorMessage(null);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const cacheKey = getCacheKey();

        if (initialValues) {
            const formValues = {
                ...initialValues,
                requestStartTime: convertDateToDayjs(initialValues.requestStartTime),
                requestEndTime: convertDateToDayjs(initialValues.requestEndTime),
                actualStartTime: convertDateToDayjs(initialValues.actualStartTime),
                actualEndTime: convertDateToDayjs(initialValues.actualEndTime),
                expectedFaSubmitDate: convertDateToDayjs(initialValues.expectedFaSubmitDate),
                deliveryDate: convertDateToDayjs(initialValues.deliveryDate),
                requestResinFromPC: initialValues.requestResinFromPC || false,
            };

            if (initialValues.typePlan !== 'SECOND_PROCESS') {
                formValues.plastics = (initialValues.plastics || []).map((plastic) => ({
                    ...plastic,
                    resinCode:
                        plastic.resin?.code ||
                        plastic.ProductResinMapping?.code ||
                        plastic.ProductResinMapping?.resinCode ||
                        plastic.resinCode ||
                        null,
                    plasticExpected: plastic.plasticExpected ?? plastic.plasticExpectedWeight ?? null,
                    description: plastic.description ?? plastic.remark ?? null,
                }));
            }

            if (initialValues.typePlan === 'SECOND_PROCESS') {
                formValues.inserts = (initialValues.inserts || []).map((insert) => ({
                    ...insert,
                    name: insert.name || null,
                    quantityExpected: insert.quantityExpected || null,
                    description: insert.description || null,
                }));
            }

            formValues.supplies = (initialValues.supplies || []).map((supply) => ({
                code: supply.supply?.code || supply.code || null,
                name: supply.supply?.name || supply.name || null,
                supplyExpectedQuantity: supply.supplyExpectedQuantity || null,
                unit: supply.supply?.unit || supply.unit || null,
                remark: supply.remark || null,
            }));

            const cachedData = loadFromCache(cacheKey);
            if (cachedData) {
                Object.assign(formValues, cachedData);
            }

            form.setFieldsValue(formValues);
        } else {
            clearOldCache();
            form.resetFields();
            form.setFieldsValue({
                typePlan: selectedPlanType,
                supplies: [],
            });

            const cachedData = loadFromCache(cacheKey);
            if (cachedData) {
                form.setFieldsValue({ ...cachedData, typePlan: selectedPlanType });
            }
        }
    }, [open, initialValues, selectedPlanType, getCacheKey, convertDateToDayjs, loadFromCache, clearOldCache, form]);

    const handleSave = async () => {
        setErrorMessage(null);
        try {
            setSaving(true);
            const values = await form.validateFields();

            const formatDateTime = (val) =>
                val
                    ? dayjs.isDayjs(val)
                        ? val.format('YYYY-MM-DDTHH:mm:ss')
                        : dayjs(val).format('YYYY-MM-DDTHH:mm:ss')
                    : null;

            const formattedPlastics = !isSecondProcess
                ? (values.plastics || []).map((plastic, index) => ({
                      orderIndex: index + 1,
                      isRecycle: plastic.isRecycle || false,
                      plasticExpectedWeight: plastic.plasticExpected || null,
                      resinCode: plastic.resinCode || null,
                      remark: plastic.description || null,
                  }))
                : [];

            const formattedInserts = isSecondProcess
                ? (values.inserts || []).map((insert, index) => ({
                      orderIndex: index + 1,
                      code: insert.code || null,
                      name: insert.name || null,
                      quantityExpected: insert.quantityExpected || null,
                      supplier: insert.supplier || null,
                  }))
                : [];

            const formattedSupplies = (values.supplies || []).map((supply, index) => ({
                orderIndex: index + 1,
                code: supply.code || null,
                name: supply.name || null,
                supplyExpectedQuantity: supply.supplyExpectedQuantity || null,
                unit: supply.unit || null,
                remark: supply.remark || null,
            }));

            let formattedValues;
            formattedValues = {
                ...values,
                requestStartTime: formatDateTime(values.requestStartTime),
                requestEndTime: formatDateTime(values.requestEndTime),
                actualEndTime: formatDateTime(values.actualEndTime),
                actualStartTime: formatDateTime(values.actualStartTime),
                expectedFaSubmitDate: formatDateTime(values.expectedFaSubmitDate),
                deliveryDate: formatDateTime(values.deliveryDate),
                sampleQuantity: values.sampleQuantity,

                requestResinFromPC: !isSecondProcess
                    ? values.requestResinFromPC === true || values.requestResinFromPC === 'true'
                    : false,
            };

            if (!isSecondProcess) {
                formattedValues.plastics = formattedPlastics;
            }
            if (isSecondProcess) {
                formattedValues.inserts = formattedInserts;
            }

            formattedValues.supplies = formattedSupplies;

            delete formattedValues.resinRequest;
            delete formattedValues.attachments;

            let res;
            if (!initialValues && !productId) {
                throw new Error('Không xác định được sản phẩm. Vui lòng tải lại trang và thử lại.');
            }
            res = initialValues
                ? await productPlanService.updatePlan(initialValues.id, formattedValues)
                : await productPlanService.createPlan(productId, formattedValues, formattedValues.typePlan);

            message.success(res?.message || 'Lưu thành công');

            const currentCacheKey = getCacheKey();
            localStorage.removeItem(currentCacheKey);
            if (cacheTimeoutRef.current) {
                clearTimeout(cacheTimeoutRef.current);
            }

            form.resetFields();
            onCancel();
            onSuccess?.();
            setErrorMessage(null);
        } catch (error) {
            if (error?.errorFields?.length) {
                const firstFieldError = error.errorFields.find((f) => Array.isArray(f.errors) && f.errors.length > 0);
                setErrorMessage(firstFieldError?.errors?.[0] || 'Vui lòng kiểm tra các trường bắt buộc.');
                form.scrollToField(firstFieldError?.name || error.errorFields[0]?.name, {
                    behavior: 'smooth',
                    block: 'center',
                });
                return;
            }
            const errorMsg = error?.message || 'Có lỗi xảy ra.';
            setErrorMessage(errorMsg);
        } finally {
            setSaving(false);
        }
    };
    return (
        <Modal
            open={open}
            onCancel={() => {
                if (cacheTimeoutRef.current) {
                    clearTimeout(cacheTimeoutRef.current);
                }
                onCancel();
            }}
            okText="Lưu"
            cancelText="Hủy"
            title={
                initialValues
                    ? `Chỉnh sửa thông tin ${labels.modalTitle}: ${initialValues.name} cho ${productCode} - Khuôn: ${moldCode}`
                    : `Lập ${labels.modalTitle} cho ${productCode} - Khuôn: ${moldCode}`
            }
            confirmLoading={saving}
            width={1400}
            style={{ top: 20 }}
            onOk={handleSave}
        >
            <Form
                form={form}
                layout="vertical"
                name={isEvent ? 'eventForm' : isMoldTrial ? 'moldTrialPlanForm' : 'secondProcessPlanForm'}
                autoComplete="off"
                onValuesChange={(changedValues, allValues) => {
                    handleCacheForm(changedValues, allValues);
                }}
            >
                {!initialValues && (
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="typePlan"
                                label="Loại kế hoạch"
                                initialValue={selectedPlanType}
                                rules={[{ required: true, message: 'Chọn loại kế hoạch!' }]}
                            >
                                <Radio.Group onChange={(e) => setSelectedPlanType(e.target.value)}>
                                    <Radio value="MOLD_TRIAL">Thử khuôn</Radio>
                                    <Radio value="EVENT">Event</Radio>
                                    <Radio value="SECOND_PROCESS">2nd Process</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                )}
                <Divider orientation="left" style={{ margin: '12px 0' }}>
                    Thông tin cơ bản
                </Divider>
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item
                            name="name"
                            label={`Tên kế hoạch ${getPlanTypeName()}`}
                            rules={[{ required: true, message: `Nhập tên kế hoạch ${getPlanTypeName()}!` }]}
                        >
                            {isEvent ? (
                                <Select
                                    showSearch
                                    allowClear
                                    placeholder="Chọn tên event"
                                    optionFilterProp="label"
                                    onChange={handleEventNameChange}
                                    options={eventRequirements.map((event) => ({
                                        value: event.name,
                                        label: `${event.name}`,
                                    }))}
                                />
                            ) : (
                                <Input placeholder={`Nhập tên kế hoạch ${getPlanTypeName()}`} maxLength={50} />
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="responsibleEmployeeId"
                            label="Nhân viên phụ trách"
                            rules={[{ required: true, message: 'Chọn nhân viên phụ trách!' }]}
                        >
                            <Select
                                showSearch
                                allowClear
                                placeholder="Chọn nhân viên phụ trách"
                                optionFilterProp="label"
                            >
                                {employees.map((emp) => (
                                    <Option
                                        key={emp.id}
                                        value={emp.id}
                                        label={`${emp.code || emp.employeeCode} - ${emp.name || emp.fullName}`}
                                    >
                                        {emp.code || emp.employeeCode} - {emp.name || emp.fullName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="deliveryQuantity"
                            label={labels.deliveryQuantityLabel}
                            rules={[{ required: true, message: 'Nhập số lượng giao hàng!' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={isMoldTrial ? 1 : 0}
                                placeholder="Nhập số lượng giao hàng"
                                addonAfter={labels.quantityUnit}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="sampleQuantity"
                            label={labels.quantityLabel}
                            rules={[{ required: true, message: 'Nhập số lượng!' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={isMoldTrial ? 1 : 0}
                                placeholder="Nhập số lượng"
                                addonAfter={labels.quantityUnit}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="processStep"
                            label="Công đoạn"
                            rules={isMoldTrial ? [{ required: true, message: 'Nhập công đoạn!' }] : []}
                        >
                            <AutoComplete
                                options={processStepOptions.map((step) => ({ value: step }))}
                                placeholder="Nhập công đoạn"
                                filterOption={(inputValue, option) =>
                                    option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                                }
                            />
                        </Form.Item>
                    </Col>
                    {!isSecondProcess && (
                        <>
                            <Col span={6}>
                                <MachineCodeAutoCompleteField form={form} machines={machines} required={false} />
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name="costFactory"
                                    label="Tính phí cho"
                                    rules={[{ required: true, message: 'Chọn nhà máy!' }]}
                                >
                                    <Select placeholder="Chọn nhà máy">
                                        <Option value="Nhà máy khuôn Hòa Lạc">Nhà máy khuôn Hòa Lạc</Option>
                                        <Option value="Công ty TNHH HTMP Việt Nam">Công ty TNHH HTMP Việt Nam</Option>
                                        <Option value="Công ty Cổ phần HTMP Việt Nam">
                                            Công ty Cổ phần HTMP Việt Nam
                                        </Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name="numberOfPeople" label="Số người sản xuất lấy hàng">
                                    <InputNumber
                                        placeholder="Nhập số người"
                                        style={{ width: '100%' }}
                                        min={0}
                                        step={0.5}
                                        addonAfter="Người"
                                    />
                                </Form.Item>
                            </Col>
                        </>
                    )}
                    {isSecondProcess && (
                        <>
                            <Col span={6}>
                                <Form.Item name="tryNo" label="Số lần thử">
                                    <Input placeholder="VD: T1, T2, T3..." maxLength={10} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name="numberOfPeople" label="Số công nhân">
                                    <InputNumber
                                        placeholder="Nhập số công nhân"
                                        style={{ width: '100%' }}
                                        min={0}
                                        step={0.5}
                                        addonAfter="Người"
                                    />
                                </Form.Item>
                            </Col>
                        </>
                    )}
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="purpose" label={labels.purposeLabel}>
                            <TextArea placeholder={labels.purposePlaceholder} rows={3} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="remark" label="Ghi chú">
                            <TextArea rows={3} placeholder="Ghi chú bổ sung (nếu có)..." />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left" style={{ margin: '12px 0' }}>
                    Thời gian {getPlanTypeAction()}
                </Divider>
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item
                            name="requestStartTime"
                            label={labels.startTimeLabel}
                            showTime={{
                                format: 'HH:mm',
                                defaultValue: dayjs('08:00', 'HH:mm'),
                            }}
                            format="DD/MM/YYYY HH:mm"
                            rules={[
                                {
                                    required: true,
                                    message: `Vui lòng nhập ${(labels.startTimeLabel || 'thời gian bắt đầu').toLowerCase()}`,
                                },
                            ]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                showTime={{
                                    format: 'HH:mm',
                                    defaultValue: dayjs('08:00', 'HH:mm'),
                                }}
                                format="DD/MM/YYYY HH:mm"
                                disabledDate={(current) => current && current.isBefore(dayjs().startOf('day'))}
                                onChange={() => {
                                    form.validateFields(['requestEndTime']);
                                }}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            name="requestEndTime"
                            label={labels.endTimeLabel}
                            dependencies={['requestStartTime']}
                            rules={[
                                {
                                    required: true,
                                    message: `Vui lòng nhập ${(labels.endTimeLabel || 'thời gian kết thúc').toLowerCase()}`,
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const startTime = getFieldValue('requestStartTime');
                                        if (!value || !startTime) {
                                            return Promise.resolve();
                                        }

                                        const start = dayjs.isDayjs(startTime) ? startTime : dayjs(startTime);
                                        const end = dayjs.isDayjs(value) ? value : dayjs(value);

                                        if (end.isBefore(start) || end.isSame(start)) {
                                            return Promise.reject(
                                                new Error(`Thời gian kết thúc phải sau thời gian bắt đầu`),
                                            );
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                showTime={{
                                    format: 'HH:mm',
                                    defaultValue: dayjs('08:00', 'HH:mm'),
                                }}
                                format={'DD/MM/YYYY HH:mm'}
                                disabledDate={(current) => {
                                    const startTime = form.getFieldValue('requestStartTime');
                                    if (!startTime) return false;

                                    const start = dayjs.isDayjs(startTime) ? startTime : dayjs(startTime);
                                    return current && current.isBefore(start.startOf('day'));
                                }}
                                disabledTime={(current) => {
                                    const startTime = form.getFieldValue('requestStartTime');
                                    if (!startTime || !current) return {};

                                    const start = dayjs.isDayjs(startTime) ? startTime : dayjs(startTime);

                                    if (current.isSame(start, 'day')) {
                                        const startHour = start.hour();
                                        const startMinute = start.minute();

                                        return {
                                            disabledHours: () => {
                                                const hours = [];
                                                for (let i = 0; i < startHour; i++) {
                                                    hours.push(i);
                                                }
                                                return hours;
                                            },
                                            disabledMinutes: (selectedHour) => {
                                                if (selectedHour === startHour) {
                                                    const minutes = [];
                                                    for (let i = 0; i <= startMinute; i++) {
                                                        minutes.push(i);
                                                    }
                                                    return minutes;
                                                }
                                                return [];
                                            },
                                        };
                                    }

                                    return {};
                                }}
                            />
                        </Form.Item>
                    </Col>
                    {isEvent && (
                        <Col span={6}>
                            <Form.Item
                                name="deliveryDate"
                                label={labels.deliveryDateLabel}
                                showTime={{
                                    format: 'HH:mm',
                                    defaultValue: dayjs('08:00', 'HH:mm'),
                                }}
                                format="DD/MM/YYYY HH:mm"
                                rules={[
                                    {
                                        required: true,
                                        message: `Vui lòng nhập ${(labels.deliveryDateLabel || 'ngày giao hàng').toLowerCase()}`,
                                    },
                                ]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    showTime={{
                                        format: 'HH:mm',
                                        defaultValue: dayjs('08:00', 'HH:mm'),
                                    }}
                                    format="DD/MM/YYYY HH:mm"
                                    onChange={() => {
                                        form.validateFields(['deliveryDate']);
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    )}
                    <Col span={6}>
                        <Form.Item name="expectedFaSubmitDate" label="Ngày yêu cầu gửi mẫu">
                            <DatePicker
                                style={{ width: '100%' }}
                                showTime={
                                    isMoldTrial
                                        ? {
                                              format: 'HH:mm',
                                              defaultValue: dayjs('08:00', 'HH:mm'),
                                          }
                                        : false
                                }
                                format={isMoldTrial ? 'DD/MM/YYYY HH:mm' : 'DD/MM/YYYY'}
                                disabledDate={(current) => {
                                    const startTime = form.getFieldValue('requestStartTime');
                                    if (!startTime) return false;

                                    const start = dayjs.isDayjs(startTime) ? startTime : dayjs(startTime);
                                    return current && current.isBefore(start.startOf('day'));
                                }}
                                disabledTime={(current) => {
                                    const startTime = form.getFieldValue('requestStartTime');
                                    if (!startTime || !current) return {};

                                    const start = dayjs.isDayjs(startTime) ? startTime : dayjs(startTime);

                                    if (current.isSame(start, 'day')) {
                                        const startHour = start.hour();
                                        const startMinute = start.minute();

                                        return {
                                            disabledHours: () => {
                                                const hours = [];
                                                for (let i = 0; i < startHour; i++) {
                                                    hours.push(i);
                                                }
                                                return hours;
                                            },
                                            disabledMinutes: (selectedHour) => {
                                                if (selectedHour === startHour) {
                                                    const minutes = [];
                                                    for (let i = 0; i <= startMinute; i++) {
                                                        minutes.push(i);
                                                    }
                                                    return minutes;
                                                }
                                                return [];
                                            },
                                        };
                                    }

                                    return {};
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {!isSecondProcess && (
                    <Card
                        title="Thông tin nhựa sử dụng"
                        style={{ marginTop: 16, marginBottom: 16 }}
                        headStyle={{ backgroundColor: '#f0f2f5', fontWeight: 'bold' }}
                    >
                        {(!initialValues || !initialValues.requestResinFromPC) && (
                            <Row gutter={16} style={{ marginBottom: 16 }}>
                                <Col span={24}>
                                    <Form.Item
                                        name="requestResinFromPC"
                                        label="Yêu cầu vật tư từ Phòng Quản lý sản xuất (PC)"
                                        initialValue={false}
                                    >
                                        <Radio.Group>
                                            <Radio value={false}>Không yêu cầu</Radio>
                                            <Radio value={true}>Yêu cầu vật tư từ PC</Radio>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>
                            </Row>
                        )}

                        <div>
                            <Button
                                type="dashed"
                                size="small"
                                onClick={() => {
                                    const plastics = form.getFieldValue('plastics') || [];
                                    form.setFieldsValue({
                                        plastics: [
                                            ...plastics,
                                            { isRecycle: false, plasticExpected: null, resinCode: null },
                                        ],
                                    });
                                }}
                                icon={<PlusOutlined />}
                                style={{ marginBottom: 12 }}
                            >
                                Thêm nhựa
                            </Button>
                        </div>
                        <Form.List name="plastics">
                            {(fields, { remove }) => (
                                <>
                                    {fields.length === 0 ? (
                                        <div
                                            style={{
                                                textAlign: 'center',
                                                padding: '20px',
                                                color: '#999',
                                                background: '#fafafa',
                                                borderRadius: '4px',
                                            }}
                                        >
                                            Chưa có thông tin nhựa. Nhấn "Thêm nhựa" để bắt đầu.
                                        </div>
                                    ) : (
                                        <Table
                                            dataSource={fields}
                                            pagination={false}
                                            rowKey="key"
                                            size="small"
                                            columns={[
                                                {
                                                    title: 'STT',
                                                    width: 60,
                                                    render: (_, field) => (
                                                        <Form.Item
                                                            noStyle
                                                            shouldUpdate={(prevValues, currentValues) => {
                                                                const prevPlastics = prevValues.plastics || [];
                                                                const currPlastics = currentValues.plastics || [];

                                                                return (
                                                                    prevPlastics.some(
                                                                        (p, idx) =>
                                                                            p?.isRecycle !==
                                                                            currPlastics[idx]?.isRecycle,
                                                                    ) || prevPlastics.length !== currPlastics.length
                                                                );
                                                            }}
                                                        >
                                                            {() => {
                                                                const plastics = form.getFieldValue('plastics') || [];
                                                                const currentPlastic = plastics[field.name];
                                                                const isRecycle = currentPlastic?.isRecycle || false;

                                                                const sttByType = plastics
                                                                    .slice(0, field.name + 1)
                                                                    .filter(
                                                                        (p) => (p?.isRecycle || false) === isRecycle,
                                                                    ).length;

                                                                return sttByType;
                                                            }}
                                                        </Form.Item>
                                                    ),
                                                },
                                                {
                                                    title: 'Mã nhựa HTMP',
                                                    dataIndex: 'resinCode',
                                                    width: 250,
                                                    render: (_, field) => (
                                                        <Form.Item
                                                            name={[field.name, 'resinCode']}
                                                            noStyle
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: 'Chọn mã nhựa!',
                                                                },
                                                            ]}
                                                        >
                                                            <ResinSelect
                                                                placeholder="Chọn mã nhựa HTMP"
                                                                style={{ width: '100%' }}
                                                                options={ProductResinMappings}
                                                            />
                                                        </Form.Item>
                                                    ),
                                                },

                                                {
                                                    title: 'Loại nhựa',
                                                    dataIndex: 'isRecycle',
                                                    width: 150,
                                                    render: (_, field) => (
                                                        <Form.Item
                                                            name={[field.name, 'isRecycle']}
                                                            noStyle
                                                            initialValue={false}
                                                        >
                                                            <Select style={{ width: '100%' }}>
                                                                <Select.Option value={false}>Nguyên chất</Select.Option>
                                                                <Select.Option value={true}>Tái sinh</Select.Option>
                                                            </Select>
                                                        </Form.Item>
                                                    ),
                                                },
                                                {
                                                    title: 'Khối lượng yêu cầu (Kg)',
                                                    dataIndex: 'plasticExpected',
                                                    render: (_, field) => (
                                                        <Form.Item
                                                            name={[field.name, 'plasticExpected']}
                                                            noStyle
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: 'Nhập khối lượng!',
                                                                },
                                                            ]}
                                                        >
                                                            <InputNumber
                                                                placeholder="Nhập khối lượng"
                                                                style={{ width: '100%' }}
                                                                min={0}
                                                                step={0.1}
                                                                addonAfter="Kg"
                                                            />
                                                        </Form.Item>
                                                    ),
                                                },
                                                {
                                                    title: 'Ghi chú',
                                                    dataIndex: 'description',
                                                    width: 200,
                                                    render: (_, field) => (
                                                        <Form.Item name={[field.name, 'description']} noStyle>
                                                            <Input.TextArea
                                                                placeholder="Ghi chú cho loại nhựa này..."
                                                                autoSize={{ minRows: 1, maxRows: 3 }}
                                                            />
                                                        </Form.Item>
                                                    ),
                                                },
                                                {
                                                    title: 'Thao tác',
                                                    width: 80,
                                                    fixed: 'right',
                                                    render: (_, field) => (
                                                        <Popconfirm
                                                            title="Xóa dòng nhựa này?"
                                                            onConfirm={() => remove(field.name)}
                                                            okText="Xóa"
                                                            cancelText="Hủy"
                                                        >
                                                            <Button type="link" danger icon={<DeleteOutlined />} />
                                                        </Popconfirm>
                                                    ),
                                                },
                                            ]}
                                        />
                                    )}
                                </>
                            )}
                        </Form.List>
                    </Card>
                )}

                <Card
                    title="Thông tin vật tư sử dụng"
                    style={{ marginTop: 16, marginBottom: 16 }}
                    headStyle={{ backgroundColor: '#f0f2f5', fontWeight: 'bold' }}
                >
                    <div>
                        <Button
                            type="dashed"
                            size="small"
                            onClick={() => {
                                const supplies = form.getFieldValue('supplies') || [];
                                form.setFieldsValue({
                                    supplies: [
                                        ...supplies,
                                        {
                                            code: null,
                                            name: null,
                                            supplyExpectedQuantity: null,
                                            unit: null,
                                            remark: null,
                                        },
                                    ],
                                });
                            }}
                            icon={<PlusOutlined />}
                            style={{ marginBottom: 12 }}
                        >
                            Thêm vật tư
                        </Button>
                    </div>
                    <Form.List name="supplies">
                        {(fields, { remove }) => (
                            <>
                                {fields.length === 0 ? (
                                    <div
                                        style={{
                                            textAlign: 'center',
                                            padding: '20px',
                                            color: '#999',
                                            background: '#fafafa',
                                            borderRadius: '4px',
                                        }}
                                    >
                                        Chưa có thông tin vật tư. Nhấn "Thêm vật tư" để bắt đầu.
                                    </div>
                                ) : (
                                    <Table
                                        dataSource={fields}
                                        pagination={false}
                                        rowKey="key"
                                        size="small"
                                        columns={[
                                            {
                                                title: 'STT',
                                                width: 60,
                                                render: (_, __, index) => index + 1,
                                            },
                                            {
                                                title: 'Vật tư',
                                                dataIndex: 'code',
                                                width: 360,
                                                render: (_, field) => (
                                                    <Form.Item
                                                        name={[field.name, 'code']}
                                                        noStyle
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Chọn mã vật tư!',
                                                            },
                                                        ]}
                                                    >
                                                        <Select
                                                            showSearch
                                                            placeholder="Chọn mã vật tư"
                                                            style={{ width: '100%' }}
                                                            options={suppliesOptions.map((s) => ({
                                                                label: `[${s.code}] - ${s.name}`,
                                                                value: s.code,
                                                                unit: s.unit,
                                                                name: s.name,
                                                            }))}
                                                            filterOption={(input, option) =>
                                                                option.label.toLowerCase().includes(input.toLowerCase())
                                                            }
                                                            onChange={(value, option) => {
                                                                const currentSupplies =
                                                                    form.getFieldValue('supplies') || [];
                                                                const selectedSupply = suppliesOptions.find(
                                                                    (s) => s.code === value,
                                                                );
                                                                form.setFieldsValue({
                                                                    supplies: currentSupplies.map((item, idx) =>
                                                                        idx === field.name
                                                                            ? {
                                                                                  ...item,
                                                                                  code: value,
                                                                                  name:
                                                                                      selectedSupply?.name ||
                                                                                      option?.name ||
                                                                                      item?.name,
                                                                                  unit:
                                                                                      selectedSupply?.unit ||
                                                                                      option?.unit ||
                                                                                      item?.unit,
                                                                              }
                                                                            : item,
                                                                    ),
                                                                });
                                                            }}
                                                        />
                                                    </Form.Item>
                                                ),
                                            },
                                            {
                                                title: 'Số lượng yêu cầu',
                                                dataIndex: 'supplyExpectedQuantity',
                                                width: 180,
                                                render: (_, field) => (
                                                    <Form.Item
                                                        noStyle
                                                        shouldUpdate={(prevValues, currentValues) => {
                                                            return (
                                                                prevValues.supplies?.[field.name]?.unit !==
                                                                currentValues.supplies?.[field.name]?.unit
                                                            );
                                                        }}
                                                    >
                                                        {() => {
                                                            const unit = form.getFieldValue([
                                                                'supplies',
                                                                field.name,
                                                                'unit',
                                                            ]);
                                                            return (
                                                                <Form.Item
                                                                    name={[field.name, 'supplyExpectedQuantity']}
                                                                    noStyle
                                                                    rules={[
                                                                        {
                                                                            required: true,
                                                                            message: 'Nhập số lượng!',
                                                                        },
                                                                    ]}
                                                                >
                                                                    <InputNumber
                                                                        placeholder="Nhập số lượng"
                                                                        style={{ width: '100%' }}
                                                                        min={0}
                                                                        addonAfter={unit || ''}
                                                                    />
                                                                </Form.Item>
                                                            );
                                                        }}
                                                    </Form.Item>
                                                ),
                                            },
                                            {
                                                title: 'Ghi chú',
                                                dataIndex: 'remark',
                                                width: 200,
                                                render: (_, field) => (
                                                    <Form.Item name={[field.name, 'remark']} noStyle>
                                                        <Input.TextArea
                                                            placeholder="Nhập ghi chú..."
                                                            autoSize={{ minRows: 1, maxRows: 3 }}
                                                        />
                                                    </Form.Item>
                                                ),
                                            },
                                            {
                                                title: 'Thao tác',
                                                width: 80,
                                                fixed: 'right',
                                                render: (_, field) => (
                                                    <Popconfirm
                                                        title="Xóa vật tư này?"
                                                        onConfirm={() => remove(field.name)}
                                                        okText="Xóa"
                                                        cancelText="Hủy"
                                                    >
                                                        <Button type="link" danger icon={<DeleteOutlined />} />
                                                    </Popconfirm>
                                                ),
                                            },
                                        ]}
                                    />
                                )}
                            </>
                        )}
                    </Form.List>
                </Card>

                <Divider orientation="left" plain style={{ margin: '12px 0', fontSize: '13px' }}>
                    Thông số sấy & nhiệt độ
                </Divider>
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item name="dryer" label="Loại sấy">
                            <AutoComplete
                                options={dryerOptions.map((dryer) => ({ value: dryer }))}
                                placeholder="Sấy nhiệt độ cao..."
                                filterOption={(inputValue, option) =>
                                    option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="dryingTemperature" label="Nhiệt độ sấy">
                            <Input placeholder="80" style={{ width: '100%' }} addonAfter="°C" />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="dryingTime" label="Thời gian sấy">
                            <Input placeholder="4" style={{ width: '100%' }} addonAfter="Giờ" />
                        </Form.Item>{' '}
                    </Col>
                    <Col span={6}>
                        <Form.Item name="screwTemperature" label="Nhiệt độ trục vít">
                            <Input placeholder="200" style={{ width: '100%' }} addonAfter="°C" />
                        </Form.Item>
                    </Col>
                </Row>

                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 font-medium text-sm">{errorMessage}</p>
                    </div>
                )}
            </Form>
        </Modal>
    );
};

export default ProductPlanModal;
