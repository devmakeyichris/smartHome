package com.stage.smarthome.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.stage.smarthome.entity.RfidCard;

public interface  RfidCardRepository extends JpaRepository<RfidCard, Long> {

     Optional<RfidCard> findByUid(String uid);
     
     List<RfidCard> findByHouseId(Long houseId);

}
