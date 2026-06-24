package htmp.codien.quanlycodien.modules.notification.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.common.exception.ResourceAlreadyExistsException;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.modules.notification.dto.NotificationRuleRequest;
import htmp.codien.quanlycodien.modules.notification.dto.NotificationRuleResponse;
import htmp.codien.quanlycodien.modules.notification.entity.NotificationRule;
import htmp.codien.quanlycodien.modules.notification.repository.NotificationRuleRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationRuleServiceImpl implements NotificationRuleService {
    private final NotificationRuleRepository notificationRuleRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<NotificationRuleResponse> getAll() {
        return notificationRuleRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<NotificationRuleResponse> getById(Long id) {
        return notificationRuleRepository.findById(id)
                .map(this::toResponse);
    }

    @Override
    @Transactional
    public NotificationRuleResponse create(NotificationRuleRequest request) {
        String eventCode = request.getEventCode().name();
        if (notificationRuleRepository.existsByEventCode(eventCode)) {
            throw new ResourceAlreadyExistsException(
                    "Rule cho sự kiện " + eventCode + " đã tồn tại. Vui lòng cập nhật thay vì tạo mới.");
        }

        NotificationRule rule = modelMapper.map(request, NotificationRule.class);
        NotificationRule saved = notificationRuleRepository.save(rule);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public NotificationRuleResponse update(Long id, NotificationRuleRequest request) {
        NotificationRule rule = notificationRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NotificationRule not found with id: " + id));

        String eventCode = request.getEventCode().name();
        if (notificationRuleRepository.existsByEventCodeAndIdNot(eventCode, id)) {
            throw new ResourceAlreadyExistsException(
                    "Rule cho sự kiện " + eventCode + " đã tồn tại. Mỗi sự kiện chỉ có 1 rule.");
        }

        modelMapper.map(request, rule);
        NotificationRule updated = notificationRuleRepository.save(rule);
        return toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!notificationRuleRepository.existsById(id)) {
            throw new ResourceNotFoundException("NotificationRule not found with id: " + id);
        }
        notificationRuleRepository.deleteById(id);
    }

    private NotificationRuleResponse toResponse(NotificationRule rule) {
        return modelMapper.map(rule, NotificationRuleResponse.class);
    }
}
