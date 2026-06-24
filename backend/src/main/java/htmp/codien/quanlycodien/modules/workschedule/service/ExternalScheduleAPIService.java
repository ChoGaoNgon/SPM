package htmp.codien.quanlycodien.modules.workschedule.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.ExternalWorkScheduleDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExternalScheduleAPIService {

    private final WorkScheduleService workScheduleService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${api.hrm.base-url}")
    private String hrmApiBaseUrl;

    public void fetchAndSyncSchedule(int month, int year, boolean useCodeHcns) {
        try {
            log.info("Bắt đầu gọi API bên ngoài để lấy lịch làm việc: month={}, year={} (API luôn trả về code_hcns)",
                    month, year);

            String url = String.format("%s/shiftplan?month=%d&year=%d", hrmApiBaseUrl, month, year);

            String responseJson = restTemplate.getForObject(url, String.class);

            if (responseJson == null || responseJson.isEmpty()) {
                throw new RuntimeException("API bên ngoài trả về dữ liệu rỗng");
            }

            Map<String, Map<String, String>> parsedData = objectMapper.readValue(
                    responseJson,
                    new TypeReference<Map<String, Map<String, String>>>() {
                    });

            ExternalWorkScheduleDTO dto = new ExternalWorkScheduleDTO();
            dto.setData(parsedData);

            workScheduleService.syncWorkScheduleFromExternalAPI(dto, year, month, useCodeHcns);

        } catch (Exception e) {
            log.error("Lỗi khi gọi API bên ngoài và đồng bộ dữ liệu: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi khi đồng bộ lịch từ API bên ngoài: " + e.getMessage(), e);
        }
    }

}
