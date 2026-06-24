import { DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    message,
    Popconfirm,
    Radio,
    Row,
    Select,
    Space,
    Table,
    Upload,
} from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '~/modules/auth/services/authService';
import ResinSelect from '../components/ResinSelect';
import moldService from '../services/moldService';
import ProductResinMappingService from '../services/productResinMappingService';
import productService from '../services/productService';

const FIELD_PERMISSIONS = {
    'product.code': ['SUPERADMIN', 'KD'],
    'product.name': ['SUPERADMIN', 'KD'],
    'product.lifecycleYear': ['SUPERADMIN', 'KD'],
    'product.monthlyOutput': ['SUPERADMIN', 'KD'],
    'product.moq': ['SUPERADMIN', 'KD'],
    'product.mdq': ['SUPERADMIN', 'KD'],
    'product.productCategory': ['SUPERADMIN', 'KD'],
    'product.infoReceivedDate': ['SUPERADMIN', 'KD'],
    'product.mpTargetDate': ['SUPERADMIN', 'KD'],
    'product.marketType': ['SUPERADMIN', 'KD'],
    'product.moldCode': ['SUPERADMIN', 'P-NMD', 'KD'],
    'product.resinIds': ['SUPERADMIN', 'KD'],
    'product.attachments': ['SUPERADMIN', 'KD'],
    'product.remark': ['SUPERADMIN', 'KD'],
    'product.events': ['SUPERADMIN', 'KD'],

    'materials.manage': ['SUPERADMIN', 'KD'],

    'inserts.manage': ['SUPERADMIN', 'KD'],

    'machine.gateType': ['SUPERADMIN', 'KD'],
    'machine.cavity': ['SUPERADMIN', 'KD'],
    'machine.cycleTimeQuotation': ['SUPERADMIN', 'KD'],
    'machine.cycleTimeTarget': ['SUPERADMIN', 'KD'],
    'machine.cycleTimeActual': ['SUPERADMIN', 'P-NMD'],
    'machine.capacityQuotation': ['SUPERADMIN', 'KD'],
    'machine.capacityTarget': ['SUPERADMIN', 'KD'],
    'machine.capacityActual': ['SUPERADMIN', 'P-NMD'],
    'machine.weightsQuotation': ['SUPERADMIN', 'KD'],
    'machine.weightActual': ['SUPERADMIN', 'P-NMD'],
    'machine.remark': ['SUPERADMIN', 'KD'],

    'depreciation.manage': ['SUPERADMIN', 'KD'],

    'packing.manage': ['SUPERADMIN', 'KD'],
    'packing.quantities': ['SUPERADMIN', 'KD'],
    'packing.investment': ['SUPERADMIN', 'KD'],
};

const sectionStyle = {
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    marginBottom: 24,
};

const buildEventName = (index) => `EVENT ${index + 1}`;

const normalizeEventRequirements = (events = []) =>
    events.map((event, index) => ({
        ...(event || {}),
        name: buildEventName(index),
    }));

const requiredRule = (label, isDisabled, alwaysRequired = false) => {
    if (isDisabled) return [];
    return alwaysRequired ? [{ required: true, message: `Vui lòng nhập ${label}` }] : [];
};

const NMD_EDITABLE_FIELDS_WHEN_KD_CREATED = new Set([
    'product.moldCode',
    'machine.capacityActual',
    'machine.cycleTimeActual',
    'machine.weightActual',
]);

