package htmp.codien.quanlycodien.modules.workschedule.service.shiftpattern;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.ShiftPatternDTO;
import htmp.codien.quanlycodien.modules.workschedule.entity.ShiftPattern;
import htmp.codien.quanlycodien.modules.workschedule.repository.ShiftPatternRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShiftPatternServiceImpl implements ShiftPatternService {

    private final ShiftPatternRepository shiftPatternRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<ShiftPatternDTO> getAllShiftPatterns() {
        List<ShiftPattern> shiftPatterns = shiftPatternRepository.findAll();
        return shiftPatterns.stream()
                .map(pattern -> modelMapper.map(pattern, ShiftPatternDTO.class))
                .toList();
    }

    @Override
    public List<ShiftPatternDTO> getActiveShiftPatterns() {
        List<ShiftPattern> shiftPatterns = shiftPatternRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        return shiftPatterns.stream()
                .map(pattern -> modelMapper.map(pattern, ShiftPatternDTO.class))
                .toList();
    }

    @Override
    public ShiftPatternDTO getShiftPatternById(Long id) {
        ShiftPattern shiftPattern = shiftPatternRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mẫu ca không tồn tại"));
        return modelMapper.map(shiftPattern, ShiftPatternDTO.class);
    }

    @Override
    public ShiftPatternDTO getShiftPatternByCode(String code) {
        ShiftPattern shiftPattern = shiftPatternRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Mẫu ca không tồn tại"));
        return modelMapper.map(shiftPattern, ShiftPatternDTO.class);
    }

    @Override
    @Transactional
    public void addShiftPattern(ShiftPatternDTO shiftPatternDTO) {
        ShiftPattern shiftPattern = modelMapper.map(shiftPatternDTO, ShiftPattern.class);
        if (shiftPattern.getIsActive() == null) {
            shiftPattern.setIsActive(true);
        }
        shiftPatternRepository.save(shiftPattern);
    }

    @Override
    @Transactional
    public void updateShiftPattern(Long id, ShiftPatternDTO shiftPatternDTO) {
        ShiftPattern existingPattern = shiftPatternRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mẫu ca không tồn tại"));

        existingPattern.setCode(shiftPatternDTO.getCode());
        existingPattern.setName(shiftPatternDTO.getName());
        existingPattern.setPattern(shiftPatternDTO.getPattern());
        existingPattern.setDefaultShift(shiftPatternDTO.getDefaultShift());
        existingPattern.setIsActive(shiftPatternDTO.getIsActive());
        existingPattern.setDisplayOrder(shiftPatternDTO.getDisplayOrder());

        shiftPatternRepository.save(existingPattern);
    }

    @Override
    @Transactional
    public void deleteShiftPattern(Long id) {
        ShiftPattern shiftPattern = shiftPatternRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mẫu ca không tồn tại"));
        shiftPatternRepository.delete(shiftPattern);
    }

    @Override
    @Transactional
    public void toggleActiveStatus(Long id) {
        ShiftPattern shiftPattern = shiftPatternRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mẫu ca không tồn tại"));
        shiftPattern.setIsActive(!shiftPattern.getIsActive());
        shiftPatternRepository.save(shiftPattern);
    }
}
