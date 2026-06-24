package htmp.codien.quanlycodien.modules.machine.service;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.modules.machine.dto.MachineSpecificationRequest;
import htmp.codien.quanlycodien.modules.machine.dto.MachineSpecificationResponse;
import htmp.codien.quanlycodien.modules.machine.entity.Machine;
import htmp.codien.quanlycodien.modules.machine.entity.MachineSpecification;
import htmp.codien.quanlycodien.modules.machine.repository.MachineRepository;
import htmp.codien.quanlycodien.modules.machine.repository.MachineSpecificationRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MachineSpecificationServiceImpl implements MachineSpecificationService {

    private final ModelMapper modelMapper;
    private final MachineRepository machineRepository;
    private final MachineSpecificationRepository machineSpecificationRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<MachineSpecificationResponse> getAllMachineSpecifications(Pageable pageable, String keyword) {
        String normalizedKeyword = keyword == null ? null : keyword.trim();
        return machineSpecificationRepository.searchByKeyword(normalizedKeyword, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public MachineSpecificationResponse getMachineSpecificationByMachineId(Long machineId) {
        Machine machine = getMachineOrThrow(machineId);
        MachineSpecification specification = machine.getSpecification();
        if (specification == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông số kỹ thuật cho máy id: " + machineId);
        }
        return toResponse(machine, specification);
    }

    @Override
    public void createMachineSpecification(MachineSpecificationRequest request) {
        MachineSpecification specification = modelMapper.map(request, MachineSpecification.class);
        machineSpecificationRepository.save(specification);
    }

    @Override
    public void createMachineSpecification(Long machineId, MachineSpecificationRequest request) {
        Machine machine = getMachineOrThrow(machineId);
        if (machine.getSpecification() != null) {
            throw new IllegalArgumentException("Máy đã có thông số kỹ thuật. Vui lòng dùng API cập nhật");
        }

        MachineSpecification specification = modelMapper.map(request, MachineSpecification.class);

        MachineSpecification savedSpecification = machineSpecificationRepository.save(specification);
        machine.setSpecification(savedSpecification);
        machineRepository.save(machine);
    }

    @Override
    public void updateMachineSpecification(Long specificationId, MachineSpecificationRequest request) {
        MachineSpecification specification = getSpecificationOrThrow(specificationId);
        modelMapper.map(request, specification);
        machineSpecificationRepository.save(specification);
    }

    @Override
    public void updateMachineSpecificationByMachineId(Long machineId, MachineSpecificationRequest request) {
        Machine machine = getMachineOrThrow(machineId);
        MachineSpecification specification = machine.getSpecification();
        if (specification == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông số kỹ thuật cho máy id: " + machineId);
        }

        modelMapper.map(request, specification);
        machineSpecificationRepository.save(specification);
    }

    @Override
    public void deleteMachineSpecification(Long specificationId) {
        MachineSpecification specification = getSpecificationOrThrow(specificationId);
        Machine machine = machineRepository.findFirstBySpecificationId(specificationId).orElse(null);

        if (machine != null) {
            machine.setSpecification(null);
            machineRepository.save(machine);
        }

        Long referenceCount = machineRepository.countBySpecificationId(specificationId);
        if (referenceCount == null || referenceCount == 0L) {
            machineSpecificationRepository.delete(specification);
        }
    }

    @Override
    public void deleteMachineSpecificationByMachineId(Long machineId) {
        Machine machine = getMachineOrThrow(machineId);
        MachineSpecification specification = machine.getSpecification();
        if (specification == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông số kỹ thuật cho máy id: " + machineId);
        }

        Long specificationId = specification.getId();
        machine.setSpecification(null);
        machineRepository.save(machine);

        Long referenceCount = machineRepository.countBySpecificationId(specificationId);
        if (referenceCount == null || referenceCount == 0L) {
            machineSpecificationRepository.deleteById(specificationId);
        }
    }

    private Machine getMachineOrThrow(Long machineId) {
        return machineRepository.findById(machineId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy máy với id: " + machineId));
    }

    private MachineSpecification getSpecificationOrThrow(Long specificationId) {
        return machineSpecificationRepository.findById(specificationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy thông số kỹ thuật với id: " + specificationId));
    }

    private MachineSpecificationResponse toResponse(MachineSpecification specification) {
        Machine machine = machineRepository.findFirstBySpecificationId(specification.getId()).orElse(null);
        return toResponse(machine, specification);
    }

    private MachineSpecificationResponse toResponse(Machine machine, MachineSpecification specification) {
        MachineSpecificationResponse response = modelMapper.map(specification, MachineSpecificationResponse.class);
        if (machine != null) {
            response.setMachineId(machine.getId());
            response.setMachineCode(machine.getCode());
            response.setMachineNo(machine.getMachineNo());
        }
        return response;
    }

}
