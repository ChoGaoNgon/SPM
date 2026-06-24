package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.sendMail;

import java.time.LocalDate;
import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder

@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SendMoldTrialPlanMailRequest {
    LocalDate date;
    List<Long> to;
    List<Long> cc;
    List<Long> bcc;
    String title;
    String content;
}
