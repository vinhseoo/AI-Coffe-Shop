package com.coffeeshop.service;

import com.coffeeshop.exception.AppException;
import com.coffeeshop.exception.ErrorCode;
import com.coffeeshop.model.dto.request.menu.MenuItemRequest;
import com.coffeeshop.model.dto.request.menu.RecipeItemRequest;
import com.coffeeshop.model.dto.request.menu.RecipeRequest;
import com.coffeeshop.model.dto.request.menu.VariantRequest;
import com.coffeeshop.model.dto.response.menu.MenuItemDetailResponse;
import com.coffeeshop.model.dto.response.menu.MenuItemResponse;
import com.coffeeshop.model.dto.response.menu.MenuItemVariantResponse;
import com.coffeeshop.model.dto.response.menu.RecipeIngredientResponse;
import com.coffeeshop.model.entity.*;
import com.coffeeshop.model.enums.ProductSize;
import com.coffeeshop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final ToppingRepository toppingRepository;
    private final MenuItemVariantRepository menuItemVariantRepository;

    @Transactional(readOnly = true)
    public Page<MenuItemResponse> searchMenuItems(Long categoryId, String name, Pageable pageable) {
        Page<MenuItem> items;
        if (categoryId != null && name != null && !name.isBlank()) {
            items = menuItemRepository.findByCategoryIdAndNameContainingIgnoreCase(categoryId, name, pageable);
        } else if (categoryId != null) {
            items = menuItemRepository.findByCategoryId(categoryId, pageable);
        } else if (name != null && !name.isBlank()) {
            items = menuItemRepository.findByNameContainingIgnoreCase(name, pageable);
        } else {
            items = menuItemRepository.findAll(pageable);
        }
        return items.map(MenuItemResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public MenuItemDetailResponse getMenuItemDetail(Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MENU_ITEM_NOT_FOUND));

        List<Topping> toppings = toppingRepository.findByIsAvailableTrue();

        return MenuItemDetailResponse.fromEntity(item, toppings);
    }

    @Transactional
    public MenuItemResponse createMenuItem(MenuItemRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        MenuItem item = MenuItem.builder()
                .category(category)
                .name(request.getName())
                .description(request.getDescription())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .isBestseller(request.getIsBestseller() != null ? request.getIsBestseller() : false)
                .isAvailable(true)
                .build();

        item = menuItemRepository.save(item);

        // Tạo biến thể
        List<MenuItemVariant> variants = new ArrayList<>();
        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            for (VariantRequest varReq : request.getVariants()) {
                MenuItemVariant variant = MenuItemVariant.builder()
                        .menuItem(item)
                        .size(varReq.getSize())
                        .price(varReq.getPrice())
                        .isAvailable(true)
                        .build();
                variants.add(variant);
            }
        } else {
            // Fallback: Tạo một biến thể mặc định
            BigDecimal priceVal = request.getPrice() != null ? request.getPrice() : BigDecimal.ZERO;
            ProductSize sizeVal = request.getSize() != null ? request.getSize() : ProductSize.M;

            MenuItemVariant defaultVariant = MenuItemVariant.builder()
                    .menuItem(item)
                    .size(sizeVal)
                    .price(priceVal)
                    .isAvailable(true)
                    .build();
            variants.add(defaultVariant);
        }

        variants = menuItemVariantRepository.saveAll(variants);
        item.setVariants(variants);

        log.info("Tạo món mới thành công: {} với {} biến thể", item.getName(), variants.size());
        return MenuItemResponse.fromEntity(item);
    }

    @Transactional
    public MenuItemResponse updateMenuItem(Long id, MenuItemRequest request) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MENU_ITEM_NOT_FOUND));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        item.setCategory(category);
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        if (request.getDisplayOrder() != null) {
            item.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getIsBestseller() != null) {
            item.setBestseller(request.getIsBestseller());
        }

        item = menuItemRepository.save(item);
        log.info("Cập nhật thông tin món ăn thành công: {}", item.getName());
        return MenuItemResponse.fromEntity(item);
    }

    @Transactional
    public void deleteMenuItem(Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MENU_ITEM_NOT_FOUND));
        menuItemRepository.delete(item);
        log.info("Xóa món thành công: {}", item.getName());
    }

    @Transactional
    public MenuItemResponse toggleAvailability(Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MENU_ITEM_NOT_FOUND));
        item.setAvailable(!item.isAvailable());
        item = menuItemRepository.save(item);
        log.info("Chuyển trạng thái có sẵn của món {}: {}", item.getName(), item.isAvailable());
        return MenuItemResponse.fromEntity(item);
    }

    // ==========================================
    // VARIANT CRUD ACTIONS
    // ==========================================

    @Transactional
    public MenuItemVariantResponse addVariant(Long menuItemId, VariantRequest request) {
        MenuItem item = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new AppException(ErrorCode.MENU_ITEM_NOT_FOUND));

        if (menuItemVariantRepository.existsByMenuItemIdAndSize(menuItemId, request.getSize())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Size " + request.getSize() + " đã tồn tại cho sản phẩm này");
        }

        MenuItemVariant variant = MenuItemVariant.builder()
                .menuItem(item)
                .size(request.getSize())
                .price(request.getPrice())
                .isAvailable(true)
                .build();

        variant = menuItemVariantRepository.save(variant);
        log.info("Thêm biến thể size {} thành công cho món {}", request.getSize(), item.getName());
        return MenuItemVariantResponse.fromEntity(variant);
    }

    @Transactional
    public MenuItemVariantResponse updateVariant(Long variantId, VariantRequest request) {
        MenuItemVariant variant = menuItemVariantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy biến thể"));

        if (menuItemVariantRepository.existsByMenuItemIdAndSizeAndIdNot(variant.getMenuItem().getId(), request.getSize(), variantId)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Size " + request.getSize() + " đã tồn tại cho sản phẩm này");
        }

        variant.setSize(request.getSize());
        variant.setPrice(request.getPrice());

        variant = menuItemVariantRepository.save(variant);
        log.info("Cập nhật biến thể thành công cho món {}", variant.getMenuItem().getName());
        return MenuItemVariantResponse.fromEntity(variant);
    }

    @Transactional
    public void deleteVariant(Long variantId) {
        MenuItemVariant variant = menuItemVariantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy biến thể"));

        // Chặn xóa nếu đây là biến thể duy nhất của sản phẩm
        List<MenuItemVariant> variants = menuItemVariantRepository.findByMenuItemId(variant.getMenuItem().getId());
        if (variants.size() <= 1) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không thể xóa biến thể duy nhất. Sản phẩm phải có ít nhất 1 size.");
        }

        menuItemVariantRepository.delete(variant);
        log.info("Xóa biến thể size {} thành công", variant.getSize());
    }

    @Transactional
    public MenuItemVariantResponse toggleVariantAvailability(Long variantId) {
        MenuItemVariant variant = menuItemVariantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy biến thể"));
        variant.setAvailable(!variant.isAvailable());
        variant = menuItemVariantRepository.save(variant);
        return MenuItemVariantResponse.fromEntity(variant);
    }

    // ==========================================
    // RECIPE ACTIONS (Variant Level)
    // ==========================================

    @Transactional(readOnly = true)
    public List<RecipeIngredientResponse> getRecipe(Long variantId) {
        if (!menuItemVariantRepository.existsById(variantId)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy biến thể");
        }
        return recipeIngredientRepository.findByMenuItemVariantId(variantId).stream()
                .map(RecipeIngredientResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<RecipeIngredientResponse> saveRecipe(Long variantId, RecipeRequest request) {
        MenuItemVariant variant = menuItemVariantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy biến thể"));

        // Xóa công thức cũ của biến thể và flush ngay lập tức
        recipeIngredientRepository.deleteByMenuItemVariantId(variantId);
        recipeIngredientRepository.flush();

        List<RecipeIngredient> newRecipes = new ArrayList<>();
        BigDecimal totalCost = BigDecimal.ZERO;

        for (RecipeItemRequest recipeReq : request.getItems()) {
            Ingredient ingredient = ingredientRepository.findById(recipeReq.getIngredientId())
                    .orElseThrow(() -> new AppException(ErrorCode.INGREDIENT_NOT_FOUND,
                            "Không tìm thấy nguyên liệu có ID: " + recipeReq.getIngredientId()));

            RecipeIngredient recipeIngredient = RecipeIngredient.builder()
                    .menuItemVariant(variant)
                    .ingredient(ingredient)
                    .quantity(recipeReq.getQuantity())
                    .build();

            newRecipes.add(recipeIngredient);

            BigDecimal itemCost = recipeReq.getQuantity().multiply(ingredient.getUnitCost());
            totalCost = totalCost.add(itemCost);
        }

        // Lưu công thức mới
        newRecipes = recipeIngredientRepository.saveAll(newRecipes);

        // Cập nhật giá vốn của Variant tương ứng
        variant.setCostPrice(totalCost);
        menuItemVariantRepository.save(variant);

        log.info("Lưu công thức cho món {} - size {} thành công. Giá vốn mới: {}",
                variant.getMenuItem().getName(), variant.getSize(), totalCost);

        return newRecipes.stream()
                .map(RecipeIngredientResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
