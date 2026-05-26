package com.coffeeshop.repository;

import com.coffeeshop.model.entity.Ingredient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    List<Ingredient> findByIsActiveTrue();

    @Query("SELECT i FROM Ingredient i WHERE i.isActive = true AND i.currentStock < i.minStock")
    List<Ingredient> findLowStockIngredients();

    List<Ingredient> findByNameContainingIgnoreCase(String name);

    Page<Ingredient> findByIsActiveTrue(Pageable pageable);

    Page<Ingredient> findByNameContainingIgnoreCaseAndIsActiveTrue(String name, Pageable pageable);

    List<Ingredient> findBySupplierId(Long supplierId);
}

