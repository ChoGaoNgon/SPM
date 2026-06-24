import { FileExcelOutlined } from "@ant-design/icons";
import { Button, Card, DatePicker, message, Space } from "antd";

export default function CommonSettingsCard({
    selectedDate,
    handleMonthChange,
    globalDefaultShift,
    handleGlobalDefaultShiftChange,
    shifts,
    handleImportClick,
    isLocked
}) {
    return (
        <Card title="Thiết lập chung" variant="" style={{ height: "100%" }}>
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <DatePicker
                    picker="month"
                    value={selectedDate}
                    onChange={handleMonthChange}
                    format="MM-YYYY"
                    style={{ width: "100%" }}
                />
                <Button
                    style={{
                        backgroundColor: "#1D6F42",
                        borderColor: "#1D6F42",
                        color: "white",
                    }}
                    type="success"
                    icon={<FileExcelOutlined />}
                    block
                    onClick={() => {
                        if (isLocked) {
                            message.info("Lịch làm việc đã bị khóa, không thể nhập lịch!");
                            return;
                        }
                        handleImportClick();
                    }}
                >
                    Nhập lịch (Excel)
                </Button>
            </Space>
        </Card>
    );
}