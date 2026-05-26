package com.coffeeshop.repository;

import com.coffeeshop.model.entity.InventoryLog;
import com.coffeeshop.model.enums.InventoryAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryLogRepository extends JpaRepository<InventoryLog, Long> {

    List<InventoryLog> findByIngredientIdOrderByCreatedAtDesc(Long ingredientId);

    Page<InventoryLog> findByIngredientId(Long ingredientId, Pageable pageable);

    Page<InventoryLog> findByAction(InventoryAction action, Pageable pageable);

    Page<InventoryLog> findByIngredientIdAndAction(Long ingredientId, InventoryAction action, Pageable pageable);

    @Query("SELECT il FROM InventoryLog il WHERE il.createdAt BETWEEN :from AND :to ORDER BY il.createdAt DESC")
    List<InventoryLog> findByCreatedAtBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT il FROM InventoryLog il WHERE il.ingredient.id = :ingredientId AND il.action IN ('EXPORT', 'AUTO_DEDUCT') AND il.createdAt >= :since ORDER BY il.createdAt DESC")
    List<InventoryLog> findConsumptionSince(@Param("ingredientId") Long ingredientId, @Param("since") LocalDateTime since);

    @Query("SELECT SUM(il.quantity) FROM InventoryLog il WHERE il.ingredient.id = :ingredientId AND il.action IN ('EXPORT', 'AUTO_DEDUCT') AND il.createdAt >= :since")
    java.math.BigDecimal sumConsumptionSince(@Param("ingredientId") Long ingredientId, @Param("since") LocalDateTime since);

    @Query("SELECT il FROM InventoryLog il ORDER BY il.createdAt DESC")
    Page<InventoryLog> findAllOrderByCreatedAtDesc(Pageable pageable);
}
