import { Card, Empty, Flex, List, Space, Tag, Typography, theme as antdTheme, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '~/contexts/ThemeContext';
import notificationService from '../services/notificationService';

const { Text, Paragraph } = Typography;

const getTagColor = (category) => {
    if (!category) return 'default';
    switch (category.toUpperCase()) {
        case 'NEW_MODEL':
            return 'blue';
        case 'it':
            return 'green';
        case 'hcns':
            return 'orange';
        default:
            return 'default';
    }
};

const NotificationList = ({ dataSource = [], setNotifications, setUnreadCount }) => {
    const navigate = useNavigate();
    const { themeAlgorithm } = useTheme();
    const { token } = antdTheme.useToken(themeAlgorithm);

    const handleNotiClick = async (notificationId, url) => {
        try {
            await notificationService.markAsRead(notificationId);

            setNotifications((prev) =>
                prev.map((n) => (n.notificationId === notificationId ? { ...n, isRead: true } : n)),
            );

            setUnreadCount((prev) => Math.max(prev - 1, 0));

            navigate(url, { replace: true });
        } catch (error) {
            message.error(error.message);
        }
    };

    return (
        <>
            <List
                dataSource={dataSource}
                locale={{
                    emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có thông báo nào" />,
                }}
                style={{
                    maxHeight: 400,
                    overflowY: 'auto',
                    width: 350,
                }}
                renderItem={(item) => (
                    <List.Item style={{ cursor: 'pointer' }} className="notification-popover-item">
                        <Card
                            size="small"
                            style={{
                                width: '100%',
                                borderLeft: item.isRead
                                    ? `4px solid ${token.colorBorderSecondary}`
                                    : `4px solid ${token.colorPrimary}`,
                                backgroundColor: item.isRead ? token.colorBgContainer : token.colorBgElevated,
                            }}
                            onClick={() => handleNotiClick(item.notificationId, item.url)}
                        >
                            <Flex justify="space-between" align="center" wrap="wrap">
                                <Space align="center" style={{ marginRight: 16 }}>
                                    <Tag color={getTagColor(item.type)}>{item.type}</Tag>
                                    <Text strong>{item.title}</Text>
                                </Space>
                            </Flex>
                            {item.message && (
                                <div style={{ marginTop: 8 }}>
                                    <Paragraph
                                        type="secondary"
                                        style={{ margin: 0, fontSize: 13 }}
                                        ellipsis={{ rows: 2 }}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: item.message }} />
                                    </Paragraph>
                                </div>
                            )}
                            <div style={{ marginTop: 4, textAlign: 'right' }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {item.departmentName} - {new Date(item.createdAt).toLocaleString()}
                                </Text>
                            </div>
                        </Card>
                    </List.Item>
                )}
            />
            <Link to="/notifications" style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>
                Xem tất cả thông báo
            </Link>
        </>
    );
};

export default NotificationList;
