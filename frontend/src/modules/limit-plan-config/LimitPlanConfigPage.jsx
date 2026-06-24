import { Settings2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Space, Table, Tag, message } from 'antd';
import { EditOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import PageHeader from '~/components/PageHeader';
import { PLAN_TYPE_LABELS, PLAN_TYPES } from '~/constants/planTypes';
import departmentService from '~/modules/department/services/departmentService';
import limitPlanConfigService from './limitConfigPageService';

const flattenDepartments = (departments = []) => {
    return departments.reduce((acc, department) => {
        acc.push(department);
        const children = department.children || department.subDepartments || department.subs || department.sub || [];
        if (children.length > 0) {
            acc.push(...flattenDepartments(children));
        }
        return acc;
    }, []);
};

const SCOPE_TYPE_OPTIONS = [
    { label: 'Toàn công ty', value: 'COMPANY' },
    { label: 'Phòng ban', value: 'DEPARTMENT' },
];

const SCOPE_TYPE_MAP = {
    COMPANY: 'Toàn công ty',
    DEPARTMENT: 'Phòng ban',
};

const LimitPlanConfigPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [creatingDefault, setCreatingDefault] = useState(false);
    const [saving, setSaving] = useState(false);
    const [allConfigs, setAllConfigs] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    const departmentMap = useMemo(
        () =>
            departments.reduce((acc, item) => {
                acc[item.id] = item.name;
                return acc;
            }, {}),
        [departments],
    );

    const getDepartmentName = (departmentId) => {
        if (!departmentId) {
            return 'Toàn công ty';
        }
        return departmentMap[departmentId] || `Phòng ban #${departmentId}`;
    };

    const moldTrialConfigs = useMemo(
        () => (Array.isArray(allConfigs) ? allConfigs.filter((item) => item?.typePlan === PLAN_TYPES.MOLD_TRIAL) : []),
        [allConfigs],
    );

    const filteredConfigs = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();
        if (!keyword) {
            return moldTrialConfigs;
        }

        return moldTrialConfigs.filter((item) => {
            const scopeText = SCOPE_TYPE_MAP[item.scopeType]?.toLowerCase() || item.scopeType?.toLowerCase() || '';
            const departmentText = getDepartmentName(item.departmentId).toLowerCase();
            const typePlanText = PLAN_TYPE_LABELS[item.typePlan]?.toLowerCase() || item.typePlan?.toLowerCase() || '';
            const maxPlanText = String(item.maxPlan || '');

            return (
                scopeText.includes(keyword) ||
                departmentText.includes(keyword) ||
                typePlanText.includes(keyword) ||
                maxPlanText.includes(keyword)
            );
        });
    }, [moldTrialConfigs, searchText, departmentMap]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [configs, rootDepartments] = await Promise.all([
                limitPlanConfigService.getAllLimitPlanConfigs(),
                departmentService.getRootDepartments(),
            ]);

            setAllConfigs(Array.isArray(configs) ? configs : []);
            setDepartments(flattenDepartments(Array.isArray(rootDepartments) ? rootDepartments : []));
        } catch (error) {
            message.error(error.message || 'Không thể tải dữ liệu cấu hình giới hạn');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateDefaultByDepartment = () => {
        Modal.confirm({
            title: 'Khởi tạo cấu hình giới hạn theo phòng ban',
            content:
                'Hệ thống sẽ lấy toàn bộ phòng ban và tự động tạo cấu hình mặc định cho những phòng ban chưa có giới hạn thử khuôn.',
            okText: 'Khởi tạo',
            cancelText: 'Hủy',
            onOk: async () => {
                setCreatingDefault(true);
                try {
                    await limitPlanConfigService.createLimitPlanConfigByAllDepartment();
                    message.success('Khởi tạo cấu hình theo phòng ban thành công');
                    await fetchData();
                } catch (error) {
                    message.error(error.message || 'Khởi tạo cấu hình thất bại');
                } finally {
                    setCreatingDefault(false);
                }
            },
        });
    };

    const handleOpenEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue({
            scopeType: SCOPE_TYPE_MAP[record.scopeType] || record.scopeType,
            departmentName: getDepartmentName(record.departmentId),
            typePlan: PLAN_TYPE_LABELS[record.typePlan] || record.typePlan,
            maxPlan: record.maxPlan,
        });
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingRecord(null);
        form.resetFields();
    };

    const handleSave = async (values) => {
        if (!editingRecord?.id) {
            return;
        }

        setSaving(true);
        try {
            await limitPlanConfigService.updateLimitPlanConfig(editingRecord.id, {
                scopeType: editingRecord.scopeType,
                departmentId: editingRecord.departmentId,
                typePlan: editingRecord.typePlan,
                maxPlan: values.maxPlan,
            });
            message.success('Cập nhật giới hạn thành công');
            handleCloseModal();
            await fetchData();
        } catch (error) {
            message.error(error.message || 'Cập nhật giới hạn thất bại');
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        {
            title: 'STT',
            width: 70,
            align: 'center',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Phạm vi',
            dataIndex: 'scopeType',
            width: 150,
            align: 'center',
            filters: SCOPE_TYPE_OPTIONS,
            onFilter: (value, record) => record.scopeType === value,
            render: (scopeType) => (
                <Tag color={scopeType === 'DEPARTMENT' ? 'blue' : 'purple'}>
                    {SCOPE_TYPE_MAP[scopeType] || scopeType}
                </Tag>
            ),
        },
        {
            title: 'Phòng ban',
            dataIndex: 'departmentId',
            render: (departmentId) => getDepartmentName(departmentId),
        },
        {
            title: 'Loại kế hoạch',
            dataIndex: 'typePlan',
            width: 150,
            render: (typePlan) => PLAN_TYPE_LABELS[typePlan] || typePlan,
        },
        {
            title: 'Giới hạn tối đa',
            dataIndex: 'maxPlan',
            width: 150,
            align: 'center',
            sorter: (a, b) => (a.maxPlan || 0) - (b.maxPlan || 0),
            render: (maxPlan) => <Tag color="gold">{maxPlan}</Tag>,
        },
        {
            title: 'Thao tác',
            width: 110,
            align: 'center',
            render: (_, record) => (
                <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)}>
                    Sửa
                </Button>
            ),
        },
    ];

    return (
        <>
            <PageHeader
                title="Cấu hình giới hạn kế hoạch Thử khuôn"
                icon={Settings2}
                description={'Điều chỉnh giới hạn thử khuôn hàng ngày theo phòng ban'}
            />

            <div className="mb-4 flex justify-between items-center gap-3 flex-wrap">
                <Input
                    placeholder="Tìm theo phòng ban / phạm vi / limit..."
                    allowClear
                    value={searchText}
                    prefix={<SearchOutlined />}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 360 }}
                />

                <Space>
                    <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
                        Làm mới
                    </Button>
                    <Button type="primary" onClick={handleCreateDefaultByDepartment} loading={creatingDefault}>
                        Khởi tạo theo phòng ban
                    </Button>
                </Space>
            </div>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={filteredConfigs}
                loading={loading}
                pagination={false}
                scroll={{ x: 900 }}
            />

            <Modal
                title="Cập nhật giới hạn thử khuôn"
                open={openModal}
                onCancel={handleCloseModal}
                onOk={() => form.submit()}
                confirmLoading={saving}
                okText="Lưu"
                cancelText="Hủy"
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="scopeType" label="Phạm vi">
                        <Input disabled />
                    </Form.Item>

                    <Form.Item name="departmentName" label="Phòng ban">
                        <Input disabled />
                    </Form.Item>

                    <Form.Item name="typePlan" label="Loại kế hoạch">
                        <Input disabled />
                    </Form.Item>

                    <Form.Item
                        name="maxPlan"
                        label="Giới hạn tối đa"
                        rules={[
                            { required: true, message: 'Vui lòng nhập giới hạn tối đa' },
                            { type: 'number', min: 1, message: 'Giới hạn tối đa phải lớn hơn hoặc bằng 1' },
                        ]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="Nhập giới hạn tối đa" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default LimitPlanConfigPage;
