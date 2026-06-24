package htmp.codien.quanlycodien.modules.mold.service;

import java.util.List;

import htmp.codien.quanlycodien.modules.mold.dto.MoldIssueResponse;
import htmp.codien.quanlycodien.modules.mold.dto.MoldRequest;
import htmp.codien.quanlycodien.modules.mold.dto.MoldResponse;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.MoldDevelopmentByCustomerProjection;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.MoldIssueStatisticsProjection;

public interface MoldService {
    void create(MoldRequest moldRequest);

    void update(Long id, MoldRequest moldRequest);

    MoldResponse getMoldByCode(String code);

    MoldResponse getMoldByID(Long id);

    List<MoldResponse> searchMoldSpecification(String keyword);

    List<MoldResponse> getAllMolds();

    List<MoldIssueStatisticsProjection> getMoldIssueStatistics(Integer limit);

    List<MoldDevelopmentByCustomerProjection> getDevelopingMoldStatisticsByCustomer();

    List<MoldIssueResponse> getMoldIssues(Long moldId);

    void delete(Long id);
}
