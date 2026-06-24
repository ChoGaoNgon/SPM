import { CheckOutlined, DeleteOutlined, PlusOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Input, message, Modal, Row, Select, Table } from 'antd';
import { useEffect, useRef, useState } from 'react';
import authService from '~/modules/auth/services/authService';
import employeeService from '~/modules/employee/services/employeeService';
import overtimeService from '../../services/overtimeService';
const { TimePicker } = DatePicker;

const OvertimePlanningModal = ({ open, onCancel }) => {
    const [rows, setRows] = useState([]);
    const idRef = useRef(0);
    const [messageApi, contextHolder] = message.useMessage();
    const [employees, setEmployees] = useState([]);
    const [defaultStartTime, setDefaultStartTime] = useState(null);
    const [defaultEndTime, setDefaultEndTime] = useState(null);
    const [defaultTaskDescription, setDefaultTaskDescription] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await employeeService.getEmployeesByDepartment(authService.getDepartmentId(), null);
                setEmployees(data || []);
            } catch (error) {
                message.error(error.message);
            }
        };
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (open) {
            idRef.current += 1;

            const initialRows = Array.from({ length: 5 }, (_, i) => ({
                uid: `r_${Date.now()}_${idRef.current + i}`,
                employeeId: null,
                employeeName: '',
                positionName: '',
                taskDescription: '',
                startTime: null,
                endTime: null,
            }));
            idRef.current += 5;
            setRows(initialRows);
        }
    }, [open]);

    const addRow = () => {
        idRef.current += 1;
        setRows([
            ...rows,
            {
                uid: `r_${Date.now()}_${idRef.current}`,
                employeeId: null,
                employeeName: '',
                positionName: '',
                taskDescription: '',
                startTime: null,
                endTime: null,
            },
        ]);
    };

    const handleChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;

        if (field === 'employeeId') {
            const selectedEmployee = employees.find((emp) => emp.id === value);
            if (selectedEmployee) {
                newRows[index].employeeName = selectedEmployee.name || '';
                newRows[index].positionName = selectedEmployee.positionName || '';
            }
        }

        setRows(newRows);
    };

    const removeRow = (index) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
    };

    const applyDefaultValues = () => {
        if (selectedRowKeys.length === 0) {
            messageApi.warning('Vui lòng chọn ít nhất một nhân viên để áp dụng');
            return;
        }

        const newRows = rows.map((row) => {
            if (selectedRowKeys.includes(row.uid)) {
                return {
                    ...row,
                    startTime: defaultStartTime || row.startTime,
                    endTime: defaultEndTime || row.endTime,
                    taskDescription: defaultTaskDescription || row.taskDescription,
                };
            }
            return row;
        });

        setRows(newRows);
        messageApi.success(`Đã áp dụng cho ${selectedRowKeys.length} nhân viên`);
    };

    const columns = [
        {
            title: 'Nhân viên',
            dataIndex: 'employeeId',
            width: 220,
            render: (_, record, index) => (
                <Select
                    style={{ width: '100%' }}
                    showSearch
                    placeholder="Chọn nhân viên"
                    value={record.employeeId}
                    onChange={(value) => handleChange(index, 'employeeId', value)}
                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                    options={employees.map((emp) => ({
                        label: `${emp.code} - ${emp.name}`,
                        value: emp.id,
                    }))}
                />
            ),
        },
        {
            title: 'Chức vụ',
            dataIndex: 'positionName',
            width: 100,
            render: (_, record, index) => (
                <Input value={record.positionName} placeholder="Chức vụ" disabled style={{ cursor: 'not-allowed' }} />
            ),
        },
        {
            title: 'Giờ bắt đầu',
            dataIndex: 'startTime',
            width: 200,
            render: (_, record, index) => (
                <DatePicker
                    showTime
                    value={record.startTime}
                    placeholder="Giờ bắt đầu"
                    onChange={(value) => handleChange(index, 'startTime', value)}
                />
            ),
        },
        {
            title: 'Giờ kết thúc',
            dataIndex: 'endTime',
            width: 200,
            render: (_, record, index) => (
                <DatePicker
                    showTime
                    value={record.endTime}
                    placeholder="Giờ kết thúc"
                    onChange={(value) => handleChange(index, 'endTime', value)}
                />
            ),
        },
        {
            title: 'Nội dung công việc',
            dataIndex: 'taskDescription',
            render: (_, record, index) => (
                <Input
                    value={record.taskDescription}
                    placeholder="Nội dung công việc"
                    onChange={(e) => handleChange(index, 'taskDescription', e.target.value)}
                />
            ),
        },
        {
            title: '',
            width: 60,
            align: 'center',
            render: (_, __, index) => <Button danger icon={<DeleteOutlined />} onClick={() => removeRow(index)} />,
        },
    ];

    const handleSubmit = async () => {
        const validRows = rows.filter(
            (row) => row.employeeId && row.startTime && row.endTime && row.taskDescription?.trim() !== '',
        );

        if (validRows.length === 0) {
            messageApi.error(
                'Vui lòng nhập đầy đủ thông tin cho ít nhất một nhân viên trước khi gửi, loại bỏ dòng trống hoặc không hợp lệ.',
            );
            return;
        }

        const payload = validRows.map((row) => ({
            employeeId: row.employeeId,
            startTime: row.startTime?.toISOString(),
            endTime: row.endTime?.toISOString(),
            taskDescription: row.taskDescription,
        }));

        try {
            await overtimeService.createBatchRequest(payload);
            messageApi.success('Gửi danh sách đơn tăng ca thành công');
            onCancel();
        } catch (error) {
            messageApi.error(error.message || 'Lỗi khi gửi danh sách đơn tăng ca');
        }
    };

    return (
        <Modal
            title="Lập đơn yêu cầu tăng ca"
            open={open}
            width={1300}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button key="add" icon={<PlusOutlined />} onClick={addRow}>
                    Thêm dòng
                </Button>,
                <Button key="submit" type="primary" icon={<SendOutlined />} onClick={handleSubmit}>
                    Gửi danh sách đơn tăng ca
                </Button>,
            ]}
        >
            <Row
                gutter={16}
                style={{ marginBottom: 16, padding: '12px', border: '1px solid #8dc8ffff', borderRadius: '4px' }}
            >
                <Col span={6}>
                    <div style={{ marginBottom: 4, fontWeight: 500 }}>Giờ bắt đầu mặc định</div>
                    <DatePicker
                        showTime
                        format="DD/MM/YYYY HH:mm"
                        placeholder="Chọn giờ bắt đầu"
                        value={defaultStartTime}
                        onChange={setDefaultStartTime}
                        style={{ width: '100%' }}
                    />
                </Col>
                <Col span={6}>
                    <div style={{ marginBottom: 4, fontWeight: 500 }}>Giờ kết thúc mặc định</div>
                    <DatePicker
                        showTime
                        format="DD/MM/YYYY HH:mm"
                        placeholder="Chọn giờ kết thúc"
                        value={defaultEndTime}
                        onChange={setDefaultEndTime}
                        style={{ width: '100%' }}
                    />
                </Col>
                <Col span={8}>
                    <div style={{ marginBottom: 4, fontWeight: 500 }}>Nội dung công việc mặc định</div>
                    <Input
                        placeholder="Nhập nội dung công việc"
                        value={defaultTaskDescription}
                        onChange={(e) => setDefaultTaskDescription(e.target.value)}
                    />
                </Col>
                <Col span={4}>
                    <div style={{ marginBottom: 4, fontWeight: 500 }}>&nbsp;</div>
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={applyDefaultValues}
                        style={{ width: '100%' }}
                    >
                        Áp dụng
                    </Button>
                </Col>
            </Row>
            {contextHolder}
            <Table
                dataSource={rows}
                columns={columns}
                size="small"
                rowKey={(record) => record.uid}
                rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                }}
                pagination={false}
                bordered
                scroll={{ y: 320 }}
            />
        </Modal>
    );
};

export default OvertimePlanningModal;