const ProductFormPage = ({ mode }) => {
    const [form] = Form.useForm();
    const { id: modelId, productId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fileChanged, setFileChanged] = useState(false);
    const [deletedOldAttachments, setDeletedOldAttachments] = useState([]);
    const [creatorInfo, setCreatorInfo] = useState(null);

    const isEdit = mode === 'edit';

    const hasFieldPermission = (fieldKey) => {
        const allowedRoles = FIELD_PERMISSIONS[fieldKey] || [];
        const userRole = authService.getRole();
        const departmentCode = authService.getDepartmentCode();

        return userRole === 'SUPERADMIN' || allowedRoles.includes(departmentCode);
    };

    const isNmdUser = authService.hasDepartmentCode('P-NMD') || authService.hasDepartmentCode('NMD');

    const normalizedCreatorDepartmentCode = (creatorInfo?.departmentCode || '').toUpperCase();
    const isProductCreatedByKD = normalizedCreatorDepartmentCode === 'P-KD' || normalizedCreatorDepartmentCode === 'KD';
    const isProductCreatedByNMD =
        normalizedCreatorDepartmentCode === 'P-NMD' || normalizedCreatorDepartmentCode === 'NMD';
    const isCreatedByCurrentNmdUser =
        isNmdUser && !!creatorInfo?.employeeCode && creatorInfo.employeeCode === authService.getEmployeeCode();

    const isFieldDisabled = (fieldKey) => {
        if (authService.hasRole('SUPERADMIN')) {
            return false;
        }

        if (isNmdUser) {
            if (!isEdit) {
                return false;
            }

            if (isProductCreatedByNMD) {
                return false;
            }

            if (isCreatedByCurrentNmdUser) {
                return false;
            }

            if (isProductCreatedByKD) {
                return !NMD_EDITABLE_FIELDS_WHEN_KD_CREATED.has(fieldKey);
            }
        }

        return !hasFieldPermission(fieldKey);
    };

    const canEditMaterialRow = () => {
        return !isFieldDisabled('materials.manage');
    };

    const pcsPerCover = Form.useWatch(['productPacking', 'pcsPerCover'], form) || 0;
    const coverPerBox = Form.useWatch(['productPacking', 'coverPerBox'], form) || 0;
    const totalPerBox = pcsPerCover * coverPerBox;

    const cacheKey = isEdit ? `product_form_edit_${productId}` : `product_form_create_${modelId}`;

    const [molds, setMolds] = useState([]);
    const [ProductResinMappings, setProductResinMappings] = useState([]);
    const [loadingResins, setLoadingResins] = useState(false);
    const [productCategoryOptions, setProductCategoryOptions] = useState([]);

    const fallbackCategoryOptions = [
        { label: 'Thành phẩm', value: 'FINISHED' },
        { label: 'Đúc', value: 'INJECTION' },
        { label: 'Bán thành phẩm - In', value: 'SECOND_PROCESS_PRINT' },
        { label: 'Bán thành phẩm - Sơn', value: 'SECOND_PROCESS_PAINT' },
        { label: 'Bán thành phẩm - Hot', value: 'SECOND_PROCESS_HOT_STAMPING' },
        { label: 'Lắp ráp', value: 'ASSEMBLY' },
        { label: 'Bán thành phẩm - Laser', value: 'SECOND_PROCESS_LASER' },
    ];

    const fetchMolds = useCallback(async () => {
        try {
            const data = await moldService.getAllMolds('');
            setMolds(data);
        } catch (err) {}
    }, []);

    const fetchProductResinMappings = useCallback(async () => {
        setLoadingResins(true);
        try {
            const data = await ProductResinMappingService.getAllProductResinMapping({ keyword: '' });

            setProductResinMappings(Array.isArray(data) ? data : data.content || []);
        } catch (err) {
        } finally {
            setLoadingResins(false);
        }
    }, []);

    const fetchProductCategories = useCallback(async () => {
        try {
            const categories = await productService.getProductCategories();
            const options = (Array.isArray(categories) ? categories : []).map((category) => ({
                value: category.code,
                label: (
                    <span className="inline-flex items-center gap-2">
                        <span
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                backgroundColor: category.color || '#d9d9d9',
                                display: 'inline-block',
                            }}
                        />
                        <span>{category.name || category.code}</span>
                    </span>
                ),
            }));
            setProductCategoryOptions(options);
        } catch (err) {
            setProductCategoryOptions(fallbackCategoryOptions);
        }
    }, []);

    useEffect(() => {
        fetchMolds();
        fetchProductResinMappings();
        fetchProductCategories();
    }, [fetchMolds, fetchProductResinMappings, fetchProductCategories]);

    useEffect(() => {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);

                if (parsed.infoReceivedDate) {
                    parsed.infoReceivedDate = dayjs(parsed.infoReceivedDate);
                }
                if (parsed.mpTargetDate) {
                    parsed.mpTargetDate = dayjs(parsed.mpTargetDate);
                }
                if (Array.isArray(parsed.productEventRequirements)) {
                    parsed.productEventRequirements = normalizeEventRequirements(parsed.productEventRequirements).map(
                        (event) => ({
                            ...event,
                            deliveryDate: event.deliveryDate ? dayjs(event.deliveryDate) : null,
                        }),
                    );
                }

                form.setFieldsValue(parsed);
            } catch (e) {}
        }
    }, [cacheKey, form]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await productService.getProductById(productId, true);

            let attachments = [];
            if (Array.isArray(data.files) && data.files.length > 0) {
                attachments = data.files.map((file, index) => ({
                    uid: String(file.id || `existing-${index}`),
                    name: file.remark || file.fileName || file.filePath?.split('/').pop() || `file-${index + 1}`,
                    status: 'done',
                    url: file.filePath,
                    existingFile: true,
                    originalRemark: file.remark || file.fileName || file.filePath?.split('/').pop(),
                }));
            } else if (Array.isArray(data.fileUrls) && data.fileUrls.length > 0) {
                attachments = data.fileUrls.map((url, index) => ({
                    uid: `existing-url-${index}`,
                    name: url?.split('/').pop() || `file-${index + 1}`,
                    status: 'done',
                    url,
                    existingFile: true,
                    originalRemark: url?.split('/').pop(),
                }));
            } else if (data.fileUrl) {
                const fileName = data.fileUrl.split('/').pop();
                attachments = [
                    {
                        uid: 'existing-single',
                        name: fileName || 'file đính kèm',
                        status: 'done',
                        url: data.fileUrl,
                        existingFile: true,
                        originalRemark: fileName,
                    },
                ];
            }

            const mapped = {
                code: data.code,
                name: data.name,
                moldCode: data.moldCode,
                lifecycleYear: data.lifecycleYear,
                monthlyOutput: data.monthlyOutput,
                moq: data.moq,
                mdq: data.mdq,
                productCategory: data.productCategory,
                marketType: data.marketType,
                infoReceivedDate: data.infoReceivedDate ? dayjs(data.infoReceivedDate) : null,
                mpTargetDate: data.mpTargetDate ? dayjs(data.mpTargetDate) : null,
                productRemark: data.remark,

                resinCodes: data.ProductResinMappings
                    ? data.ProductResinMappings.map((r) => r.resinCode || r.code)
                    : [],

                productMachine: data.productMachine || {},
                productPacking: data.productPacking || {},
                productMoldDepreciation: data.productMoldDepreciation || {},

                productMaterials: data.productMaterials || [],
                productInserts: data.productInserts || [],
                productEventRequirements: normalizeEventRequirements(data.productEventRequirements || []).map(
                    (event) => ({
                        ...event,
                        deliveryDate: event.deliveryDate ? dayjs(event.deliveryDate) : null,
                    }),
                ),

                attachments,
            };

            setCreatorInfo({
                employeeCode: data.createdByCode || data.createdBy || '',
                employeeName: data.createdByName || '',
                departmentCode: data.createdByDepartmentCode || '',
                departmentName: data.createdByDepartmentName || '',
            });

            const pm = mapped.productMachine;
            mapped.productMachine = {
                ...pm,
                totalWeightG: calculateTotalWeight(pm?.productWeightG, pm?.runnerWeightG, pm?.cavity),
            };

            form.setFieldsValue(mapped);
            setDeletedOldAttachments([]);
            setFileChanged(false);
        } catch (error) {
            message.error(error?.message || String(error));
        } finally {
            setLoading(false);
        }
    }, [productId, form]);

    useEffect(() => {
        if (isEdit) fetchData();
    }, [fetchData, isEdit]);

    const handleCacheForm = (_, allValues) => {
        const payload = {
            ...allValues,
            infoReceivedDate: allValues.infoReceivedDate?.format('YYYY-MM-DD'),
            mpTargetDate: allValues.mpTargetDate?.format('YYYY-MM-DD'),
            productEventRequirements: normalizeEventRequirements(allValues.productEventRequirements || []).map(
                (event) => ({
                    ...event,
                    deliveryDate: event.deliveryDate?.format('YYYY-MM-DD'),
                }),
            ),
        };

        localStorage.setItem(cacheKey, JSON.stringify(payload));
    };

    const handleFileChange = ({ fileList }) => {
        form.setFieldsValue({ attachments: fileList });
        setFileChanged(true);
    };

    const handleAttachmentRemove = (file) => {
        if (file?.existingFile) {
            const removedRemark = file.originalRemark || file.name;
            setDeletedOldAttachments((prev) => {
                if (prev.includes(removedRemark)) {
                    return prev;
                }
                return [...prev, removedRemark];
            });
        }
        setFileChanged(true);
        return true;
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            const productPacking = { ...values.productPacking };
            delete productPacking.totalPerBox;

            const moldCodeValue = values.moldCode || '';

            const rawInserts = values.productInserts || [];
            const productInserts = rawInserts
                .map((insert) => ({
                    ...insert,
                    type: insert?.type || 'INSERT',
                    unit: insert?.unit || 'PCS',
                }))
                .filter((insert) => {
                    return (
                        (insert.code && insert.code.trim() !== '') ||
                        (insert.name && insert.name.trim() !== '') ||
                        (insert.quantityExpected !== undefined && insert.quantityExpected !== null) ||
                        (insert.supplier && insert.supplier.trim() !== '')
                    );
                });

            const rawMaterials = values.productMaterials || [];
            const productMaterials = rawMaterials
                .map((m) => m || {})
                .filter((m) => {
                    const keys = Object.keys(m).filter((k) => k !== 'isQuotation');
                    return keys.some((k) => {
                        const v = m[k];
                        if (v === undefined || v === null) return false;
                        if (typeof v === 'string') return v.trim() !== '';
                        return true;
                    });
                });

            const rawEventRequirements = values.productEventRequirements || [];
            const productEventRequirements = normalizeEventRequirements(rawEventRequirements)
                .map((event) => ({
                    ...event,
                    deliveryDate: event.deliveryDate?.format('YYYY-MM-DD'),
                }))
                .filter((event) => !!event.deliveryDate || (event.quantity !== undefined && event.quantity !== null));

            const payload = {
                code: values.code,
                name: values.name,
                moldCode: moldCodeValue,
                lifecycleYear: values.lifecycleYear,
                monthlyOutput: values.monthlyOutput,
                moq: values.moq,
                mdq: values.mdq,
                productCategory: values.productCategory,
                marketType: values.marketType,
                productRemark: values.productRemark,
                infoReceivedDate: values.infoReceivedDate?.format('YYYY-MM-DD'),
                mpTargetDate: values.mpTargetDate?.format('YYYY-MM-DD'),

                resinCodes: values.resinCodes || [],

                productMaterials,
                productInserts,
                productEventRequirements,
                productMachine: values.productMachine,
                productPacking,
                productMoldDepreciation: values.productMoldDepreciation,

                fileChanged,
            };

            const attachmentList = values.attachments || [];
            const uploadFiles = attachmentList
                .filter((file) => !file.existingFile)
                .map((file) => file.originFileObj || file)
                .filter((file) => file instanceof Blob);

            const keptOldFiles = attachmentList
                .filter((file) => file.existingFile)
                .map((file) => file.originalRemark || file.name);

            if (isEdit) {
                await productService.updateProduct(
                    {
                        data: payload,
                        uploadFiles,
                        keptOldFiles,
                        deletedOldFiles: deletedOldAttachments,
                    },
                    productId,
                );
                message.success('Cập nhật sản phẩm thành công');
                localStorage.removeItem(cacheKey);
            } else {
                await productService.createProduct({
                    modelId,
                    data: payload,
                    uploadFiles,
                    keptOldFiles,
                    deletedOldFiles: deletedOldAttachments,
                });
                message.success('Tạo sản phẩm mới thành công');
                localStorage.removeItem(cacheKey);
            }

            navigate(-1);
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalWeight = (productWeight, runnerWeight, cavity) => {
        if (!cavity || cavity === 0) return productWeight || 0;
        return (productWeight || 0) + (runnerWeight || 0) / cavity;
    };

    return (
        <Form
            layout="vertical"
            form={form}
            onFinish={handleSubmit}
            autoComplete="off"
            onValuesChange={(changedValues, allValues) => {
                handleCacheForm(changedValues, allValues);

                const { productWeightG, runnerWeightG, cavity } = allValues.productMachine || {};
                const total = calculateTotalWeight(productWeightG, runnerWeightG, cavity);

                form.setFieldsValue({
                    productMachine: {
                        ...allValues.productMachine,
                        totalWeightG: total,
                    },
                });
            }}
        >
            <Card style={sectionStyle} bodyStyle={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <div>
                        <h3 className="font-bold text-2xl" style={{ margin: 0 }}>
                            {isEdit ? 'Chỉnh sửa sản phẩm' : 'Tạo mới sản phẩm'}
                        </h3>
                        {isEdit && creatorInfo?.employeeCode && (
                            <div style={{ marginTop: 6, color: '#555', fontSize: 13 }}>
                                Người tạo: {creatorInfo.employeeCode}
                                {creatorInfo.employeeName ? ` - ${creatorInfo.employeeName}` : ''}
                                {creatorInfo.departmentName ? ` (${creatorInfo.departmentName})` : ''}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Space>
                            <Button onClick={() => navigate(-1)}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {isEdit ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                        </Space>
                    </div>
                </div>
            </Card>

            <Card title="Thông tin sản phẩm" style={sectionStyle} loading={loading}>
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item
                            name="code"
                            label="Mã sản phẩm"
                            rules={requiredRule('mã sản phẩm', isFieldDisabled('product.code'), true)}
                        >
                            <Input disabled={isFieldDisabled('product.code')} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="name"
                            label="Tên sản phẩm"
                            rules={requiredRule('tên sản phẩm', isFieldDisabled('product.name'), true)}
                        >
                            <Input disabled={isFieldDisabled('product.name')} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="lifecycleYear" label="Số năm vòng đời">
                            <InputNumber
                                min={1}
                                style={{ width: '100%' }}
                                disabled={isFieldDisabled('product.lifecycleYear')}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="monthlyOutput" label="Sản lượng hàng tháng">
                            <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                                disabled={isFieldDisabled('product.monthlyOutput')}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item name="moq" label="MOQ">
                            <InputNumber min={0} style={{ width: '100%' }} disabled={isFieldDisabled('product.moq')} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="mdq" label="MDQ">
                            <InputNumber min={0} style={{ width: '100%' }} disabled={isFieldDisabled('product.mdq')} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="productCategory" label="Loại sản phẩm" initialValue="FINISHED">
                            <Select
                                disabled={isFieldDisabled('product.productCategory')}
                                options={
                                    productCategoryOptions.length > 0 ? productCategoryOptions : fallbackCategoryOptions
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="infoReceivedDate"
                            label="Ngày nhận thông tin"
                            rules={requiredRule('ngày nhận thông tin', isFieldDisabled('product.infoReceivedDate'))}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                disabled={isFieldDisabled('product.infoReceivedDate')}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="mpTargetDate" label="Ngày mục tiêu MP">
                            <DatePicker style={{ width: '100%' }} disabled={isFieldDisabled('product.mpTargetDate')} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="marketType"
                            label="Loại hình kinh doanh"
                            rules={requiredRule('loại hình kinh doanh', isFieldDisabled('product.marketType'))}
                        >
                            <Select
                                placeholder="Chọn loại hình kinh doanh"
                                disabled={isFieldDisabled('product.marketType')}
                            >
                                <Select.Option value="PRODUCTION_EXPORT">Sản xuất xuất khẩu</Select.Option>
                                <Select.Option value="VAT_BUSINESS">Kinh doanh (VAT)</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item name="moldCode" label="Mã khuôn">
                            <Select
                                allowClear
                                placeholder="Chọn khuôn hoặc để trống nếu là khuôn mới"
                                showSearch
                                optionFilterProp="label"
                                disabled={isFieldDisabled('product.moldCode')}
                                onChange={(value) => {
                                    form.setFieldsValue({ moldCode: value });
                                }}
                                options={molds.map((mold) => ({
                                    label: mold.code,
                                    value: mold.code,
                                }))}
                            />
                            <a href="/product-manager/molds">+ Tạo khuôn mới</a>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="resinCodes" label="Nhựa HTMP">
                            <ResinSelect
                                mode="multiple"
                                allowClear
                                loading={loadingResins}
                                placeholder="Chọn nhựa HTMP sử dụng"
                                disabled={isFieldDisabled('product.resinIds')}
                                options={ProductResinMappings}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="attachments"
                            label="File đính kèm"
                            valuePropName="fileList"
                            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
                        >
                            <Upload
                                beforeUpload={() => false}
                                multiple
                                onChange={handleFileChange}
                                onRemove={handleAttachmentRemove}
                                disabled={isFieldDisabled('product.attachments')}
                            >
                                <Button icon={<UploadOutlined />} disabled={isFieldDisabled('product.attachments')}>
                                    Chọn file
                                </Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="productRemark" label="Ghi chú">
                            <Input.TextArea rows={2} disabled={isFieldDisabled('product.remark')} />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            <Card
                title="Danh sách nguyên vật liệu"
                style={sectionStyle}
                extra={
                    <Button
                        type="dashed"
                        disabled={isFieldDisabled('materials.manage')}
                        onClick={() => {
                            const materials = form.getFieldValue('productMaterials') || [];
                            form.setFieldsValue({
                                productMaterials: [...materials, { isQuotation: false }],
                            });
                        }}
                        icon={<PlusOutlined />}
                    >
                        Thêm nguyên vật liệu
                    </Button>
                }
            >
                <Form.List name="productMaterials">
                    {(fields, { remove }) => (
                        <>
                            {fields.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                    Chưa có nguyên vật liệu. Nhấn "Thêm nguyên vật liệu" để bắt đầu.
                                </div>
                            ) : (
                                <Table
                                    dataSource={fields}
                                    pagination={false}
                                    rowKey="key"
                                    size="small"
                                    scroll={{ x: 1200 }}
                                    columns={[
                                        {
                                            title: 'Loại',
                                            dataIndex: 'isQuotation',
                                            width: 120,
                                            render: (_, field) => {
                                                const canEdit = canEditMaterialRow(field.name);
                                                return (
                                                    <Form.Item
                                                        name={[field.name, 'isQuotation']}
                                                        noStyle
                                                        initialValue={false}
                                                        rules={requiredRule('loại', !canEdit)}
                                                    >
                                                        <Select style={{ width: '100%' }} disabled={!canEdit}>
                                                            <Select.Option value={false}>Khách gửi</Select.Option>
                                                            <Select.Option value={true}>Báo giá</Select.Option>
                                                        </Select>
                                                    </Form.Item>
                                                );
                                            },
                                        },
                                        {
                                            title: 'Loại NVL',
                                            dataIndex: 'matType',
                                            width: 150,
                                            render: (_, field) => {
                                                const canEdit = canEditMaterialRow(field.name);
                                                return (
                                                    <Form.Item
                                                        name={[field.name, 'matType']}
                                                        noStyle
                                                        rules={requiredRule('loại NVL', !canEdit, true)}
                                                    >
                                                        <Input placeholder="Loại NVL" disabled={!canEdit} />
                                                    </Form.Item>
                                                );
                                            },
                                        },
                                        {
                                            title: 'Grade',
                                            dataIndex: 'matGrade',
                                            width: 120,
                                            render: (_, field) => {
                                                const canEdit = canEditMaterialRow(field.name);
                                                return (
                                                    <Form.Item
                                                        name={[field.name, 'matGrade']}
                                                        noStyle
                                                        rules={requiredRule('grade', !canEdit)}
                                                    >
                                                        <Input placeholder="Grade" disabled={!canEdit} />
                                                    </Form.Item>
                                                );
                                            },
                                        },
                                        {
                                            title: 'Mã màu',
                                            dataIndex: 'matColorCode',
                                            width: 120,
                                            render: (_, field) => {
                                                const canEdit = canEditMaterialRow(field.name);
                                                return (
                                                    <Form.Item
                                                        name={[field.name, 'matColorCode']}
                                                        noStyle
                                                        rules={requiredRule('mã màu', !canEdit)}
                                                    >
                                                        <Input placeholder="Mã màu" disabled={!canEdit} />
                                                    </Form.Item>
                                                );
                                            },
                                        },
                                        {
                                            title: 'Tên màu',
                                            dataIndex: 'matColorName',
                                            width: 150,
                                            render: (_, field) => {
                                                const canEdit = canEditMaterialRow(field.name);
                                                return (
                                                    <Form.Item
                                                        name={[field.name, 'matColorName']}
                                                        noStyle
                                                        rules={requiredRule('tên màu', !canEdit)}
                                                    >
                                                        <Input placeholder="Tên màu" disabled={!canEdit} />
                                                    </Form.Item>
                                                );
                                            },
                                        },
                                        {
                                            title: 'Nhà cung cấp',
                                            dataIndex: 'matMaker',
                                            width: 150,
                                            render: (_, field) => {
                                                const canEdit = canEditMaterialRow(field.name);
                                                return (
                                                    <Form.Item
                                                        name={[field.name, 'matMaker']}
                                                        noStyle
                                                        rules={requiredRule('nhà cung cấp', !canEdit)}
                                                    >
                                                        <Input placeholder="Nhà cung cấp" disabled={!canEdit} />
                                                    </Form.Item>
                                                );
                                            },
                                        },
                                        {
                                            title: 'Tỷ lệ tái chế (%)',
                                            dataIndex: 'recyclingRate',
                                            width: 120,
                                            render: (_, field) => {
                                                const canEdit = canEditMaterialRow(field.name);
                                                return (
                                                    <Form.Item
                                                        name={[field.name, 'recyclingRate']}
                                                        noStyle
                                                        rules={requiredRule('tỷ lệ tái chế', !canEdit)}
                                                    >
                                                        <InputNumber
                                                            placeholder="Tỷ lệ tái chế"
                                                            style={{ width: '100%' }}
                                                            min={0}
                                                            max={100}
                                                            disabled={!canEdit}
                                                        />
                                                    </Form.Item>
                                                );
                                            },
                                        },
                                        {
                                            title: 'MOQ',
                                            dataIndex: 'matMoq',
                                            width: 100,
                                            render: (_, field) => {
                                                const canEdit = canEditMaterialRow(field.name);
                                                return (
                                                    <Form.Item
                                                        name={[field.name, 'matMoq']}
                                                        noStyle
                                                        rules={requiredRule('MOQ', !canEdit)}
                                                    >
                                                        <InputNumber
                                                            placeholder="MOQ"
                                                            style={{ width: '100%' }}
                                                            min={0}
                                                            disabled={!canEdit}
                                                        />
                                                    </Form.Item>
                                                );
                                            },
                                        },
                                        {
                                            title: 'Ghi chú',
                                            dataIndex: 'remark',
                                            width: 200,
                                            render: (_, field) => {
                                                const canEdit = canEditMaterialRow(field.name);
                                                return (
                                                    <Form.Item name={[field.name, 'remark']} noStyle>
                                                        <Input.TextArea
                                                            placeholder="Ghi chú"
                                                            rows={1}
                                                            autoSize={{ minRows: 1, maxRows: 3 }}
                                                            disabled={!canEdit}
                                                        />
                                                    </Form.Item>
                                                );
                                            },
                                        },
                                        {
                                            title: 'Thao tác',
                                            width: 80,
                                            fixed: 'right',
                                            render: (_, field) => {
                                                const canEdit = canEditMaterialRow(field.name);
                                                return (
                                                    <Popconfirm
                                                        title="Xóa nguyên vật liệu này?"
                                                        onConfirm={() => remove(field.name)}
                                                        okText="Xóa"
                                                        cancelText="Hủy"
                                                        disabled={!canEdit}
                                                    >
                                                        <Button
                                                            type="link"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            disabled={!canEdit}
                                                        />
                                                    </Popconfirm>
                                                );
                                            },
                                        },
                                    ]}
                                />
                            )}
                        </>
                    )}
                </Form.List>
            </Card>

            <Card
                title="Thông tin 2nd Process/Insert"
                style={sectionStyle}
                extra={
                    <Button
                        type="dashed"
                        disabled={isFieldDisabled('inserts.manage')}
                        onClick={() => {
                            const inserts = form.getFieldValue('productInserts') || [];
                            form.setFieldsValue({
                                productInserts: [...inserts, { type: 'INSERT', unit: 'PCS' }],
                            });
                        }}
                        icon={<PlusOutlined />}
                    >
                        Thêm Insert
                    </Button>
                }
            >
                <Form.List name="productInserts">
                    {(fields, { remove }) => (
                        <>
                            {fields.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                    Chưa có insert. Nhấn "Thêm Insert" để bắt đầu.
                                </div>
                            ) : (
                                <Table
                                    dataSource={fields}
                                    pagination={false}
                                    rowKey="key"
                                    size="small"
                                    columns={[
                                        {
                                            title: 'Mã',
                                            dataIndex: 'code',
                                            width: 200,
                                            render: (_, field) => (
                                                <Form.Item
                                                    name={[field.name, 'code']}
                                                    noStyle
                                                    rules={requiredRule(
                                                        'mã insert',
                                                        isFieldDisabled('inserts.manage'),
                                                        true,
                                                    )}
                                                >
                                                    <Input
                                                        placeholder="Mã insert"
                                                        disabled={isFieldDisabled('inserts.manage')}
                                                    />
                                                </Form.Item>
                                            ),
                                        },
                                        {
                                            title: 'Tên',
                                            dataIndex: 'name',
                                            width: 250,
                                            render: (_, field) => (
                                                <Form.Item
                                                    name={[field.name, 'name']}
                                                    noStyle
                                                    rules={requiredRule(
                                                        'tên insert',
                                                        isFieldDisabled('inserts.manage'),
                                                        true,
                                                    )}
                                                >
                                                    <Input
                                                        placeholder="Tên insert"
                                                        disabled={isFieldDisabled('inserts.manage')}
                                                    />
                                                </Form.Item>
                                            ),
                                        },
                                        {
                                            title: 'Số lượng',
                                            dataIndex: 'quantity',
                                            width: 120,
                                            render: (_, field) => (
                                                <Form.Item name={[field.name, 'quantity']} noStyle>
                                                    <InputNumber
                                                        placeholder="Số lượng"
                                                        style={{ width: '100%' }}
                                                        min={0}
                                                        disabled={isFieldDisabled('inserts.manage')}
                                                    />
                                                </Form.Item>
                                            ),
                                        },
                                        {
                                            title: 'Đơn vị',
                                            dataIndex: 'unit',
                                            width: 120,
                                            render: (_, field) => (
                                                <Form.Item
                                                    name={[field.name, 'unit']}
                                                    noStyle
                                                    initialValue="PCS"
                                                    rules={requiredRule('đơn vị', isFieldDisabled('inserts.manage'))}
                                                >
                                                    <Select
                                                        placeholder="Đơn vị"
                                                        disabled={isFieldDisabled('inserts.manage')}
                                                    >
                                                        <Select.Option value="PCS">pcs</Select.Option>
                                                        <Select.Option value="KG">kg</Select.Option>
                                                        <Select.Option value="MM">mm</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            ),
                                        },
                                        {
                                            title: 'Loại',
                                            dataIndex: 'type',
                                            width: 130,
                                            render: (_, field) => (
                                                <Form.Item
                                                    name={[field.name, 'type']}
                                                    noStyle
                                                    initialValue="INSERT"
                                                    rules={requiredRule('loại', isFieldDisabled('inserts.manage'))}
                                                >
                                                    <Select
                                                        placeholder="Loại"
                                                        disabled={isFieldDisabled('inserts.manage')}
                                                    >
                                                        <Select.Option value="INSERT">INSERT</Select.Option>
                                                        <Select.Option value="PROCESS">PROCESS</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            ),
                                        },
                                        {
                                            title: 'Nhà cung cấp',
                                            dataIndex: 'supplier',
                                            width: 200,
                                            render: (_, field) => (
                                                <Form.Item
                                                    name={[field.name, 'supplier']}
                                                    noStyle
                                                    rules={requiredRule(
                                                        'nhà cung cấp',
                                                        isFieldDisabled('inserts.manage'),
                                                    )}
                                                >
                                                    <Input
                                                        placeholder="Nhà cung cấp"
                                                        disabled={isFieldDisabled('inserts.manage')}
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
                                                    title="Xóa insert này?"
                                                    onConfirm={() => remove(field.name)}
                                                    okText="Xóa"
                                                    cancelText="Hủy"
                                                    disabled={isFieldDisabled('inserts.manage')}
                                                >
                                                    <Button
                                                        type="link"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        disabled={isFieldDisabled('inserts.manage')}
                                                    />
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

            <Card
                title="Khai báo event"
                style={sectionStyle}
                extra={
                    <Button
                        type="dashed"
                        disabled={isFieldDisabled('product.events')}
                        onClick={() => {
                            const events = form.getFieldValue('productEventRequirements') || [];
                            form.setFieldsValue({
                                productEventRequirements: normalizeEventRequirements([...events, {}]),
                            });
                        }}
                        icon={<PlusOutlined />}
                    >
                        Thêm event
                    </Button>
                }
            >
                <Form.List name="productEventRequirements">
                    {(fields) => (
                        <>
                            {fields.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                    Chưa có event. Nhấn "Thêm event" để bắt đầu.
                                </div>
                            ) : (
                                <Table
                                    dataSource={fields}
                                    pagination={false}
                                    rowKey="key"
                                    size="small"
                                    columns={[
                                        {
                                            title: 'Tên event',
                                            dataIndex: 'name',
                                            width: 180,
                                            render: (_, field) => (
                                                <Form.Item name={[field.name, 'name']} noStyle>
                                                    <Input disabled />
                                                </Form.Item>
                                            ),
                                        },
                                        {
                                            title: 'Ngày giao hàng',
                                            dataIndex: 'deliveryDate',
                                            width: 180,
                                            render: (_, field) => (
                                                <Form.Item
                                                    name={[field.name, 'deliveryDate']}
                                                    noStyle
                                                    rules={requiredRule(
                                                        'ngày giao hàng',
                                                        isFieldDisabled('product.events'),
                                                    )}
                                                >
                                                    <DatePicker
                                                        style={{ width: '100%' }}
                                                        disabled={isFieldDisabled('product.events')}
                                                    />
                                                </Form.Item>
                                            ),
                                        },
                                        {
                                            title: 'Số lượng',
                                            dataIndex: 'quantity',
                                            width: 160,
                                            render: (_, field) => (
                                                <Form.Item
                                                    name={[field.name, 'quantity']}
                                                    noStyle
                                                    rules={requiredRule('số lượng', isFieldDisabled('product.events'))}
                                                >
                                                    <InputNumber
                                                        placeholder="Số lượng"
                                                        style={{ width: '100%' }}
                                                        min={0}
                                                        disabled={isFieldDisabled('product.events')}
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
                                                    title="Xóa event này?"
                                                    onConfirm={() => {
                                                        const events =
                                                            form.getFieldValue('productEventRequirements') || [];
                                                        const nextEvents = normalizeEventRequirements(
                                                            events.filter((_, index) => index !== field.name),
                                                        );
                                                        form.setFieldsValue({
                                                            productEventRequirements: nextEvents,
                                                        });
                                                    }}
                                                    okText="Xóa"
                                                    cancelText="Hủy"
                                                    disabled={isFieldDisabled('product.events')}
                                                >
                                                    <Button
                                                        type="link"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        disabled={isFieldDisabled('product.events')}
                                                    />
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

            <Card title="Thông tin sản phẩm và máy" style={sectionStyle}>
                <Row gutter={16}>
                    <Col span={18}>
                        <Row gutter={16}>
                            <Col span={6}>
                                <Form.Item name={['productMachine', 'gateType']} label="Loại gate">
                                    <Input disabled={isFieldDisabled('machine.gateType')} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name={['productMachine', 'cavity']} label="Số cavity">
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        disabled={isFieldDisabled('machine.cavity')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name={['productMachine', 'cycleTimeQuotation']} label="Chu kỳ (Báo giá)">
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        disabled={isFieldDisabled('machine.cycleTimeQuotation')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name={['productMachine', 'cycleTimeTarget']} label="Chu kỳ (Mục tiêu)">
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        disabled={isFieldDisabled('machine.cycleTimeTarget')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name={['productMachine', 'cycleTimeActual']} label="Chu kỳ (Thực tế)">
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        disabled={isFieldDisabled('machine.cycleTimeActual')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name={['productMachine', 'machineCapacityQuotation']}
                                    label="Công suất (Báo giá)"
                                    min={0}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        disabled={isFieldDisabled('machine.capacityQuotation')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name={['productMachine', 'machineCapacityTarget']}
                                    label="Công suất (Mục tiêu)"
                                    min={0}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        disabled={isFieldDisabled('machine.capacityTarget')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name={['productMachine', 'machineCapacityActual']}
                                    label="Công suất (Thực tế)"
                                    min={0}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        disabled={isFieldDisabled('machine.capacityActual')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name={['productMachine', 'runnerWeightG']}
                                    label="Trọng lượng runner báo giá (g)"
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        disabled={isFieldDisabled('machine.weightsQuotation')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name={['productMachine', 'runnerWeightActualG']}
                                    label="Trọng lượng runner thực tế (g)"
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        disabled={isFieldDisabled('machine.weightActual')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name={['productMachine', 'productWeightG']}
                                    label="Trọng lượng sản phẩm báo giá (g)"
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        disabled={isFieldDisabled('machine.weightsQuotation')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name={['productMachine', 'productWeightActualG']}
                                    label="Trọng lượng sản phẩm thực tế (g)"
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        disabled={isFieldDisabled('machine.weightActual')}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={6}>
                                <Form.Item name={['productMachine', 'totalWeightG']} label="Tổng (g)/pcs">
                                    <InputNumber style={{ width: '100%' }} disabled />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>

                    <Col span={6}>
                        <Form.Item name={['productMachine', 'machineRemark']} label="Ghi chú máy">
                            <Input.TextArea rows={8} disabled={isFieldDisabled('machine.remark')} />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            <Card title="Thông tin khấu hao khuôn" style={sectionStyle}>
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item name={['productMoldDepreciation', 'quantityPcs']} label="Số lượng (pcs)">
                            <InputNumber style={{ width: '100%' }} disabled={isFieldDisabled('depreciation.manage')} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name={['productMoldDepreciation', 'depreciationYear']} label="Số năm khấu hao">
                            <InputNumber style={{ width: '100%' }} disabled={isFieldDisabled('depreciation.manage')} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name={['productMoldDepreciation', 'depreciationRemark']} label="Ghi chú">
                            <Input.TextArea rows={1} disabled={isFieldDisabled('depreciation.manage')} />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            <Card title="Đóng gói" style={sectionStyle}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name={['productPacking', 'boxType']}
                            label="Loại thùng"
                            rules={requiredRule('loại thùng', isFieldDisabled('packing.manage'))}
                        >
                            <Input disabled={isFieldDisabled('packing.manage')} />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name={['productPacking', 'coverType']}
                            label="Loại Cover"
                            rules={requiredRule('loại cover', isFieldDisabled('packing.manage'))}
                        >
                            <Input disabled={isFieldDisabled('packing.manage')} />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            name={['productPacking', 'boxInvestQty']}
                            label="Số lượng thùng đầu tư (chỉ dùng khi báo giá)"
                        >
                            <InputNumber style={{ width: '100%' }} disabled={isFieldDisabled('packing.investment')} />
                        </Form.Item>
                    </Col>

                    <Col span={4}>
                        <Form.Item
                            name={['productPacking', 'pcsPerCover']}
                            label="Số lượng/Cover"
                            rules={requiredRule('số lượng/Cover', isFieldDisabled('packing.quantities'))}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                disabled={isFieldDisabled('packing.quantities')}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={4}>
                        <Form.Item
                            name={['productPacking', 'coverPerBox']}
                            label="Cover/Thùng"
                            rules={requiredRule('cover/thùng', isFieldDisabled('packing.quantities'))}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                disabled={isFieldDisabled('packing.quantities')}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={4}>
                        <Form.Item label="Số lượng / thùng">
                            <InputNumber style={{ width: '100%' }} disabled value={totalPerBox} />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            name={['productPacking', 'isOneTimeBox']}
                            label="Loại thùng"
                            rules={requiredRule('loại thùng', isFieldDisabled('packing.manage'))}
                        >
                            <Radio.Group disabled={isFieldDisabled('packing.manage')}>
                                <Radio value={true}>Thùng 1 lần</Radio>
                                <Radio value={false}>Thùng xoay vòng</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item name={['productPacking', 'remark']} label="Ghi chú">
                            <Input disabled={isFieldDisabled('packing.manage')} />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>
        </Form>
    );
};

export default ProductFormPage;
