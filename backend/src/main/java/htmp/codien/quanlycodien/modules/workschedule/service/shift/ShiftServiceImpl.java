package htmp.codien.quanlycodien.modules.workschedule.service.shift;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.ShiftDTO;
import htmp.codien.quanlycodien.modules.workschedule.entity.Shift;
import htmp.codien.quanlycodien.modules.workschedule.repository.ShiftRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShiftServiceImpl implements ShiftService {
    private final ShiftRepository shiftRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<ShiftDTO> getAllShifts() {
        List<Shift> shifts = shiftRepository.findAll();
        return shifts.stream()
                .map(shift -> modelMapper.map(shift, ShiftDTO.class))
                .toList();
    }

    @Override
    public ShiftDTO getShiftById(Long id) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ca làm việc không tồn tại"));
        return modelMapper.map(shift, ShiftDTO.class);
    }

    @Override
    public void addShift(ShiftDTO shiftDTO) {
        Shift shift = modelMapper.map(shiftDTO, Shift.class);
        shiftRepository.save(shift);
    }

    @Override
    @Transactional
    public void updateShift(Long id, ShiftDTO shiftDTO) {
        Shift existingShift = shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ca làm việc không tồn tại"));
        existingShift.setShiftCode(shiftDTO.getShiftCode());
        existingShift.setCodeHcns(shiftDTO.getCodeHcns());
        existingShift.setDescription(shiftDTO.getDescription());
        existingShift.setStartTime(shiftDTO.getStartTime());
        existingShift.setEndTime(shiftDTO.getEndTime());
        shiftRepository.save(existingShift);
    }

    @Override
    public void deleteShift(Long id) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ca làm việc không tồn tại"));
        shiftRepository.delete(shift);
    }
}