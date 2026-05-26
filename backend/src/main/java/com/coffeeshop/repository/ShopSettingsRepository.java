package com.coffeeshop.repository;

import com.coffeeshop.model.entity.ShopSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShopSettingsRepository extends JpaRepository<ShopSettings, Long> {

    Optional<ShopSettings> findByUserId(Long userId);
}
