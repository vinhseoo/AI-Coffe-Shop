package com.coffeeshop.model.dto.response.marketing;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class CaptionResponse {
    private String shortCaption;
    private String mediumCaption;
    private String longCaption;
    private List<String> hashtags;
}
