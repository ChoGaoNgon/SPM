package htmp.codien.quanlycodien.modules.newmodel.product.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductProgressResponse {
    String stageName;
    LocalDate plannedStartDate;
    LocalDate plannedEndDate;
    LocalDate actualStartDate;
    LocalDate actualEndDate;
    String url;
    String status;

    List<StepDetail> steps;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class StepDetail {
        String stepName;
        String responsibleBy;
        String result;
        String remark;
    }
}
