package com.coffeeshop.repository;

import com.coffeeshop.model.entity.Customer;
import com.coffeeshop.model.enums.CustomerTier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByPhone(String phone);

    boolean existsByPhone(String phone);

    @Query("SELECT c FROM Customer c WHERE " +
           "(:query IS NULL OR :query = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR c.phone LIKE CONCAT('%', :query, '%')) AND " +
           "(:tier IS NULL OR c.tier = :tier)")
    Page<Customer> searchCustomers(
            @Param("query") String query,
            @Param("tier") CustomerTier tier,
            Pageable pageable
    );

    @Query("SELECT c FROM Customer c WHERE c.lastVisitAt < :inactiveDate OR (c.lastVisitAt IS NULL AND c.createdAt < :inactiveDate)")
    List<Customer> findInactiveCustomers(@Param("inactiveDate") LocalDateTime inactiveDate);

    Long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
