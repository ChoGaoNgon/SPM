package htmp.codien.quanlycodien.modules.newmodel.plan.service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import htmp.codien.quanlycodien.modules.machine.entity.Machine;

@Service
public class ProductPlanNoteService {

    @Autowired
    private ObjectMapper objectMapper;

    public boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    public String buildUpdateNote(String type, String actorInfo, String oldValue, String newValue, String userNote) {
        try {
            Map<String, Object> notePayload = new LinkedHashMap<>();
            notePayload.put("type", type);
            notePayload.put("updatedBy", actorInfo);
            notePayload.put("updatedAt", LocalDateTime.now().toString());
            notePayload.put("oldValue", oldValue);
            notePayload.put("newValue", newValue);
            notePayload.put("note", hasText(userNote) ? userNote.trim() : null);
            return objectMapper.writeValueAsString(notePayload);
        } catch (Exception exception) {
            return hasText(userNote) ? userNote.trim() : null;
        }
    }

    public String formatMachineDisplay(Machine machine) {
        if (machine == null) {
            return null;
        }
        String machineCode = machine.getCode() != null ? machine.getCode() : "Chưa có mã máy";
        String machineNo = machine.getMachineNo() != null ? "Máy số " + machine.getMachineNo() : "Chưa có số máy";
        String position = machine.getPosition() != null ? machine.getPosition() : "Chưa có vị trí";
        return machineCode + " | " + machineNo + " | " + position;
    }

    public String buildTimeRangeDisplay(LocalDateTime startTime, LocalDateTime endTime) {
        String startDisplay = startTime != null ? startTime.toString() : "N/A";
        String endDisplay = endTime != null ? endTime.toString() : "N/A";
        return startDisplay + " -> " + endDisplay;
    }
}
