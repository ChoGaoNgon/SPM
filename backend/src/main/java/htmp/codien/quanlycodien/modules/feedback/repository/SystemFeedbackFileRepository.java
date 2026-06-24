package htmp.codien.quanlycodien.modules.feedback.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import htmp.codien.quanlycodien.modules.feedback.entity.SystemFeedbackFile;

public interface SystemFeedbackFileRepository extends JpaRepository<SystemFeedbackFile, Long> {

    List<SystemFeedbackFile> findBySystemFeedback_Id(Long id);

}
