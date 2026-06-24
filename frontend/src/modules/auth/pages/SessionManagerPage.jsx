import { Button, message, Table, Tag, Tooltip } from 'antd';
import { LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UAParser } from 'ua-parser-js';
import employeeSessionService from '~/modules/auth/services/employeeSessionService';

export default function SessionManagementPage() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const data = await employeeSessionService.getActiveSessions();
            setSessions(data);
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKick = async (employeeId) => {
        try {
            await employeeSessionService.logoutEmployee(employeeId);
            message.success('Đã đăng xuất nhân viên ' + employeeId);
            fetchSessions();
        } catch (error) {
            message.error(error.message);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const renderBrowser = (uaString) => {
        const parser = new UAParser(uaString);
        const browser = parser.getBrowser();
        const os = parser.getOS();
        const device = parser.getDevice();

        return `${browser.name || 'Unknown'} ${browser.version?.split('.')[0] || ''} - ${os.name || ''} ${os.version || ''} ${device.model ? '- ' + device.model : ''} ${device.type ? '- ' + device.type + device.vendor : ''}`.trim();
    };

    const activeEmployeeCount = new Set(sessions.filter((s) => s.active).map((s) => s.employeeId)).size;

    const columns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            width: 60,
            align: 'center',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Mã NV',
            dataIndex: 'employeeCode',
            key: 'employeeCode',
            width: 120,
        },
        {
            title: 'Nhân viên',
            dataIndex: 'employeeName',
            key: 'employeeName',
            width: 180,
        },
        {
            title: 'IP',
            dataIndex: 'ipAddress',
            key: 'ipAddress',
            width: 140,
            render: (ipAddress) => ipAddress || '-',
        },
        {
            title: 'Thiết bị',
            dataIndex: 'deviceInfo',
            key: 'deviceInfo',
            width: 320,
            render: (deviceInfo) => renderBrowser(deviceInfo),
        },
        {
            title: 'Đăng nhập',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            render: (createdAt) => new Date(createdAt).toLocaleString(),
        },
        {
            title: 'Hết hạn',
            dataIndex: 'expiredAt',
            key: 'expiredAt',
            width: 180,
            render: (expiredAt) => new Date(expiredAt).toLocaleString(),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            key: 'active',
            width: 140,
            align: 'center',
            render: (active) =>
                active ? <Tag color="success">Đang hoạt động</Tag> : <Tag color="default">Hết hạn</Tag>,
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 120,
            align: 'center',
            fixed: 'right',
            render: (_, record) =>
                record.active ? (
                    <Tooltip title="Đăng xuất nhân viên khỏi tất cả phiên đang hoạt động">
                        <Button danger type="primary" size="small" onClick={() => handleKick(record.employeeId)}>
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </Tooltip>
                ) : null,
        },
    ];

    return (
        <div className="">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
                        Quản lý phiên đăng nhập
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Theo dõi trạng thái đăng nhập của nhân viên và quản lý phiên.
                    </p>
                </div>
                <div className="flex gap-4 flex-wrap">
                    <div className="bg-green-600 text-white rounded-2xl shadow-md p-4 min-w-[180px]">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-green-100">
                            Nhân viên đang đăng nhập
                        </div>
                        <div className="mt-1 text-3xl font-extrabold">{activeEmployeeCount}</div>
                    </div>
                </div>
            </div>

            <div className="shadow rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
                <Table
                    rowKey="sessionId"
                    columns={columns}
                    dataSource={sessions}
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 1200, y: 'calc(100vh - 320px)' }}
                />
            </div>
        </div>
    );
}
