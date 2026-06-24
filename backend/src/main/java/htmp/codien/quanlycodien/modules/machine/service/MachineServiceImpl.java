package htmp.codien.quanlycodien.modules.machine.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.modules.machine.dto.MachineDetailRequest;
import htmp.codien.quanlycodien.modules.machine.dto.MachineDetailResponse;
import htmp.codien.quanlycodien.modules.machine.dto.MachineRequest;
import htmp.codien.quanlycodien.modules.machine.dto.MachineResponse;
import htmp.codien.quanlycodien.modules.machine.dto.MachineSpecificationResponse;
import htmp.codien.quanlycodien.modules.machine.dto.MachineTypeResponse;
import htmp.codien.quanlycodien.modules.machine.entity.Machine;
import htmp.codien.quanlycodien.modules.machine.entity.MachineDetail;
import htmp.codien.quanlycodien.modules.machine.entity.MachineSpecification;
import htmp.codien.quanlycodien.modules.machine.entity.MachineType;
import htmp.codien.quanlycodien.modules.machine.repository.MachineRepository;
import htmp.codien.quanlycodien.modules.machine.repository.MachineSpecificationRepository;
import htmp.codien.quanlycodien.modules.machine.repository.MachineTypeRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MachineServiceImpl implements MachineService {
    private final ModelMapper modelMapper;
    private final MachineRepository machineRepository;
    private final MachineSpecificationRepository machineSpecificationRepository;
    private final MachineTypeRepository machineTypeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<String> getDistinctMachineDetailFieldValues(String fieldName) {
        if (fieldName == null || fieldName.isBlank()) {
            throw new IllegalArgumentException("Tên field distinct không được để trống");
        }

        String normalizedField = fieldName.trim().toLowerCase();
        List<String> result = switch (normalizedField) {
            case "name" -> machineRepository.findDistinctDetailNames();
            case "model" -> machineRepository.findDistinctModels();
            case "maker" -> machineRepository.findDistinctMakers();
            case "voltage" -> machineRepository.findDistinctVoltages();
            case "position" -> machineRepository.findDistinctPositions();
            default -> throw new IllegalArgumentException("Field distinct không được hỗ trợ: " + fieldName);
        };

        if ("voltage".equals(normalizedField)) {
            System.out.println("DEBUG: Voltage distinct values from DB: " + result);
            System.out.println("DEBUG: Voltage list size: " + (result != null ? result.size() : "null"));
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MachineResponse> getAllMachines(Pageable pageable, String keyword, Long machineTypeId) {
        String normalizedKeyword = keyword == null ? null : keyword.trim();

        if ((normalizedKeyword == null || normalizedKeyword.isBlank()) && machineTypeId == null) {
            return machineRepository.findAll(pageable).map(this::toResponse);
        } else {
            return machineRepository.findByKeyword(normalizedKeyword, machineTypeId, pageable).map(this::toResponse);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public MachineResponse getMachineById(Long id) {
        Machine machine = machineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy máy với id: " + id));
        return toResponse(machine);
    }

    @Override
    @Transactional
    public void createMachine(MachineRequest request) {
        if (machineRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Mã máy '" + request.getCode() + "' đã tồn tại");
        }

        validateDuplicateSerialInRequest(request.getMachineDetails());

        MachineType machineType = resolveMachineType(request);
        MachineSpecification machineSpecification = resolveMachineSpecification(request);

        Machine machine = Machine.builder()
                .code(request.getCode())
                .machineNo(request.getMachineNo())
                .dimension(request.getDimension())
                .screw(request.getScrew())
                .capacityTon(request.getCapacityTon())
                .description(request.getDescription())
                .position(request.getPosition())
                .machineType(machineType)
                .specification(machineSpecification)
                .build();

        List<MachineDetail> mappedDetails = mapDetails(request.getMachineDetails(), machine);
        machine.setMachineDetail(mappedDetails);
        machine.setTotalElectricPower(resolveTotalElectricPower(request.getTotalElectricPower(), mappedDetails, null));

        machineRepository.save(machine);
    }

    @Override
    @Transactional
    public void updateMachine(Long id, MachineRequest request) {
        if (id == null) {
            throw new IllegalArgumentException("Thiếu id để cập nhật máy");
        }

        validateDuplicateSerialInRequest(request.getMachineDetails());

        Machine machine = machineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy máy với id: " + id));

        if (!machine.getCode().equals(request.getCode()) && machineRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Mã máy '" + request.getCode() + "' đã tồn tại");
        }

        MachineType machineType = resolveMachineType(request);
        MachineSpecification machineSpecification = resolveMachineSpecification(request);

        machine.setCode(request.getCode());
        machine.setMachineNo(request.getMachineNo());
        machine.setDimension(request.getDimension());
        machine.setScrew(request.getScrew());
        machine.setCapacityTon(request.getCapacityTon());
        machine.setDescription(request.getDescription());
        machine.setPosition(request.getPosition());
        machine.setMachineType(machineType);
        machine.setSpecification(machineSpecification);
        if (machine.getMachineDetail() == null) {
            machine.setMachineDetail(new ArrayList<>());
        }

        List<MachineDetail> mappedDetails = mapDetails(request.getMachineDetails(), machine);
        machine.getMachineDetail().clear();

        machineRepository.saveAndFlush(machine);
        machine.getMachineDetail().addAll(mappedDetails);
        machine.setTotalElectricPower(resolveTotalElectricPower(
                request.getTotalElectricPower(),
                mappedDetails,
                machine.getTotalElectricPower()));

        machineRepository.save(machine);
    }

    @Override
    @Transactional
    public void deleteMachine(Long id) {
        Machine machine = machineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy máy với id: " + id));
        machineRepository.delete(machine);
    }

    private MachineType resolveMachineType(MachineRequest request) {
        if (request.getMachineTypeId() == null) {
            throw new IllegalArgumentException("Thiếu loại máy (machineTypeId)");
        }
        return machineTypeRepository.findById(request.getMachineTypeId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy loại máy với id: " + request.getMachineTypeId()));
    }

    private MachineSpecification resolveMachineSpecification(MachineRequest request) {
        if (request.getMachineSpecificationId() == null) {
            return null;
        }

        return machineSpecificationRepository.findById(request.getMachineSpecificationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy thông số máy với id: " + request.getMachineSpecificationId()));
    }

    private List<MachineDetail> mapDetails(List<MachineDetailRequest> detailRequests, Machine machine) {
        if (detailRequests == null || detailRequests.isEmpty()) {
            return List.of();
        }

        return detailRequests.stream()
                .map(d -> MachineDetail.builder()
                        .name(d.getName())
                        .model(d.getModel())
                        .serial(d.getSerial())
                        .voltage(d.getVoltage())
                        .maker(d.getMaker())
                        .productionStartTime(d.getProductionStartTime())
                        .dispatchTime(d.getDispatchTime())
                        .electricPower(d.getElectricPower())
                        .machine(machine)
                        .build())
                .collect(Collectors.toList());
    }

    private String resolveTotalElectricPower(String requestTotalElectricPower,
            List<MachineDetail> details,
            String existingTotalElectricPower) {
        boolean hasDetailElectricPower = details != null
                && details.stream().anyMatch(d -> d.getElectricPower() != null);

        if (hasDetailElectricPower) {
            double sum = details.stream()
                    .map(MachineDetail::getElectricPower)
                    .filter(value -> value != null)
                    .mapToDouble(Double::doubleValue)
                    .sum();

            return BigDecimal.valueOf(sum).stripTrailingZeros().toPlainString();
        }

        if (requestTotalElectricPower != null && !requestTotalElectricPower.isBlank()) {
            return requestTotalElectricPower.trim();
        }

        return existingTotalElectricPower;
    }

    private void validateDuplicateSerialInRequest(List<MachineDetailRequest> detailRequests) {
        if (detailRequests == null || detailRequests.isEmpty()) {
            return;
        }

        Set<String> serialSet = new HashSet<>();
        for (MachineDetailRequest detail : detailRequests) {
            if (detail == null || detail.getSerial() == null || detail.getSerial().isBlank()) {
                continue;
            }

            String normalizedSerial = detail.getSerial().trim();
            if (!serialSet.add(normalizedSerial)) {
                throw new IllegalArgumentException("Serial bị trùng trong danh sách chi tiết: " + normalizedSerial);
            }
        }
    }

    private MachineResponse toResponse(Machine machine) {
        MachineTypeResponse machineTypeResponse = null;
        if (machine.getMachineType() != null) {
            MachineType mt = machine.getMachineType();
            machineTypeResponse = MachineTypeResponse.builder()
                    .id(mt.getId())
                    .name(mt.getName())
                    .code(mt.getCode())
                    .description(mt.getDescription())
                    .build();
        }

        List<MachineDetailResponse> details = machine.getMachineDetail() != null
                ? machine.getMachineDetail().stream()
                        .map(d -> MachineDetailResponse.builder()
                                .id(d.getId())
                                .name(d.getName())
                                .model(d.getModel())
                                .serial(d.getSerial())
                                .voltage(d.getVoltage())
                                .maker(d.getMaker())
                                .productionStartTime(d.getProductionStartTime())
                                .dispatchTime(d.getDispatchTime())
                                .electricPower(d.getElectricPower())
                                .build())
                        .toList()
                : List.of();

        return MachineResponse.builder()
                .id(machine.getId())
                .code(machine.getCode())
                .machineNo(machine.getMachineNo())
                .dimension(machine.getDimension())
                .screw(machine.getScrew())
                .capacityTon(machine.getCapacityTon())
                .description(machine.getDescription())
                .position(machine.getPosition())
                .totalElectricPower(machine.getTotalElectricPower())
                .machineType(machineTypeResponse)
                .machineDetails(details)
                .machineSpecification(toMachineSpecificationResponse(machine.getSpecification()))
                .build();
    }

    private MachineSpecificationResponse toMachineSpecificationResponse(MachineSpecification specification) {
        if (specification == null) {
            return null;
        }

        return modelMapper.map(specification, MachineSpecificationResponse.class);
    }

    @Override
    public MachineResponse getMachineByCode(String code) {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Mã máy không được để trống");
        }

        Machine machine = machineRepository.findByCode(code.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy máy với tên: " + code));
        return toResponse(machine);
    }
}
