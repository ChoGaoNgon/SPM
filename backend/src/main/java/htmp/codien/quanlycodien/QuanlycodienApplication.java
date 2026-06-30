package htmp.codien.quanlycodien;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import static org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO;

@SpringBootApplication
@EnableScheduling
@EnableAsync
@EnableCaching
@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)
public class QuanlycodienApplication {

	public static void main(String[] args) {
		// POI/XMLBeans khi đọc file Excel lớn sẽ vượt giới hạn bảo mật XML (JAXP) mặc định của JDK,
		// gây lỗi: "The accumulated size of entities ... exceeded the ... limit".
		// Nới các giới hạn này về 0 (không giới hạn) NGAY trước khi app khởi động,
		// để mọi XML parser tạo sau đó đều áp dụng.
		System.setProperty("jdk.xml.totalEntitySizeLimit", "0");
		System.setProperty("jdk.xml.entityExpansionLimit", "0");
		System.setProperty("jdk.xml.maxGeneralEntitySizeLimit", "0");
		System.setProperty("jdk.xml.maxParameterEntitySizeLimit", "0");

		SpringApplication.run(QuanlycodienApplication.class, args);
	}

}