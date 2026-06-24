package htmp.codien.quanlycodien.modules.workschedule.service.shift;

import java.util.List;

import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.ShiftDTO;

public interface ShiftService {
    List<ShiftDTO> getAllShifts();

    ShiftDTO getShiftById(Long id);

    void addShift(ShiftDTO shiftDTO);

    void updateShift(Long id, ShiftDTO shiftDTO);

    void deleteShift(Long id);
}