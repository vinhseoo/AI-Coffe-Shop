package com.coffeeshop.model.entity;

import com.coffeeshop.model.enums.AIReportType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ai_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIReport extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false, length = 50)
    private AIReportType reportType;

    @Column(nullable = false, length = 255)
    private String title;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "prompt_used", columnDefinition = "TEXT")
    private String promptUsed;

    @Column(columnDefinition = "TEXT")
    private String metadata;

    @Column(name = "is_bookmarked", nullable = false)
    @Builder.Default
    private boolean isBookmarked = false;
}
