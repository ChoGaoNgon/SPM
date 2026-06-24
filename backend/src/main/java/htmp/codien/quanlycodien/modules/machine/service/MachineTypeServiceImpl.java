package htmp.codien.quanlycodien.modules.machine.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.modules.machine.dto.MachineTypeRequest;
import htmp.codien.quanlycodien.modules.machine.dto.MachineTypeResponse;
import htmp.codien.quanlycodien.modules.machine.entity.MachineType;
import htmp.codien.quanlycodien.modules.machine.repository.MachineTypeRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MachineTypeServiceImpl implements MachineTypeService {

    private final MachineTypeRepository machineTypeRepository;

    @Override
    @Transactional
    public void createMachineType(MachineTypeRequest request) {
        validateDuplicate(request, null);

        MachineType type = MachineType.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .build();

        machineTypeRepository.save(type);
    }

    @Override
    @Transactional
    public void updateMachineType(Long id, MachineTypeRequest request) {
        MachineType machineType = findEntityById(id);
        validateDuplicate(request, machineType);

        machineType.setName(request.getName());
        machineType.setCode(request.getCode());
        machineType.setDescription(request.getDescription());

        machineTypeRepository.save(machineType);
    }

    @Override
    @Transactional
    public void deleteMachineType(Long id) {
        MachineType machineType = findEntityById(id);
        machineTypeRepository.delete(machineType);
    }

    @Override
    @Transactional(readOnly = true)
    public MachineTypeResponse getMachineTypeById(Long id) {
        MachineType machineType = findEntityById(id);
        return convertToResponse(machineType);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MachineTypeResponse> getAllMachineTypes() {
        return machineTypeRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    protected MachineType findEntityById(Long id) {
        return machineTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại máy với id: " + id));
    }

    private void validateDuplicate(MachineTypeRequest request, MachineType existingMachineType) {
        if (existingMachineType == null || !existingMachineType.getCode().equals(request.getCode())) {
            if (machineTypeRepository.existsByCode(request.getCode())) {
                throw new IllegalArgumentException("Loại máy với mã '" + request.getCode() + "' đã tồn tại");
            }
        }

        if (existingMachineType == null || !existingMachineType.getName().equals(request.getName())) {
            if (machineTypeRepository.existsByName(request.getName())) {
                throw new IllegalArgumentException("Loại máy với tên '" + request.getName() + "' đã tồn tại");
            }
        }
    }

    private MachineTypeResponse convertToResponse(MachineType machineType) {
        return MachineTypeResponse.builder()
                .id(machineType.getId())
                .name(machineType.getName())
                .code(machineType.getCode())
                .description(machineType.getDescription())
                .build();
    }
}
