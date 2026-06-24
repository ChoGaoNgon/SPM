import { FileExcelOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Flex, Form, Row, Typography, Upload, message } from 'antd';
import { FileCog } from 'lucide-react';
import { useState } from 'react';

import PageHeader from '~/components/PageHeader';
import productionPlanDowntimeService from '~/services/productionPlanDowntimeService';

const { Title, Text } = Typography;

const ProductionPlanDowntimeExportPage = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        if (!file) {
            message.error('Vui lòng chọn file Excel kế hoạch');
            return;
        }

        setLoading(true);

        try {
            const blob = await productionPlanDowntimeService.exportReport(file);
            const timestamp = new Date().toISOString().slice(0, 10);
            productionPlanDowntimeService.downloadFile(blob, `plan-downtime-${timestamp}.xlsx`);
            message.success('Xuất báo cáo downtime thành công');
            setFile(null);
        } catch (error) {
            message.error(error.message || 'Xuất báo cáo thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <PageHeader
                icon={FileCog}
                title="Plan Downtime Report"
                description="Xuất báo cáo downtime từ file kế hoạch"
            />

            <Row gutter={[24, 24]} justify="center">
                <Col xs={24} xl={14}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 16,
                        }}
                    >
                        <Flex vertical gap={8}>
                            <Title level={3} style={{ margin: 0 }}>
                                Xuất Báo Cáo Plan Downtime
                            </Title>
                            <Text type="secondary">
                                Upload file kế hoạch sản xuất để hệ thống tạo file báo cáo downtime
                            </Text>
                        </Flex>

                        <Divider />

                        <Form layout="vertical">
                            <Form.Item label="File kế hoạch" required>
                                <Upload
                                    beforeUpload={(selectedFile) => {
                                        setFile(selectedFile);
                                        return false;
                                    }}
                                    maxCount={1}
                                    accept=".xlsx,.xls"
                                    onRemove={() => setFile(null)}
                                >
                                    <Button icon={<UploadOutlined />} size="large" block>
                                        {file ? file.name : 'Chọn file Excel'}
                                    </Button>
                                </Upload>
                            </Form.Item>

                            <Button
                                type="primary"
                                icon={<FileExcelOutlined />}
                                loading={loading}
                                size="large"
                                block
                                onClick={handleExport}
                            >
                                Xuất Báo Cáo
                            </Button>
                        </Form>

                        <Divider />

                        <Card
                            size="small"
                            style={{
                                background: '#fafafa',
                                borderRadius: 12,
                            }}
                        >
                            <Title level={5}>Hướng dẫn sử dụng</Title>
                            <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
                                <li>Chọn file kế hoạch có sheet KH_TODAY1</li>
                                <li>Hệ thống sẽ đọc các cột B, E, Y, BO từ dòng dữ liệu</li>
                                <li>Nhấn "Xuất Báo Cáo" để tải file Excel downtime</li>
                            </ul>
                        </Card>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProductionPlanDowntimeExportPage;
