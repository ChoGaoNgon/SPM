import { Button, Card, Form, Modal, message } from 'antd';
import { Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchDepartments } from '~/modules/mail/services/departmentHelper';
import mailAddressService from '~/modules/mail/services/mailAddressService';
import MailModal from '../components/MailModal';
import MailTable from '../components/MailTable';

const MailAddressPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingRecord, setEditingRecord] = useState(null);
    const [departments, setDepartments] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const list = await mailAddressService.getAllMailAddresses();
            setData((list || []).map((item) => ({ key: item.id, ...item })));
        } catch (err) {
            message.error(err.message || 'Lỗi tải danh sách địa chỉ mail');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        (async () => {
            const deps = await fetchDepartments();
            setDepartments(deps);
        })();
    }, []);

    const openCreate = () => {
        setEditingRecord(null);
        form.resetFields();
        form.setFieldsValue({ active: true });
        setModalOpen(true);
    };

    const openEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue({
            email: record.email,
            displayName: record.displayName,
            departmentId: record.departmentId,
            active: record.active,
        });
        setModalOpen(true);
    };

    const handleDelete = async (record) => {
        Modal.confirm({
            title: 'Xóa địa chỉ mail?',
            content: `Bạn có chắc muốn xóa ${record.email}?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await mailAddressService.deleteMailAddress(record.id);
                    message.success('Xóa địa chỉ mail thành công');
                    fetchData();
                } catch (err) {
                    message.error(err.message || 'Lỗi khi xóa địa chỉ mail');
                }
            },
        });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingRecord) {
                await mailAddressService.updateMailAddress(editingRecord.id, values);
                message.success('Cập nhật địa chỉ mail thành công');
            } else {
                await mailAddressService.createMailAddress(values);
                message.success('Thêm địa chỉ mail thành công');
            }
            setModalOpen(false);
            form.resetFields();
            fetchData();
        } catch (err) {
            if (err?.errorFields) return;
            message.error(err.message || 'Lỗi khi lưu địa chỉ mail');
        }
    };

    return (
        <>
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Mail size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Quản lý địa chỉ mail</h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Quản lý các địa chỉ mail dùng để gửi thông báo cho nhân viên và bộ phận
                        </p>
                    </div>
                </div>
            </div>
            <Card
                title="Quản lý địa chỉ Mail"
                extra={
                    <Button type="primary" onClick={openCreate}>
                        Thêm mới
                    </Button>
                }
            >
                <MailTable data={data} loading={loading} onEdit={openEdit} onDelete={handleDelete} />
                <MailModal
                    open={modalOpen}
                    editingRecord={editingRecord}
                    form={form}
                    departments={departments}
                    onCancel={() => setModalOpen(false)}
                    onSubmit={handleSubmit}
                />
            </Card>
        </>
    );
};

export default MailAddressPage;
