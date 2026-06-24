package htmp.codien.quanlycodien.modules.mail.service;

import java.util.List;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MailService {

    private final MailSenderService mailSenderService;

    public void sendHtmlMail(
            String senderKey,
            List<String> toList,
            List<String> ccList,
            List<String> bccList,
            String subject,
            String htmlContent) {
        try {
            JavaMailSender mailSender = mailSenderService.getSender(senderKey);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            String from = mailSenderService.getUsername(senderKey);

            helper.setTo(toList.toArray(new String[0]));

            if (ccList != null && !ccList.isEmpty()) {
                helper.setCc(ccList.toArray(new String[0]));
            }

            if (bccList != null && !bccList.isEmpty()) {
                helper.setBcc(bccList.toArray(new String[0]));
            }

            helper.setFrom(from);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Gửi mail HTML thất bại", e);
        }
    }

}
