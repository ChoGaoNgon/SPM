package htmp.codien.quanlycodien.modules.machine.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import htmp.codien.quanlycodien.modules.machine.dto.MachineRequest;
import htmp.codien.quanlycodien.modules.machine.dto.MachineResponse;

public interface MachineService {

    List<String> getDistinctMachineDetailFieldValues(String fieldName);

    void createMachine(MachineRequest machineRequest);

    void updateMachine(Long id, MachineRequest request);

    void deleteMachine(Long id);

    Page<MachineResponse> getAllMachines(Pageable pageable, String keyword, Long machineTypeId);

    MachineResponse getMachineById(Long id);

    MachineResponse getMachineByCode(String code);

}
