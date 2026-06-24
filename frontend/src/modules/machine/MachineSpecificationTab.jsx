import { DeleteOutlined, EditOutlined, EyeOutlined, PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import {
    Button,
    Form,
    Input,
    InputNumber,
    Modal,
    Pagination,
    Popconfirm,
    Select,
    Space,
    Table,
    Tag,
    message,
} from 'antd';
import React, { useState } from 'react';
import machineService from '~/modules/machine/service/machineService';
import machineSpecificationService from '~/modules/machine/service/machineSpecificationService';

const BOOLEAN_OPTIONS = [
    { label: 'Có', value: true },
    { label: 'Không', value: false },
];

const FIELD_SECTIONS = [
    {
        title: 'Thông tin chung',
        fields: [
            { name: 'maker', label: 'Maker' },
            { name: 'modelName', label: 'Model' },
            { name: 'machineType', label: 'Loại spec' },
            { name: 'manufacturedDate', label: 'Năm SX' },
            { name: 'clampingForceTon', label: 'Lực kẹp (Ton)', type: 'number' },
            { name: 'supportsAutoClamping', label: 'Hỗ trợ auto clamp', type: 'boolean' },
            { name: 'supportsManualClamping', label: 'Hỗ trợ manual clamp', type: 'boolean' },
            { name: 'thickness', label: 'Độ dày' },
            { name: 'clampingSystemType', label: 'Loại hệ kẹp' },
            { name: 'screwMm', label: 'Screw (mm)' },
        ],
    },
    {
        title: 'Thông số ép phun',
        fields: [
            { name: 'shotSizeCm3', label: 'Shot size (cm3)' },
            { name: 'shotWeightG', label: 'Shot weight (g)' },
            { name: 'maxHoldingPressureKgCm2', label: 'Áp suất giữ max' },
            { name: 'maxInjectionPressureKgCm2', label: 'Áp suất phun max' },
            { name: 'injectionRateCm3Sec', label: 'Tốc độ phun (cm3/s)' },
            { name: 'injectionSpeedMmSec', label: 'Tốc độ phun (mm/s)', type: 'number' },
            { name: 'screwSpeedRpm', label: 'Screw speed (rpm)', type: 'number' },
            { name: 'plasticizingCapacityKgH', label: 'Plasticizing (kg/h)', type: 'number' },
            { name: 'tieBarSpaceHorizontalMm', label: 'Tie bar ngang (mm)', type: 'number' },
            { name: 'tieBarSpaceVerticalMm', label: 'Tie bar dọc (mm)', type: 'number' },
            { name: 'platenSizeHorizontalMm', label: 'Platen ngang (mm)', type: 'number' },
            { name: 'platenSizeVerticalMm', label: 'Platen dọc (mm)', type: 'number' },
            { name: 'maxDaylightMm', label: 'Max daylight (mm)', type: 'number' },
            { name: 'moldHeightMm', label: 'Mold height (mm)', type: 'number' },
            { name: 'minMoldHeightMm', label: 'Min mold height (mm)', type: 'number' },
            { name: 'maxMoldHeightMm', label: 'Max mold height (mm)', type: 'number' },
            { name: 'maxEjectorStrokeMm', label: 'Max ejector (mm)', type: 'number' },
        ],
    },
    {
        title: 'Hệ thống và dầu',
        fields: [
            { name: 'autoClampingSystem', label: 'Auto clamping system', type: 'boolean' },
            { name: 'manualClampingSystem', label: 'Manual clamping system', type: 'boolean' },
            { name: 'nozzleInsideDiameterMm', label: 'Nozzle ID (mm)', type: 'number' },
            { name: 'nozzleTouchRadiusMm', label: 'Nozzle touch radius (mm)' },
            { name: 'locatingRingDiameterMm', label: 'Locating ring (mm)' },
            { name: 'coolingCouplerInch', label: 'Cooling coupler (inch)' },
            { name: 'hydraulicCoreCountFixedPlate', label: 'Core cố định', type: 'number' },
            { name: 'hydraulicCoreCountMovablePlate', label: 'Core di động', type: 'number' },
            { name: 'utilizedOilQuantityL', label: 'Lượng dầu (L)' },
            { name: 'electricMotorPowerKw', label: 'CS motor (kW)', type: 'decimal' },
            { name: 'electricHeaterPowerKw', label: 'CS heater (kW)', type: 'decimal' },
        ],
    },
    {
        title: 'Robot và hot runner',
        fields: [
            { name: 'robotMaker', label: 'Robot Maker' },
            { name: 'robotModelName', label: 'Robot Model' },
            { name: 'robotStrokeMm', label: 'Robot stroke (mm)' },
            { name: 'hotRunnerZoneCount', label: 'Zone hot runner', type: 'number' },
            { name: 'hotRunnerHeatingType', label: 'Heating type' },
            { name: 'hotRunnerMainVoltageV', label: 'Main voltage (V)', type: 'number' },
            { name: 'hotRunnerSolenoidValveVoltageV', label: 'Solenoid voltage (V)', type: 'number' },
            { name: 'hotRunnerSequenceEnabled', label: 'Sequence hot runner', type: 'boolean' },
            { name: 'hotRunnerControllerPinType', label: 'Pin type controller' },
            { name: 'temperatureControllerEnabled', label: 'Temp controller', type: 'boolean' },
            { name: 'chillerEnabled', label: 'Chiller', type: 'boolean' },
            { name: 'chillerCapacityRt', label: 'Chiller capacity (RT)', type: 'decimal' },
        ],
    },
];

const FIELD_NAMES = FIELD_SECTIONS.flatMap((section) => section.fields.map((field) => field.name));

const MachineSpecificationTab = () => {
    const [rows, setRows] = useState([]);
    const [machinesBySpecification, setMachinesBySpecification] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMachinesBySpecification, setLoadingMachinesBySpecification] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [viewingSpecification, setViewingSpecification] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deletingSpecificationId, setDeletingSpecificationId] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [form] = Form.useForm();

    const fetchData = React.useCallback(
        async (page = 1, pageSize = 10) => {
            setLoading(true);
            try {
                const data = await machineSpecificationService.getAllMachineSpecifications({
                    page: page - 1,
                    size: pageSize,
                    sort: 'id,asc',
                    ...(keyword.trim() ? { keyword: keyword.trim() } : {}),
                });

                const content = data?.content || [];
                const totalElements =
                    data?.totalElements ??
                    data?.page?.totalElements ??
                    data?.total ??
                    data?.page?.total ??
                    content.length;

                setRows(content);
                setPagination((prev) => ({
                    ...prev,
                    current: page,
                    pageSize,
                    total: totalElements,
                }));
            } catch (error) {
                message.error(error.message || 'Không tải được danh sách spec máy');
            } finally {
                setLoading(false);
            }
        },
        [keyword],
    );

    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchData(1, pagination.pageSize);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [fetchData, pagination.pageSize]);

    const handlePageChange = (page, pageSize) => {
        fetchData(page, pageSize);
    };

    const renderText = (text) => text || '—';
    const renderNumber = (value) => value ?? '—';
    const renderBoolean = (value) => {
        if (value === true) return <Tag color="green">Có</Tag>;
        if (value === false) return <Tag color="default">Không</Tag>;
        return '—';
    };

    const openCreateModal = () => {
        setEditingItem(null);
        form.resetFields();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (record) => {
        setEditingItem(record);
        form.setFieldsValue(
            FIELD_NAMES.reduce((result, fieldName) => {
                result[fieldName] = record[fieldName];
                return result;
            }, {}),
        );
        setIsCreateModalOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        setEditingItem(null);
        form.resetFields();
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setViewingSpecification(null);
        setMachinesBySpecification([]);
    };

    const buildPayload = (values) => {
        return FIELD_SECTIONS.flatMap((section) => section.fields).reduce((payload, field) => {
            const rawValue = values[field.name];
            if (!field.type) {
                payload[field.name] = typeof rawValue === 'string' ? rawValue.trim() || null : (rawValue ?? null);
                return payload;
            }
            payload[field.name] = rawValue ?? null;
            return payload;
        }, {});
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            const payload = buildPayload(values);

            if (editingItem?.id) {
                await machineSpecificationService.updateMachineSpecification(editingItem.id, payload);
                message.success('Cập nhật spec máy thành công');
            } else {
                await machineSpecificationService.createMachineSpecification(payload);
                message.success('Tạo spec máy thành công');
            }

            closeCreateModal();
            fetchData(pagination.current, pagination.pageSize);
        } catch (error) {
            if (error?.errorFields) {
                return;
            }
            message.error(error.message || `Không thể ${editingItem ? 'cập nhật' : 'tạo'} spec máy`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (record) => {
        try {
            setDeletingSpecificationId(record.id);
            await machineSpecificationService.deleteMachineSpecification(record.id);
            message.success('Xóa spec máy thành công');

            const nextPage = rows.length === 1 && pagination.current > 1 ? pagination.current - 1 : pagination.current;
            fetchData(nextPage, pagination.pageSize);
        } catch (error) {
            message.error(error.message || 'Không thể xóa spec máy');
        } finally {
            setDeletingSpecificationId(null);
        }
    };

    const openViewModal = async (record) => {
        try {
            setViewingSpecification(record);
            setIsViewModalOpen(true);
            setLoadingMachinesBySpecification(true);

            const data = await machineService.getAllMachines({
                page: 0,
                size: 2000,
                sort: 'id,desc',
            });
            const content = data?.content || [];
            const linkedMachines = content.filter(
                (machine) => (machine?.machineSpecification?.id ?? machine?.machineSpecificationId) === record.id,
            );
            setMachinesBySpecification(linkedMachines);
        } catch (error) {
            message.error(error.message || 'Không tải được danh sách máy theo spec');
        } finally {
            setLoadingMachinesBySpecification(false);
        }
    };

    const renderInputByField = (field) => {
        if (field.type === 'number') {
            return <InputNumber className="w-full" style={{ width: '100%' }} precision={0} />;
        }
        if (field.type === 'decimal') {
            return <InputNumber className="w-full" style={{ width: '100%' }} />;
        }
        if (field.type === 'boolean') {
            return <Select allowClear options={BOOLEAN_OPTIONS} placeholder="Chọn" />;
        }
        return <Input placeholder={field.label} />;
    };

    const columns = [
        {
            title: 'STT',
            key: 'order',
            width: 80,
            align: 'center',
            fixed: 'left',
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: 'Model',
            dataIndex: 'modelName',
            key: 'modelName',
            width: 180,
            fixed: 'left',
            render: renderText,
        },
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80, align: 'center' },
        { title: 'Maker', dataIndex: 'maker', key: 'maker', width: 140, render: renderText },
        {
            title: 'Loại spec',
            dataIndex: 'machineType',
            key: 'machineType',
            width: 130,
            render: (text) => (text ? <Tag color="blue">{text}</Tag> : '—'),
        },
        {
            title: 'Năm SX',
            dataIndex: 'manufacturedDate',
            key: 'manufacturedDate',
            width: 120,
            align: 'center',
            render: renderText,
        },
        {
            title: 'Lực kẹp (Ton)',
            dataIndex: 'clampingForceTon',
            key: 'clampingForceTon',
            width: 130,
            align: 'center',
            render: renderNumber,
        },
        {
            title: 'Hỗ trợ auto clamp',
            dataIndex: 'supportsAutoClamping',
            key: 'supportsAutoClamping',
            width: 160,
            align: 'center',
            render: renderBoolean,
        },
        {
            title: 'Hỗ trợ manual clamp',
            dataIndex: 'supportsManualClamping',
            key: 'supportsManualClamping',
            width: 170,
            align: 'center',
            render: renderBoolean,
        },
        { title: 'Độ dày', dataIndex: 'thickness', key: 'thickness', width: 120, render: renderText },
        {
            title: 'Loại hệ kẹp',
            dataIndex: 'clampingSystemType',
            key: 'clampingSystemType',
            width: 150,
            render: renderText,
        },
        {
            title: 'Screw (mm)',
            dataIndex: 'screwMm',
            key: 'screwMm',
            width: 120,
            align: 'center',
            render: renderText,
        },
        {
            title: 'Shot size (cm3)',
            dataIndex: 'shotSizeCm3',
            key: 'shotSizeCm3',
            width: 130,
            align: 'center',
            render: renderText,
        },
        {
            title: 'Shot weight (g)',
            dataIndex: 'shotWeightG',
            key: 'shotWeightG',
            width: 130,
            align: 'center',
            render: renderText,
        },
        {
            title: 'Áp suất giữ max',
            dataIndex: 'maxHoldingPressureKgCm2',
            key: 'maxHoldingPressureKgCm2',
            width: 150,
            align: 'center',
            render: renderText,
        },
        {
            title: 'Áp suất phun max',
            dataIndex: 'maxInjectionPressureKgCm2',
            key: 'maxInjectionPressureKgCm2',
            width: 150,
            align: 'center',
            render: renderText,
        },
        {
            title: 'Tốc độ phun (cm3/s)',
            dataIndex: 'injectionRateCm3Sec',
            key: 'injectionRateCm3Sec',
            width: 160,
            align: 'center',
            render: renderText,
        },
        {
            title: 'Tốc độ phun (mm/s)',
            dataIndex: 'injectionSpeedMmSec',
            key: 'injectionSpeedMmSec',
            width: 150,
            align: 'center',
            render: renderNumber,
        },
        {
            title: 'Screw speed (rpm)',
            dataIndex: 'screwSpeedRpm',
            key: 'screwSpeedRpm',
            width: 150,
            align: 'center',
            render: renderNumber,
        },
        {
            title: 'Plasticizing (kg/h)',
            dataIndex: 'plasticizingCapacityKgH',
            key: 'plasticizingCapacityKgH',
            width: 150,
            align: 'center',
            render: renderNumber,
        },
        {
            title: 'Tie bar ngang (mm)',
            dataIndex: 'tieBarSpaceHorizontalMm',
            key: 'tieBarSpaceHorizontalMm',
            width: 160,
            align: 'center',
            render: renderNumber,
        },
        {
            title: 'Tie bar dọc (mm)',
            dataIndex: 'tieBarSpaceVerticalMm',
            key: 'tieBarSpaceVerticalMm',
            width: 150,
            align: 'center',
            render: renderNumber,
        },
        {
            title: 'Platen ngang (mm)',
            dataIndex: 'platenSizeHorizontalMm',
            key: 'platenSizeHorizontalMm',
            width: 150,
            align: 'center',
            render: renderNumber,
        },
        {
            title: 'Platen dọc (mm)',
            dataIndex: 'platenSizeVerticalMm',
            key: 'platenSizeVerticalMm',
            width: 140,
            align: 'center',
            render: renderNumber,
        },
        {
            title: 'Max daylight (mm)',
            dataIndex: 'maxDaylightMm',
            key: 'maxDaylightMm',
            width: 150,
            align: 'center',
            render: renderNumber,
        },
        {
            title: 'Mold height (mm)',
            dataIndex: 'moldHeightMm',
            key: 'moldHeightMm',
            width: 140,
            align: 'center',
            render: renderNumber,
        },
        {
            title: 'Min mold height (mm)',
            dataIndex: 'minMoldHeightMm',
            key: 'minMoldHeightMm',
            width: 170,
            align: 'center',
            render: renderNumber,
        },
        {
            title: 'Max mold height (mm)',
            dataIndex: 'maxMoldHeightMm',
            key: 'maxMoldHeightMm',
            width: 170,
            align: 'center',
            render: renderNumber,
        },
        {
            title: 'Max ejector (mm)',
            dataIndex: 'maxEjectorStrokeMm',
            key: 'maxEjectorStrokeMm',
            width: 140,
            align: 'center',
            render: renderNumber,
        },
        {
            title: 'Auto clamping system',
            dataIndex: 'autoClampingSystem',
            key: 'autoClampingSystem',
            width: 170,
            align: 'center',
            render: renderBoolean,
        },
        {
            title: 'Manual clamping system',
            dataIndex: 'manualClampingSystem',
            key: 'manualClampingSystem',
            width: 180,
            align: 'center',
            render: renderBoolean,
        },
        {
            title: 'Nozzle ID (mm)',
            dataIndex: 'nozzleInsideDiameterMm',
            key: 'nozzleInsideDiameterMm',
            width: 140,
            align: 'center',
            render: renderNumber,
        },
        {
            title: 'Nozzle touch radius (mm)',
            dataIndex: 'nozzleTouchRadiusMm',
            key: 'nozzleTouchRadiusMm',
            width: 180,
            align: 'center',
            render: renderText,
        },
        {
            title: 'Locating ring (mm)',
            dataIndex: 'locatingRingDiameterMm',
            key: 'locatingRingDiameterMm',
            width: 150,
            align: 'center',
            render: renderText,
        },
        {
            title: 'Cooling coupler (inch)',
            dataIndex: 'coolingCouplerInch',
            key: 'coolingCouplerInch',
            width: 170,
            align: 'center',
            render: renderText,
        },
        {
            title: 'Core cố định',
            dataIndex: 'hydraulicCoreCountFixedPlate',
            key: 'hydraulicCoreCountFixedPlate',
            width: 130,
            align: 'center',
            render: renderNumber,
        },
        {
            title: 'Core di động',
            dataIndex: 'hydraulicCoreCountMovablePlate',
            key: 'hydraulicCoreCountMovablePlate',
            width: 130,
            align: 'center',
            render: renderNumber,
        },
        {
            title: 'Lượng dầu (L)',
            dataIndex: 'utilizedOilQuantityL',
            key: 'utilizedOilQuantityL',
            width: 130,
            align: 'center',
            render: renderText,
        },
        {
            title: 'CS motor (kW)',
            dataIndex: 'electricMotorPowerKw',
            key: 'electricMotorPowerKw',
            width: 130,
            align: 'center',
            render: renderNumber,
        },
        {
            title: 'CS heater (kW)',
            dataIndex: 'electricHeaterPowerKw',
            key: 'electricHeaterPowerKw',
            width: 130,
            align: 'center',
            render: renderNumber,
        },
        { title: 'Robot Maker', dataIndex: 'robotMaker', key: 'robotMaker', width: 140, render: renderText },
        { title: 'Robot Model', dataIndex: 'robotModelName', key: 'robotModelName', width: 160, render: renderText },
        {
            title: 'Robot stroke (mm)',
            dataIndex: 'robotStrokeMm',
            key: 'robotStrokeMm',
            width: 140,
            align: 'center',
            render: renderText,
        },
        {
            title: 'Zone hot runner',
            dataIndex: 'hotRunnerZoneCount',
            key: 'hotRunnerZoneCount',
            width: 140,
            align: 'center',
            render: renderNumber,
        },
        {
            title: 'Heating type',
            dataIndex: 'hotRunnerHeatingType',
            key: 'hotRunnerHeatingType',
            width: 130,
            align: 'center',
            render: renderText,
        },
        {
            title: 'Main voltage (V)',
            dataIndex: 'hotRunnerMainVoltageV',
            key: 'hotRunnerMainVoltageV',
            width: 140,
            align: 'center',
            render: renderNumber,
        },
        {
            title: 'Solenoid voltage (V)',
            dataIndex: 'hotRunnerSolenoidValveVoltageV',
            key: 'hotRunnerSolenoidValveVoltageV',
            width: 170,
            align: 'center',
            render: renderNumber,
        },
        {
            title: 'Sequence hot runner',
            dataIndex: 'hotRunnerSequenceEnabled',
            key: 'hotRunnerSequenceEnabled',
            width: 160,
            align: 'center',
            render: renderBoolean,
        },
        {
            title: 'Pin type controller',
            dataIndex: 'hotRunnerControllerPinType',
            key: 'hotRunnerControllerPinType',
            width: 180,
            render: renderText,
        },
        {
            title: 'Temp controller',
            dataIndex: 'temperatureControllerEnabled',
            key: 'temperatureControllerEnabled',
            width: 140,
            align: 'center',
            render: renderBoolean,
        },
        {
            title: 'Chiller',
            dataIndex: 'chillerEnabled',
            key: 'chillerEnabled',
            width: 110,
            align: 'center',
            render: renderBoolean,
        },
        {
            title: 'Chiller capacity (RT)',
            dataIndex: 'chillerCapacityRt',
            key: 'chillerCapacityRt',
            width: 160,
            align: 'center',
            render: renderText,
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 240,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EyeOutlined />} onClick={() => openViewModal(record)}>
                        Xem
                    </Button>
                    <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa spec máy"
                        description="Spec sẽ bị gỡ khỏi các máy đang liên kết. Tiếp tục?"
                        okText="Xóa"
                        cancelText="Hủy"
                        onConfirm={() => handleDelete(record)}
                    >
                        <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                            loading={deletingSpecificationId === record.id}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div className="text-sm text-slate-500">Thông số kỹ thuật máy</div>
                    <div className="text-lg font-semibold text-slate-800 dark:text-white">Danh sách spec máy</div>
                </div>
                <Button type="primary" icon={<PlusCircleOutlined />} onClick={openCreateModal}>
                    Thêm mới spec
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
                    <div className="text-xs text-slate-500">Spec trong trang hiện tại</div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">{rows.length}</div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
                    <div className="text-xs text-slate-500">Tổng số spec</div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">{pagination.total}</div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                <div className="flex flex-wrap gap-3 mb-4">
                    <Input
                        allowClear
                        prefix={<SearchOutlined className="text-slate-400" />}
                        placeholder="Tìm theo maker, model, loại spec, robot..."
                        className="w-full md:w-96"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>

                <Table
                    rowKey={(record) => record.id}
                    loading={loading}
                    columns={columns}
                    dataSource={rows}
                    pagination={false}
                    bordered
                    size="middle"
                    sticky
                    scroll={{ x: 'max-content', y: 520 }}
                    locale={{ emptyText: keyword ? 'Không có dữ liệu phù hợp' : 'Chưa có spec máy' }}
                />

                <div className="mt-4 flex justify-end">
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        showSizeChanger
                        pageSizeOptions={['10', '20', '50', '100']}
                        showTotal={(total, range) => `${range[0]}-${range[1]} / ${total} spec`}
                        onChange={handlePageChange}
                        onShowSizeChange={handlePageChange}
                    />
                </div>
            </div>

            <Modal
                open={isCreateModalOpen}
                title={editingItem ? 'Chỉnh sửa spec' : 'Thêm mới spec'}
                onCancel={closeCreateModal}
                onOk={handleSubmit}
                okText="Lưu"
                cancelText="Hủy"
                confirmLoading={submitting}
                width={1200}
                destroyOnHidden
                styles={{ body: { maxHeight: '75vh', overflowY: 'auto', paddingTop: 12 } }}
            >
                <Form form={form} layout="vertical">
                    {FIELD_SECTIONS.map((section) => (
                        <div key={section.title} className="mb-6">
                            <div className="mb-3 text-base font-semibold text-slate-800">{section.title}</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {section.fields.map((field) => (
                                    <Form.Item key={field.name} name={field.name} label={field.label} className="mb-0">
                                        {renderInputByField(field)}
                                    </Form.Item>
                                ))}
                            </div>
                        </div>
                    ))}
                </Form>
            </Modal>

            <Modal
                open={isViewModalOpen}
                title={`Danh sách máy dùng spec: ${viewingSpecification?.modelName || '—'}`}
                onCancel={closeViewModal}
                footer={[
                    <Button key="close" onClick={closeViewModal}>
                        Đóng
                    </Button>,
                ]}
                width={900}
                destroyOnHidden
            >
                <Table
                    rowKey={(record) => record.id}
                    loading={loadingMachinesBySpecification}
                    pagination={false}
                    bordered
                    size="middle"
                    dataSource={machinesBySpecification}
                    locale={{ emptyText: 'Spec này chưa được gán cho máy nào' }}
                    columns={[
                        {
                            title: 'STT',
                            key: 'index',
                            width: 80,
                            align: 'center',
                            render: (_, __, index) => index + 1,
                        },
                        {
                            title: 'Mã máy',
                            dataIndex: 'code',
                            key: 'code',
                            render: renderText,
                        },
                        {
                            title: 'Số máy',
                            dataIndex: 'machineNo',
                            key: 'machineNo',
                            align: 'center',
                            render: renderNumber,
                        },
                        {
                            title: 'Loại máy',
                            dataIndex: 'type',
                            key: 'type',
                            render: renderText,
                        },
                        {
                            title: 'Maker',
                            dataIndex: 'maker',
                            key: 'maker',
                            render: renderText,
                        },
                        {
                            title: 'Model',
                            dataIndex: 'model',
                            key: 'model',
                            render: renderText,
                        },
                    ]}
                />
            </Modal>
        </div>
    );
};

export default MachineSpecificationTab;
