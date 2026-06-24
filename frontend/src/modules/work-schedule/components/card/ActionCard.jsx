import { Card, Space, Button, Input } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import authService from '~/modules/auth/services/authService';

export default function ActionCard({ handleSave, loading, setSearchText, isLocked, handleSyncClick }) {
    const isSuperAdmin = authService.hasRole('SUPERADMIN');

    return (
        <Card title="Thao tác" bordered style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Input.Search
                    placeholder="Tìm tên nhân viên..."
                    onSearch={(val) => setSearchText(val)}
                    enterButton
                    style={{ width: '100%' }}
                />

                {isLocked && (
                    <div
                        style={{
                            color: '#cf1322',
                            textAlign: 'center',
                        }}
                    >
                        Lịch làm việc của phòng đã bị khóa. Bạn không thể thay đổi lịch trong tháng này.
                    </div>
                )}

                {!isLocked && (
                    <Button type="primary" onClick={handleSave} loading={loading} style={{ width: '100%' }}>
                        Lưu thay đổi
                    </Button>
                )}

                {isSuperAdmin && (
                    <Button
                        type="default"
                        icon={<SyncOutlined />}
                        onClick={handleSyncClick}
                        loading={loading}
                        style={{ width: '100%' }}
                    >
                        Đồng bộ từ API
                    </Button>
                )}
            </Space>
        </Card>
    );
}
