package com.coffeeshop.repository;

import com.coffeeshop.model.entity.LoyaltyTransaction;
import com.coffeeshop.model.enums.LoyaltyAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoyaltyTransactionRepository extends JpaRepository<LoyaltyTransaction, Long> {

    List<LoyaltyTransaction> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    @Query("SELECT COALESCE(SUM(lt.points), 0) FROM LoyaltyTransaction lt WHERE lt.createdAt >= :start AND lt.createdAt <= :end AND lt.action = :action")
    Long sumPointsByActionAndCreatedAtBetween(
            @Param("action") LoyaltyAction action,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
