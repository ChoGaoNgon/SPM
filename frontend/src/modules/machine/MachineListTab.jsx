import { DeleteOutlined, EditOutlined, PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import {
    AutoComplete,
    Button,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Pagination,
    Popconfirm,
    Select,
    Space,
    Table,
    Tag,
    Tooltip,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import machineService from '~/modules/machine/service/machineService';
import machineSpecificationService from '~/modules/machine/service/machineSpecificationService';
import MachineDetailFormTable from './MachineDetailFormTable';
import {
    buildMachinePayload,
    flattenMachineRows,
    normalizeDetailRows,
    toStringOptions,
    toVoltageOptions,
} from './utils/machineListUtils';

const MachineListTab = ({ machineTypes = [] }) => {
    const [machines, setMachines] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [loading, setLoading] = useState(false);
    const [loadingDistinctOptions, setLoadingDistinctOptions] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [filterMachineTypeId, setFilterMachineTypeId] = useState(undefined);
    const [detailFieldOptions, setDetailFieldOptions] = useState({
        name: [],
        model: [],
        maker: [],
        voltage: [],
        position: [],
    });
    const [machineSpecificationOptions, setMachineSpecificationOptions] = useState([]);
    const [form] = Form.useForm();

    const machineTypeOptions = useMemo(
        () =>
            (machineTypes || []).map((type) => ({
                label: type.name,
                value: type.id,
            })),
        [machineTypes],
    );

    const filteredMachines = useMemo(() => machines, [machines]);

    const flattenedRows = useMemo(
        () =>
            flattenMachineRows(filteredMachines, {
                startOrder: (pagination.current - 1) * pagination.pageSize,
            }),
        [filteredMachines, pagination.current, pagination.pageSize],
    );

    const getGroupedCellProps = (record) => ({
        rowSpan: record.isFirstRow ? record.rowSpan : 0,
    });

    const hasComponentElectricPower = useMemo(
        () =>
            filteredMachines.some((machine) =>
                (machine?.machineDetails || []).some((detail) => {
                    const value = detail?.electricPower;
                    return value !== null && value !== undefined && String(value).trim() !== '';
                }),
            ),
        [filteredMachines],
    );

    const fetchMachines = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const data = await machineService.getAllMachines({
                page: page - 1,
                size: pageSize,
                sort: 'id,desc',
                ...(keyword.trim() ? { keyword: keyword.trim() } : {}),
                ...(filterMachineTypeId ? { machineTypeId: filterMachineTypeId } : {}),
            });

            const content = data?.content || [];
            const totalElements =
                data?.totalElements ?? data?.page?.totalElements ?? data?.total ?? data?.page?.total ?? content.length;

            setMachines(content);
            setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize,
                total: totalElements,
            }));
        } catch (error) {
            message.error(error.message || 'Không tải được danh sách máy');
        } finally {
            setLoading(false);
        }
    };

    const fetchDistinctDetailOptions = async () => {
        setLoadingDistinctOptions(true);
        try {
            const [nameValues, modelValues, makerValues, voltageValues, positionValues] = await Promise.all([
                machineService.getDistinctMachineDetailFieldValues('name'),
                machineService.getDistinctMachineDetailFieldValues('model'),
                machineService.getDistinctMachineDetailFieldValues('maker'),
                machineService.getDistinctMachineDetailFieldValues('voltage'),
                machineService.getDistinctMachineDetailFieldValues('position'),
            ]);

            setDetailFieldOptions({
                name: toStringOptions(nameValues),
                model: toStringOptions(modelValues),
                maker: toStringOptions(makerValues),
                voltage: toVoltageOptions(voltageValues),
                position: toStringOptions(positionValues),
            });
        } catch (error) {
            message.error(error.message || 'Không tải được danh sách gợi ý chi tiết máy');
        } finally {
            setLoadingDistinctOptions(false);
        }
    };

    const fetchMachineSpecificationOptions = async () => {
        try {
            const data = await machineSpecificationService.getAllMachineSpecifications({
                page: 0,
                size: 1000,
                sort: 'id,desc',
            });

            const content = data?.content || [];
            setMachineSpecificationOptions(
                content.map((spec) => ({
                    value: spec.id,
                    label: `#${spec.id} - ${spec.maker || 'N/A'} ${spec.modelName || ''}`.trim(),
                })),
            );
        } catch (error) {
            message.error(error.message || 'Không tải được danh sách spec máy');
        }
    };

    const reloadAllData = async () => {
        await Promise.all([fetchMachines(1, pagination.pageSize), fetchDistinctDetailOptions()]);
    };

    useEffect(() => {
        fetchMachines(1, pagination.pageSize);
        fetchDistinctDetailOptions();
        fetchMachineSpecificationOptions();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchMachines(1, pagination.pageSize);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [keyword, filterMachineTypeId]);

    const handlePageChange = (page, pageSize) => {
        fetchMachines(page, pageSize);
    };

    const openCreateModal = () => {
        setEditingItem(null);
        form.setFieldsValue({
            totalElectricPower: '',
            machineDetails: [
                {
                    name: '',
                    model: '',
                    serial: '',
                    voltage: undefined,
                    maker: '',
                    electricPower: undefined,
                    productionStartTime: undefined,
                    dispatchTime: undefined,
                },
            ],
        });
        setIsModalOpen(true);
    };

    const openEditModal = (record) => {
        setEditingItem(record);
        form.setFieldsValue({
            code: record.code,
            machineNo: record.machineNo,
            dimension: record.dimension,
            machineTypeId: record.machineType?.id,
            machineSpecificationId: record.machineSpecification?.id,
            capacityTon: record.capacityTon,
            totalElectricPower: record.totalElectricPower,
            position: record.position,
            screw: record.screw,
            description: record.description,
            machineDetails: normalizeDetailRows(record.machineDetails),
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            const payload = buildMachinePayload(values);

            if (editingItem) {
                await machineService.updateMachine(editingItem.id, payload);
                message.success('Cập nhật máy thành công');
            } else {
                await machineService.createMachine(payload);
                message.success('Tạo máy thành công');
            }

            closeModal();
            reloadAllData();
        } catch (error) {
            if (error?.errorFields) return;
            message.error(error.message || `Không thể ${editingItem ? 'cập nhật' : 'tạo'} máy`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (record) => {
        try {
            setDeletingId(record.id);
            await machineService.deleteMachine(record.id);
            message.success('Xóa máy thành công');
            reloadAllData();
        } catch (error) {
            message.error(error.message || 'Không thể xóa máy');
        } finally {
            setDeletingId(null);
        }
    };

    const columns = [
        {
            title: 'STT',
            align: 'center',
            width: 60,
            render: (_, record) => record.machineOrder,
            onCell: getGroupedCellProps,
        },
        {
            title: 'Mã máy',
            dataIndex: 'code',
            key: 'code',
            width: '100px',
            render: (code) => (
                <span className="font-semibold text-sky-700 truncate block" title={code}>
                    {code}
                </span>
            ),
            onCell: getGroupedCellProps,
        },
        {
            title: 'Thiết bị',
            dataIndex: 'detailName',
            key: 'detailName',
            width: '100px',
            render: (text) => (
                <span className="truncate block" title={text || ''}>
                    {text || '—'}
                </span>
            ),
        },
        {
            title: 'Model',
            dataIndex: 'model',
            key: 'model',
            width: '100px',
            render: (text) => (
                <span className="block" style={{ whiteSpace: 'pre-line' }} title={text || ''}>
                    {text || '—'}
                </span>
            ),
        },
        {
            title: 'Maker',
            dataIndex: 'maker',
            key: 'maker',
            width: '100px',
            render: (text) => (
                <span className="truncate block" title={text || ''}>
                    {text || '—'}
                </span>
            ),
        },
        {
            title: 'Serial',
            dataIndex: 'serial',
            key: 'serial',
            width: '100px',
            render: (text) => (
                <span className="block" style={{ whiteSpace: 'pre-line' }} title={text || ''}>
                    {(text || '—').replace('/', '\n')}
                </span>
            ),
        },
        {
            title: 'Điện áp',
            dataIndex: 'voltage',
            key: 'voltage',
            align: 'center',
            width: '100px',
            render: (value) => (value ? `${value}V` : '—'),
        },
        ...(hasComponentElectricPower
            ? [
                  {
                      title: 'CS điện',
                      dataIndex: 'electricPower',
                      key: 'electricPower',
                      align: 'center',
                      width: '100px',
                      render: (value) => (value ? `${value}kW` : '—'),
                  },
              ]
            : []),
        {
            title: 'BĐ SX',
            dataIndex: 'productionStartTime',
            key: 'productionStartTime',
            width: '100px',
            align: 'center',
            render: (text) => text || '—',
        },
        {
            title: 'Ngày xuất',
            dataIndex: 'dispatchTime',
            key: 'dispatchTime',
            width: '100px',
            align: 'center',
            render: (text) => text || '—',
        },
        {
            title: 'Loại máy',
            dataIndex: ['machineType', 'name'],
            key: 'machineType',
            width: '100px',
            render: (text) =>
                text ? (
                    <Tag color="blue" className="truncate block max-w-full" title={text}>
                        {text}
                    </Tag>
                ) : (
                    '—'
                ),
            onCell: getGroupedCellProps,
        },
        {
            title: 'Số máy',
            dataIndex: 'machineNo',
            key: 'machineNo',
            align: 'center',
            width: '100px',
            render: (value) => value || '—',
            onCell: getGroupedCellProps,
        },
        {
            title: 'Công suất',
            dataIndex: 'capacityTon',
            key: 'capacityTon',
            width: '100px',
            align: 'center',
            render: (text) => (text ? `${text}T` : '—'),
            onCell: getGroupedCellProps,
        },
        {
            title: 'Vít',
            dataIndex: 'screw',
            key: 'screw',
            width: '100px',
            align: 'center',
            render: (value) => (value ? `${value}` : '—'),
            onCell: getGroupedCellProps,
        },
        ...(!hasComponentElectricPower
            ? [
                  {
                      title: 'TCS điện',
                      dataIndex: 'totalElectricPower',
                      key: 'totalElectricPower',
                      width: '100px',
                      align: 'center',
                      render: (text) => (
                          <span title={text || ''} className="truncate block">
                              {text ? `${text}` : '—'}
                          </span>
                      ),
                      onCell: getGroupedCellProps,
                  },
              ]
            : []),
        {
            title: 'Vị trí',
            dataIndex: 'position',
            key: 'position',
            width: '100px',
            render: (text) => (
                <span className="truncate block" title={text || ''}>
                    {text || <span className="text-slate-400">—</span>}
                </span>
            ),
            onCell: getGroupedCellProps,
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: '100px',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => {
                                const machine = machines.find((m) => m.id === record.machineId);
                                if (machine) openEditModal(machine);
                            }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa máy"
                        description={`Bạn có chắc muốn xóa máy ${record.code}?`}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true, loading: deletingId === record.machineId }}
                        onConfirm={() => {
                            const machine = machines.find((m) => m.id === record.machineId);
                            if (machine) handleDelete(machine);
                        }}
                    >
                        <Tooltip title="Xóa">
                            <Button
                                danger
                                type="text"
                                icon={<DeleteOutlined />}
                                loading={deletingId === record.machineId}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
            onCell: getGroupedCellProps,
        },
    ];

    return (
        <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div className="text-sm text-slate-500">Danh sách máy</div>
                    <div className="text-lg font-semibold text-slate-800 dark:text-white">Quản lý máy sản xuất</div>
                </div>
                <Button icon={<PlusCircleOutlined />} type="primary" onClick={openCreateModal}>
                    Thêm máy
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
                    <div className="text-xs text-slate-500">Máy trong trang hiện tại</div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">{filteredMachines.length}</div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
                    <div className="text-xs text-slate-500">Tổng số máy</div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">{pagination.total}</div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
                    <div className="text-xs text-slate-500">Loại máy</div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {filterMachineTypeId
                            ? machineTypeOptions.find((m) => m.value === filterMachineTypeId)?.label || 'Không xác định'
                            : 'Tất cả'}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                <div className="flex flex-wrap gap-3 mb-4">
                    <Input
                        allowClear
                        prefix={<SearchOutlined className="text-slate-400" />}
                        placeholder="Tìm theo mã máy, số máy, vị trí"
                        className="w-full md:w-80"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <Select
                        allowClear
                        className="w-full md:w-64"
                        placeholder="Lọc theo loại máy"
                        options={machineTypeOptions}
                        value={filterMachineTypeId}
                        onChange={(value) => setFilterMachineTypeId(value)}
                    />
                </div>
                <Table
                    rowKey="key"
                    loading={loading}
                    columns={columns}
                    dataSource={flattenedRows}
                    pagination={false}
                    bordered
                    size="middle"
                    scroll={{ x: 'max-content' }}
                    locale={{ emptyText: keyword || filterMachineTypeId ? 'Không có dữ liệu phù hợp' : 'Chưa có máy' }}
                    className="[&_.ant-table-cell]:!px-2 [&_.ant-table-thead_.ant-table-cell]:!text-xs [&_.machine-group-separator]:!border-t-2 [&_.machine-group-separator]:!border-t-blue-400"
                    rowClassName={(record) => (record.isFirstRow ? 'machine-group-separator' : '')}
                />

                <div className="mt-4 flex justify-end">
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        showSizeChanger
                        pageSizeOptions={['10', '20', '50', '100']}
                        showTotal={(total, range) => `${range[0]}-${range[1]} / ${total} máy`}
                        onChange={handlePageChange}
                        onShowSizeChange={handlePageChange}
                    />
                </div>
            </div>

            <Modal
                title={editingItem ? 'Cập nhật máy' : 'Thêm máy'}
                open={isModalOpen}
                onCancel={closeModal}
                onOk={handleSubmit}
                okText="Lưu"
                cancelText="Hủy"
                width={1400}
                confirmLoading={submitting}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" preserve={false}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Form.Item name="code" label="Mã máy" rules={[{ required: true, message: 'Nhập mã máy' }]}>
                            <Input placeholder="MAY-001" />
                        </Form.Item>
                        <Form.Item
                            name="machineTypeId"
                            label="Loại máy"
                            rules={[{ required: true, message: 'Chọn loại máy' }]}
                        >
                            <Select
                                options={machineTypeOptions}
                                placeholder="Chọn loại máy"
                                showSearch
                                optionFilterProp="label"
                            />
                        </Form.Item>
                        <Form.Item name="machineSpecificationId" label="Spec máy">
                            <Select
                                allowClear
                                options={machineSpecificationOptions}
                                placeholder="Chọn spec máy"
                                showSearch
                                optionFilterProp="label"
                            />
                        </Form.Item>
                        <Form.Item name="machineNo" label="Số máy">
                            <InputNumber className="w-full" min={1} placeholder="Nhập số máy" />
                        </Form.Item>
                        <Form.Item name="capacityTon" label="Công suất (Ton)">
                            <Input placeholder="VD: 120" />
                        </Form.Item>
                        <Form.Item name="totalElectricPower" label="Tổng công suất điện">
                            <Input placeholder="VD: 6.8 kW" />
                        </Form.Item>
                        <Form.Item name="screw" label="Screw">
                            <InputNumber className="w-full" min={0} placeholder="Nhập screw" />
                        </Form.Item>
                        <Form.Item name="position" label="Vị trí">
                            <AutoComplete
                                allowClear
                                placeholder="Chọn hoặc nhập vị trí"
                                options={detailFieldOptions.position}
                                filterOption={(inputValue, option) =>
                                    (option?.label || '').toLowerCase().includes(inputValue.toLowerCase())
                                }
                            >
                                <Input loading={loadingDistinctOptions} />
                            </AutoComplete>
                        </Form.Item>
                        <Form.Item name="dimension" label="Kích thước">
                            <Input placeholder="1000x700x900" />
                        </Form.Item>
                    </div>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={2} placeholder="Mô tả máy..." />
                    </Form.Item>

                    <Form.List name="machineDetails">
                        {(fields, { add, remove }) => (
                            <MachineDetailFormTable
                                fields={fields}
                                add={add}
                                remove={remove}
                                detailFieldOptions={detailFieldOptions}
                                loadingDistinctOptions={loadingDistinctOptions}
                            />
                        )}
                    </Form.List>
                </Form>
            </Modal>
        </div>
    );
};

export default MachineListTab;
