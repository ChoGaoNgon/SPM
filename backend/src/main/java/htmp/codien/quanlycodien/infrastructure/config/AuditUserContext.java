package htmp.codien.quanlycodien.infrastructure.config;

import java.util.Optional;

public final class AuditUserContext {
    private static final ThreadLocal<String> CURRENT = new ThreadLocal<>();

    private AuditUserContext() {
    }

    public static void setCurrentAuditor(String auditor) {
        CURRENT.set(auditor);
    }

    public static Optional<String> getCurrentAuditor() {
        return Optional.ofNullable(CURRENT.get());
    }

    public static void clear() {
        CURRENT.remove();
    }
}
