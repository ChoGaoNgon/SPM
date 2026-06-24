import {
    BellOutlined,
    DownOutlined,
    LockOutlined,
    LogoutOutlined,
    MoonOutlined,
    QuestionCircleOutlined,
    ReloadOutlined,
    SunOutlined,
} from '@ant-design/icons';
import {
    Badge,
    Dropdown,
    Flex,
    Form,
    Grid,
    Input,
    InputNumber,
    Modal,
    Popover,
    Space,
    Switch,
    Typography,
    message,
    notification,
} from 'antd';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import authService from '~/modules/auth/services/authService';
import NotificationList from '~/modules/notification/components/NotificationList';
import notificationService from '~/modules/notification/services/notificationService';
import { broadcastPageReload } from '~/modules/notification/services/socketControlService';
import socket, { acquireSocketConnection, releaseSocketConnection } from '~/modules/notification/socket';
import AppBreadcrumb from './AppBreadcrumb';
import { getBreadcrumbItems } from './breadcrumbHelper';

const { useBreakpoint } = Grid;
const { Text } = Typography;

const WEATHER_API =
    'https://api.open-meteo.com/v1/forecast?latitude=21.25&longitude=105.75&current_weather=true&timezone=Asia%2FBangkok';

const getWeatherIcon = (code) => {
    if (code === 0) return '☀️';
    if ([1, 2].includes(code)) return '⛅';
    if (code === 3) return '☁️';
    if ([45, 48].includes(code)) return '🌫️';
    if ([51, 53, 55].includes(code)) return '🌦️';
    if ([61, 63, 65].includes(code)) return '🌧️';
    if ([66, 67].includes(code)) return '🌨️';
    if ([71, 73, 75].includes(code)) return '❄️';
    if ([95].includes(code)) return '⛈️';
    return '🌡️';
};

