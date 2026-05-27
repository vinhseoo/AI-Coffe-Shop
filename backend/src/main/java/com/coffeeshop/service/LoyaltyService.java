package com.coffeeshop.service;

import com.coffeeshop.exception.AppException;
import com.coffeeshop.exception.ErrorCode;
import com.coffeeshop.model.entity.Customer;
import com.coffeeshop.model.entity.LoyaltyTransaction;
import com.coffeeshop.model.entity.Order;
import com.coffeeshop.model.enums.CustomerTier;
import com.coffeeshop.model.enums.LoyaltyAction;
import com.coffeeshop.repository.CustomerRepository;
import com.coffeeshop.repository.LoyaltyTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoyaltyService {

    private final CustomerRepository customerRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;

    @Transactional
    public void earnPoints(Order order) {
        if (order.getCustomerId() == null) return;

        Customer customer = customerRepository.findById(order.getCustomerId())
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));

        // 1 point per 10,000 VND spent
        int points = order.getTotalAmount().divide(BigDecimal.valueOf(10000)).intValue();
        if (points <= 0) {
            // Still update visit history and order count even if points = 0
            customer.setTotalOrders(customer.getTotalOrders() + 1);
            customer.setTotalSpent(customer.getTotalSpent().add(order.getTotalAmount()));
            customer.setLastVisitAt(LocalDateTime.now());
            customerRepository.save(customer);
            return;
        }

        customer.setLoyaltyPoints(customer.getLoyaltyPoints() + points);
        customer.setTotalOrders(customer.getTotalOrders() + 1);
        customer.setTotalSpent(customer.getTotalSpent().add(order.getTotalAmount()));
        customer.setLastVisitAt(LocalDateTime.now());
        
        // Recalculate tier
        CustomerTier originalTier = customer.getTier();
        CustomerTier newTier = CustomerTier.fromPoints(customer.getLoyaltyPoints());
        if (originalTier != newTier) {
            customer.setTier(newTier);
            log.info("Khách hàng {} ({}) được nâng hạng từ {} lên {}", customer.getName(), customer.getPhone(), originalTier, newTier);
        }

        customerRepository.save(customer);

        LoyaltyTransaction tx = LoyaltyTransaction.builder()
                .customer(customer)
                .orderId(order.getId())
                .points(points)
                .action(LoyaltyAction.EARN)
                .description("Tích điểm từ đơn hàng " + order.getOrderCode())
                .build();

        loyaltyTransactionRepository.save(tx);
        log.info("Tích {} điểm cho khách hàng: {} từ đơn {}", points, customer.getName(), order.getOrderCode());
    }

    @Transactional
    public void redeemPoints(Long customerId, int points, String description) {
        if (points <= 0) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Số điểm đổi phải lớn hơn 0");
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));

        if (customer.getLoyaltyPoints() < points) {
            throw new AppException(ErrorCode.INSUFFICIENT_LOYALTY_POINTS);
        }

        customer.setLoyaltyPoints(customer.getLoyaltyPoints() - points);
        
        // Recalculate tier
        CustomerTier originalTier = customer.getTier();
        CustomerTier newTier = CustomerTier.fromPoints(customer.getLoyaltyPoints());
        if (originalTier != newTier) {
            customer.setTier(newTier);
            log.info("Khách hàng {} ({}) bị hạ hạng từ {} xuống {}", customer.getName(), customer.getPhone(), originalTier, newTier);
        }

        customerRepository.save(customer);

        LoyaltyTransaction tx = LoyaltyTransaction.builder()
                .customer(customer)
                .points(-points)
                .action(LoyaltyAction.REDEEM)
                .description(description != null ? description : "Đổi quà / giảm trừ điểm")
                .build();

        loyaltyTransactionRepository.save(tx);
        log.info("Khấu trừ {} điểm của khách hàng: {} - Lý do: {}", points, customer.getName(), description);
    }

    @Transactional
    public void addBonusPoints(Long customerId, int points, String description) {
        if (points <= 0) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Số điểm thưởng thêm phải lớn hơn 0");
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));

        customer.setLoyaltyPoints(customer.getLoyaltyPoints() + points);
        
        // Recalculate tier
        CustomerTier originalTier = customer.getTier();
        CustomerTier newTier = CustomerTier.fromPoints(customer.getLoyaltyPoints());
        if (originalTier != newTier) {
            customer.setTier(newTier);
        }

        customerRepository.save(customer);

        LoyaltyTransaction tx = LoyaltyTransaction.builder()
                .customer(customer)
                .points(points)
                .action(LoyaltyAction.BONUS)
                .description(description != null ? description : "Điểm thưởng thêm từ quản trị viên")
                .build();

        loyaltyTransactionRepository.save(tx);
        log.info("Thành công tặng {} điểm thưởng cho khách hàng: {}", points, customer.getName());
    }

    @Transactional
    public void revertPoints(Order order) {
        if (order.getCustomerId() == null) return;
        Customer customer = customerRepository.findById(order.getCustomerId()).orElse(null);
        if (customer == null) return;

        int points = order.getTotalAmount().divide(BigDecimal.valueOf(10000)).intValue();
        
        // Update customer total orders & spent
        customer.setTotalOrders(Math.max(0, customer.getTotalOrders() - 1));
        customer.setTotalSpent(customer.getTotalSpent().subtract(order.getTotalAmount()));
        if (customer.getTotalSpent().compareTo(BigDecimal.ZERO) < 0) {
            customer.setTotalSpent(BigDecimal.ZERO);
        }

        if (points > 0) {
            customer.setLoyaltyPoints(Math.max(0, customer.getLoyaltyPoints() - points));
            customer.setTier(CustomerTier.fromPoints(customer.getLoyaltyPoints()));
            
            customerRepository.save(customer);

            LoyaltyTransaction tx = LoyaltyTransaction.builder()
                    .customer(customer)
                    .orderId(order.getId())
                    .points(-points)
                    .action(LoyaltyAction.REDEEM)
                    .description("Hoàn trả điểm tích lũy do hủy đơn hàng: " + order.getOrderCode())
                    .build();
            loyaltyTransactionRepository.save(tx);
            log.info("Hoàn trả {} điểm tích lũy cho khách hàng: {} do hủy đơn {}", points, customer.getName(), order.getOrderCode());
        } else {
            customerRepository.save(customer);
        }
    }
}
