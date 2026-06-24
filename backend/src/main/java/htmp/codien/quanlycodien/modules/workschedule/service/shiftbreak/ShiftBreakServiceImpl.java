package htmp.codien.quanlycodien.modules.workschedule.service.shiftbreak;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

import lombok.RequiredArgsConstructor;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.ShiftBreakDTO;
import htmp.codien.quanlycodien.modules.workschedule.entity.ShiftBreak;
import htmp.codien.quanlycodien.modules.workschedule.repository.ShiftBreakRepository;

@Service
@RequiredArgsConstructor
public class ShiftBreakServiceImpl implements ShiftBreakService {

    private final ShiftBreakRepository shiftBreakRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<ShiftBreakDTO> getAllShiftBreaks() {
        List<ShiftBreak> shiftBreaks = shiftBreakRepository.findAll();
        if (shiftBreaks.isEmpty()) {
            return new ArrayList<>();
        }
        List<ShiftBreakDTO> shiftBreakDTOs = new ArrayList<>();
        for (ShiftBreak shiftBreak : shiftBreaks) {
            ShiftBreakDTO dto = modelMapper.map(shiftBreak, ShiftBreakDTO.class);
            shiftBreakDTOs.add(dto);
        }
        return shiftBreakDTOs;
    }

    @Override
    public ShiftBreakDTO getShiftBreakById(Long id) {
        ShiftBreak shiftBreak = shiftBreakRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nghỉ ca"));
        return modelMapper.map(shiftBreak, ShiftBreakDTO.class);
    }

    @Override
    public void createShiftBreak(ShiftBreakDTO shiftBreak) {
        ShiftBreak newShiftBreak = modelMapper.map(shiftBreak, ShiftBreak.class);
        shiftBreakRepository.save(newShiftBreak);
    }

    @Override
    public void updateShiftBreak(Long id, ShiftBreakDTO shiftBreak) {
        ShiftBreak existingShiftBreak = shiftBreakRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nghỉ ca"));
        existingShiftBreak.setBreakType(shiftBreak.getBreakType());
        existingShiftBreak.setStartTime(shiftBreak.getStartTime());
        existingShiftBreak.setEndTime(shiftBreak.getEndTime());
        existingShiftBreak.setDuration(shiftBreak.getDuration());
        existingShiftBreak.setIsPaid(shiftBreak.getIsPaid());
        shiftBreakRepository.save(existingShiftBreak);
    }

    @Override
    public void deleteShiftBreak(Long id) {
        ShiftBreak shiftBreak = shiftBreakRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nghỉ ca"));
        shiftBreakRepository.delete(shiftBreak);
    }

    @Override
    public List<ShiftBreakDTO> getAllShiftBreaksByShiftId(Long shiftId) {
        List<ShiftBreak> shiftBreaks = shiftBreakRepository.findAllByShift_Id(shiftId);
        if (shiftBreaks.isEmpty()) {
            return new ArrayList<>();
        }
        List<ShiftBreakDTO> shiftBreakDTOs = new ArrayList<>();
        for (ShiftBreak shiftBreak : shiftBreaks) {
            ShiftBreakDTO dto = modelMapper.map(shiftBreak, ShiftBreakDTO.class);
            shiftBreakDTOs.add(dto);
        }
        return shiftBreakDTOs;
    }
}