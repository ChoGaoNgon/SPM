package htmp.codien.quanlycodien.modules.machine.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import htmp.codien.quanlycodien.modules.machine.dto.MachineSpecificationRequest;
import htmp.codien.quanlycodien.modules.machine.dto.MachineSpecificationResponse;

public interface MachineSpecificationService {

    Page<MachineSpecificationResponse> getAllMachineSpecifications(Pageable pageable, String keyword);

    MachineSpecificationResponse getMachineSpecificationByMachineId(Long machineId);

    void createMachineSpecification(MachineSpecificationRequest request);

    void createMachineSpecification(Long machineId, MachineSpecificationRequest request);

    void updateMachineSpecification(Long specificationId, MachineSpecificationRequest request);

    void updateMachineSpecificationByMachineId(Long machineId, MachineSpecificationRequest request);

    void deleteMachineSpecification(Long specificationId);

    void deleteMachineSpecificationByMachineId(Long machineId);
}
