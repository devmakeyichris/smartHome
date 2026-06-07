package com.stage.smarthome.repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.stage.smarthome.entity.OthersUserHouse;
import com.stage.smarthome.entity.User;

@Repository
public interface OthersUserHouseRepository extends JpaRepository<OthersUserHouse, Long> {
    List<OthersUserHouse> findByUser(User user);
    
}
