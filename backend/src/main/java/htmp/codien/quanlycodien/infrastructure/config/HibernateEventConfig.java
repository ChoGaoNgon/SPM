package htmp.codien.quanlycodien.infrastructure.config;

import org.hibernate.event.service.spi.EventListenerRegistry;
import org.hibernate.event.spi.EventType;
import org.hibernate.internal.SessionFactoryImpl;
import org.springframework.context.annotation.Configuration;

import htmp.codien.quanlycodien.infrastructure.listener.AuditDeleteListener;
import htmp.codien.quanlycodien.infrastructure.listener.AuditInsertListener;
import htmp.codien.quanlycodien.infrastructure.listener.AuditUpdateListener;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManagerFactory;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class HibernateEventConfig {

    private final EntityManagerFactory entityManagerFactory;
    private final AuditUpdateListener updateListener;
    private final AuditInsertListener insertListener;
    private final AuditDeleteListener deleteListener;

    @PostConstruct
    public void registerListeners() {

        SessionFactoryImpl sessionFactory = entityManagerFactory.unwrap(SessionFactoryImpl.class);

        EventListenerRegistry registry = sessionFactory
                .getServiceRegistry()
                .getService(EventListenerRegistry.class);

        registry.appendListeners(EventType.POST_UPDATE, updateListener);
        registry.appendListeners(EventType.POST_INSERT, insertListener);
        registry.appendListeners(EventType.POST_DELETE, deleteListener);
    }
}