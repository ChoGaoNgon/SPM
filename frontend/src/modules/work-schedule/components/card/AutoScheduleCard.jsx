import { Button, Card, Col, DatePicker, Row, Select, Space, Spin } from 'antd';
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function AutoScheduleCard({
    anchorStart,
    anchorEnd,
    setAnchorStart,
    setAnchorEnd,
    selectedPatternCode,
    setSelectedPatternCode,
    autoGenerateSchedule,
    shiftPatterns = [],
    patternsLoading = false,
}) {
    return (
        <Card title="Sinh lịch tự động" variant="" style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Row gutter={8}>
                    <Col flex="auto">
                        <RangePicker
                            value={[anchorStart, anchorEnd]}
                            onChange={(dates) => {
                                const [start, end] = dates || [];
                                setAnchorStart(start);
                                setAnchorEnd(end);
                            }}
                            format="DD-MM-YYYY"
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col flex="300px">
                        <Select
                            placeholder="Chọn pattern"
                            value={selectedPatternCode}
                            onChange={setSelectedPatternCode}
                            style={{ width: '100%' }}
                            loading={patternsLoading}
                            notFoundContent={patternsLoading ? <Spin size="small" /> : 'Không có dữ liệu'}
                        >
                            {shiftPatterns
                                .filter((p) => p.isActive)
                                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                                .map((p) => (
                                    <Option key={p.code} value={p.code}>
                                        {p.name}
                                    </Option>
                                ))}
                        </Select>
                    </Col>
                </Row>

                <Button type="primary" block onClick={() => autoGenerateSchedule(selectedPatternCode)}>
                    Áp dụng cho nhân viên được chọn
                </Button>
            </Space>
        </Card>
    );
}
