package com.coffeeshop.controller;

import com.coffeeshop.model.dto.response.ApiResponse;
import com.coffeeshop.model.dto.response.customer.CustomerSegmentResponse;
import com.coffeeshop.service.ai.CustomerAIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customers/ai")
@RequiredArgsConstructor
public class CustomerAIController {

    private final CustomerAIService customerAIService;

    @GetMapping("/segmentation")
    public ResponseEntity<ApiResponse<CustomerSegmentResponse>> getCustomerSegmentation() {
        return ResponseEntity.ok(ApiResponse.success(customerAIService.getCustomerSegmentation()));
    }
}
