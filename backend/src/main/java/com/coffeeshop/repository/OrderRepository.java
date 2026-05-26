package com.coffeeshop.repository;

import com.coffeeshop.model.entity.Order;
import com.coffeeshop.model.enums.OrderStatus;
import com.coffeeshop.model.enums.OrderType;
import com.coffeeshop.model.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderCode(String orderCode);

    @Query("SELECT o FROM Order o WHERE " +
           "(:search IS NULL OR LOWER(o.orderCode) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:orderType IS NULL OR o.orderType = :orderType) AND " +
           "(:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus)")
    Page<Order> searchOrders(
            @Param("search") String search,
            @Param("status") OrderStatus status,
            @Param("orderType") OrderType orderType,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            Pageable pageable
    );
}
