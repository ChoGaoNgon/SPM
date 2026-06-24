import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, message, Modal, Popconfirm, Space, Switch, Table, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import PageHeader from '~/components/PageHeader';
import { Calendar } from 'lucide-react';
import shiftPatternService from '~/services/shiftPatternService';

const ShiftPatternManagement = () => {
    const [form] = Form.useForm();
    const [patterns, setPatterns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPattern, setEditingPattern] = useState(null);

    useEffect(() => {
        fetchPatterns();
    }, []);

    const fetchPatterns = async () => {
        setLoading(true);
        try {
            const data = await shiftPatternService.getAllShiftPatterns();
            setPatterns(data || []);
        } catch (error) {
            message.error(error.message || 'Lỗi tải danh sách mẫu ca');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingPattern(null);
        form.resetFields();
        form.setFieldsValue({ isActive: true, displayOrder: 0 });
        setModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingPattern(record);
        form.setFieldsValue(record);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await shiftPatternService.deleteShiftPattern(id);
            message.success('Xóa mẫu ca thành công');
            fetchPatterns();
        } catch (error) {
            message.error(error.message || 'Lỗi xóa mẫu ca');
        }
    };

    const handleToggleActive = async (id) => {
        try {
            await shiftPatternService.toggleActiveStatus(id);
            message.success('Thay đổi trạng thái thành công');
            fetchPatterns();
        } catch (error) {
            message.error(error.message || 'Lỗi thay đổi trạng thái');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingPattern) {
                await shiftPatternService.updateShiftPattern(editingPattern.id, values);
                message.success('Cập nhật mẫu ca thành công');
            } else {
                await shiftPatternService.createShiftPattern(values);
                message.success('Thêm mẫu ca thành công');
            }
            setModalOpen(false);
            fetchPatterns();
        } catch (error) {
            if (error.errorFields) {
                message.error('Vui lòng kiểm tra lại thông tin');
            } else {
                message.error(error.message || 'Lỗi lưu mẫu ca');
            }
        }
    };

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            align: 'center',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
            width: 120,
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Tên mẫu ca',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
        },
        {
            title: 'Pattern',
            dataIndex: 'pattern',
            key: 'pattern',
            width: 150,
            render: (text) => (
                <code style={{ fontSize: '12px', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                    {text}
                </code>
            ),
        },
        {
            title: 'Ca mặc định',
            dataIndex: 'defaultShift',
            key: 'defaultShift',
            width: 120,
            render: (text) => <Tag color="green">{text}</Tag>,
        },
        {
            title: 'Thứ tự',
            dataIndex: 'displayOrder',
            key: 'displayOrder',
            width: 80,
            align: 'center',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
            align: 'center',
            render: (isActive, record) => (
                <Switch
                    checked={isActive}
                    onChange={() => handleToggleActive(record.id)}
                    checkedChildren="Hiện"
                    unCheckedChildren="Ẩn"
                />
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small">
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc muốn xóa mẫu ca này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="link" danger icon={<DeleteOutlined />} size="small">
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div >
            <PageHeader title="Quản lý mẫu ca làm việc" icon={Calendar} />

            <Card
                extra={
                    <Space>
                        <Button icon={<SyncOutlined />} onClick={fetchPatterns} loading={loading}>
                            Làm mới
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                            Thêm mẫu ca
                        </Button>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={patterns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 20,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} mẫu ca`,
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            <Modal
                title={editingPattern ? 'Chỉnh sửa mẫu ca' : 'Thêm mẫu ca mới'}
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={() => setModalOpen(false)}
                width={600}
                okText={editingPattern ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item
                        name="code"
                        label="Mã mẫu ca"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã mẫu ca' },
                            { max: 20, message: 'Mã không được quá 20 ký tự' },
                        ]}
                    >
                        <Input placeholder="VD: HCT1, KO_42, C1..." />
                    </Form.Item>

                    <Form.Item
                        name="name"
                        label="Tên mẫu ca"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên mẫu ca' },
                            { max: 100, message: 'Tên không được quá 100 ký tự' },
                        ]}
                    >
                        <Input placeholder="VD: Hành chính trực tiếp, Kíp ngày 4-2..." />
                    </Form.Item>

                    <Form.Item
                        name="pattern"
                        label="Pattern (Chu kỳ)"
                        rules={[
                            { required: true, message: 'Vui lòng nhập pattern' },
                            {
                                pattern: /^[01]+$/,
                                message: 'Pattern chỉ chứa số 0 hoặc 1',
                            },
                        ]}
                        tooltip="Chuỗi gồm 0 và 1. VD: 1111110 = làm 6 ngày nghỉ 1, 111100 = làm 4 ngày nghỉ 2"
                    >
                        <Input placeholder="VD: 1111110, 111100, 1..." />
                    </Form.Item>

                    <Form.Item
                        name="defaultShift"
                        label="Mã ca mặc định"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã ca mặc định' },
                            { max: 20, message: 'Mã ca không được quá 20 ký tự' },
                        ]}
                        tooltip="Mã ca sẽ được áp dụng khi sử dụng mẫu này. VD: HCT1, KO, KD, C1..."
                    >
                        <Input placeholder="VD: HCT1, KO, KD, C1..." />
                    </Form.Item>

                    <Form.Item
                        name="displayOrder"
                        label="Thứ tự hiển thị"
                        rules={[{ required: true, message: 'Vui lòng nhập thứ tự' }]}
                        tooltip="Số càng nhỏ hiển thị càng trước"
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                        <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ShiftPatternManagement;
