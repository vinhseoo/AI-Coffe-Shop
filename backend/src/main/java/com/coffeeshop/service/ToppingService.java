package com.coffeeshop.service;

import com.coffeeshop.exception.AppException;
import com.coffeeshop.exception.ErrorCode;
import com.coffeeshop.model.dto.request.menu.ToppingRequest;
import com.coffeeshop.model.dto.response.menu.ToppingResponse;
import com.coffeeshop.model.entity.Topping;
import com.coffeeshop.repository.ToppingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ToppingService {

    private final ToppingRepository toppingRepository;

    @Transactional(readOnly = true)
    public List<ToppingResponse> getAllToppings(boolean onlyAvailable) {
        List<Topping> toppings = onlyAvailable
                ? toppingRepository.findByIsAvailableTrue()
                : toppingRepository.findAll();
        return toppings.stream()
                .map(ToppingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ToppingResponse createTopping(ToppingRequest request) {
        Topping topping = Topping.builder()
                .name(request.getName())
                .price(request.getPrice())
                .isAvailable(true)
                .build();
        topping = toppingRepository.save(topping);
        log.info("Tạo topping mới thành công: {}", topping.getName());
        return ToppingResponse.fromEntity(topping);
    }

    @Transactional
    public ToppingResponse updateTopping(Long id, ToppingRequest request) {
        Topping topping = toppingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TOPPING_NOT_FOUND));

        topping.setName(request.getName());
        topping.setPrice(request.getPrice());

        topping = toppingRepository.save(topping);
        log.info("Cập nhật topping thành công: {}", topping.getName());
        return ToppingResponse.fromEntity(topping);
    }

    @Transactional
    public ToppingResponse toggleAvailability(Long id) {
        Topping topping = toppingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TOPPING_NOT_FOUND));
        topping.setAvailable(!topping.isAvailable());
        topping = toppingRepository.save(topping);
        log.info("Chuyển trạng thái có sẵn của topping {}: {}", topping.getName(), topping.isAvailable());
        return ToppingResponse.fromEntity(topping);
    }

    @Transactional
    public void deleteTopping(Long id) {
        Topping topping = toppingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TOPPING_NOT_FOUND));
        toppingRepository.delete(topping);
        log.info("Xóa topping thành công: {}", topping.getName());
    }
}
