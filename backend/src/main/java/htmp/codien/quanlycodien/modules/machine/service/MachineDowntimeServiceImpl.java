package htmp.codien.quanlycodien.modules.machine.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.modules.machine.dto.DowntimeManagementDTO;
import htmp.codien.quanlycodien.modules.machine.dto.MachineDowntimeResponse;

@Service
@ConditionalOnBean(name = "secondaryJdbcTemplate")
public class MachineDowntimeServiceImpl implements MachineDowntimeService {
        private final JdbcTemplate secondaryJdbcTemplate;

        public MachineDowntimeServiceImpl(
                        @Qualifier("secondaryJdbcTemplate") JdbcTemplate jdbcTemplate) {
                this.secondaryJdbcTemplate = jdbcTemplate;
        }

        @Override
        public MachineDowntimeResponse getDailyDowntime(LocalDate date) {

                LocalDateTime start = date.atTime(8, 0);
                LocalDateTime end = date.plusDays(1).atTime(8, 0);
                String sql = """
                                SELECT *
                                FROM machine_status_log
                                WHERE start_time >= ? AND start_time < ?
                                """;
                List<DowntimeManagementDTO> rawList = secondaryJdbcTemplate.query(
                                sql, (rs, rowNum) -> DowntimeManagementDTO
                                                .builder()
                                                .id(rs.getLong("id"))
                                                .machineId(rs.getString("machine_id"))
                                                .runState(rs.getInt("run_state") == 1)
                                                .errorState(rs.getInt("error_state") == 1)
                                                .stopState(rs.getInt("stop_state") == 1)
                                                .startTime(
                                                                rs.getTimestamp("start_time") != null
                                                                                ? rs.getTimestamp("start_time")
                                                                                                .toLocalDateTime()
                                                                                : null)
                                                .endTime(rs.getTimestamp("end_time") != null
                                                                ? rs.getTimestamp("end_time").toLocalDateTime()
                                                                : null)
                                                .durationMinutes(rs.getInt("duration") / 60)
                                                .build(),
                                start, end);
                if (rawList == null || rawList.isEmpty()) {
                        return MachineDowntimeResponse.builder()
                                        .machines(Collections.emptyList())
                                        .summary(MachineDowntimeResponse.Summary.builder().errorStops(0).manualStops(0)
                                                        .build())
                                        .timeline(Collections.emptyList())
                                        .build();
                }

                Set<String> machineSet = rawList.stream()
                                .map(DowntimeManagementDTO::getMachineId)
                                .filter(Objects::nonNull)
                                .collect(Collectors.toSet());
                List<String> machines = new ArrayList<>(machineSet);
                Collections.sort(machines);

                Map<String, List<DowntimeManagementDTO>> grouped = rawList.stream()
                                .filter(dto -> dto.getMachineId() != null)
                                .collect(Collectors.groupingBy(DowntimeManagementDTO::getMachineId));
                List<MachineDowntimeResponse.TimelineItem> timeline = new ArrayList<>();
                int totalError = 0;
                int totalManual = 0;
                for (String machineId : machines) {
                        List<DowntimeManagementDTO> events = grouped.getOrDefault(machineId, Collections.emptyList());
                        int totalDowntime = 0;
                        List<MachineDowntimeResponse.Event> eventList = new ArrayList<>();
                        for (DowntimeManagementDTO dto : events) {
                                boolean isError = Boolean.TRUE.equals(dto.getErrorState());
                                boolean isManual = Boolean.TRUE.equals(dto.getStopState());
                                String reason = isError ? "error" : (isManual ? "manual_stop" : "unknown");
                                String reasonLabel = isError ? "Dừng do lỗi"
                                                : (isManual ? "Dừng do lệnh" : "Không xác định");
                                boolean isOpen = dto.getEndTime() == null;
                                int duration = dto.getDurationMinutes() != null ? dto.getDurationMinutes() * 60 : 0;
                                totalDowntime += duration;
                                if (isError)
                                        totalError++;
                                if (isManual)
                                        totalManual++;
                                eventList.add(MachineDowntimeResponse.Event.builder()
                                                .machineId(machineId)
                                                .startTime(dto.getStartTime() != null
                                                                ? dto.getStartTime().format(
                                                                                DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                                                                : null)
                                                .endTime(dto.getEndTime() != null
                                                                ? dto.getEndTime().format(
                                                                                DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                                                                : null)
                                                .durationSeconds(duration)
                                                .isOpen(isOpen)
                                                .reason(reason)
                                                .reasonLabel(reasonLabel)
                                                .errorState(isError ? 1 : 0)
                                                .stopState(isManual ? 1 : 0)
                                                .build());
                        }
                        timeline.add(MachineDowntimeResponse.TimelineItem.builder()
                                        .machineId(machineId)
                                        .totalDowntimeSeconds(totalDowntime)
                                        .events(eventList)
                                        .build());
                }
                return MachineDowntimeResponse.builder()
                                .machines(machines)
                                .summary(MachineDowntimeResponse.Summary.builder().errorStops(totalError)
                                                .manualStops(totalManual)
                                                .build())
                                .timeline(timeline)
                                .build();
        }
}
