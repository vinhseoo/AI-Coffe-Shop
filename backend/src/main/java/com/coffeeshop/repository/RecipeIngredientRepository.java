package com.coffeeshop.repository;

import com.coffeeshop.model.entity.RecipeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, Long> {

    List<RecipeIngredient> findByMenuItemVariantId(Long menuItemVariantId);

    void deleteByMenuItemVariantId(Long menuItemVariantId);
}
