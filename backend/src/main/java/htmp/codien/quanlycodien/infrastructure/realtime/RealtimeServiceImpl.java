package htmp.codien.quanlycodien.infrastructure.realtime;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RealtimeServiceImpl implements RealtimeService {

    private final RestTemplate restTemplate;

    @Value("${realtime.server.url}")
    private String realtimeServerUrl;

    private void postToRealtimeServer(String endpoint, Map<String, Object> payload) {
        try {
            restTemplate.postForObject(
                    realtimeServerUrl + endpoint,
                    payload,
                    String.class);
        } catch (Exception e) {
            System.err.println("Realtime server error: " + e.getMessage());
        }
    }

    @Override
    public void sendUpdatedPermissions(Long employeeId, Set<String> permissions, String message) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("receivers", Set.of(employeeId)); 
        payload.put("permissions", permissions); 
        payload.put("message", message); 

        postToRealtimeServer("/permissions", payload);
    }

    @Override
    public void forceLogout(Long employeeId, String message) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "FORCE_LOGOUT");
        payload.put("receivers", Set.of(employeeId)); 
        payload.put("message", message); 

        postToRealtimeServer("/force-logout", payload);
    }
}
