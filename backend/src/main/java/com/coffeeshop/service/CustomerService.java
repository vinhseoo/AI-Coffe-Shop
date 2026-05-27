package com.coffeeshop.service;

import com.coffeeshop.exception.AppException;
import com.coffeeshop.exception.ErrorCode;
import com.coffeeshop.model.dto.request.customer.CustomerRequest;
import com.coffeeshop.model.dto.response.PagedResponse;
import com.coffeeshop.model.dto.response.customer.CustomerResponse;
import com.coffeeshop.model.dto.response.customer.LoyaltyTransactionResponse;
import com.coffeeshop.model.entity.Customer;
import com.coffeeshop.model.enums.CustomerTier;
import com.coffeeshop.repository.CustomerRepository;
import com.coffeeshop.repository.LoyaltyTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;

    @Transactional(readOnly = true)
    public PagedResponse<CustomerResponse> getCustomers(String query, CustomerTier tier, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<Customer> customerPage = customerRepository.searchCustomers(query, tier, pageable);

        List<CustomerResponse> content = customerPage.getContent().stream()
                .map(CustomerResponse::fromEntity)
                .collect(Collectors.toList());

        return PagedResponse.<CustomerResponse>builder()
                .pageNumber(customerPage.getNumber() + 1)
                .pageSize(customerPage.getSize())
                .totalElements(customerPage.getTotalElements())
                .totalPages(customerPage.getTotalPages())
                .last(customerPage.isLast())
                .content(content)
                .build();
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));
        return CustomerResponse.fromEntity(customer);
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        if (customerRepository.existsByPhone(request.getPhone())) {
            throw new AppException(ErrorCode.CUSTOMER_PHONE_EXISTS);
        }

        Customer customer = Customer.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .birthday(request.getBirthday())
                .note(request.getNote())
                .totalOrders(0)
                .totalSpent(BigDecimal.ZERO)
                .loyaltyPoints(0)
                .tier(CustomerTier.NORMAL)
                .build();

        Customer saved = customerRepository.save(customer);
        log.info("Đã tạo khách hàng mới: {} - {}", saved.getName(), saved.getPhone());
        return CustomerResponse.fromEntity(saved);
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));

        // Check phone duplicate if changed
        if (!customer.getPhone().equals(request.getPhone()) && customerRepository.existsByPhone(request.getPhone())) {
            throw new AppException(ErrorCode.CUSTOMER_PHONE_EXISTS);
        }

        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setBirthday(request.getBirthday());
        customer.setNote(request.getNote());

        Customer updated = customerRepository.save(customer);
        log.info("Đã cập nhật khách hàng: {} - {}", updated.getName(), updated.getPhone());
        return CustomerResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new AppException(ErrorCode.CUSTOMER_NOT_FOUND);
        }
        customerRepository.deleteById(id);
        log.info("Đã xóa khách hàng id: {}", id);
    }

    @Transactional(readOnly = true)
    public List<LoyaltyTransactionResponse> getCustomerTransactions(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new AppException(ErrorCode.CUSTOMER_NOT_FOUND);
        }
        return loyaltyTransactionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(LoyaltyTransactionResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
