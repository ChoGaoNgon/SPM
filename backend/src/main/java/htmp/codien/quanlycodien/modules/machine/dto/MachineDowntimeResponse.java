package htmp.codien.quanlycodien.modules.machine.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MachineDowntimeResponse {
    private List<String> machines;
    private Summary summary;
    private List<TimelineItem> timeline;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Summary {
        private int errorStops;
        private int manualStops;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimelineItem {
        private String machineId;
        private int totalDowntimeSeconds;
        private List<Event> events;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Event {
        private String machineId;
        private String startTime;
        private String endTime;
        private int durationSeconds;
        private boolean isOpen;
        private String reason;
        private String reasonLabel;
        private Integer errorState;
        private Integer stopState;
        private Double startPercent;
        private Double widthPercent;
        private String displayEnd;
    }
}
