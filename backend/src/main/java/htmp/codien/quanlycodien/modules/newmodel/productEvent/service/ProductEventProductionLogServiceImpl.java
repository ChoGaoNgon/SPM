package htmp.codien.quanlycodien.modules.newmodel.productEvent.service;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanRepository;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.ProductEventProductionLog.ProductEventProductionLogRequest;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.ProductEventProductionLog.ProductEventProductionLogResponse;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.entity.ProductEventProductionLog;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.repository.ProductEventProductionLogRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductEventProductionLogServiceImpl implements ProductEventProductionLogService {

    private final ProductPlanRepository productPlanRepository;
    private final ProductEventProductionLogRepository logRepository;
    private final ModelMapper modelMapper;

    @Override
    public void createLog(Long eventId, ProductEventProductionLogRequest req) {
        try {
            ProductPlan event = productPlanRepository.findById(eventId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Event ID: " + eventId));

            ProductEventProductionLog log = modelMapper.map(req, ProductEventProductionLog.class);
            log.setPlan(event);

            logRepository.save(log);
        } catch (Exception e) {

            throw new RuntimeException("Lỗi khi tạo thông tin Lot sản xuất:  " + e.getMessage());
        }
    }

    @Override
    public void updateLog(Long id, ProductEventProductionLogRequest req) {

        try {
            ProductEventProductionLog log = logRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Log ID: " + id));

            modelMapper.map(req, log);
            logRepository.save(log);
        } catch (Exception e) {

            throw new RuntimeException("Lỗi khi tạo thông tin Lot sản xuất:  " + e.getMessage());
        }
    }

    @Override
    public ProductEventProductionLogResponse getLogById(Long id) {

        try {
            ProductEventProductionLog log = logRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Log ID: " + id));

            ProductEventProductionLogResponse res = modelMapper.map(log, ProductEventProductionLogResponse.class);
            res.setEventId(log.getPlan().getId());
            return res;
        } catch (Exception e) {

            throw new RuntimeException("Lỗi khi tạo thông tin Lot sản xuất:  " + e.getMessage());
        }
    }

    @Override
    public List<ProductEventProductionLogResponse> getAllLogByPlanId(Long planId) {
        try {
            return logRepository.findByPlanId(planId)
                    .stream()
                    .map(log -> {
                        ProductEventProductionLogResponse res = modelMapper.map(log,
                                ProductEventProductionLogResponse.class);
                        res.setEventId(log.getPlan().getId());
                        return res;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy danh sách log sản xuất: " + e.getMessage(), e);
        }
    }
}