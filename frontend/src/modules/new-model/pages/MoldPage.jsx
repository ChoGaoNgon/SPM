import { DeleteOutlined, EditOutlined, ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons';
import { Button, Input, message, Modal, Space, Table } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import MoldFormModal from '../components/modal/MoldFormModal';
import moldService from '../services/moldService';

const { confirm } = Modal;

const MoldPage = () => {
    const [molds, setMolds] = useState([]);
    const [filteredMolds, setFilteredMolds] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');

    const loadMolds = async () => {
        try {
            const data = await moldService.getAllMolds(searchKeyword);
            setMolds(Array.isArray(data) ? data : []);
            setFilteredMolds(Array.isArray(data) ? data : []);
        } catch (error) {
            message.error(error.message);
        }
    };

    useEffect(() => {
        loadMolds();
    }, []);

    const handleAdd = () => {
        setEditingRecord(null);
        setOpenModal(true);
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        setOpenModal(true);
    };

    const handleDelete = (record) => {
        confirm({
            title: 'Bạn có chắc chắn muốn xóa khuôn này?',
            icon: <ExclamationCircleFilled />,
            content: `Mã khuôn: ${record.code}`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            async onOk() {
                try {
                    await moldService.deleteMold(record.id);
                    message.success('Xóa khuôn thành công');
                    loadMolds();
                } catch (error) {
                    message.error(error.message);
                }
            },
        });
    };

    const handleSubmit = async (values) => {
        setModalLoading(true);
        try {
            const formattedValues = {
                ...values,
                expectedStartDate: values.expectedStartDate
                    ? dayjs(values.expectedStartDate).format('YYYY-MM-DD[T]00:00:00')
                    : null,
                expectedEndDate: values.expectedEndDate
                    ? dayjs(values.expectedEndDate).format('YYYY-MM-DD[T]00:00:00')
                    : null,
                actualStartDate: values.actualStartDate
                    ? dayjs(values.actualStartDate).format('YYYY-MM-DD[T]00:00:00')
                    : null,
                actualEndDate: values.actualEndDate
                    ? dayjs(values.actualEndDate).format('YYYY-MM-DD[T]00:00:00')
                    : null,
            };

            if (editingRecord) {
                await moldService.updateMold(editingRecord.id, formattedValues);
                message.success('Cập nhật thành công');
            } else {
                await moldService.createMold(formattedValues);
                message.success('Tạo mới thành công');
            }
            setOpenModal(false);
            loadMolds();
        } catch (err) {
            message.error(err.message);
        } finally {
            setModalLoading(false);
        }
    };

    const handleSearch = (value) => {
        setSearchKeyword(value);
        if (!value) {
            setFilteredMolds(molds);
        } else {
            const keyword = value.toLowerCase();
            setFilteredMolds(
                molds.filter((m) => m.code?.toLowerCase().includes(keyword) || m.type?.toLowerCase().includes(keyword)),
            );
        }
    };

    const columns = [
        { title: 'STT', render: (_, __, index) => index + 1, width: 60, align: 'center' },
        { title: 'Mã khuôn', dataIndex: 'code', width: 120 },
        { title: 'Loại khuôn', dataIndex: 'type', width: 120 },
        { title: 'Nhà máy', dataIndex: 'factory', width: 120 },
        {
            title: 'Ngày dự kiến bắt đầu',
            dataIndex: 'expectedStartDate',
            render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : ''),
            width: 140,
        },
        {
            title: 'Ngày dự kiến kết thúc',
            dataIndex: 'expectedEndDate',
            render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : ''),
            width: 140,
        },
        { title: 'Số lần sửa', dataIndex: 'numRepair', width: 100, align: 'center' },
        {
            title: 'Hành động',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        Sửa
                    </Button>
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
                        Xóa
                    </Button>
                </Space>
            ),
            width: 150,
            fixed: 'right',
        },
    ];

    return (
        <div>
            <Space
                style={{
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    flexWrap: 'wrap',
                }}
            >
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm mới khuôn
                </Button>

                <Input.Search
                    allowClear
                    placeholder="Tìm theo mã hoặc loại khuôn..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onSearch={(value) => handleSearch(value)}
                    style={{ width: 250 }}
                />
            </Space>

            <Table
                columns={columns}
                dataSource={filteredMolds}
                rowKey="id"
                scroll={{ x: 'max-content', y: 500 }}
                pagination={false}
                bordered
            />

            <MoldFormModal
                open={openModal}
                onCancel={() => setOpenModal(false)}
                onSubmit={handleSubmit}
                loading={modalLoading}
                initialValues={editingRecord}
            />
        </div>
    );
};

export default MoldPage;
