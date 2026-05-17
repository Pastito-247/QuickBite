package com.quickbite.menu_service.repository;

import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.quickbite.menu_service.entity.MenuItem;

@Repository
public interface MenuRepository extends JpaRepository<MenuItem, Long>{
    
    List<MenuItem> findByAvailableTrue();

    List<MenuItem> findByAvailableFalse();

    List<MenuItem> findByCategory(String category);

}
