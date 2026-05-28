package com.coffeeshop.repository;

import com.coffeeshop.model.entity.AIReport;
import com.coffeeshop.model.enums.AIReportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AIReportRepository extends JpaRepository<AIReport, Long> {

    List<AIReport> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<AIReport> findByUserIdAndReportTypeOrderByCreatedAtDesc(Long userId, AIReportType reportType);

    Optional<AIReport> findByIdAndUserId(Long id, Long userId);
}
