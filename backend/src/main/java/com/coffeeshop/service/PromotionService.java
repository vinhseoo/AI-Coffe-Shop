package com.coffeeshop.service;

import com.coffeeshop.exception.AppException;
import com.coffeeshop.exception.ErrorCode;
import com.coffeeshop.model.dto.request.promotion.PromotionRequest;
import com.coffeeshop.model.dto.response.PagedResponse;
import com.coffeeshop.model.dto.response.promotion.PromotionResponse;
import com.coffeeshop.model.entity.Promotion;
import com.coffeeshop.repository.PromotionRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(readOnly = true)
    public PagedResponse<PromotionResponse> getPromotions(String query, Boolean isActive, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<Promotion> promotionPage = promotionRepository.searchPromotions(query, isActive, pageable);

        List<PromotionResponse> content = promotionPage.getContent().stream()
                .map(PromotionResponse::fromEntity)
                .collect(Collectors.toList());

        return PagedResponse.<PromotionResponse>builder()
                .pageNumber(promotionPage.getNumber() + 1)
                .pageSize(promotionPage.getSize())
                .totalElements(promotionPage.getTotalElements())
                .totalPages(promotionPage.getTotalPages())
                .last(promotionPage.isLast())
                .content(content)
                .build();
    }

    @Transactional(readOnly = true)
    public PromotionResponse getPromotionById(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        return PromotionResponse.fromEntity(promotion);
    }

    @Transactional
    public PromotionResponse createPromotion(PromotionRequest request) {
        String applicableItemsJson = null;
        if (request.getApplicableItems() != null) {
            try {
                applicableItemsJson = objectMapper.writeValueAsString(request.getApplicableItems());
            } catch (Exception e) {
                log.error("Lỗi parse list applicableItems sang JSON string", e);
            }
        }

        Promotion promotion = Promotion.builder()
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .value(request.getValue())
                .minOrderValue(request.getMinOrderValue() != null ? request.getMinOrderValue() : BigDecimal.ZERO)
                .maxDiscount(request.getMaxDiscount())
                .applicableItems(applicableItemsJson)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .usageLimit(request.getUsageLimit())
                .usedCount(0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isAiSuggested(false)
                .build();

        Promotion saved = promotionRepository.save(promotion);
        log.info("Đã tạo chương trình khuyến mãi mới: {} (ID: {})", saved.getName(), saved.getId());
        return PromotionResponse.fromEntity(saved);
    }

    @Transactional
    public PromotionResponse updatePromotion(Long id, PromotionRequest request) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        String applicableItemsJson = null;
        if (request.getApplicableItems() != null) {
            try {
                applicableItemsJson = objectMapper.writeValueAsString(request.getApplicableItems());
            } catch (Exception e) {
                log.error("Lỗi parse list applicableItems sang JSON string", e);
            }
        }

        promotion.setName(request.getName());
        promotion.setDescription(request.getDescription());
        promotion.setType(request.getType());
        promotion.setValue(request.getValue());
        promotion.setMinOrderValue(request.getMinOrderValue() != null ? request.getMinOrderValue() : BigDecimal.ZERO);
        promotion.setMaxDiscount(request.getMaxDiscount());
        promotion.setApplicableItems(applicableItemsJson);
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setUsageLimit(request.getUsageLimit());
        if (request.getIsActive() != null) {
            promotion.setActive(request.getIsActive());
        }

        Promotion updated = promotionRepository.save(promotion);
        log.info("Đã cập nhật chương trình khuyến mãi ID: {}", updated.getId());
        return PromotionResponse.fromEntity(updated);
    }

    @Transactional
    public void deletePromotion(Long id) {
        if (!promotionRepository.existsById(id)) {
            throw new AppException(ErrorCode.PROMOTION_NOT_FOUND);
        }
        promotionRepository.deleteById(id);
        log.info("Đã xóa chương trình khuyến mãi ID: {}", id);
    }

    @Transactional(readOnly = true)
    public PromotionResponse validatePromotion(Long id, BigDecimal orderAmount, List<Long> variantIds) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        if (!promotion.isActive()) {
            throw new AppException(ErrorCode.PROMOTION_NOT_APPLICABLE);
        }

        LocalDateTime now = LocalDateTime.now();
        if (promotion.getStartDate() != null && promotion.getStartDate().isAfter(now)) {
            throw new AppException(ErrorCode.PROMOTION_NOT_APPLICABLE);
        }
        if (promotion.getEndDate() != null && promotion.getEndDate().isBefore(now)) {
            throw new AppException(ErrorCode.PROMOTION_EXPIRED);
        }

        if (promotion.getUsageLimit() != null && promotion.getUsedCount() >= promotion.getUsageLimit()) {
            throw new AppException(ErrorCode.PROMOTION_USAGE_LIMIT_REACHED);
        }

        if (promotion.getMinOrderValue() != null && orderAmount.compareTo(promotion.getMinOrderValue()) < 0) {
            throw new AppException(ErrorCode.PROMOTION_NOT_APPLICABLE);
        }

        // If there are applicable items, verify at least one ordered item is applicable
        if (promotion.getApplicableItems() != null && !promotion.getApplicableItems().trim().isEmpty()) {
            try {
                List<Long> applicableList = objectMapper.readValue(promotion.getApplicableItems(), new TypeReference<List<Long>>() {});
                if (!applicableList.isEmpty() && (variantIds == null || variantIds.stream().noneMatch(applicableList::contains))) {
                    throw new AppException(ErrorCode.PROMOTION_NOT_APPLICABLE);
                }
            } catch (Exception e) {
                log.error("Lỗi đọc list applicableItems trong validate", e);
            }
        }

        return PromotionResponse.fromEntity(promotion);
    }

    @Transactional
    public void incrementUsedCount(Long id) {
        Promotion promotion = promotionRepository.findById(id).orElse(null);
        if (promotion != null) {
            promotion.setUsedCount(promotion.getUsedCount() + 1);
            promotionRepository.save(promotion);
        }
    }
}
