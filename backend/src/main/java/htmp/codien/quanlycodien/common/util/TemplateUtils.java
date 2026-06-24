package htmp.codien.quanlycodien.common.util;

import java.nio.charset.StandardCharsets;

import org.springframework.core.io.ClassPathResource;
import org.springframework.util.StreamUtils;

public class TemplateUtils {

    public static String loadHtmlTemplate(String path) {
        try {
            ClassPathResource resource = new ClassPathResource(path);
            return StreamUtils.copyToString(
                    resource.getInputStream(),
                    StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Không đọc được file HTML mail", e);
        }
    }

}
