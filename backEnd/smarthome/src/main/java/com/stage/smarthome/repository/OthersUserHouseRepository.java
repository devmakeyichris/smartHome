package com.stage.smarthome.repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.stage.smarthome.entity.OthersUserHouse;
import com.stage.smarthome.entity.User;
import java.util.List;
import com.stage.smarthome.entity.OthersUserHouse;
import com.stage.smarthome.enumerateur.RequestStatus;

@Repository
public interface OthersUserHouseRepository extends JpaRepository<OthersUserHouse, Long> {
    List<OthersUserHouse> findByUser(User user);
    List<OthersUserHouse> findByHouseIdAndStatus(Long houseId, RequestStatus status);
    
}
