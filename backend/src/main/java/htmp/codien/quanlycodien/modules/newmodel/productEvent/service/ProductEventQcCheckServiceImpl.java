package htmp.codien.quanlycodien.modules.newmodel.productEvent.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.common.exception.ConflictException;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanRepository;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.productEventQcCheck.ProductEventQcCheckRequest;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.productEventQcCheck.ProductEventQcCheckResponse;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.entity.ProductEventQcCheck;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.repository.ProductEventQcCheckRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductEventQcCheckServiceImpl implements ProductEventQcCheckService {
    private final ProductEventQcCheckRepository eventQcCheckRepository;
    private final ProductPlanRepository eventRepository;
    private final EmployeeRepository employeeRepository;
    private final ModelMapper modelMapper;

    @Override
    public void createEventQcCheck(Long eventId, ProductEventQcCheckRequest req) {
        try {
            ProductPlan event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Event ko tồn tại"));

            if (req.getVisualCheckedById() == null) {
                throw new ConflictException("Nhân viên kiểm tra ngoại quan không được để trống");
            }
            if (req.getDimensionCheckById() == null) {
                throw new ConflictException("Nhân viên kiểm tra kích thước không được để trống");
            }

            ProductEventQcCheck qcCheck = modelMapper.map(req, ProductEventQcCheck.class);

            Employee visualCheckedBy = employeeRepository.findById(req.getVisualCheckedById())
                    .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại"));

            Employee dimensionCheckedBy = employeeRepository.findById(req.getDimensionCheckById())
                    .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại"));

            qcCheck.setId(null);

            qcCheck.setPlan(event);
            qcCheck.setVisualCheckedBy(visualCheckedBy);
            qcCheck.setDimensionCheckedBy(dimensionCheckedBy);

            Integer inspectedQuantity = req.getInspectedQuantity();
            Integer ngQuantity = req.getNgQuantity();

            BigDecimal ratio = BigDecimal.ZERO;

            if (inspectedQuantity != null && inspectedQuantity > 0) {
                ratio = BigDecimal.valueOf(ngQuantity)
                        .divide(BigDecimal.valueOf(inspectedQuantity), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }

            qcCheck.setNgRatio(ratio);

            eventQcCheckRepository.save(qcCheck);

        } catch (ConflictException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo thông tin kiểm tra chạy hàng sự kiện:  " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void updateEventQcCheck(Long id, ProductEventQcCheckRequest req) {
        try {
            ProductEventQcCheck existing = eventQcCheckRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bản ghi QC Check với ID: " + id));

            existing.setQcDate(req.getQcDate());
            existing.setInspectedQuantity(req.getInspectedQuantity());
            existing.setNgQuantity(req.getNgQuantity());
            existing.setVisualResult(req.getVisualResult());
            existing.setDimensionResult(req.getDimensionResult());
            existing.setIssueDescription(req.getIssueDescription());
            Integer inspectedQuantity = req.getInspectedQuantity();
            Integer ngQuantity = req.getNgQuantity();

            BigDecimal ratio = BigDecimal.ZERO;

            if (inspectedQuantity != null && inspectedQuantity > 0 && ngQuantity != null) {
                ratio = BigDecimal.valueOf(ngQuantity)
                        .divide(BigDecimal.valueOf(inspectedQuantity), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }

            existing.setNgRatio(ratio);

            if (req.getVisualCheckedById() != null) {
                Employee visualCheckedBy = employeeRepository.findById(req.getVisualCheckedById())
                        .orElseThrow(
                                () -> new ResourceNotFoundException("Nhân viên kiểm tra ngoại quan không tồn tại"));
                existing.setVisualCheckedBy(visualCheckedBy);
            }

            if (req.getDimensionCheckById() != null) {
                Employee dimensionCheckedBy = employeeRepository.findById(req.getDimensionCheckById())
                        .orElseThrow(
                                () -> new ResourceNotFoundException("Nhân viên kiểm tra kích thước không tồn tại"));
                existing.setDimensionCheckedBy(dimensionCheckedBy);
            }

            if (existing.getAllowShipment() != null && existing.getAllowShipment()) {
                throw new ConflictException("QC Check đã được phê duyệt, không thể cập nhật");
            }

            eventQcCheckRepository.save(existing);

        } catch (ConflictException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi cập nhật thông tin QC Check: " + e.getMessage(), e);
        }
    }

    @Override
    public ProductEventQcCheckResponse getEventQcCheckById(Long id) {
        try {
            ProductEventQcCheck qcCheck = eventQcCheckRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bản ghi QC Check với ID: " + id));

            ProductEventQcCheckResponse response = modelMapper.map(qcCheck, ProductEventQcCheckResponse.class);
            response.setEventId(qcCheck.getPlan().getId());

            if (qcCheck.getVisualCheckedBy() != null) {
                response.setVisualCheckedById(qcCheck.getVisualCheckedBy().getId());
                response.setVisualCheckedByCode(qcCheck.getVisualCheckedBy().getCode());
                response.setVisualCheckedByName(qcCheck.getVisualCheckedBy().getName());
            }

            if (qcCheck.getDimensionCheckedBy() != null) {
                response.setDimensionCheckById(qcCheck.getDimensionCheckedBy().getId());
                response.setDimensionCheckedByCode(qcCheck.getDimensionCheckedBy().getCode());
                response.setDimensionCheckedByName(qcCheck.getDimensionCheckedBy().getName());
            }

            return response;
        } catch (ConflictException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy dữ liệu QC Check: " + e.getMessage(), e);
        }
    }

    @Override
    public ProductEventQcCheckResponse getEventQcCheckByEventId(Long eventId) {
        try {
            ProductPlan plan = eventRepository.findById(eventId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sự kiện với ID: " + eventId));

            ProductEventQcCheck qcCheck = plan.getProductEventQcCheck();
            if (qcCheck == null) {
                throw new ResourceNotFoundException("Event này chưa có thông tin QC Check");
            }

            ProductEventQcCheckResponse res = modelMapper.map(qcCheck, ProductEventQcCheckResponse.class);
            res.setEventId(eventId);

            if (qcCheck.getVisualCheckedBy() != null) {
                res.setVisualCheckedById(qcCheck.getVisualCheckedBy().getId());
                res.setVisualCheckedByCode(qcCheck.getVisualCheckedBy().getCode());
                res.setVisualCheckedByName(qcCheck.getVisualCheckedBy().getName());
            }

            if (qcCheck.getDimensionCheckedBy() != null) {
                res.setDimensionCheckById(qcCheck.getDimensionCheckedBy().getId());
                res.setDimensionCheckedByCode(qcCheck.getDimensionCheckedBy().getCode());
                res.setDimensionCheckedByName(qcCheck.getDimensionCheckedBy().getName());
            }

            return res;

        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy thông tin QC Check theo event ID: " + eventId, e);
        }
    }

    @Override
    public void approveShipping(Long id) {
        try {
            ProductEventQcCheck qcCheck = eventQcCheckRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Event ko tồn tại"));

            if (qcCheck.getVisualResult() == null || qcCheck.getDimensionResult() == null) {
                throw new RuntimeException("Event chưa được kiểm tra");
            }

            if (qcCheck.getAllowShipment() != null) {
                throw new RuntimeException("Event đã được phê duyệt");
            }

            qcCheck.setAllowShipment(true);
            eventQcCheckRepository.save(qcCheck);

        } catch (Exception e) {
            throw new RuntimeException("Lỗi chấp thuận:" + e.getMessage(), e);
        }
    }

}
