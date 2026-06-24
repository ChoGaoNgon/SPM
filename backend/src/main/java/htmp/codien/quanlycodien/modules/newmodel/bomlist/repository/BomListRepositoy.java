package htmp.codien.quanlycodien.modules.newmodel.bomlist.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import htmp.codien.quanlycodien.modules.newmodel.bomlist.entity.BomList;

public interface BomListRepositoy extends JpaRepository<BomList, Long> {
    List<BomList> findAllByModel_Id(Long modelId);

}
