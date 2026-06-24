package htmp.codien.quanlycodien.modules.employee.service;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.common.exception.UnauthorizedException;
import htmp.codien.quanlycodien.common.util.ExcelUtils;
import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.modules.department.entity.Department;
import htmp.codien.quanlycodien.modules.department.repository.DepartmentRepository;
import htmp.codien.quanlycodien.modules.employee.dto.EmployeeRequest;
import htmp.codien.quanlycodien.modules.employee.dto.EmployeeResponse;
import htmp.codien.quanlycodien.modules.employee.dto.EmployeeSearchRequest;
import htmp.codien.quanlycodien.modules.employee.dto.EmployeeStatsResponse;
import htmp.codien.quanlycodien.modules.employee.dto.EmployeeSyncDTO;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.enums.EmployeeStatus;
import htmp.codien.quanlycodien.modules.employee.enums.Gender;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.employee.specification.EmployeeSpecification;
import htmp.codien.quanlycodien.modules.position.entity.Position;
import htmp.codien.quanlycodien.modules.position.repository.PositionRepository;
import htmp.codien.quanlycodien.modules.session.service.EmployeeSessionService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {
    private static final String DEFAULT_EMPLOYEE_PASSWORD = "Htmp1234";

    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeRepository employeeRepository;
    private final WebClient webClient;
    private final ModelMapper modelMapper;
    private final EmployeeSessionService employeeSessionService;

    @Value("${api.hrm.base-url}")
    private String hrmApiBaseUrl;

    @Override
    public EmployeeResponse toResponse(Employee employee) {
        EmployeeResponse response = modelMapper.map(employee, EmployeeResponse.class);

        if (employee.getDepartment() != null) {
            Department dep = employee.getDepartment();

            response.setDepartmentId(dep.getId());
            response.setDepartmentName(dep.getName());
            if (dep.getParentDepartment() != null) {
                response.setParentDepartmentId(dep.getParentDepartment().getId());
                response.setDisplayDepartment(dep.getParentDepartment().getName());
            } else {
                response.setDisplayDepartment(dep.getName());
            }

        }

        if (employee.getPosition() != null) {
            response.setPositionId(employee.getPosition().getId());
            response.setPositionName(employee.getPosition().getName());
        }

        return response;
    }

    private Employee toEntity(EmployeeRequest dto) {
        return modelMapper.map(dto, Employee.class);
    }

    @Override
    public EmployeeResponse getEmployeeByCode(String code) {
        Employee employee = employeeRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Không có nhân viên nào mã: " + code));
        return modelMapper.map(employee, EmployeeResponse.class);
    }

    @Override
    public List<EmployeeResponse> findAll() {
        return employeeRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<EmployeeResponse> findById(Long id) {
        return employeeRepository.findById(id).map(this::toResponse);
    }

    @Override
    public void save(EmployeeRequest request) {
        Employee employee = toEntity(request);

        if (employee.getId() == null) {
            employee.setPassword(passwordEncoder.encode(DEFAULT_EMPLOYEE_PASSWORD));
        } else {

            Employee existing = employeeRepository.findById(employee.getId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Employee not found with id: " + employee.getId()));

            if (employee.getPassword() == null) {
                employee.setPassword(existing.getPassword());
            }
        }

        if (employee.getDepartment() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy phòng ban"));
            employee.setDepartment(department);
        }
        if (employee.getPosition() != null) {
            Position position = positionRepository.findById(request.getPositionId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy chức vụ"));
            employee.setPosition(position);
        }

        employeeRepository.save(employee);
    }

    @Override
    @Transactional
    public void updateRole(Long id, Role role) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        employee.setRole(role);
        employeeRepository.save(employee);
    }

    @Override
    @Transactional
    public void resetPassword(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        employee.setPassword(passwordEncoder.encode(DEFAULT_EMPLOYEE_PASSWORD));
        employeeRepository.save(employee);

        employeeSessionService.forceLogoutEmployee(
                id,
                "Mật khẩu đã được đặt lại. Vui lòng đăng nhập lại.",
                "PASSWORD_RESET");
    }

    @Override
    public List<EmployeeResponse> findByDepartment(Long departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng ban không tồn tại"));
        return employeeRepository.findByDepartment(department).stream()
                .filter(e -> e.getStatus() != EmployeeStatus.INACTIVE)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<EmployeeResponse> findByDepartmentCode(String departmentCode) {
        Department department = departmentRepository.findByCode(departmentCode)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng ban không tồn tại"));
        return employeeRepository.findByDepartment(department).stream()
                .filter(e -> e.getStatus() != EmployeeStatus.INACTIVE)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void importEmployeeFromExcel(MultipartFile file) {
        try (XSSFWorkbook workbook = new XSSFWorkbook(file.getInputStream())) {

            XSSFSheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                String code = ExcelUtils.getCellString(row, 0);
                if (code == null || code.trim().isEmpty())
                    continue;

                Optional<Employee> existingOpt = employeeRepository.findByCode(code);
                if (existingOpt.isPresent()) {

                    Employee existing = existingOpt.get();
                    updateEmployeeFromRow(existing, row);
                    employeeRepository.save(existing);
                } else {

                    Employee employee = parseEmployeeFromRow(row);
                    employeeRepository.save(employee);
                }
            }

        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi đọc file Excel", e);
        }
    }

    private Employee parseEmployeeFromRow(Row row) {
        Employee employee = new Employee();
        updateEmployeeFromRow(employee, row);
        employee.setPassword(passwordEncoder.encode(DEFAULT_EMPLOYEE_PASSWORD));
        employee.setRole(Role.EMPLOYEE);
        return employee;
    }

    private void updateEmployeeFromRow(Employee employee, Row row) {
        Department department = departmentRepository.findById(
                Long.valueOf(ExcelUtils.getCellLong(row, 2)))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy phòng ban: " + ExcelUtils.getCellLong(row, 2)));
        employee.setDepartment(department);

        Position position = positionRepository.findById(
                Long.valueOf(ExcelUtils.getCellLong(row, 3)))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy chức vụ: " + ExcelUtils.getCellLong(row, 3)));
        employee.setPosition(position);

        employee.setCode(ExcelUtils.getCellString(row, 0));
        employee.setName(ExcelUtils.getCellString(row, 1));

        String status = ExcelUtils.getCellString(row, 4);
        if ("Đang làm việc".equalsIgnoreCase(status)) {
            employee.setStatus(EmployeeStatus.ACTIVE);
        } else if ("Nghỉ việc".equalsIgnoreCase(status)) {
            employee.setStatus(EmployeeStatus.INACTIVE);
        } else {
            employee.setStatus(EmployeeStatus.PROBATION);
        }

        employee.setPhone(ExcelUtils.getCellString(row, 5));
        employee.setMachineEmployeeId(
                ExcelUtils.getCellLong(row, 6) != null ? ExcelUtils.getCellLong(row, 6) : null);
    }

    @Override
    @Transactional
    public void syncEmployeeData() {
        String url = hrmApiBaseUrl + "/hralldata";
        Map<String, Department> departmentCache = departmentRepository.findAll().stream()
                .collect(Collectors.toMap(
                        d -> {
                            String name = d.getName();

                            if (name.toUpperCase().contains("CƠ ĐIỆN")) {
                                return name
                                        .replaceAll("\\s+", "")
                                        .toUpperCase();
                            } else if (name.toUpperCase().contains("VĂN PHÒNG KHO")) {
                                return name
                                        .replaceAll("\\s+", "")
                                        .toUpperCase();
                            }

                            return name
                                    .replace("Phòng", "")
                                    .replaceAll("\\s+", "")
                                    .toUpperCase()
                                    .trim();
                        },
                        d -> d,
                        (a, b) -> a
                ));

        Map<String, Position> positionCache = positionRepository.findAll().stream()
                .collect(Collectors.toMap(
                        p -> p.getName()
                                .replaceAll("\\s+", "")
                                .toUpperCase(),
                        p -> p,
                        (a, b) -> a));

        try {
            List<Map<String, Object>> employees = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {
                    })
                    .block();

            List<EmployeeSyncDTO> dtoList = employees.stream()
                    .map(this::mapToEmployeeDTO)
                    .toList();

            for (EmployeeSyncDTO dto : dtoList) {
                String depKeyRaw = dto.getBoPhan().trim();
                System.out.println(depKeyRaw);
                String normalize = depKeyRaw.toUpperCase().replaceAll("\\s+", "");

                if (normalize.contains("PHÒNGSẢNXUẤT") || normalize.contains("PHONGSANXUAT")
                        || normalize.contains("CÔNGTYCỔPHẦNHTMP") || normalize.contains("QUẢNLÝDỰÁN")) {
                    depKeyRaw = "Văn phòng sản xuất";
                } else if (normalize.contains("HOTSTAMPING")) {
                    depKeyRaw = "In + Hot";
                }

                String depKey = depKeyRaw
                        .toUpperCase()
                        .replaceAll("\\s+", "");

                Department department = departmentCache.get(depKey);
                if (department == null) {
                    throw new ResourceNotFoundException("Phòng ban không tồn tại: " + depKey);
                }

                String rawPos = dto.getChucDanh();

                if (rawPos == null)
                    rawPos = "";

                String posKey = rawPos.toUpperCase().replaceAll("\\s+", "");

                if (posKey.contains("CÔNGNHÂNVIÊN") || posKey.isEmpty()) {
                    posKey = "CÔNGNHÂN";
                }

                else if (posKey.contains("LEADERC") || posKey.contains("LEADERD")) {
                    posKey = "TỔTRƯỞNG";
                }

                Position position = positionCache.get(posKey);
                if (position == null) {
                    throw new ResourceNotFoundException("Chức danh không tồn tại: " + posKey);
                }

                EmployeeStatus status = dto.getTrangThai().equalsIgnoreCase("Bình thường")
                        ? EmployeeStatus.ACTIVE
                        : EmployeeStatus.INACTIVE;

                Employee employee = employeeRepository.findByCode(dto.getMaNV())
                        .orElseGet(() -> {
                            Employee emp = new Employee();
                            emp.setCode(dto.getMaNV());

                            emp.setPassword(passwordEncoder.encode("Htmp1234"));
                            emp.setRole(Role.EMPLOYEE);
                            return emp;
                        });

                employee.setName(dto.getHoVaTen());
                employee.setDepartment(department);
                employee.setPosition(position);
                employee.setStatus(status);
                employee.setPhone(normalizePhone(dto.getMobilePhone()));
                employee.setMachineEmployeeId(dto.getMaChamCong() != null ? Long.valueOf(dto.getMaChamCong()) : null);

                employee.setEmail(dto.getEmail());
                employee.setDateOfBirth(dto.getNgaySinh());
                employee.setGender("Nam".equalsIgnoreCase(dto.getGioiTinh()) ? Gender.MALE : Gender.FEMALE);
                employee.setDateOfJoining(dto.getNgayVaoCty());
                employeeRepository.save(employee);
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to sync employee data", e);
        }
    }

    private EmployeeSyncDTO mapToEmployeeDTO(Map<String, Object> map) {
        EmployeeSyncDTO dto = new EmployeeSyncDTO();

        dto.setMaNV((String) map.get("MaNV"));
        dto.setHoVaTen((String) map.get("HoVaTen"));
        dto.setHoVaTenDem((String) map.get("HoVaTenDem"));
        dto.setTen((String) map.get("Ten"));
        dto.setGioiTinh((String) map.get("GioiTinh"));

        dto.setNgaySinh(convertDate(map.get("NgaySinh")));
        dto.setNgayVaoCty(convertDate(map.get("NgayVaoCty")));

        dto.setEmail((String) map.get("Email"));
        dto.setMobilePhone((String) map.get("MOBILE_PHONE"));

        dto.setTrangThai((String) map.get("TrangThai"));

        dto.setMaChamCong(convertInteger(map.get("MaChamCong")));

        dto.setChucDanh((String) map.get("ChucDanh"));
        dto.setBoPhan((String) map.get("BoPhan"));
        dto.setPhongBan((String) map.get("PhongBan"));

        return dto;
    }

    private LocalDate convertDate(Object value) {
        if (value == null)
            return null;
        return LocalDate.parse(value.toString().substring(0, 10));
    }

    private Integer convertInteger(Object value) {
        if (value == null)
            return null;
        try {
            return Integer.parseInt(value.toString());
        } catch (Exception e) {
            return null;
        }
    }

    public String normalizePhone(String phone) {
        if (phone == null || phone.isBlank())
            return "";

        String[] lines = phone.split("\\r?\\n");

        Map<String, String> prefixMap = Map.ofEntries(
                Map.entry("0162", "032"), Map.entry("0163", "033"), Map.entry("0164", "034"),
                Map.entry("0165", "035"), Map.entry("0166", "036"), Map.entry("0167", "037"),
                Map.entry("0168", "038"), Map.entry("0169", "039"),

                Map.entry("0120", "070"), Map.entry("0121", "079"), Map.entry("0122", "077"),
                Map.entry("0126", "076"), Map.entry("0128", "078"),

                Map.entry("0123", "083"), Map.entry("0124", "084"),
                Map.entry("0125", "085"), Map.entry("0127", "081"),
                Map.entry("0129", "082"),

                Map.entry("0186", "056"), Map.entry("0188", "058"),

                Map.entry("0199", "059"));

        List<String> results = new ArrayList<>();

        for (String raw : lines) {
            if (raw == null || raw.isBlank())
                continue;

            String cleaned = raw.replaceAll("[^0-9]", "");

            if (cleaned.length() < 9)
                continue;

            if (!cleaned.startsWith("0")) {
                cleaned = "0" + cleaned;
            }

            if (cleaned.length() >= 4) {
                String first4 = cleaned.substring(0, 4);
                if (prefixMap.containsKey(first4)) {
                    cleaned = prefixMap.get(first4) + cleaned.substring(4);
                }
            }

            results.add(cleaned);
        }

        return String.join(",", results);
    }

    @Override
    public EmployeeStatsResponse getEmployeeStats() {
        List<Employee> employees = employeeRepository.findAll();

        Map<String, Long> statusCount = employees.stream()
                .collect(Collectors.groupingBy(
                        emp -> emp.getStatus() != null ? emp.getStatus().name() : "UNKNOWN",
                        Collectors.counting()));

        for (EmployeeStatus status : EmployeeStatus.values()) {
            statusCount.putIfAbsent(status.name(), 0L);
        }

        return new EmployeeStatsResponse((long) employees.size(), statusCount);
    }

    @Override
    public List<EmployeeResponse> searchEmployees(EmployeeSearchRequest searchRequest) {
        Specification<Employee> spec = buildSpecification(searchRequest);

        List<Employee> employees = employeeRepository.findAll(spec);
        return employees.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<EmployeeResponse> searchEmployeesWithPagination(EmployeeSearchRequest searchRequest,
            Pageable pageable) {
        Specification<Employee> spec = buildSpecification(searchRequest);

        Page<Employee> employeePage = employeeRepository.findAll(spec, pageable);
        return employeePage.map(this::toResponse);
    }

    private Specification<Employee> buildSpecification(EmployeeSearchRequest searchRequest) {
        Specification<Employee> spec = Specification.allOf();

        if (searchRequest.getKeyword() != null && !searchRequest.getKeyword().trim().isEmpty()) {
            spec = spec.and(EmployeeSpecification.hasKeyword(searchRequest.getKeyword()));
        } else {
            if (searchRequest.getCode() != null && !searchRequest.getCode().trim().isEmpty()) {
                spec = spec.and(EmployeeSpecification.hasCode(searchRequest.getCode()));
            }
            if (searchRequest.getName() != null && !searchRequest.getName().trim().isEmpty()) {
                spec = spec.and(EmployeeSpecification.hasName(searchRequest.getName()));
            }
            if (searchRequest.getPhone() != null && !searchRequest.getPhone().trim().isEmpty()) {
                spec = spec.and(EmployeeSpecification.hasPhone(searchRequest.getPhone()));
            }
        }

        if (searchRequest.getRole() != null) {
            spec = spec.and(EmployeeSpecification.hasRole(searchRequest.getRole()));
        }

        if (searchRequest.getEmployeeType() != null) {
            spec = spec.and(EmployeeSpecification.hasEmployeeType(searchRequest.getEmployeeType()));
        }

        if (searchRequest.getDepartmentIds() != null && !searchRequest.getDepartmentIds().isEmpty()) {
            spec = spec.and(EmployeeSpecification.hasDepartmentIds(searchRequest.getDepartmentIds()));
        } else if (searchRequest.getDepartmentId() != null) {
            spec = spec.and(EmployeeSpecification.hasDepartmentId(searchRequest.getDepartmentId()));
        }

        if (searchRequest.getPositionIds() != null && !searchRequest.getPositionIds().isEmpty()) {
            spec = spec.and(EmployeeSpecification.hasPositionIds(searchRequest.getPositionIds()));
        } else if (searchRequest.getPositionId() != null) {
            spec = spec.and(EmployeeSpecification.hasPositionId(searchRequest.getPositionId()));
        }

        if (searchRequest.getStatus() != null) {
            spec = spec.and(EmployeeSpecification.hasStatus(searchRequest.getStatus()));
        }

        if (Boolean.TRUE.equals(searchRequest.getWithDepartment())) {
            spec = spec.and(EmployeeSpecification.withDepartment());
        }
        if (Boolean.TRUE.equals(searchRequest.getWithPosition())) {
            spec = spec.and(EmployeeSpecification.withPosition());
        }

        return spec;
    }

    @Override
    @Cacheable(value = "employees", key = "#root.methodName + ':' + T(htmp.codien.quanlycodien.common.util.SecurityUtils).getCurrentEmployeeId()")
    public EmployeeResponse getMe() {
        Long employeeId = SecurityUtils.getCurrentEmployeeId();
        if (employeeId == null) {
            throw new UnauthorizedException("Không thể xác định người dùng hiện tại. Vui lòng đăng nhập lại.");
        }
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));
        return toResponse(employee);
    }

}