package com.coffeeshop.repository;

import com.coffeeshop.model.entity.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    Page<MenuItem> findByCategoryId(Long categoryId, Pageable pageable);

    Page<MenuItem> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<MenuItem> findByCategoryIdAndNameContainingIgnoreCase(Long categoryId, String name, Pageable pageable);

    List<MenuItem> findByIsAvailableTrueOrderByDisplayOrderAsc();

    List<MenuItem> findByCategoryIdAndIsAvailableTrueOrderByDisplayOrderAsc(Long categoryId);
}
