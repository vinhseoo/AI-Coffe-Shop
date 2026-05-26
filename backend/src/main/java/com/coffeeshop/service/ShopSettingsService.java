package com.coffeeshop.service;

import com.coffeeshop.exception.AppException;
import com.coffeeshop.exception.ErrorCode;
import com.coffeeshop.model.dto.request.settings.ShopSettingsRequest;
import com.coffeeshop.model.dto.response.settings.ShopSettingsResponse;
import com.coffeeshop.model.entity.ShopSettings;
import com.coffeeshop.model.entity.User;
import com.coffeeshop.repository.ShopSettingsRepository;
import com.coffeeshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShopSettingsService {

    private final ShopSettingsRepository shopSettingsRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    @Transactional(readOnly = true)
    public ShopSettingsResponse getSettings(String username) {
        User user = findUser(username);
        ShopSettings settings = shopSettingsRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.SHOP_SETTINGS_NOT_FOUND));
        return ShopSettingsResponse.fromEntity(settings);
    }

    @Transactional
    public ShopSettingsResponse updateSettings(String username, ShopSettingsRequest request) {
        User user = findUser(username);
        ShopSettings settings = shopSettingsRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.SHOP_SETTINGS_NOT_FOUND));

        settings.setShopName(request.getShopName());
        settings.setAddress(request.getAddress());
        settings.setPhone(request.getPhone());
        settings.setDescription(request.getDescription());
        settings.setWifiPassword(request.getWifiPassword());
        settings.setSocialFacebook(request.getSocialFacebook());
        settings.setSocialInstagram(request.getSocialInstagram());

        if (request.getOpeningTime() != null) {
            settings.setOpeningTime(LocalTime.parse(request.getOpeningTime(), TIME_FMT));
        }
        if (request.getClosingTime() != null) {
            settings.setClosingTime(LocalTime.parse(request.getClosingTime(), TIME_FMT));
        }
        if (request.getTaxRate() != null) {
            settings.setTaxRate(request.getTaxRate());
        }

        settings = shopSettingsRepository.save(settings);
        log.info("Cập nhật cài đặt quán cho user: {}", username);

        return ShopSettingsResponse.fromEntity(settings);
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}
