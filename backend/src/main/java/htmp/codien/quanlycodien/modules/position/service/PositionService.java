package htmp.codien.quanlycodien.modules.position.service;

import java.util.List;

import htmp.codien.quanlycodien.modules.position.dto.PositionDTO;

public interface PositionService {

    List<PositionDTO> getAllPositions();

    PositionDTO getPositionById(Long id);

    void createPosition(PositionDTO positionDTO);

    void updatePosition(Long id, PositionDTO positionDTO);

    void deletePosition(Long id);
}