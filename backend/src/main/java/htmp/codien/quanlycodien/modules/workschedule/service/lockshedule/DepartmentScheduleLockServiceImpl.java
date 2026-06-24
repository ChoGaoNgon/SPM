package htmp.codien.quanlycodien.modules.workschedule.service.lockshedule;

import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.modules.department.entity.Department;
import htmp.codien.quanlycodien.modules.department.repository.DepartmentRepository;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.DepartmentLockDTO;
import htmp.codien.quanlycodien.modules.workschedule.entity.DepartmentScheduleLock;
import htmp.codien.quanlycodien.modules.workschedule.repository.DepartmentScheduleLockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DepartmentScheduleLockServiceImpl implements DepartmentScheduleLockService {

        private final DepartmentScheduleLockRepository lockRepository;
        private final DepartmentRepository departmentRepository;

        @Override
        public List<DepartmentLockDTO> getDepartmentsWithLockStatus(int year, int month) {
                List<Department> departments = departmentRepository.findAll();
                List<DepartmentLockDTO> result = new ArrayList<>();

                for (Department dept : departments) {
                        Department department = departmentRepository.findById(dept.getId())
                                        .orElseThrow(() -> new ResourceNotFoundException("Phòng ban không tồn tại"));
                        DepartmentScheduleLock locked = lockRepository
                                        .findByDepartmentAndYearAndMonth(department, year, month)
                                        .orElse(DepartmentScheduleLock.builder()
                                                        .department(dept)
                                                        .year(year)
                                                        .month(month)
                                                        .isLocked(false)
                                                        .build());
                        ;
                        result.add(new DepartmentLockDTO(dept.getId(), dept.getName(), locked.getIsLocked()));
                }
                return result;
        }

        @Override
        public boolean isLocked(Long departmentId, int year, int month) {
                Department dept = departmentRepository.findById(departmentId)
                                .orElseThrow(() -> new ResourceNotFoundException("Phòng ban không tồn tại"));

                Optional<DepartmentScheduleLock> lockOpt = lockRepository.findByDepartmentAndYearAndMonth(dept, year,
                                month);
                return lockOpt.map(DepartmentScheduleLock::getIsLocked).orElse(false);
        }

        @Override
        @Transactional
        public DepartmentScheduleLock lockSchedule(Long departmentId, int year, int month) {
                Department dept = departmentRepository.findById(departmentId)
                                .orElseThrow(() -> new ResourceNotFoundException("Phòng ban không tồn tại"));

                DepartmentScheduleLock lock = lockRepository.findByDepartmentAndYearAndMonth(dept, year, month)
                                .orElse(DepartmentScheduleLock.builder()
                                                .department(dept)
                                                .year(year)
                                                .month(month)
                                                .isLocked(true)
                                                .build());

                lock.setIsLocked(true);
                return lockRepository.save(lock);
        }

        @Override
        @Transactional
        public DepartmentScheduleLock unlockSchedule(Long departmentId, int year, int month) {
                Department dept = departmentRepository.findById(departmentId)
                                .orElseThrow(() -> new ResourceNotFoundException("Phòng ban không tồn tại"));

                DepartmentScheduleLock lock = lockRepository.findByDepartmentAndYearAndMonth(dept, year, month)
                                .orElse(DepartmentScheduleLock.builder()
                                                .department(dept)
                                                .year(year)
                                                .month(month)
                                                .isLocked(false)
                                                .build());

                lock.setIsLocked(false);
                return lockRepository.save(lock);
        }

        @Override
        @Transactional
        public void lockDepartments(List<Long> departmentIds, int year, int month) {
                for (Long deptId : departmentIds) {
                        lockSchedule(deptId, year, month);
                }
        }

        @Override
        @Transactional
        public void unlockDepartments(List<Long> departmentIds, int year, int month) {
                for (Long deptId : departmentIds) {
                        unlockSchedule(deptId, year, month);
                }
        }
}
