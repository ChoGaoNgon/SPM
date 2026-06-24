package htmp.codien.quanlycodien.modules.workschedule.service.shiftpattern;

import java.util.List;

import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.ShiftPatternDTO;

public interface ShiftPatternService {
    List<ShiftPatternDTO> getAllShiftPatterns();

    List<ShiftPatternDTO> getActiveShiftPatterns();

    ShiftPatternDTO getShiftPatternById(Long id);

    ShiftPatternDTO getShiftPatternByCode(String code);

    void addShiftPattern(ShiftPatternDTO shiftPatternDTO);

    void updateShiftPattern(Long id, ShiftPatternDTO shiftPatternDTO);

    void deleteShiftPattern(Long id);

    void toggleActiveStatus(Long id);
}
