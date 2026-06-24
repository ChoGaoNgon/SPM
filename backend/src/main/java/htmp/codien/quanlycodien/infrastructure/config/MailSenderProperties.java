package htmp.codien.quanlycodien.infrastructure.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;
import lombok.Setter;

@Configuration
@ConfigurationProperties(prefix = "spring.mail")
@Getter
@Setter
public class MailSenderProperties {
    private Map<String, MailConfig> senders = new HashMap<>();

    @Getter
    @Setter
    public static class MailConfig {
        private String host;
        private int port;
        private String username;
        private String password;
    }
}
