package htmp.codien.quanlycodien.modules.newmodel.statistic.helper;

import java.time.LocalDate;
import java.time.temporal.WeekFields;

public final class StatisticsPeriodResolver {
    public record PeriodRange(LocalDate fromDate, LocalDate toDate, String periodType, Integer year, Integer month,
            Integer week) {
    }

    private static final WeekFields ISO = WeekFields.ISO;

    private StatisticsPeriodResolver() {
    }

    public static PeriodRange resolve(String periodType, Integer year, Integer month, Integer week) {
        LocalDate now = LocalDate.now();
        String normalizedPeriodType = periodType == null ? "WEEK" : periodType.trim().toUpperCase();

        return switch (normalizedPeriodType) {
            case "WEEK" -> resolveWeek(now, year, week);
            case "MONTH" -> resolveMonth(now, year, month);
            case "YEAR" -> resolveYear(now, year);
            default -> throw new IllegalArgumentException("periodType không hợp lệ. Giá trị hợp lệ: WEEK, MONTH, YEAR");
        };
    }

    private static PeriodRange resolveWeek(LocalDate now, Integer year, Integer week) {
        int effectiveYear = year != null ? year : now.get(ISO.weekBasedYear());
        int effectiveWeek = week != null ? week : now.get(ISO.weekOfWeekBasedYear());

        if (effectiveWeek < 1 || effectiveWeek > 53) {
            throw new IllegalArgumentException("week phải trong khoảng từ 1 đến 53.");
        }

        LocalDate start = LocalDate.of(effectiveYear, 1, 4)
                .with(ISO.weekOfWeekBasedYear(), effectiveWeek)
                .with(ISO.dayOfWeek(), 1);

        if (start.get(ISO.weekBasedYear()) != effectiveYear || start.get(ISO.weekOfWeekBasedYear()) != effectiveWeek) {
            throw new IllegalArgumentException("Tuần không hợp lệ cho năm đã chọn.");
        }

        return new PeriodRange(start, start.plusWeeks(1), "WEEK", effectiveYear, null, effectiveWeek);
    }

    private static PeriodRange resolveMonth(LocalDate now, Integer year, Integer month) {
        int effectiveYear = year != null ? year : now.getYear();
        int effectiveMonth = month != null ? month : now.getMonthValue();

        if (effectiveMonth < 1 || effectiveMonth > 12) {
            throw new IllegalArgumentException("month phải trong khoảng từ 1 đến 12.");
        }

        LocalDate start = LocalDate.of(effectiveYear, effectiveMonth, 1);
        return new PeriodRange(start, start.plusMonths(1), "MONTH", effectiveYear, effectiveMonth, null);
    }

    private static PeriodRange resolveYear(LocalDate now, Integer year) {
        int effectiveYear = year != null ? year : now.getYear();
        LocalDate start = LocalDate.of(effectiveYear, 1, 1);
        return new PeriodRange(start, start.plusYears(1), "YEAR", effectiveYear, null, null);
    }
}