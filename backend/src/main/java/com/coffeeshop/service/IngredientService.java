package com.coffeeshop.service;

import com.coffeeshop.model.entity.Ingredient;
import com.coffeeshop.repository.IngredientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IngredientService {

    private final IngredientRepository ingredientRepository;

    @Transactional(readOnly = true)
    public List<Ingredient> getAllActiveIngredients() {
        return ingredientRepository.findByIsActiveTrue();
    }
}
