package htmp.codien.quanlycodien.modules.feedback.service;

import java.nio.file.Paths;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.modelmapper.ModelMapper;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.infrastructure.storage.FileStorageService;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackAssignRequest;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackCreateRequest;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackDashboardResponse;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackDashboardStatsResponse;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackResponse;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackSummaryResponse;
import htmp.codien.quanlycodien.modules.feedback.entity.SystemFeedback;
import htmp.codien.quanlycodien.modules.feedback.entity.SystemFeedbackFile;
import htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus;
import htmp.codien.quanlycodien.modules.feedback.repository.SystemFeedbackFileRepository;
import htmp.codien.quanlycodien.modules.feedback.repository.SystemFeedbackRepository;
import htmp.codien.quanlycodien.modules.feedback.specification.SystemFeedbackSpecification;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationEvent;
import htmp.codien.quanlycodien.modules.notification.service.NotificationTriggerEvent;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SystemFeedbackServiceImpl implements SystemFeedbackService {
    private final SystemFeedbackRepository feedbackRepository;
    private final SystemFeedbackFileRepository feedbackFileRepository;
    private final FileStorageService fileStorageService;
    private final ModelMapper modelMapper;
    private final EmployeeRepository employeeRepository;
    private final ApplicationEventPublisher applicationEventPublisher;

    @Override
    public Void createFeedback(SystemFeedbackCreateRequest req, List<MultipartFile> uploadFiles,
            String keptOldFilesJson, String deletedOldFilesJson) {
        SystemFeedback feedback = modelMapper.map(req, SystemFeedback.class);
        Employee currentEmployee = SecurityUtils.getCurrentEmployee();
        if (feedback.getCreatedBy() == null && currentEmployee != null) {
            feedback.setCreatedBy(currentEmployee.getCode());
        }
        feedback.setStatus(SystemFeedbackStatus.PENDING);
        if (feedback.getRemark() == null) {
            feedback.setRemark("");
        }
        SystemFeedback savedFeedback = feedbackRepository.save(feedback);

        if (uploadFiles != null && !uploadFiles.isEmpty()) {
            for (MultipartFile file : uploadFiles) {
                try {
                    String storedFile = fileStorageService.storeFile(file, "system-feedbacks/" + savedFeedback.getId());
                    SystemFeedbackFile feedbackFile = new SystemFeedbackFile();
                    feedbackFile.setFilePath("system-feedbacks/" + savedFeedback.getId() + "/" + storedFile);
                    feedbackFile.setSystemFeedback(savedFeedback);
                    feedbackFileRepository.save(feedbackFile);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }

        var current = currentEmployee;
        applicationEventPublisher.publishEvent(
                new NotificationTriggerEvent(
                        NotificationEvent.SYSTEM_FEEDBACK_CREATED,
                        Map.of(
                                "feedbackTitle", savedFeedback.getTitle(),
                                "employeeCode", current != null ? current.getCode() : "SYSTEM",
                                "employeeName", current != null ? current.getName() : "SYSTEM")));

        return null;
    }

    @Override
    @Transactional
    public void updateFeedback(Long id, SystemFeedbackCreateRequest req, List<MultipartFile> uploadFiles,
            String keptOldFilesJson, String deletedOldFilesJson) {

        SystemFeedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Góp ý không tồn tại"));

        boolean isFeedbackResponsed = false;
        if (req.getResponse() != null && !req.getResponse().isBlank()) {

            isFeedbackResponsed = !req.getResponse().equals(feedback.getResponse());
        }

        if (feedback.getFiles() == null) {
            feedback.setFiles(new HashSet<>());
        }

        modelMapper.map(req, feedback);
        if (feedback.getRemark() == null) {
            feedback.setRemark("");
        }

        ObjectMapper mapper = new ObjectMapper();
        List<String> deletedOldFiles = Collections.emptyList();
        try {
            if (deletedOldFilesJson != null) {
                deletedOldFiles = mapper.readValue(deletedOldFilesJson, new TypeReference<List<String>>() {
                });
            }
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {

            e.printStackTrace();
        }


        if (feedback.getFiles() != null && !feedback.getFiles().isEmpty()) {
            var it = feedback.getFiles().iterator();
            while (it.hasNext()) {
                SystemFeedbackFile f = it.next();
                String fileName = Paths.get(f.getFilePath()).getFileName().toString();
                if (deletedOldFiles.contains(fileName)) {
                    try {
                        fileStorageService.deleteFile(f.getFilePath());
                    } catch (Exception e) {
                    }
                    it.remove();
                }
            }
            feedbackRepository.save(feedback);
        }

        if (uploadFiles != null && !uploadFiles.isEmpty()) {
            for (MultipartFile file : uploadFiles) {
                try {
                    String storedFile = fileStorageService.storeFile(file, "system-feedbacks/" +
                            feedback.getId());
                    SystemFeedbackFile feedbackFile = new SystemFeedbackFile();
                    feedbackFile.setFilePath("system-feedbacks/" + feedback.getId() + "/" +
                            storedFile);
                    feedbackFile.setSystemFeedback(feedback);
                    feedbackFileRepository.save(feedbackFile);

                    feedback.getFiles().add(feedbackFile);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }

        var current = SecurityUtils.getCurrentEmployee();
        if (isFeedbackResponsed) {
            applicationEventPublisher.publishEvent(
                    new NotificationTriggerEvent(
                            NotificationEvent.SYSTEM_FEEDBACK_RESPONDED,
                            Map.of(
                                    "feedbackResponse", feedback.getResponse(),
                                    "createdBy", feedback.getCreatedBy(),
                                    "employeeCode", current != null ? current.getCode() : "SYSTEM",
                                    "employeeName", current != null ? current.getName() : "SYSTEM")));
        } else {
            applicationEventPublisher.publishEvent(
                    new NotificationTriggerEvent(
                            NotificationEvent.SYSTEM_FEEDBACK_UPDATED,
                            Map.of(
                                    "feedbackTitle", feedback.getTitle(),
                                    "createdBy", feedback.getCreatedBy(),
                                    "employeeCode", current != null ? current.getCode() : "SYSTEM",
                                    "employeeName", current != null ? current.getName() : "SYSTEM")));
        }
    }

    @Override
    public List<SystemFeedbackSummaryResponse> getAllFeedbacks(String employeeCode,
            List<SystemFeedbackStatus> statuses) {
        return searchFeedbacks(null, employeeCode, statuses);
    }

    @Override
    public void assignFeedback(Long id, SystemFeedbackAssignRequest request) {
        SystemFeedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Góp ý không tồn tại"));

        if (request.getAssignToEmployeeId() != null) {
            Employee emp = employeeRepository.findById(request.getAssignToEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Nhân viên được giao không tồn tại"));
            feedback.setAssignToEmployee(emp);
        }

        if (request.getPriority() != null) {
            feedback.setPriority(request.getPriority());
        }

        if (request.getStatus() != null) {
            feedback.setStatus(request.getStatus());
        }

        feedback.setStartTime(request.getStartTime());
        feedback.setEndTime(request.getEndTime());
        feedback.setRemark(request.getRemark() != null ? request.getRemark() : "");

        feedbackRepository.save(feedback);
    }

    @Override
    public SystemFeedbackResponse getFeedbackById(Long id) {
        SystemFeedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Góp ý không tồn tại"));

        SystemFeedbackResponse resp = modelMapper.map(feedback, SystemFeedbackResponse.class);
        List<SystemFeedbackFile> files = feedbackFileRepository.findBySystemFeedback_Id(feedback.getId());
        resp.setFiles(files);
        applyCreatorInfo(resp, feedback.getCreatedBy());
        if (feedback.getAssignToEmployee() != null) {
            resp.setAssignToEmployeeId(feedback.getAssignToEmployee().getId());
            resp.setAssignToEmployeeCode(feedback.getAssignToEmployee().getCode());
            resp.setAssignToEmployeeName(feedback.getAssignToEmployee().getName());
        }
        return resp;
    }

    @Override
    public SystemFeedbackDashboardResponse getDashboardData() {
        DashboardVisibilityScope scope = resolveDashboardVisibilityScope();
        SystemFeedbackDashboardStatsResponse stats = feedbackRepository.getDashboardStats(
                scope.employeeCode(),
                scope.isDepartmentIT());

        return SystemFeedbackDashboardResponse.builder()
                .stats(stats != null ? stats
                        : SystemFeedbackDashboardStatsResponse.builder()
                                .total(0)
                                .pending(0)
                                .inProgress(0)
                                .done(0)
                                .rejected(0)
                                .build())
                .types(feedbackRepository.getDashboardTypes(scope.employeeCode(), scope.isDepartmentIT()))
                .modules(feedbackRepository.getDashboardModules(scope.employeeCode(), scope.isDepartmentIT()))
                .departments(feedbackRepository.getDashboardDepartments(scope.employeeCode(), scope.isDepartmentIT()))
                .employees(feedbackRepository.getDashboardEmployees(scope.employeeCode(), scope.isDepartmentIT()))
                .pendingList(feedbackRepository.getDashboardPriorityItems(
                        scope.employeeCode(),
                        scope.isDepartmentIT(),
                        List.of(SystemFeedbackStatus.PENDING, SystemFeedbackStatus.IN_PROGRESS),
                        PageRequest.of(0, 6)))
                .build();
    }

    @Override
    @Transactional
    public void deleteFeedback(Long id) {
        SystemFeedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Góp ý không tồn tại"));

        Set<SystemFeedbackFile> existingFiles = feedback.getFiles() != null ? feedback.getFiles()
                : Collections.emptySet();

        if (!existingFiles.isEmpty()) {
            try {
                fileStorageService.deleteFolder("system-feedbacks/" + feedback.getId());
            } catch (Exception e) {
            }
        }

        feedbackRepository.delete(feedback);
        var current = SecurityUtils.getCurrentEmployee();
        applicationEventPublisher.publishEvent(
                new NotificationTriggerEvent(
                        NotificationEvent.SYSTEM_FEEDBACK_DELETED,
                        Map.of(
                                "feedbackTitle", feedback.getTitle(),
                                "employeeCode", current != null ? current.getCode() : "SYSTEM",
                                "employeeName", current != null ? current.getName() : "SYSTEM")));
    }

    @Override
    public List<SystemFeedbackSummaryResponse> searchFeedbacks(String keyword, String employeeCode,
            List<SystemFeedbackStatus> statuses) {

        boolean isDepartmentIT = false;

        if (employeeCode != null && !employeeCode.isBlank()) {
            Employee employee = employeeRepository.findByCode(employeeCode)
                    .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại"));

            if (employee.getDepartment() != null) {
                String deptCode = employee.getDepartment().getCode();
                isDepartmentIT = "IT".equals(deptCode) || "P-IT&ERP".equals(deptCode);
            }
        }

        Specification<SystemFeedback> spec = Specification.allOf();

        if (keyword != null && !keyword.isBlank()) {
            spec = spec.and(SystemFeedbackSpecification.searchByKeyword(keyword));
        }

        if (statuses != null && !statuses.isEmpty()) {
            spec = spec.and(SystemFeedbackSpecification.hasStatuses(statuses));
        }

        if (!isDepartmentIT && employeeCode != null && !employeeCode.isBlank()) {
            spec = spec.and(SystemFeedbackSpecification.byCreatedBy(employeeCode));
        }

        List<SystemFeedback> feedbacks = feedbackRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));

        return feedbacks.stream().map(this::mapToSummaryResponse).toList();
    }

    private DashboardVisibilityScope resolveDashboardVisibilityScope() {
        Employee currentEmployee = SecurityUtils.getCurrentEmployee();
        boolean isDepartmentIT = SecurityUtils.hasDepartmentCode("IT") || SecurityUtils.hasDepartmentCode("P-IT&ERP");
        String employeeCode = !isDepartmentIT && currentEmployee != null ? currentEmployee.getCode() : null;
        return new DashboardVisibilityScope(employeeCode, isDepartmentIT);
    }

    private record DashboardVisibilityScope(String employeeCode, boolean isDepartmentIT) {
    }

    private SystemFeedbackSummaryResponse mapToSummaryResponse(SystemFeedback feedback) {
        Employee createdByEmp = resolveEmployeeByAuditor(feedback.getCreatedBy());
        String creatorCode = createdByEmp != null ? createdByEmp.getCode() : feedback.getCreatedBy();
        String creatorName = createdByEmp != null ? createdByEmp.getName() : feedback.getCreatedBy();

        return SystemFeedbackSummaryResponse.builder()
                .id(feedback.getId())
                .title(feedback.getTitle())
                .requestType(feedback.getRequestType())
                .status(feedback.getStatus())
                .priority(feedback.getPriority())
                .module(feedback.getModule())
                .createdByEmployeeCode(creatorCode)
                .createdByEmployeeName(creatorName)
                .createdAt(feedback.getCreatedAt())
                .assignToEmployeeId(
                        feedback.getAssignToEmployee() != null ? feedback.getAssignToEmployee().getId() : null)
                .assignToEmployeeCode(
                        feedback.getAssignToEmployee() != null ? feedback.getAssignToEmployee().getCode() : null)
                .assignToEmployeeName(
                        feedback.getAssignToEmployee() != null ? feedback.getAssignToEmployee().getName() : null)
                .build();
    }

    private void applyCreatorInfo(SystemFeedbackResponse response, String auditorValue) {
        Employee createdByEmployee = resolveEmployeeByAuditor(auditorValue);

        response.setCreatedByEmployeeCode(createdByEmployee != null ? createdByEmployee.getCode() : auditorValue);
        response.setCreatedByEmployeeName(createdByEmployee != null ? createdByEmployee.getName() : auditorValue);
    }

    private Employee resolveEmployeeByAuditor(String auditorValue) {
        if (auditorValue == null || auditorValue.isBlank() || "SYSTEM".equalsIgnoreCase(auditorValue)) {
            return null;
        }

        Employee employee = employeeRepository.findByCode(auditorValue).orElse(null);
        if (employee != null) {
            return employee;
        }

        try {
            return employeeRepository.findById(Long.valueOf(auditorValue)).orElse(null);
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

}
