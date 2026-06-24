package htmp.codien.quanlycodien.modules.notification.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.notification.entity.NotificationReceiver;

public interface NotificationReceiverRepository extends JpaRepository<NotificationReceiver, Long> {
    long countByEmployeeIdAndIsReadFalse(Long employeeId);

    @Query(value = "SELECT COUNT(*) " +
            "FROM notification_receivers nr " +
            "WHERE nr.employee_id = :employeeId " +
            "AND nr.is_read = false", nativeQuery = true)
    Long countUnreadByEmployeeId(@Param("employeeId") Long employeeId);

    Optional<NotificationReceiver> findByNotificationIdAndEmployeeId(Long notificationId, Long employeeId);

    @Query(value = """
            SELECT
                n.id AS notificationId,
                n.title,
                n.message,
                n.type,
                n.url,
                nr.is_read AS isRead,
                n.created_at AS createdAt,
                d.name AS departmentName
            FROM notifications n
            JOIN notification_receivers nr ON n.id = nr.notification_id
            JOIN employees e ON n.updated_by = e.code
            JOIN departments d ON e.department_id = d.id
            WHERE nr.employee_id = :employeeId
            ORDER BY n.created_at DESC
            LIMIT 10
            """, nativeQuery = true)
    List<Object[]> findTop10NotificationWithReceiverByEmployeeId(@Param("employeeId") Long employeeId);

    @Query(value = """
            SELECT
                n.id AS notificationId,
                n.title,
                n.message,
                n.type,
                n.url,
                nr.is_read AS isRead,
                n.created_at AS createdAt,
                d.name AS departmentName
            FROM notifications n
            JOIN notification_receivers nr ON n.id = nr.notification_id
            JOIN employees e ON n.updated_by = e.code
            JOIN departments d ON e.department_id = d.id
            WHERE nr.employee_id = :employeeId
            ORDER BY n.created_at DESC
            """, nativeQuery = true)
    List<Object[]> findAllNotificationWithReceiverByEmployeeId(Long employeeId);

    @Modifying
    @Query("UPDATE NotificationReceiver nr SET nr.isRead = true WHERE nr.employeeId = :employeeId AND nr.isRead = false")
    void markAllAsReadByEmployeeId(@Param("employeeId") Long employeeId);

}