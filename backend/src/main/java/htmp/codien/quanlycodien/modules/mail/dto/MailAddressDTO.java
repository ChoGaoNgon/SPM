package htmp.codien.quanlycodien.modules.mail.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MailAddressDTO {
    Long id;
    String email;
    String displayName;
    Long departmentId;
    String departmentName;
    Boolean active;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
