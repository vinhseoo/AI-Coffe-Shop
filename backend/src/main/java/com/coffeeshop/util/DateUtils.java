package com.coffeeshop.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public final class DateUtils {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private DateUtils() {}

    public static LocalDateTime startOfDay(LocalDate date) {
        return date.atStartOfDay();
    }

    public static LocalDateTime endOfDay(LocalDate date) {
        return date.atTime(LocalTime.MAX);
    }

    public static LocalDateTime startOfToday() {
        return startOfDay(LocalDate.now());
    }

    public static LocalDateTime endOfToday() {
        return endOfDay(LocalDate.now());
    }

    public static LocalDateTime startOfYesterday() {
        return startOfDay(LocalDate.now().minusDays(1));
    }

    public static LocalDateTime endOfYesterday() {
        return endOfDay(LocalDate.now().minusDays(1));
    }

    public static LocalDate daysAgo(int days) {
        return LocalDate.now().minusDays(days);
    }

    public static String formatDate(LocalDate date) {
        return date.format(DATE_FORMATTER);
    }

    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime.format(DATE_TIME_FORMATTER);
    }

    public static boolean isToday(LocalDateTime dateTime) {
        return dateTime.toLocalDate().equals(LocalDate.now());
    }
}
