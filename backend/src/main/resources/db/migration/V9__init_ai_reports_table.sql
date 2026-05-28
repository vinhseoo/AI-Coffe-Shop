-- ===================================================
-- PHASE 9: REPORTS MODULE — AI REPORTS
-- ===================================================

CREATE TABLE ai_reports (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id       BIGINT NOT NULL,
    report_type   VARCHAR(50) NOT NULL, -- WEEKLY_ANALYSIS, REVENUE_FORECAST, BUSINESS_SUGGESTION
    title         VARCHAR(255) NOT NULL,
    content       LONGTEXT NOT NULL,
    prompt_used   TEXT,
    metadata      TEXT,
    is_bookmarked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by    VARCHAR(100),
    updated_by    VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_ai_reports_user ON ai_reports(user_id);
CREATE INDEX idx_ai_reports_type ON ai_reports(report_type);
