package htmp.codien.quanlycodien.modules.machine.service;

import java.util.List;

import htmp.codien.quanlycodien.modules.machine.dto.MachineTypeRequest;
import htmp.codien.quanlycodien.modules.machine.dto.MachineTypeResponse;

public interface MachineTypeService {
    void createMachineType(MachineTypeRequest request);

    void updateMachineType(Long id, MachineTypeRequest request);

    void deleteMachineType(Long id);

    MachineTypeResponse getMachineTypeById(Long id);

    List<MachineTypeResponse> getAllMachineTypes();
}
