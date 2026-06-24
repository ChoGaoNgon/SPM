import React from 'react';
import { Row, Col, Button, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useIsMobile } from '~/hook/useIsMobile';
import PlanTable from '../table/PlanTable';

const { Title } = Typography;

const PlanTab = ({
    productId,
    productCode,
    reloadTrigger,
    onEdit,
    onEditKT,
    onEditLOG,
    onCreate,
    canCreate,
    moldCode,
}) => {
    const isMobile = useIsMobile();

    return (
        <Row gutter={isMobile ? [8, 8] : [16, 16]}>
            <Col span={24}>
                <Row
                    justify="space-between"
                    align="middle"
                    style={{
                        marginTop: isMobile ? 8 : 8,
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? 8 : 0,
                    }}
                >
                    <Title level={isMobile ? 5 : 4} style={{ color: '#555', margin: 0 }}>
                        Kế hoạch sản phẩm
                    </Title>
                    <Space
                        style={{ marginBottom: isMobile ? 8 : 16, width: isMobile ? '100%' : 'auto' }}
                        direction={isMobile ? 'vertical' : 'horizontal'}
                    >
                        {canCreate && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={onCreate}
                                block={isMobile}
                                size={isMobile ? 'middle' : 'default'}
                            >
                                {'Lập kế hoạch'}
                            </Button>
                        )}
                    </Space>
                </Row>
                <PlanTable
                    productId={productId}
                    reloadTrigger={reloadTrigger}
                    onEdit={onEdit}
                    onEditKT={onEditKT}
                    onEditLOG={onEditLOG}
                    moldCode={moldCode}
                    productCode={productCode}
                />
            </Col>
        </Row>
    );
};

export default PlanTab;
