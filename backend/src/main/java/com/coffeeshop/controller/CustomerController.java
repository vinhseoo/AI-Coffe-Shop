package com.coffeeshop.controller;

import com.coffeeshop.model.dto.request.customer.CustomerRequest;
import com.coffeeshop.model.dto.request.customer.RedeemPointsRequest;
import com.coffeeshop.model.dto.response.ApiResponse;
import com.coffeeshop.model.dto.response.PagedResponse;
import com.coffeeshop.model.dto.response.customer.CustomerResponse;
import com.coffeeshop.model.dto.response.customer.LoyaltyTransactionResponse;
import com.coffeeshop.model.enums.CustomerTier;
import com.coffeeshop.service.CustomerService;
import com.coffeeshop.service.LoyaltyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final LoyaltyService loyaltyService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<CustomerResponse>>> getCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) CustomerTier tier,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(customerService.getCustomers(search, tier, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(customerService.getCustomerById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(@Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(customerService.createCustomer(request), "Đăng ký thành viên thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(ApiResponse.success(customerService.updateCustomer(id, request), "Cập nhật thành viên thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa khách hàng thành công"));
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<ApiResponse<List<LoyaltyTransactionResponse>>> getCustomerTransactions(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(customerService.getCustomerTransactions(id)));
    }

    @PostMapping("/{id}/redeem")
    public ResponseEntity<ApiResponse<Void>> redeemPoints(
            @PathVariable Long id,
            @Valid @RequestBody RedeemPointsRequest request) {
        loyaltyService.redeemPoints(id, request.getPoints(), request.getDescription());
        return ResponseEntity.ok(ApiResponse.success(null, "Đổi điểm tích lũy thành công"));
    }
}
