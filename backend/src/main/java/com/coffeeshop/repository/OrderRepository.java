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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.createdAt >= :start AND o.createdAt <= :end AND o.status <> 'CANCELLED'")
    BigDecimal calculateRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :start AND o.createdAt <= :end AND o.status <> 'CANCELLED'")
    Long countOrdersBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query(value = "SELECT DATE_FORMAT(o.created_at, '%Y-%m-%d') as label, COALESCE(SUM(o.total_amount), 0) as revenue, COUNT(o.id) as orderCount " +
                   "FROM orders o " +
                   "WHERE o.created_at >= :start AND o.created_at <= :end AND o.status <> 'CANCELLED' " +
                   "GROUP BY DATE_FORMAT(o.created_at, '%Y-%m-%d') " +
                   "ORDER BY label ASC", nativeQuery = true)
    List<Object[]> getDailyRevenueSummary(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query(value = "SELECT DATE_FORMAT(o.created_at, '%Y-W%u') as label, COALESCE(SUM(o.total_amount), 0) as revenue, COUNT(o.id) as orderCount " +
                   "FROM orders o " +
                   "WHERE o.created_at >= :start AND o.created_at <= :end AND o.status <> 'CANCELLED' " +
                   "GROUP BY DATE_FORMAT(o.created_at, '%Y-W%u') " +
                   "ORDER BY label ASC", nativeQuery = true)
    List<Object[]> getWeeklyRevenueSummary(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query(value = "SELECT DATE_FORMAT(o.created_at, '%Y-%m') as label, COALESCE(SUM(o.total_amount), 0) as revenue, COUNT(o.id) as orderCount " +
                   "FROM orders o " +
                   "WHERE o.created_at >= :start AND o.created_at <= :end AND o.status <> 'CANCELLED' " +
                   "GROUP BY DATE_FORMAT(o.created_at, '%Y-%m') " +
                   "ORDER BY label ASC", nativeQuery = true)
    List<Object[]> getMonthlyRevenueSummary(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query(value = "SELECT mi.id as menuItemId, mi.name as name, SUM(oi.quantity) as totalSold, SUM(oi.subtotal) as revenue, mi.image_url as imageUrl " +
                   "FROM order_items oi " +
                   "JOIN menu_item_variants miv ON oi.menu_item_variant_id = miv.id " +
                   "JOIN menu_items mi ON miv.menu_item_id = mi.id " +
                   "JOIN orders o ON oi.order_id = o.id " +
                   "WHERE o.created_at >= :start AND o.created_at <= :end AND o.status <> 'CANCELLED' " +
                   "GROUP BY mi.id, mi.name, mi.image_url " +
                   "ORDER BY totalSold DESC " +
                   "LIMIT :limit", nativeQuery = true)
    List<Object[]> getTopSellingItems(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("limit") Integer limit);

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
