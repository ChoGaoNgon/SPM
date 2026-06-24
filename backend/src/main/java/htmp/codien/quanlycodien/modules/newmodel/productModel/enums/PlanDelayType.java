package htmp.codien.quanlycodien.modules.newmodel.productModel.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor

public enum PlanDelayType {
    PLAN_END_TIME_DELAY("Trễ thời gian kết thúc kế hoạch"),
    FA_SUBMIT_DELAY("Trễ thời gian gửi FA");

    private final String description;

}
