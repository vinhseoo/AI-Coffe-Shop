package com.coffeeshop.repository;

import com.coffeeshop.model.entity.MenuItemVariant;
import com.coffeeshop.model.enums.ProductSize;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuItemVariantRepository extends JpaRepository<MenuItemVariant, Long> {

    List<MenuItemVariant> findByMenuItemId(Long menuItemId);

    Optional<MenuItemVariant> findByMenuItemIdAndSize(Long menuItemId, ProductSize size);

    boolean existsByMenuItemIdAndSize(Long menuItemId, ProductSize size);

    boolean existsByMenuItemIdAndSizeAndIdNot(Long menuItemId, ProductSize size, Long id);
}
