package htmp.codien.quanlycodien.modules.mail.service;

import java.util.Properties;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.infrastructure.config.MailSenderProperties;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MailSenderService {
        private final MailSenderProperties properties;

        public JavaMailSender getSender(String key) {
                MailSenderProperties.MailConfig cfg = properties.getSenders().getOrDefault(
                                key,
                                properties.getSenders().get("default"));

                JavaMailSenderImpl sender = new JavaMailSenderImpl();

                sender.setHost(cfg.getHost());
                sender.setPort(cfg.getPort());
                sender.setUsername(cfg.getUsername());
                sender.setPassword(cfg.getPassword());

                Properties props = sender.getJavaMailProperties();
                props.put("mail.smtp.auth", "true");
                props.put("mail.smtp.starttls.enable", "true");

                return sender;
        }

        public String getUsername(String key) {
                MailSenderProperties.MailConfig cfg = properties.getSenders().getOrDefault(
                                key,
                                properties.getSenders().get("default"));
                return cfg.getUsername();
        }
}
