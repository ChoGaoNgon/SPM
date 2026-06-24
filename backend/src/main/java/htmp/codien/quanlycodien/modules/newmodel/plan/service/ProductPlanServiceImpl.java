package htmp.codien.quanlycodien.modules.newmodel.plan.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.common.enums.ApprovalStatus;
import htmp.codien.quanlycodien.common.enums.HtmpResult;
import htmp.codien.quanlycodien.common.enums.HtmpStatus;
import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.common.exception.ConflictException;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.common.util.TemplateUtils;
import htmp.codien.quanlycodien.infrastructure.storage.FileStorageService;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.machine.entity.Machine;
import htmp.codien.quanlycodien.modules.machine.repository.MachineRepository;
import htmp.codien.quanlycodien.modules.mail.entity.MailAddress;
import htmp.codien.quanlycodien.modules.mail.repository.MailAddressRepository;
import htmp.codien.quanlycodien.modules.mail.service.MailService;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.MoldTrialPlanUpdateRequestForKT;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.MoldTrialPlanUpdateRequestForLOG;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.MoldTrialWeeklyCustomerStatDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.MoldTrialWeeklyStatisticsResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PlanApprovalRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PlanCreationRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PlanResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PlanUpdateRequestTimeRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanActualSupplyRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanPlasticActualDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.sendMail.SendMoldTrialPlanMailRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanApproval;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanApproveResult;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanDelayLog;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanInspection;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanResinMapping;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanSupplyMapping;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductFaInspectionRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanApprovalRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanDelayLogRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.service.ProductDeletorService;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.PlanDelayType;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductNmdInfoStatus;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;
import htmp.codien.quanlycodien.modules.newmodel.statistic.helper.StatisticsPeriodResolver;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.MoldTrialPlanListView;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.MoldTrialWeeklyCustomerProjection;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationEvent;
import htmp.codien.quanlycodien.modules.permission.service.PermissionService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductPlanServiceImpl implements ProductPlanService {

    private final ProductPlanRepository productPlanRepository;
    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;
    private final EmployeeRepository employeeRepository;
    private final FileStorageService fileStorageService;
    private final ProductFaInspectionRepository faInspectionRepository;
    private final MachineRepository machineRepository;
    private final PermissionService permissionServiceImpl;
    private final MailService mailService;
    private final MailAddressRepository mailAddressRepository;
    private final ProductPlanApprovalRepository approvalRepository;
    private final PermissionService permissionService;
    private final ProductPlanDelayLogRepository productPlanDelayLogRepository;
    private final ProductPlanValidationService productPlanValidationService;
    private final ProductPlanApprovalManager approvalManager;
    private final ProductPlanResponseMapper responseMapper;
    private final ProductPlanMaterialService productPlanMaterialService;
    private final ProductPlanNotificationService notificationService;
    private final ProductPlanNoteService productPlanNoteService;
    private final ProductDeletorService productDeletorService;

    @Override
    @Transactional
    public void createPlan(Long productId, PlanCreationRequest req, TypePlan typePlan) {
        if (productId == null) {
            throw new ConflictException("Không xác định được sản phẩm để tạo kế hoạch.");
        }
        if (req == null) {
            throw new ConflictException("Dữ liệu tạo kế hoạch không hợp lệ.");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));

        if (product.getIsApprovedByHeadKD() != null && !product.getIsApprovedByHeadKD()) {
            throw new ConflictException(
                    "Sản phẩm chưa được phê duyệt bởi trưởng phòng KD. Vui lòng hoàn tất phê duyệt trước khi tạo kế hoạch thử khuôn.");
        }

        if (product.getNmdInfoStatus() != ProductNmdInfoStatus.RECEIVED) {
            throw new ConflictException(
                    "Thông tin sản phẩm từ NMD chưa được nhận đầy đủ. Vui lòng cập nhật trạng thái thông tin từ NMD thành 'RECEIVED' trước khi tạo kế hoạch thử khuôn.");
        }

        if (typePlan != TypePlan.SECOND_PROCESS && product.getMold() == null) {
            throw new ConflictException(
                    "Sản phẩm chưa có mã khuôn. Vui lòng cập nhật mã khuôn trước khi tạo kế hoạch thử khuôn.");
        }

        if (req.getResponsibleEmployeeId() == null) {
            throw new ResourceNotFoundException("Vui lòng chọn nhân viên chịu trách nhiệm kế hoạch.");
        }

        if (productPlanRepository.existsByNameAndProduct_Id(req.getName(), productId)) {
            throw new ConflictException(
                    "Tên kế hoạch đã tồn tại cho sản phẩm này. Vui lòng chọn tên khác.");
        }

        Employee employee = employeeRepository.findById(req.getResponsibleEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên chịu trách nhiệm không tồn tại."));

        Employee creator = employeeRepository.findByCode(SecurityUtils.getCurrentEmployee().getCode())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy thông tin nhân viên."));

        Machine machine = null;
        if (req.getMachineId() != null) {
            machine = machineRepository.findById(req.getMachineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Máy không tồn tại."));
        }

        productPlanValidationService.validateDailyPlannedLimit(typePlan, creator);
        productPlanValidationService.validateMachineTimeConflict(
                machine != null ? machine.getId() : null,
                req.getRequestStartTime(),
                req.getRequestEndTime(),
                null);

        ProductPlan plan = new ProductPlan();
        plan.setId(null);
        plan.setProduct(product);
        plan.setResponsibleEmployee(employee);
        plan.setName(req.getName());
        plan.setCostFactory(req.getCostFactory());
        plan.setRequestStartTime(req.getRequestStartTime());
        plan.setRequestEndTime(req.getRequestEndTime());
        plan.setSampleQuantity(req.getSampleQuantity());
        plan.setDeliveryQuantity(req.getDeliveryQuantity());
        plan.setProcessStep(req.getProcessStep());
        plan.setMachineCapacityTon(req.getMachineCapacityTon());
        plan.setResinGrade(req.getResinGrade());
        plan.setHtmpResin(req.getHtmpResin());
        plan.setNumberOfPeople(req.getNumberOfPeople());
        plan.setResinColor(req.getResinColor());
        plan.setResinCode(req.getResinCode());
        plan.setDryingTemperature(req.getDryingTemperature());
        plan.setDryer(req.getDryer());
        plan.setDryingTime(req.getDryingTime());
        plan.setScrewTemperature(req.getScrewTemperature());
        plan.setPurpose(req.getPurpose());
        plan.setExpectedFaSubmitDate(req.getExpectedFaSubmitDate());
        plan.setRemark(req.getRemark());
        plan.setMachine(machine);
        plan.setRequestResinFromPC(req.getRequestResinFromPC() != null && req.getRequestResinFromPC());
        plan.setIsUnusual(productPlanValidationService.isUnusualPlan(req.getRequestStartTime()));
        plan.setStatus(HtmpStatus.PLANNED);
        plan.setTryNo(req.getTryNo());
        plan.setDryingTemperatureActual(req.getDryingTemperatureActual());
        plan.setDryingTimeActual(req.getDryingTimeActual());
        plan.setScrewTemperatureActual(req.getScrewTemperatureActual());

        if (typePlan == TypePlan.EVENT) {
            plan.setTypePlan(TypePlan.EVENT);
        } else if (typePlan == TypePlan.MOLD_TRIAL) {
            plan.setTypePlan(TypePlan.MOLD_TRIAL);
        } else if (typePlan == TypePlan.SECOND_PROCESS) {
            plan.setTypePlan(TypePlan.SECOND_PROCESS);
        } else {
            plan.setTypePlan(null);
        }

        productPlanMaterialService.replacePlastics(plan, req.getPlastics());
        productPlanMaterialService.replaceSupplies(plan, req.getSupplies());

        approvalManager.generateApprovalsFromTemplate(plan, creator);

        productPlanRepository.save(plan);
        productRepository.save(product);

        notificationService.sendNotification(NotificationEvent.PRODUCT_PLAN_CREATED, plan);
    }

    @Override
    @Transactional
    public void updatePlan(Long id, PlanCreationRequest req) {
        if (req == null) {
            throw new ConflictException("Dữ liệu cập nhật kế hoạch không hợp lệ.");
        }

        ProductPlan plan = productPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kế hoạch thử khuôn không tồn tại."));

        if (req.getResponsibleEmployeeId() == null) {
            throw new ConflictException("Vui lòng chọn nhân viên chịu trách nhiệm kế hoạch.");
        }
        if (plan.getProduct() == null || plan.getProduct().getId() == null) {
            throw new ConflictException("Kế hoạch hiện tại chưa liên kết sản phẩm hợp lệ.");
        }

        Product product = productRepository.findById(plan.getProduct().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại."));

        Employee employee = employeeRepository.findById(req.getResponsibleEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên chịu trách nhiệm không tồn tại."));

        Machine machine = null;
        if (req.getMachineId() != null) {
            machine = machineRepository.findById(req.getMachineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Máy không tồn tại."));
        }

        if (!plan.getName().equals(req.getName())
                && productPlanRepository.existsByNameAndProduct_Id(req.getName(), product.getId())) {
            throw new ConflictException(
                    "Tên kế hoạch đã tồn tại cho sản phẩm này. Vui lòng chọn tên khác.");
        }

        plan.setProduct(product);
        plan.setResponsibleEmployee(employee);
        plan.setRequestStartTime(req.getRequestStartTime());
        plan.setRequestEndTime(req.getRequestEndTime());
        plan.setIsUnusual(productPlanValidationService.isUnusualPlan(req.getRequestStartTime()));

        productPlanValidationService.validateMachineTimeConflict(
                machine != null ? machine.getId() : null,
                plan.getRequestStartTime(), plan.getRequestEndTime(), plan.getId());

        productPlanMaterialService.replacePlastics(plan, req.getPlastics());
        productPlanMaterialService.replaceSupplies(plan, req.getSupplies());

        plan.setDryer(req.getDryer());
        plan.setProcessStep(req.getProcessStep());
        plan.setHtmpResin(req.getHtmpResin());
        plan.setRemark(req.getRemark());
        plan.setSampleQuantity(req.getSampleQuantity());
        plan.setDeliveryQuantity(req.getDeliveryQuantity());
        plan.setResinCode(req.getResinCode());
        plan.setResinGrade(req.getResinGrade());
        plan.setResinColor(req.getResinColor());
        plan.setDryingTemperature(req.getDryingTemperature());
        plan.setDryingTime(req.getDryingTime());
        plan.setScrewTemperature(req.getScrewTemperature());
        plan.setPurpose(req.getPurpose());
        plan.setExpectedFaSubmitDate(req.getExpectedFaSubmitDate());
        plan.setNumberOfPeople(req.getNumberOfPeople());
        plan.setMachine(machine);
        plan.setTryNo(req.getTryNo());
        plan.setDryingTemperatureActual(req.getDryingTemperatureActual());
        plan.setDryingTimeActual(req.getDryingTimeActual());
        plan.setScrewTemperatureActual(req.getScrewTemperatureActual());

        productPlanRepository.save(plan);
        notificationService.sendNotification(NotificationEvent.PRODUCT_PLAN_UPDATED_DETAIL_AND_EXPECTED, plan);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlanResponse> getAllPlanByProductId(Long productId) {
        List<ProductPlan> moldTrialPlans = productPlanRepository.findByProduct_Id(productId);

        return moldTrialPlans.stream()
                .map(plan -> {
                    PlanResponse dto = PlanResponse.builder()
                            .id(plan.getId())
                            .name(plan.getName())
                            .typePlan(plan.getTypePlan() != null ? plan.getTypePlan().name() : null)
                            .costFactory(plan.getCostFactory())
                            .requestStartTime(plan.getRequestStartTime())
                            .requestEndTime(plan.getRequestEndTime())
                            .actualStartTime(plan.getActualStartTime())
                            .actualEndTime(plan.getActualEndTime())
                            .purpose(plan.getPurpose())
                            .processStep(plan.getProcessStep())
                            .sampleQuantity(plan.getSampleQuantity())
                            .status(plan.getStatus())
                            .statusDescription(plan.getStatus() != null ? plan.getStatus().getDescription() : null)
                            .statusColor(plan.getStatus() != null ? plan.getStatus().getColor() : null)
                            .machineId(plan.getMachine() != null ? plan.getMachine().getId() : null)
                            .machineCode(plan.getMachine() != null ? plan.getMachine().getCode() : null)
                            .machineCapacityTon(
                                    plan.getMachine() != null ? plan.getMachine().getCapacityTon() : null)
                            .machinePosition(plan.getMachine() != null ? plan.getMachine().getPosition() : null)
                            .tryNo(plan.getTryNo())
                            .dryingTemperature(plan.getDryingTemperature())
                            .dryingTemperatureActual(plan.getDryingTemperatureActual())
                            .dryingTime(plan.getDryingTime())
                            .dryingTimeActual(plan.getDryingTimeActual())
                            .screwTemperature(plan.getScrewTemperature())
                            .screwTemperatureActual(plan.getScrewTemperatureActual())
                            .createdByCode(plan.getCreatedBy())
                            .createdAt(plan.getCreatedAt())
                            .build();
                    dto.setCreatedByName(employeeRepository.findByCode(plan.getCreatedBy())
                            .map(Employee::getName)
                            .orElse("Chưa có tên"));

                    responseMapper.populatePlanResponseDetails(plan, dto);

                    ProductPlanInspection latestFa = faInspectionRepository.findLatestByPlanId(plan.getId())
                            .orElse(null);
                    dto.setResult(latestFa != null ? latestFa.getFinalResult() : null);
                    return dto;
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PlanResponse getPlanById(Long id) {
        ProductPlan plan = productPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kế hoạch thử khuôn không tồn tại"));

        PlanResponse res = modelMapper.map(plan, PlanResponse.class);
        responseMapper.populatePlanResponseDetails(plan, res);
        return res;
    }

    @Override
    @Transactional
    public void updateActualMoldTrialPlanForKT(Long id, MoldTrialPlanUpdateRequestForKT req) {
        productPlanValidationService.validateAllApprovalsCompleted(id);

        ProductPlan plan = productPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kế hoạch thử khuôn với id: " + id + "Không tồn tại"));

        if (req.getActualEndTime() != null) {
            plan.setActualEndTime(req.getActualEndTime());
            if (req.getActualEndTime().isAfter(plan.getRequestEndTime())) {
                long delayMinutes = ChronoUnit.MINUTES.between(plan.getRequestEndTime(), req.getActualEndTime());
                plan.setStatus(HtmpStatus.DELAYED);

                List<ProductPlanDelayLog> existingLogs = productPlanDelayLogRepository
                        .findByPlanIdAndDelayTypeOrderByCreatedAtDesc(id, PlanDelayType.PLAN_END_TIME_DELAY);

                ProductPlanDelayLog delayLog;
                if (!existingLogs.isEmpty()) {

                    delayLog = existingLogs.get(0);
                } else {

                    delayLog = new ProductPlanDelayLog();
                    delayLog.setPlan(plan);
                    delayLog.setDelayType(PlanDelayType.PLAN_END_TIME_DELAY);
                }

                delayLog.setDelayDuration(delayMinutes);
                delayLog.setReason(req.getPlanDelayReason());

                productPlanDelayLogRepository.save(delayLog);

                if (!plan.getDelayLogs().contains(delayLog)) {
                    plan.getDelayLogs().add(delayLog);
                }
            } else {
                plan.setStatus(HtmpStatus.WAITINGQCCHECK);
            }
        }

        if (req.getActualStartTime() != null) {
            plan.setActualStartTime(req.getActualStartTime());
            if (plan.getActualEndTime() == null
                    && plan.getStatus() != HtmpStatus.DELAYED
                    && plan.getStatus() != HtmpStatus.WAITINGQCCHECK) {
                plan.setStatus(HtmpStatus.RUNNING);
            }
        }

        if (req.getProductSampleSubmitDate() != null) {
            plan.setActualFaSubmitDate(req.getProductSampleSubmitDate());
            if (req.getProductSampleSubmitDate().isAfter(plan.getExpectedFaSubmitDate())) {
                long delayMinutes = ChronoUnit.MINUTES.between(plan.getExpectedFaSubmitDate(),
                        req.getProductSampleSubmitDate());
                ProductPlanDelayLog delayLog = new ProductPlanDelayLog();
                delayLog.setPlan(plan);
                delayLog.setDelayDuration(delayMinutes);
                delayLog.setDelayType(PlanDelayType.FA_SUBMIT_DELAY);
                delayLog.setReason(req.getFaSubmitDelayReason());
                plan.getDelayLogs().add(delayLog);
                productPlanDelayLogRepository.save(delayLog);
            }
        }

        if (req.getProductSampleSubmitDate() != null) {
            plan.setProductSampleSubmitDate(req.getProductSampleSubmitDate());
        }
        if (req.getProductSampleSubmitterId() != null) {
            Employee submitter = employeeRepository.findById(req.getProductSampleSubmitterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Người gửi mẫu sản phẩm không tồn tại."));
            plan.setProductSampleSubmitter(submitter);
        }

        if (req.getDryingTemperatureActual() != null) {
            plan.setDryingTemperatureActual(req.getDryingTemperatureActual());
        }
        if (req.getDryingTimeActual() != null) {
            plan.setDryingTimeActual(req.getDryingTimeActual());
        }

        productPlanRepository.save(plan);
        productRepository.save(plan.getProduct());
        notificationService.sendNotification(NotificationEvent.PRODUCT_PLAN_UPDATED_ACTUAL_TIME, plan);
    }

    @Override
    @Transactional
    public void updateActualMoldTrialPlanForLOG(Long id, MoldTrialPlanUpdateRequestForLOG req) {
        productPlanValidationService.validateAllApprovalsCompleted(id);

        ProductPlan moldTrialPlan = productPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kế hoạch thử khuôn với id: " + id + "Không tồn tại"));

        if (req.getActualPlastics() != null && !req.getActualPlastics().isEmpty()) {
            for (ProductPlanPlasticActualDTO dto : req.getActualPlastics()) {
                ProductPlanResinMapping existing = moldTrialPlan.getProductPlanResins()
                        .stream()
                        .filter(p -> p.getId().equals(dto.getId()))
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    existing.setPlasticActualWeight(dto.getPlasticActualWeight());
                    existing.setRemark(dto.getRemark());
                }
            }
        }

        if (req.getSupplies() != null && !req.getSupplies().isEmpty()) {
            for (ProductPlanActualSupplyRequest dto : req.getSupplies()) {
                ProductPlanSupplyMapping existing = moldTrialPlan.getProductPlanSupplies()
                        .stream()
                        .filter(s -> s.getSupplyCode() != null && s.getSupplyCode().equals(dto.getCode()))
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    existing.setSupplyActualQuantity(dto.getSupplyActualQuantity());
                    existing.setRemark(dto.getRemark());
                }
            }
        }

        productPlanRepository.save(moldTrialPlan);
        notificationService.sendNotification(NotificationEvent.PRODUCT_PLAN_UPDATED_ACTUAL_MATERIAL, moldTrialPlan);
    }

    @Override
    @Transactional
    public void deleteProductMoldTrialPlan(Long id) {
        ProductPlan plan = productPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kế hoạch thử khuôn không tồn tại."));

        Employee currentEmployee = SecurityUtils.getCurrentEmployee();

        boolean isApproved = !plan.getApprovals().isEmpty()
                && plan.getApprovals().get(0).getStatus() == ApprovalStatus.APPROVED;

        if (isApproved && !permissionServiceImpl.hasPermission(currentEmployee, "NMD_PRODUCT_PLAN_DELETE")) {
            throw new ConflictException("Kế hoạch đã được phê duyệt, bạn không có quyền xóa.");
        }

        if (plan.getProduct() == null || plan.getProduct().getModel() == null) {
            throw new ConflictException("Kế hoạch chưa có thông tin sản phẩm/mẫu hợp lệ để thực hiện xóa.");
        }
        String modelCode = plan.getProduct().getModel().getCode();
        String productCode = plan.getProduct().getCode();

        productDeletorService.deleteSinglePlanWithDependencies(plan);

        String folderPath = "models/" + modelCode +
                "/" + productCode +
                "/" + plan.getName();

        fileStorageService.deleteFolder(folderPath);

        notificationService.sendNotification(NotificationEvent.PRODUCT_PLAN_DELETED, plan);
    }

    @Override
    @Transactional(readOnly = true)
    public PlanResponse getLatestMoldTrialPlanByHtmpResin(String htmpResin) {
        if (htmpResin == null || htmpResin.trim().isEmpty()) {
            return null;
        }

        ProductPlan latestPlan = productPlanRepository.findTopByHtmpResinOrderByCreatedAtDesc(htmpResin)
                .orElse(null);

        if (latestPlan == null) {
            return null;
        }

        PlanResponse response = modelMapper.map(latestPlan, PlanResponse.class);
        responseMapper.populatePlanResponseDetails(latestPlan, response);
        return response;
    }

    @Override
    public List<String> getAllDistinctHtmpResin() {
        return productPlanRepository.findDistinctHtmpResin();
    }

    @Override
    public List<String> getAllDistinctDryer() {
        return productPlanRepository.findDistinctDryer();
    }

    @Override
    public List<String> getAllDistinctProcessStep() {

        return productPlanRepository.findDistinctProcessStep();
    }

    @Override
    @Transactional
    public void approveProductPlanApproval(Long planId, PlanApprovalRequest req) {

        ProductPlan plan = productPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Kế hoạch không tồn tại."));

        ProductPlanApproval approval = approvalRepository
                .findByPlan_IdAndApprovalType(planId, req.getApprovalType())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy approval với loại: " + req.getApprovalType()));

        if (approval.getStatus() != ApprovalStatus.PENDING) {
            throw new ConflictException("Approval này đã được xử lý. Trạng thái hiện tại: " + approval.getStatus());
        }

        Employee currentEmployee = SecurityUtils.getCurrentEmployee();

        currentEmployee = employeeRepository.findById(currentEmployee.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin nhân viên hiện tại."));

        boolean isSuperAdmin = SecurityUtils.hasRole(Role.SUPERADMIN);

        if (!isSuperAdmin && approval.getRequiredPermission() != null && !approval.getRequiredPermission().isEmpty()) {
            boolean hasPermission = permissionService.hasPermission(currentEmployee, approval.getRequiredPermission());
            if (!hasPermission) {
                throw new RuntimeException(
                        "Bạn không có quyền phê duyệt bước này. Quyền yêu cầu: " + approval.getRequiredPermission());
            }
        }

        boolean requireSameDepartmentAsCreator = "APPROVE_CHECKER".equalsIgnoreCase(approval.getApprovalType())
                || "APPROVE_HEAD_NMD".equalsIgnoreCase(approval.getApprovalType());

        if (!isSuperAdmin && requireSameDepartmentAsCreator) {
            Employee planCreator = employeeRepository.findByCode(plan.getCreatedBy()).orElse(null);
            if (planCreator != null && currentEmployee.getDepartment() != null && planCreator.getDepartment() != null) {
                if (!currentEmployee.getDepartment().getId().equals(planCreator.getDepartment().getId())) {
                    throw new RuntimeException(
                            "Bạn không thể phê duyệt kế hoạch này vì không cùng phòng ban với người tạo. " +
                                    "Phòng ban của bạn: " + currentEmployee.getDepartment().getName() +
                                    ", Phòng ban người tạo: " + planCreator.getDepartment().getName());
                }
            }
        }

        List<ProductPlanApproval> previousApprovals = approvalRepository
                .findPreviousApprovals(planId, approval.getApprovalOrder());

        boolean hasUncompletedPrevious = previousApprovals.stream()
                .anyMatch(a -> a.getStatus() == ApprovalStatus.PENDING);

        if (hasUncompletedPrevious) {
            throw new ConflictException(
                    "Không thể phê duyệt. Các bước phê duyệt trước đó chưa hoàn thành.");
        }

        boolean hasPreviousRejected = previousApprovals.stream()
                .anyMatch(a -> a.getStatus() == ApprovalStatus.REJECTED);

        if (hasPreviousRejected && req.getStatus() == ApprovalStatus.APPROVED) {
            throw new ConflictException(
                    "Không thể phê duyệt vì có bước phê duyệt trước đó đã bị từ chối.");
        }

        if (req.getStatus() != ApprovalStatus.APPROVED && req.getStatus() != ApprovalStatus.REJECTED) {
            throw new ConflictException("Trạng thái phê duyệt không hợp lệ. Chỉ chấp nhận APPROVED hoặc REJECTED.");
        }

        approval.setStatus(req.getStatus());
        approval.setApprovedBy(currentEmployee);
        approval.setApprovedAt(LocalDateTime.now());
        approval.setRemark(req.getRemark());

        approvalRepository.save(approval);

        approvalManager.updatePlanStatusBasedOnApprovals(plan);

        if (req.getStatus() == ApprovalStatus.REJECTED) {
            notificationService.sendNotification(NotificationEvent.PRODUCT_PLAN_REJECTED, plan, approval);
        } else {

            NotificationEvent approvedEvent = mapApprovalTypeToApprovedEvent(approval.getApprovalType());

            NotificationEvent waitingEvent = approvalRepository
                    .findByPlan_IdOrderByApprovalOrderAsc(plan.getId())
                    .stream()
                    .filter(a -> a.getStatus() == ApprovalStatus.PENDING)
                    .findFirst()
                    .map(next -> mapApprovalTypeToWaitingEvent(next.getApprovalType()))
                    .orElse(NotificationEvent.PRODUCT_PLAN_APPROVED);

            notificationService.sendApprovalNotifications(approvedEvent, waitingEvent, plan, approval);
        }

    }

    private NotificationEvent mapApprovalTypeToApprovedEvent(String approvalType) {
        if (approvalType == null) {
            return NotificationEvent.PRODUCT_PLAN_APPROVED;
        }

        String normalized = approvalType.trim().toUpperCase();

        return switch (normalized) {
            case "CHECKER", "APPROVE_CHECKER" -> NotificationEvent.PRODUCT_PLAN_CHECKER_APPROVED;
            case "APPROVE_HEAD_NMD", "HEAD_NMD" -> NotificationEvent.PRODUCT_PLAN_HEAD_NMD_APPROVED;
            case "APPROVE_RESIN", "RESIN" -> NotificationEvent.PRODUCT_PLAN_RESIN_APPROVED;
            case "APPROVE_PLAN", "PC", "PLAN" -> NotificationEvent.PRODUCT_PLAN_PC_APPROVED;
            case "APPROVE_TECHNICAL", "TECHNICAL" -> NotificationEvent.PRODUCT_PLAN_TECHNICAL_APPROVED;
            case "APPROVE_PRODUCTION", "PRODUCTION" -> NotificationEvent.PRODUCT_PLAN_PRODUCTION_APPROVED;
            default -> NotificationEvent.PRODUCT_PLAN_APPROVED;
        };
    }

    private NotificationEvent mapApprovalTypeToWaitingEvent(String approvalType) {
        if (approvalType == null) {
            return NotificationEvent.PRODUCT_PLAN_APPROVED;
        }

        String normalized = approvalType.trim().toUpperCase();

        return switch (normalized) {
            case "CHECKER", "APPROVE_CHECKER" -> NotificationEvent.PRODUCT_PLAN_WAITING_CHECKER;
            case "APPROVE_HEAD_NMD", "HEAD_NMD" -> NotificationEvent.PRODUCT_PLAN_WAITING_HEAD_NMD;
            case "APPROVE_RESIN", "RESIN" -> NotificationEvent.PRODUCT_PLAN_WAITING_RESIN;
            case "APPROVE_PLAN", "PC", "PLAN" -> NotificationEvent.PRODUCT_PLAN_WAITING_PLAN;
            case "APPROVE_TECHNICAL", "TECHNICAL" -> NotificationEvent.PRODUCT_PLAN_WAITING_TECHNICAL;
            case "APPROVE_PRODUCTION", "PRODUCTION" -> NotificationEvent.PRODUCT_PLAN_WAITING_PRODUCTION;
            default -> NotificationEvent.PRODUCT_PLAN_APPROVED;
        };
    }

    @Override
    @Transactional
    public void updateMoldTrialPlanApproveResult(Long id, Boolean resultedByKT, Boolean resultedByMold,
            Boolean resultedByNMD, Boolean resultedByQC, Boolean resultedBySX) {

        ProductPlan plan = productPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kế hoạch thử khuôn không tồn tại."));

        java.util.Set<String> allowedDepartments = getAllowedApproveResultDepartments(plan.getTypePlan());

        java.util.Map<String, Boolean> departmentResults = new java.util.HashMap<>();
        if (resultedByKT != null && allowedDepartments.contains("KT"))
            departmentResults.put("KT", resultedByKT);
        if (resultedByMold != null && allowedDepartments.contains("MOLD"))
            departmentResults.put("MOLD", resultedByMold);
        if (resultedByNMD != null && allowedDepartments.contains("P-NMD"))
            departmentResults.put("P-NMD", resultedByNMD);
        if (resultedByQC != null && allowedDepartments.contains("QC"))
            departmentResults.put("QC", resultedByQC);
        if (resultedBySX != null && allowedDepartments.contains("SX"))
            departmentResults.put("SX", resultedBySX);

        List<ProductPlanApproveResult> currentResults = plan.getApproveResults();
        if (currentResults == null) {
            currentResults = new java.util.ArrayList<>();
            plan.setApproveResults(currentResults);
        }

        if (plan.getTypePlan() == TypePlan.SECOND_PROCESS) {
            currentResults.removeIf(r -> !allowedDepartments.contains(r.getDepartmentCode()));
        }

        Employee currentEmployee = SecurityUtils.getCurrentEmployee();

        for (Map.Entry<String, Boolean> entry : departmentResults.entrySet()) {
            String departmentCode = entry.getKey();
            Boolean result = entry.getValue();

            ProductPlanApproveResult approveResult = currentResults.stream()
                    .filter(r -> departmentCode.equals(r.getDepartmentCode()))
                    .findFirst()
                    .orElse(null);

            if (approveResult == null) {

                approveResult = ProductPlanApproveResult.builder()
                        .plan(plan)
                        .departmentCode(departmentCode)
                        .result(result ? HtmpResult.OK : HtmpResult.NG)
                        .approvedBy(currentEmployee)
                        .build();
                currentResults.add(approveResult);
            } else {

                approveResult.setResult(result ? HtmpResult.OK : HtmpResult.NG);
                approveResult.setApprovedBy(currentEmployee);
            }
        }

        if (areAllDepartmentResultsCompleted(plan)) {
            plan.setStatus(HtmpStatus.WAITTINGFARESULT);
        }

        productPlanRepository.save(plan);

    }

    private boolean areAllDepartmentResultsCompleted(ProductPlan plan) {
        java.util.Set<String> allowedDepartments = getAllowedApproveResultDepartments(plan.getTypePlan());
        if (allowedDepartments.isEmpty()) {
            return false;
        }

        java.util.Set<String> completedDepartments = plan.getApproveResults() == null
                ? java.util.Set.of()
                : plan.getApproveResults().stream()
                        .filter(r -> r.getResult() != null && r.getDepartmentCode() != null)
                        .map(r -> r.getDepartmentCode().trim().toUpperCase())
                        .filter(allowedDepartments::contains)
                        .collect(java.util.stream.Collectors.toSet());

        return completedDepartments.containsAll(allowedDepartments);
    }

    private java.util.Set<String> getAllowedApproveResultDepartments(TypePlan typePlan) {
        if (typePlan == TypePlan.SECOND_PROCESS) {
            return java.util.Set.of("QC", "P-NMD", "SX");
        }
        return java.util.Set.of("KT", "MOLD", "P-NMD", "QC", "SX");
    }

    @Override
    public List<MoldTrialPlanListView> searchMoldTrialPlans(LocalDateTime fromDate, LocalDateTime toDate,
            TypePlan typePlan) {
        return productPlanRepository.search(fromDate, toDate, typePlan == null ? null : typePlan.name())
                .stream()
                .toList();
    }

    @Override
    public long countDelayLogsByPlanId(Long planId) {
        if (!productPlanRepository.existsById(planId)) {
            throw new ResourceNotFoundException("Kế hoạch thử khuôn không tồn tại.");
        }

        return productPlanDelayLogRepository.countByPlan_Id(planId);
    }

    @Override
    @Transactional
    public void cancelPlan(Long planId, PlanCreationRequest req) {

        ProductPlan plan = productPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch với ID: " + planId));

        if (req.getRemark() == null || req.getRemark().trim().isEmpty()) {
            throw new RuntimeException("Lý do hủy kế hoạch là bắt buộc");
        }

        if (plan.getStatus() == HtmpStatus.COMPLETED
                || plan.getStatus() == HtmpStatus.WAITTINGFARESULT) {
            throw new RuntimeException("Không thể hủy kế hoạch ở trạng thái hiện tại");
        }

        if (plan.getStatus() == HtmpStatus.CANCELLED) {
            throw new RuntimeException("Kế hoạch đã được hủy trước đó");
        }

        plan.setStatus(HtmpStatus.CANCELLED);

        String currentRemark = plan.getRemark();
        String cancelRemark = "[HỦY] " + req.getRemark().trim();

        if (currentRemark != null && !currentRemark.isEmpty()) {
            plan.setRemark(cancelRemark + " | Ghi chú cũ: " + currentRemark);
        } else {
            plan.setRemark(cancelRemark);
        }

        Employee currentEmployee = SecurityUtils.getCurrentEmployee();
        if (currentEmployee != null) {

            plan.setRemark(plan.getRemark() + " - Hủy bởi: " + currentEmployee.getCode() + " ("
                    + currentEmployee.getName() + " - " + currentEmployee.getDepartment().getName() + ")");
        }

        productPlanRepository.save(plan);

        notificationService.sendNotification(NotificationEvent.PRODUCT_PLAN_CANCELLED, plan);

    }

    @Override
    @Transactional
    public void sendMoldTrialPlanMail(SendMoldTrialPlanMailRequest request) {
        Employee currentEmployee = SecurityUtils.getCurrentEmployee();
        String title = request.getTitle() != null &&
                !request.getTitle().isEmpty()
                        ? request.getTitle()
                        : "Kế hoạch thử khuôn ngày " +
                                request.getDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String htmlContent = TemplateUtils.loadHtmlTemplate("templates/mail/mold-trial-plan.html");

        String formattedContent = request.getContent()
                .replace("\n", "<br>")
                .replace("\r", "<br>")
                .replace("\r\n", "<br>");

        htmlContent = htmlContent
                .replace("{{content}}", formattedContent)
                .replace("{{time}}", LocalDateTime.now().toString())
                .replace("{{createdBy}}", currentEmployee.getName())
                .replace("{{detailUrl}}",
                        "https://apps.htmp.vn/product-manager/mold-trial-plans-daily?date="
                                + request.getDate());

        List<String> toList = mailAddressRepository.findAllByIdIn(request.getTo())
                .stream()
                .map(MailAddress::getEmail)
                .toList();
        List<String> ccList = mailAddressRepository.findAllByIdIn(request.getCc())
                .stream()
                .map(MailAddress::getEmail)
                .toList();
        List<String> bccList = mailAddressRepository.findAllByIdIn(request.getBcc())
                .stream()
                .map(MailAddress::getEmail)
                .toList();

        mailService.sendHtmlMail(
                "default",
                toList,
                ccList,
                bccList,
                title,
                htmlContent);
    }

    @Override
    @Transactional
    public void updateRequestTime(Long planId, PlanUpdateRequestTimeRequest request) {
        ProductPlan plan = productPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Kế hoạch không tồn tại."));

        Machine targetMachine = plan.getMachine();
        if (request.getMachineId() != null) {
            targetMachine = machineRepository.findById(request.getMachineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Máy không tồn tại."));
        }

        Employee currentEmployee = employeeRepository.findByCode(SecurityUtils.getCurrentEmployee().getCode())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin nhân viên hiện tại."));

        productPlanValidationService.validateMachineTimeConflict(
                targetMachine != null ? targetMachine.getId() : null,
                request.getRequestStartTime(),
                request.getRequestEndTime(),
                plan.getId());

        String departmentName = currentEmployee.getDepartment() != null
                ? currentEmployee.getDepartment().getName()
                : "Không rõ phòng ban";
        String actorInfo = currentEmployee.getName() + " - " + departmentName;

        boolean isStartTimeChanged = !Objects.equals(plan.getRequestStartTime(), request.getRequestStartTime());
        boolean isEndTimeChanged = !Objects.equals(plan.getRequestEndTime(), request.getRequestEndTime());
        boolean isMachineChanged = !Objects.equals(
                plan.getMachine() != null ? plan.getMachine().getId() : null,
                targetMachine != null ? targetMachine.getId() : null);

        if (isStartTimeChanged || productPlanNoteService.hasText(request.getRequestStartTimeNote())) {
            plan.setLegacyRequestStartTimeNote(productPlanNoteService.buildUpdateNote(
                    "REQUEST_START_TIME",
                    actorInfo,
                    plan.getRequestStartTime() != null ? plan.getRequestStartTime().toString() : null,
                    request.getRequestStartTime() != null ? request.getRequestStartTime().toString() : null,
                    request.getRequestStartTimeNote()));
        }

        if (isEndTimeChanged || productPlanNoteService.hasText(request.getRequestEndTimeNote())) {
            plan.setLegacyRequestEndTimeNote(productPlanNoteService.buildUpdateNote(
                    "REQUEST_END_TIME",
                    actorInfo,
                    plan.getRequestEndTime() != null ? plan.getRequestEndTime().toString() : null,
                    request.getRequestEndTime() != null ? request.getRequestEndTime().toString() : null,
                    request.getRequestEndTimeNote()));
        }

        if (isMachineChanged || productPlanNoteService.hasText(request.getRequestMachineNote())) {
            plan.setRequestMachineNote(productPlanNoteService.buildUpdateNote(
                    "REQUEST_MACHINE",
                    actorInfo,
                    productPlanNoteService.formatMachineDisplay(plan.getMachine()),
                    productPlanNoteService.formatMachineDisplay(targetMachine),
                    request.getRequestMachineNote()));
        }

        if (isStartTimeChanged || isEndTimeChanged) {
            plan.setRequestTimeNote(productPlanNoteService.buildUpdateNote(
                    "REQUEST_TIME",
                    actorInfo,
                    productPlanNoteService.buildTimeRangeDisplay(plan.getRequestStartTime(), plan.getRequestEndTime()),
                    productPlanNoteService.buildTimeRangeDisplay(request.getRequestStartTime(),
                            request.getRequestEndTime()),
                    null));
        }

        plan.setMachine(targetMachine);
        plan.setRequestStartTime(request.getRequestStartTime());
        plan.setRequestEndTime(request.getRequestEndTime());

        productPlanRepository.save(plan);
    }

    @Override
    public MoldTrialWeeklyStatisticsResponse getMoldTrialWeeklyStatistics(String periodType, Integer year,
            Integer month, Integer week) {
        StatisticsPeriodResolver.PeriodRange periodRange;
        try {
            periodRange = StatisticsPeriodResolver.resolve(periodType, year, month, week);
        } catch (IllegalArgumentException ex) {
            throw new ConflictException(ex.getMessage());
        }

        List<MoldTrialWeeklyCustomerProjection> projections = productPlanRepository
                .getMoldTrialWeeklyStatisticsByCustomer(periodRange.fromDate().atStartOfDay(),
                        periodRange.toDate().atStartOfDay());

        List<MoldTrialWeeklyCustomerStatDTO> customers = projections.stream()
                .map(item -> MoldTrialWeeklyCustomerStatDTO.builder()
                        .customerId(item.getCustomerId())
                        .customerName(item.getCustomerName())
                        .totalMoldTrials(item.getTotalMoldTrials() == null ? 0L : item.getTotalMoldTrials())
                        .okMoldTrials(item.getOkMoldTrials() == null ? 0L : item.getOkMoldTrials())
                        .ngMoldTrials(item.getNgMoldTrials() == null ? 0L : item.getNgMoldTrials())
                        .build())
                .toList();

        long totalMoldTrials = customers.stream().mapToLong(MoldTrialWeeklyCustomerStatDTO::getTotalMoldTrials).sum();
        long totalOkMoldTrials = customers.stream().mapToLong(MoldTrialWeeklyCustomerStatDTO::getOkMoldTrials).sum();
        long totalNgMoldTrials = customers.stream().mapToLong(MoldTrialWeeklyCustomerStatDTO::getNgMoldTrials).sum();

        return MoldTrialWeeklyStatisticsResponse.builder()
                .periodType(periodRange.periodType())
                .year(periodRange.year())
                .month(periodRange.month())
                .week(periodRange.week())
                .fromDate(periodRange.fromDate())
                .toDate(periodRange.toDate())
                .totalMoldTrials(totalMoldTrials)
                .totalOkMoldTrials(totalOkMoldTrials)
                .totalNgMoldTrials(totalNgMoldTrials)
                .customers(customers)
                .build();
    }

}
