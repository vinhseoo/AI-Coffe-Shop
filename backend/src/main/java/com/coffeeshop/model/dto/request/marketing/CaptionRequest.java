package com.coffeeshop.model.dto.request.marketing;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CaptionRequest {
    private Long menuItemId;
    private String customProduct; // Optional custom product info if menuItemId is null
    private String tone;          // e.g. vui vẻ, chuyên nghiệp, gen-z
    private String platform;      // e.g. Facebook, Instagram, TikTok
}
