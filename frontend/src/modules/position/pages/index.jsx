import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Popconfirm, Space, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';
import positionService from '~/modules/position/services/positionService';

const { Title } = Typography;

function PositionManagerPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const dataPositions = await positionService.getAllPositions();
            setPositions(dataPositions);
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = () => {
        setEditingRecord(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            const msg = await positionService.deletePosition(id);
            message.success(msg);
            fetchData();
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            if (editingRecord) {
                await positionService.updatePosition(editingRecord.id, values);
                message.success('Cập nhật thành công!');
            } else {
                await positionService.createPosition(values);
                message.success('Thêm mới thành công!');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            message.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        {
            title: <span className="font-semibold text-slate-700 dark:text-slate-200">STT</span>,
            render: (_, __, index) => (
                <span className="font-medium text-slate-600 dark:text-slate-300">{index + 1}</span>
            ),
            align: 'center',
            width: 80,
        },
        {
            title: <span className="font-semibold text-slate-700 dark:text-slate-200">Mã chức vụ</span>,
            dataIndex: 'code',
            align: 'center',
            width: 150,
            render: (text) => (
                <span className="inline-block font-mono text-sm font-semibold text-accent-600 dark:text-accent-400 px-3 py-1.5 bg-accent-50 dark:bg-accent-900/20 rounded-lg border border-accent-200 dark:border-accent-800">
                    {text}
                </span>
            ),
        },
        {
            title: <span className="font-semibold text-slate-700 dark:text-slate-200">Tên chức vụ</span>,
            dataIndex: 'name',
            render: (text) => <span className="text-slate-800 dark:text-slate-100 font-medium">{text}</span>,
        },
        {
            title: <span className="font-semibold text-slate-700 dark:text-slate-200">Cấp bậc</span>,
            dataIndex: 'level',
            align: 'center',
            width: 120,
            render: (level) => {
                const getLevelStyle = (lvl) => {
                    if (lvl <= 3) {
                        return {
                            bg: 'bg-accent-600 dark:bg-accent-700',
                            border: 'border-accent-700 dark:border-accent-600',
                            text: 'text-white',
                        };
                    } else if (lvl <= 6) {
                        return {
                            bg: 'bg-slate-600 dark:bg-slate-700',
                            border: 'border-slate-700 dark:border-slate-600',
                            text: 'text-white',
                        };
                    } else {
                        return {
                            bg: 'bg-slate-400 dark:bg-slate-500',
                            border: 'border-slate-500 dark:border-slate-400',
                            text: 'text-white',
                        };
                    }
                };

                const style = getLevelStyle(level);

                return (
                    <div className="flex items-center justify-center">
                        <div
                            className={`inline-flex items-center justify-center w-10 h-10 ${style.bg} ${style.text} rounded-lg border-2 ${style.border} shadow-sm hover:shadow-md transition-all duration-200`}
                        >
                            <span className="font-bold text-lg">{level}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            title: <span className="font-semibold text-slate-700 dark:text-slate-200">Hành động</span>,
            align: 'center',
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        className="text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium transition-all duration-200"
                    ></Button>
                    <Popconfirm
                        title={
                            <span className="font-semibold text-slate-800 dark:text-slate-100">Xóa chức vụ này?</span>
                        }
                        description={<span className="text-slate-600 dark:text-slate-300">Bạn có chắc muốn xóa?</span>}
                        okText="Xóa"
                        cancelText="Hủy"
                        okType="danger"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            className="font-medium transition-all duration-200"
                        ></Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="min-h-screen  dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white dark:bg-dark-secondary rounded-2xl shadow-xl dark:shadow-dark-lg p-6 mb-6 border border-slate-200 dark:border-dark transition-all duration-300">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 dark:from-accent-600 dark:to-accent-700 rounded-xl flex items-center justify-center shadow-lg">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <Title level={3} className="!mb-1 !text-slate-800 dark:!text-slate-100">
                                    Quản lý chức vụ
                                </Title>
                                <p className="text-sm text-slate-500 dark:text-slate-400 m-0">
                                    Tổng số:{' '}
                                    <span className="font-semibold text-accent-600 dark:text-accent-400">
                                        {positions.length}
                                    </span>{' '}
                                    chức vụ
                                </p>
                            </div>
                        </div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                            size="large"
                            className="!bg-gradient-to-r !from-accent-500 !to-accent-600 dark:!from-accent-600 dark:!to-accent-700 !border-0 !rounded-xl hover:!shadow-lg hover:!scale-105 !transition-all !duration-300 !font-semibold"
                        >
                            Thêm chức vụ
                        </Button>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-secondary rounded-2xl shadow-xl dark:shadow-dark-lg overflow-hidden border border-slate-200 dark:border-dark transition-all duration-300 hidden md:block">
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={positions}
                        pagination={false}
                        loading={loading}
                        bordered
                        className="custom-table hidden md:block"
                        rowClassName="hover:bg-accent-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                    />
                </div>

                <div className="block md:hidden space-y-3 mb-4">
                    {positions.map((pos) => (
                        <div
                            key={pos.id}
                            className="rounded-xl border border-border shadow-sm
                       bg-white dark:bg-slate-800"
                        >
                            <div className="flex justify-between items-start p-4">
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{pos.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Mã: {pos.code}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Cấp bậc:
                                        <span className="font-semibold ml-1">{pos.level}</span>
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(pos)}
                                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                                    >
                                        <EditOutlined className="text-slate-700 dark:text-slate-300" />
                                    </button>

                                    <Popconfirm
                                        title="Xóa chức vụ?"
                                        okText="Xóa"
                                        cancelText="Hủy"
                                        okType="danger"
                                        onConfirm={() => handleDelete(pos.id)}
                                    >
                                        <button className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">
                                            <DeleteOutlined className="text-red-500" />
                                        </button>
                                    </Popconfirm>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-700 p-3">
                                <span
                                    className="px-3 py-1 rounded-lg text-xs font-semibold
                               bg-slate-100 dark:bg-slate-700
                               text-slate-700 dark:text-slate-200"
                                >
                                    Level: {pos.level}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Modal
                title={
                    <div className="flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 dark:from-accent-600 dark:to-accent-700 rounded-lg flex items-center justify-center">
                            {editingRecord ? (
                                <EditOutlined className="text-white text-lg" />
                            ) : (
                                <PlusOutlined className="text-white text-lg" />
                            )}
                        </div>
                        <span className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                            {editingRecord ? 'Chỉnh sửa chức vụ' : 'Thêm chức vụ mới'}
                        </span>
                    </div>
                }
                open={isModalOpen}
                onOk={handleSave}
                onCancel={() => setIsModalOpen(false)}
                okText="Lưu"
                cancelText="Hủy"
                confirmLoading={saving}
                width={600}
                className="custom-modal"
                okButtonProps={{
                    className:
                        '!bg-gradient-to-r !from-accent-500 !to-accent-600 dark:!from-accent-600 dark:!to-accent-700 !border-0 !rounded-lg hover:!shadow-lg !transition-all !duration-300',
                }}
                cancelButtonProps={{
                    className:
                        '!border-slate-300 dark:!border-slate-600 !text-slate-700 dark:!text-slate-300 !rounded-lg hover:!border-slate-400 dark:hover:!border-slate-500 !transition-all !duration-300',
                }}
            >
                <Form form={form} layout="vertical" className="mt-6">
                    <Form.Item
                        label={<span className="font-semibold text-slate-700 dark:text-slate-200">Mã chức vụ</span>}
                        name="code"
                        rules={[{ required: true, message: 'Vui lòng nhập mã chức vụ!' }]}
                    >
                        <Input
                            placeholder="Nhập mã chức vụ (VD: CV001)"
                            className="!rounded-lg !border-slate-300 dark:!border-slate-600 dark:!bg-dark-tertiary dark:!text-slate-100 !py-2 hover:!border-accent-500 focus:!border-accent-500 dark:hover:!border-accent-400 dark:focus:!border-accent-400 !transition-all !duration-300"
                        />
                    </Form.Item>
                    <Form.Item
                        label={<span className="font-semibold text-slate-700 dark:text-slate-200">Tên chức vụ</span>}
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên chức vụ!' }]}
                    >
                        <Input
                            placeholder="Nhập tên chức vụ (VD: Giám đốc)"
                            className="!rounded-lg !border-slate-300 dark:!border-slate-600 dark:!bg-dark-tertiary dark:!text-slate-100 !py-2 hover:!border-accent-500 focus:!border-accent-500 dark:hover:!border-accent-400 dark:focus:!border-accent-400 !transition-all !duration-300"
                        />
                    </Form.Item>
                    <Form.Item
                        label={<span className="font-semibold text-slate-700 dark:text-slate-200">Cấp bậc</span>}
                        name="level"
                        rules={[{ required: true, message: 'Vui lòng nhập cấp bậc!' }]}
                    >
                        <Input
                            type="number"
                            placeholder="Nhập cấp bậc (VD: 1, 2, 3...)"
                            className="!rounded-lg !border-slate-300 dark:!border-slate-600 dark:!bg-dark-tertiary dark:!text-slate-100 !py-2 hover:!border-accent-500 focus:!border-accent-500 dark:hover:!border-accent-400 dark:focus:!border-accent-400 !transition-all !duration-300"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <style jsx>{`
                .custom-table .ant-table {
                    background: transparent;
                }
                .custom-table .ant-table-thead > tr > th {
                    background: linear-gradient(to right, #f8fafc, #f1f5f9);
                    border-bottom: 2px solid #e2e8f0;
                    font-weight: 600;
                    padding: 16px;
                }
                .dark .custom-table .ant-table-thead > tr > th {
                    background: linear-gradient(to right, #334155, #1e293b);
                    border-bottom: 2px solid #334155;
                    color: #e2e8f0;
                }
                .custom-table .ant-table-tbody > tr > td {
                    padding: 16px;
                    border-bottom: 1px solid #f8fafc;
                }
                .dark .custom-table .ant-table-tbody > tr > td {
                    border-bottom: 1px solid #334155;
                    background: transparent;
                    color: #e2e8f0;
                }
                .custom-table .ant-table-tbody > tr:hover > td {
                    background: #eef2ff !important;
                }
                .dark .custom-table .ant-table-tbody > tr:hover > td {
                    background: rgba(51, 65, 81, 0.5) !important;
                }
                .ant-modal-content {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                }
                .dark .ant-modal-content {
                    background: #1e293b;
                }
                .dark .ant-modal-header {
                    background: #1e293b;
                    border-bottom-color: #334155;
                }
                .dark .ant-form-item-label > label {
                    color: #e2e8f0;
                }
            `}</style>
        </div>
    );
}

export default PositionManagerPage;