const HeaderBar = ({ backgroundColor, textColor, isDarkMode, toggleTheme, style = {}, extra }) => {
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    const employee = authService.getEmployee() || { name: 'Người dùng' };
    const userId = authService.getEmployeeId();

    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const [popoverVisible, setPopoverVisible] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [weather, setWeather] = useState(null);

    const [api, contextHolder] = notification.useNotification();

    const userRole = authService.getRole();
    const canBroadcastReload = userRole === 'SUPERADMIN';

    const [reloadModalOpen, setReloadModalOpen] = useState(false);
    const [reloadSubmitting, setReloadSubmitting] = useState(false);
    const [reloadForm] = Form.useForm();

    const openReloadModal = () => {
        reloadForm.resetFields();
        setReloadModalOpen(true);
    };

    const handleBroadcastReload = async () => {
        try {
            const values = await reloadForm.validateFields();
            setReloadSubmitting(true);
            const result = await broadcastPageReload({
                message: values.message || '',
                delaySeconds: values.delaySeconds ?? 10,
            });
            const effectiveSec = Math.round((result.effectiveDelayMs ?? 0) / 1000);
            setReloadModalOpen(false);
            api.success({
                message: 'Đã gửi lệnh tải lại trang',
                description: `Tất cả người dùng sẽ tải lại sau ${effectiveSec} giây.`,
                placement: 'topRight',
                duration: 5,
            });
        } catch (err) {
            if (err?.errorFields) return;
            api.error({
                message: 'Gửi lệnh thất bại',
                description: err?.response?.data?.error || err?.message || 'Lỗi không xác định',
                placement: 'topRight',
            });
        } finally {
            setReloadSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchBreadcrumb = async () => {
            const items = await getBreadcrumbItems(location.pathname, params);
            setBreadcrumbs(items);
        };
        fetchBreadcrumb();
    }, [location.pathname, params]);

    const fetchUnreadNotiCount = async () => {
        try {
            const employeeId = authService.getEmployeeId();
            const count = await notificationService.getUnreadCount(employeeId);
            setUnreadCount(count);
        } catch (error) {
            message.error(error);
        }
    };

    useEffect(() => {
        if (!userId) return;

        fetchUnreadNotiCount();
        acquireSocketConnection(userId);

        const handleNotification = (data) => {
            const notif = data.notification;
            if (!notif) return;

            api.open({
                message: notif.title,
                description: <span dangerouslySetInnerHTML={{ __html: notif.message }} />,
                duration: 5,
            });

            if (typeof data.unreadCount === 'number') setUnreadCount(data.unreadCount);
        };

        socket.on('notification', handleNotification);
        return () => {
            socket.off('notification', handleNotification);
            releaseSocketConnection();
        };
    }, [userId, api]);

    const fetchTop10Notifications = async () => {
        try {
            const data = await notificationService.get10Notification();
            setNotifications(data);
        } catch (error) {
            message.error(error);
        }
    };

    const handlePopoverVisibleChange = (visible) => {
        setPopoverVisible(visible);
        if (visible) fetchTop10Notifications();
    };

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const res = await fetch(WEATHER_API);
                const data = await res.json();
                setWeather(data.current_weather);
            } catch (err) {
                message.error(err);
            }
        };

        fetchWeather();
        const interval = setInterval(fetchWeather, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const menuItems = [
        {
            label: (
                <Space>
                    <Switch
                        checkedChildren={<MoonOutlined />}
                        unCheckedChildren={<SunOutlined />}
                        checked={isDarkMode}
                        onChange={toggleTheme}
                    />{' '}
                    <Text>Giao diện</Text>
                </Space>
            ),
            key: '1',
        },
        {
            label: (
                <Space>
                    <LockOutlined />
                    <Text>Đổi mật khẩu</Text>
                </Space>
            ),
            key: 'change-password',
            onClick: () => navigate('/change-password'),
        },
        ...(canBroadcastReload
            ? [
                  {
                      label: (
                          <Space>
                              <ReloadOutlined />
                              <Text>Gửi lệnh tải lại trang</Text>
                          </Space>
                      ),
                      key: 'broadcast-reload',
                      onClick: openReloadModal,
                  },
              ]
            : []),
        { type: 'divider' },
        {
            label: (
                <Space>
                    <QuestionCircleOutlined />
                    <Text>Hướng dẫn sử dụng</Text>
                </Space>
            ),
            key: '10',
            onClick: () =>
                window.open('https://docs.google.com/document/d/1VEB3Hj9rZMPbvryO_QoI0akMP8IhA6x2Om6yD5nQDtU'),
        },
        {
            label: (
                <Space>
                    <LogoutOutlined />
                    <Text>Đăng xuất</Text>
                </Space>
            ),
            key: '20',
            onClick: () => authService.logout(),
        },
    ];

    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    height: 64,
                    padding: '0 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: backgroundColor,
                    color: textColor,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: 100,
                    width: '100%',
                    ...style,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {extra}

                    {!isMobile && (
                        <Space>
                            <AppBreadcrumb
                                items={breadcrumbs}
                                onNavigate={(url) => navigate(url)}
                                textColor={textColor}
                            />
                        </Space>
                    )}
                </div>

                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    {weather && (
                        <Flex align="center" gap={6} style={{ color: textColor }}>
                            <span style={{ fontSize: 22 }}>{getWeatherIcon(weather.weathercode)}</span>
                            <Text strong style={{ fontSize: 15 }}>
                                {weather.temperature}°C
                            </Text>
                        </Flex>
                    )}

                    {isMobile ? (
                        <Badge count={unreadCount} size="small">
                            <BellOutlined
                                style={{ fontSize: 24, cursor: 'pointer', color: textColor }}
                                onClick={() => navigate('/notifications')}
                            />
                        </Badge>
                    ) : (
                        <Popover
                            content={
                                <NotificationList
                                    dataSource={notifications}
                                    setNotifications={setNotifications}
                                    setUnreadCount={setUnreadCount}
                                />
                            }
                            title={<Text strong>Thông báo</Text>}
                            trigger="click"
                            placement="bottomRight"
                            open={popoverVisible}
                            onOpenChange={handlePopoverVisibleChange}
                        >
                            <Badge count={unreadCount} size="small">
                                <BellOutlined style={{ fontSize: 24, cursor: 'pointer', color: textColor }} />
                            </Badge>
                        </Popover>
                    )}

                    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                        <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <Flex align="center" gap="small">
                                <Flex vertical align="end" style={{ lineHeight: 1.2 }}>
                                    <Text strong style={{ fontSize: 14 }}>
                                        {employee.name}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                        {authService.getRole()}
                                    </Text>
                                </Flex>
                                <DownOutlined style={{ fontSize: 10 }} />
                            </Flex>
                        </button>
                    </Dropdown>

                    {contextHolder}
                </div>
            </div>

            <Modal
                title={
                    <>
                        <ReloadOutlined /> Tải lại trang cho người dùng
                    </>
                }
                open={reloadModalOpen}
                onOk={handleBroadcastReload}
                onCancel={() => setReloadModalOpen(false)}
                okText="Gửi lệnh"
                cancelText="Hủy"
                confirmLoading={reloadSubmitting}
                destroyOnClose
            >
                <Form form={reloadForm} layout="vertical" initialValues={{ delaySeconds: 10 }}>
                    <Form.Item
                        label="Nội dung thông báo"
                        name="message"
                        rules={[{ max: 300, message: 'Tối đa 300 ký tự' }]}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Hệ thống đang cập nhật. Trang sẽ tự tải lại..."
                            maxLength={300}
                            showCount
                        />
                    </Form.Item>
                    <Form.Item
                        label="Thời gian trễ (giây)"
                        name="delaySeconds"
                        rules={[{ required: true, message: 'Nhập số giây' }]}
                        extra="Thời gian hiển thị đếm ngược trước khi tải lại (0 = tải lại ngay)"
                    >
                        <InputNumber min={0} max={300} style={{ width: '100%' }} addonAfter="giây" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default HeaderBar;
