package com.stage.smarthome.repository;



import com.stage.smarthome.entity.OthersUserHouse;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OthersUserHouseRepository extends JpaRepository<OthersUserHouse, Long> {
    
}
