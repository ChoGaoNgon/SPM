package htmp.codien.quanlycodien.modules.notification.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum NotificationEvent {

    MODEL_CREATED("MODEL", "Tạo mới Model"),
    MODEL_UPDATED("MODEL", "Cập nhật Model"),
    MODEL_DELETED("MODEL", "Xóa Model"),
    MODEL_IMPORTED_FROM_EXCEL("MODEL", "Nhập Model từ Excel"),
    PRODUCT_CREATED("PRODUCT", "Tạo mới Sản phẩm"),
    PRODUCT_UPDATED("PRODUCT", "Cập nhật Sản phẩm"),
    PRODUCT_NMD_INFO_STATUS_UPDATED("PRODUCT", "Cập nhật trạng thái thông tin NMD"),
    PRODUCT_DELETED("PRODUCT", "Xóa Sản phẩm"),
    PRODUCT_APPROVAL_REQUESTED("PRODUCT", "Yêu cầu phê duyệt sản phẩm thành phẩm"),
    PRODUCT_APPROVED_BY_HEAD_KD("PRODUCT", "Trưởng/Phó phòng KD đã phê duyệt sản phẩm"),
    PRODUCT_PLAN_CREATED("PLAN", "Tạo mới kế hoạch "),
    PRODUCT_PLAN_UPDATED_DETAIL_AND_EXPECTED("PLAN", "Cập nhật kế hoạch - chi tiết và dự kiến "),
    PRODUCT_PLAN_UPDATED_ACTUAL_TIME("PLAN", "Cập nhật kế hoạch - thời gian thực tế "),
    PRODUCT_PLAN_UPDATED_ACTUAL_MATERIAL("PLAN", "Cập nhật kế hoạch - nguyên vật liệu thực tế "),
    PRODUCT_PLAN_CANCELLED("PLAN", "Hủy kế hoạch "),
    PRODUCT_PLAN_RESIN_APPROVED("PLAN", "Duyệt nhựa cho kế hoạch "),
    PRODUCT_PLAN_CHECKER_APPROVED("PLAN", "Quản lý trực tiếp duyệt"),
    PRODUCT_PLAN_HEAD_NMD_APPROVED("PLAN", "Trưởng/phó phòng duyệt"),
    PRODUCT_PLAN_PC_APPROVED("PLAN", "Bộ phận PC duyệt kế hoạch"),
    PRODUCT_PLAN_TECHNICAL_APPROVED("PLAN", "Phòng kỹ thuật duyệt"),
    PRODUCT_PLAN_PRODUCTION_APPROVED("PLAN", "Bộ phận sản xuất duyệt"),
    PRODUCT_PLAN_DELETED("PLAN", "Xóa kế hoạch "),
    PRODUCT_PLAN_ISSUE_CREATED("PLAN", "Tạo phát sinh cho kế hoạch "),
    PRODUCT_PLAN_RESULT_APPROVE("PLAN", "Phê duyệt kết quả kế hoạch "),
    PRODUCT_PLAN_RESULT_REJECT("PLAN", "Từ chối kết quả kế hoạch "),
    PRODUCT_PLAN_QC_UPDATE("PLAN", "Cập nhật kiểm tra chất lượng kế hoạch "),
    PRODUCT_PLAN_DELIVERY_UPDATE("PLAN", "Cập nhật giao hàng kế hoạch "),
    PRODUCT_PLAN_APPROVE_ATTACHCONDITION_FILE("PLAN", "Phê duyệt file điều kiện đúc theo kế hoạch "),
    PRODUCT_PLAN_REJECTED("PLAN", "Kế hoạch bị từ chối"),
    PRODUCT_PLAN_APPROVED("PLAN", "Kế hoạch đã được phê duyệt toàn bộ"),
    PRODUCT_PLAN_CHECKED("PLAN", "Kế hoạch được kiểm tra"),
    PRODUCT_PLAN_HEAD_APPROVED("PLAN", "Kế hoạch được trưởng phòng NMD phê duyệt"),
    PRODUCT_PLAN_WAITING_CHECKER("PLAN", "Chờ quản lý trực tiếp duyệt kế hoạch"),
    PRODUCT_PLAN_WAITING_HEAD_NMD("PLAN", "Chờ trưởng/phó phòng NMD duyệt kế hoạch"),
    PRODUCT_PLAN_WAITING_RESIN("PLAN", "Chờ duyệt nhựa cho kế hoạch"),
    PRODUCT_PLAN_WAITING_PLAN("PLAN", "Chờ bộ phận PC duyệt kế hoạch"),
    PRODUCT_PLAN_WAITING_TECHNICAL("PLAN", "Chờ phòng kỹ thuật duyệt kế hoạch"),
    PRODUCT_PLAN_WAITING_PRODUCTION("PLAN", "Chờ bộ phận sản xuất duyệt kế hoạch"),
    SYSTEM_FEEDBACK_CREATED("SYSTEM_FEEDBACK", "Phản hồi hệ thống được gửi"),
    SYSTEM_FEEDBACK_UPDATED("SYSTEM_FEEDBACK", "Phản hồi hệ thống được cập nhật"),
    SYSTEM_FEEDBACK_DELETED("SYSTEM_FEEDBACK", "Phản hồi hệ thống được xóa"),
    SYSTEM_FEEDBACK_RESPONDED("SYSTEM_FEEDBACK", "Phản hồi hệ thống được trả lời");

    private final String group;
    private final String description;
}
