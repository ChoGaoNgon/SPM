package htmp.codien.quanlycodien.modules.workschedule.service.lockshedule;

import java.util.List;

import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.DepartmentLockDTO;
import htmp.codien.quanlycodien.modules.workschedule.entity.DepartmentScheduleLock;

public interface DepartmentScheduleLockService {

    boolean isLocked(Long departmentId, int year, int month);

    DepartmentScheduleLock lockSchedule(Long departmentId, int year, int month);

    DepartmentScheduleLock unlockSchedule(Long departmentId, int year, int month);

    List<DepartmentLockDTO> getDepartmentsWithLockStatus(int year, int month);

    void lockDepartments(List<Long> departmentIds, int year, int month);

    void unlockDepartments(List<Long> departmentIds, int year, int month);
}