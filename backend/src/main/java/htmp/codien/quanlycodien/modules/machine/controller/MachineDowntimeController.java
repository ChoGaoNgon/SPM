package htmp.codien.quanlycodien.modules.machine.controller;

import java.time.LocalDate;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.machine.dto.MachineDowntimeResponse;
import htmp.codien.quanlycodien.modules.machine.service.MachineDowntimeService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/machines-downtime")
@RequiredArgsConstructor
@ConditionalOnBean(MachineDowntimeService.class)
public class MachineDowntimeController {

    private final MachineDowntimeService machineDowntimeService;

    @GetMapping
    public ResponseEntity<ApiResponse<MachineDowntimeResponse>> getStatus(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        MachineDowntimeResponse status = machineDowntimeService.getDailyDowntime(date);
        return ResponseUtil.success(status, "Lấy trạng thái database phụ thành công");
    }
}