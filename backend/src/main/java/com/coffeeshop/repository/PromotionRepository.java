package com.coffeeshop.repository;

import com.coffeeshop.model.entity.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
           "(p.startDate IS NULL OR p.startDate <= :now) AND " +
           "(p.endDate IS NULL OR p.endDate >= :now) AND " +
           "(p.usageLimit IS NULL OR p.usedCount < p.usageLimit)")
    List<Promotion> findAvailablePromotions(@Param("now") LocalDateTime now);

    @Query("SELECT p FROM Promotion p WHERE " +
           "(:query IS NULL OR :query = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:isActive IS NULL OR p.isActive = :isActive)")
    Page<Promotion> searchPromotions(
            @Param("query") String query,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );
}
