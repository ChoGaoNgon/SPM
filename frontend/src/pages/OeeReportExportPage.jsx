import { Button, Card, Col, DatePicker, Divider, Flex, Form, Row, Typography, Upload, message } from 'antd';
import { BugOutlined, FileExcelOutlined, ImportOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

import oeeReportService from '~/services/oeeReportService';
import productCodeMappingService from '~/services/productCodeMappingService';
import PageHeader from '~/components/PageHeader';
import { FileChartColumn } from 'lucide-react';

const { Title, Text } = Typography;

const OeeReportExportPage = () => {
    const [file, setFile] = useState(null);
    const [mappingFile, setMappingFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);

    const [date, setDate] = useState(dayjs());

    const fileInputRef = useRef(null);
    const importFileInputRef = useRef(null);

    const handleExport = async () => {
        if (!file) {
            message.error('Vui lòng chọn file Excel');
            return;
        }

        if (!date) {
            message.error('Vui lòng chọn ngày');
            return;
        }

        setLoading(true);

        try {
            const formattedDate = date.format('YYYY-MM-DD');

            const blob = await oeeReportService.exportReport(file, formattedDate);

            oeeReportService.downloadFile(blob, `OEE ${formattedDate}.xlsx`);

            message.success('Xuất báo cáo thành công');

            setFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDebugExport = async () => {
        if (!date) {
            message.error('Vui lòng chọn ngày');
            return;
        }

        setLoading(true);

        try {
            const formattedDate = date.format('YYYY-MM-DD');

            const blob = await oeeReportService.debugExport(formattedDate);

            oeeReportService.downloadFile(blob, `OEE-DEBUG-${formattedDate}.xlsx`);

            message.success('Xuất file debug thành công');
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImportMapping = async () => {
        if (!mappingFile) {
            message.error('Vui lòng chọn file mapping');
            return;
        }

        setImportLoading(true);

        try {
            const successMessage = await productCodeMappingService.importFromExcel(mappingFile);

            message.success(successMessage);

            setMappingFile(null);

            if (importFileInputRef.current) {
                importFileInputRef.current.value = '';
            }
        } catch (error) {
            message.error(error.message || 'Lỗi khi import mapping mã sản phẩm');
        } finally {
            setImportLoading(false);
        }
    };

    return (
        <div>
            <PageHeader icon={FileChartColumn} title="Báo Cáo OEE" description="Báo cáo hiệu suất OEE" />
            <Row gutter={[24, 24]} justify="center">
                <Col xs={24} xl={14}>
                    <Card
                        variant={false}
                        style={{
                            borderRadius: 16,
                        }}
                    >
                        <Flex vertical gap={8}>
                            <Title level={3} style={{ margin: 0 }}>
                                Xuất Báo Cáo OEE
                            </Title>

                            <Text type="secondary">Upload template Excel và xuất báo cáo OEE tự động</Text>
                        </Flex>

                        <Divider />

                        <Form layout="vertical">
                            <Form.Item label="Ngày báo cáo" required>
                                <DatePicker
                                    value={date}
                                    onChange={(value) => setDate(value)}
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>

                            <Form.Item label="Template Excel" required>
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

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
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
                                </Col>

                                <Col xs={24} md={12}>
                                    <Button
                                        icon={<BugOutlined />}
                                        loading={loading}
                                        size="large"
                                        block
                                        onClick={handleDebugExport}
                                    >
                                        Debug Export
                                    </Button>
                                </Col>
                            </Row>
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
                                <li>Chọn ngày cần xuất báo cáo</li>
                                <li>Upload file template Excel</li>
                                <li>Nhấn "Xuất Báo Cáo" để tải file</li>
                                <li>"Debug Export" dùng để test nhanh không cần template</li>
                            </ul>
                        </Card>
                    </Card>
                </Col>

                <Col xs={24} xl={10}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 16,
                            height: '100%',
                        }}
                    >
                        <Flex vertical gap={8}>
                            <Title level={3} style={{ margin: 0 }}>
                                Import Mapping
                            </Title>

                            <Text type="secondary">Import mapping mã sản phẩm MES ↔ KHSX</Text>
                        </Flex>

                        <Divider />

                        <Form layout="vertical">
                            <Form.Item label="File Mapping Excel" required>
                                <Upload
                                    beforeUpload={(selectedFile) => {
                                        setMappingFile(selectedFile);
                                        return false;
                                    }}
                                    maxCount={1}
                                    accept=".xlsx,.xls"
                                    onRemove={() => setMappingFile(null)}
                                >
                                    <Button icon={<UploadOutlined />} size="large" block>
                                        {mappingFile ? mappingFile.name : 'Chọn file mapping'}
                                    </Button>
                                </Upload>
                            </Form.Item>

                            <Button
                                type="primary"
                                icon={<ImportOutlined />}
                                loading={importLoading}
                                size="large"
                                block
                                onClick={handleImportMapping}
                            >
                                Import Mapping
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
                            <Title level={5}>Định dạng file</Title>

                            <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
                                <li>Sheet đầu tiên sẽ được sử dụng</li>
                                <li>Dòng đầu tiên là header</li>
                                <li>Cột A: MES Product Code</li>
                                <li>Cột B: KHSX Product Code</li>
                            </ul>
                        </Card>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default OeeReportExportPage;
