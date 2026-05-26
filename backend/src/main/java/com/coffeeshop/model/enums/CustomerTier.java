package com.coffeeshop.model.enums;

public enum CustomerTier {
    NORMAL,
    SILVER,
    GOLD,
    PLATINUM;

    public static CustomerTier fromPoints(int points) {
        if (points >= 1000) return PLATINUM;
        if (points >= 500) return GOLD;
        if (points >= 100) return SILVER;
        return NORMAL;
    }
}
