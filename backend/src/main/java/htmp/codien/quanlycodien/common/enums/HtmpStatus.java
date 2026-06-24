package htmp.codien.quanlycodien.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum HtmpStatus {

    PLANNED("Đã lên kế hoạch", "#64748b"),
    RUNNING("Đang chạy", "#2563eb"),
    DELAYED("Trễ kế hoạch", "#ea580c"),
    COMPLETED("Hoàn thành", "#16a34a"),

    WAITTINGAPPROVALCHEKER("Chờ quản lý NMD kiểm tra", "#0f766e"),
    WAITTINGAPPROVALHEADNMD("Chờ trưởng phòng NMD duyệt", "#7c3aed"),
    WAITTINGAPPROVALRESIN("Chờ PC duyệt nhựa", "#9333ea"),
    WAITTINGAPPROVALPLAN("Chờ PC duyệt kế hoạch", "#c026d3"),
    WAITTINGAPPROVALPRODUCTION("Chờ bộ phận sản xuất duyệt", "#0284c7"),
    WAITTINGAPPROVALTECHNICAL("Chờ phòng kỹ thuật duyệt", "#0284c7"),

    WAITINGQCCHECK("Chờ QC đánh giá", "#0284c7"),
    WAITTINGFARESULT("Chờ kết quả FA", "#d97706"),

    WAITTINGAPPROVALRESULT("Chờ duyệt kết quả kế hoạch", "#e11d48"),

    REJECTED("Bị từ chối", "#dc2626"),
    CANCELLED("Đã hủy", "#6b7280");

    private final String description;
    private final String color;
}