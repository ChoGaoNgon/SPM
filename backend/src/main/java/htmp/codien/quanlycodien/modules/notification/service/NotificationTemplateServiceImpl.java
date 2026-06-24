package htmp.codien.quanlycodien.modules.notification.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.common.exception.ResourceAlreadyExistsException;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.modules.notification.dto.NotificationTemplateRequest;
import htmp.codien.quanlycodien.modules.notification.dto.NotificationTemplateResponse;
import htmp.codien.quanlycodien.modules.notification.entity.NotificationTemplate;
import htmp.codien.quanlycodien.modules.notification.repository.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationTemplateServiceImpl implements NotificationTemplateService {
    private final NotificationTemplateRepository notificationTemplateRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<NotificationTemplateResponse> getAll() {
        return notificationTemplateRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<NotificationTemplateResponse> getById(Long id) {
        return notificationTemplateRepository.findById(id)
                .map(this::toResponse);
    }

    @Override
    @Transactional
    public NotificationTemplateResponse create(NotificationTemplateRequest request) {
        String eventCode = request.getEventCode().name();
        if (notificationTemplateRepository.existsByEventCode(eventCode)) {
            throw new ResourceAlreadyExistsException(
                    "Template cho sự kiện " + eventCode + " đã tồn tại. Vui lòng cập nhật thay vì tạo mới.");
        }

        NotificationTemplate template = modelMapper.map(request, NotificationTemplate.class);
        NotificationTemplate saved = notificationTemplateRepository.save(template);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public NotificationTemplateResponse update(Long id, NotificationTemplateRequest request) {
        NotificationTemplate template = notificationTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NotificationTemplate not found with id: " + id));

        String eventCode = request.getEventCode().name();
        if (notificationTemplateRepository.existsByEventCodeAndIdNot(eventCode, id)) {
            throw new ResourceAlreadyExistsException(
                    "Template cho sự kiện " + eventCode + " đã tồn tại. Mỗi sự kiện chỉ có 1 template.");
        }

        modelMapper.map(request, template);
        NotificationTemplate updated = notificationTemplateRepository.save(template);
        return toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!notificationTemplateRepository.existsById(id)) {
            throw new ResourceNotFoundException("NotificationTemplate not found with id: " + id);
        }
        notificationTemplateRepository.deleteById(id);
    }

    private NotificationTemplateResponse toResponse(NotificationTemplate template) {
        return modelMapper.map(template, NotificationTemplateResponse.class);
    }
}
