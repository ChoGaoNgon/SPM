package htmp.codien.quanlycodien.infrastructure.realtime;

import java.util.Set;

public interface RealtimeService {

    void sendUpdatedPermissions(Long employeeId, Set<String> permissions, String message);

    void forceLogout(Long employeeId, String message);
}
