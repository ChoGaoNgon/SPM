package htmp.codien.quanlycodien.modules.workreport.helper;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.function.Function;

public class WorkTimeCalculator {

    public static <T> long calculateTotalMinutes(
            List<T> tasks,
            Function<T, LocalDateTime> startGetter,
            Function<T, LocalDateTime> endGetter,
            List<Interval> breaks) {
        if (tasks == null || tasks.isEmpty())
            return 0;

        List<Interval> intervals = new ArrayList<>();
        for (T task : tasks) {
            LocalDateTime start = startGetter.apply(task);
            LocalDateTime end = endGetter.apply(task);
            if (start != null && end != null && !end.isBefore(start)) {
                intervals.add(new Interval(start, end));
            }
        }

        intervals.sort(Comparator.comparing(i -> i.start));
        List<Interval> merged = new ArrayList<>();
        for (Interval i : intervals) {
            if (merged.isEmpty()) {
                merged.add(i);
            } else {
                Interval last = merged.get(merged.size() - 1);
                if (!i.start.isAfter(last.end)) {
                    last.end = i.end.isAfter(last.end) ? i.end : last.end;
                } else {
                    merged.add(i);
                }
            }
        }

        long totalMinutes = 0;
        for (Interval work : merged) {
            List<Interval> cut = subtractBreaks(work, breaks);
            for (Interval c : cut) {
                totalMinutes += Duration.between(c.start, c.end).toMinutes();
            }
        }

        return totalMinutes;
    }

    private static List<Interval> subtractBreaks(Interval work, List<Interval> breaks) {
        List<Interval> result = new ArrayList<>();
        result.add(work);

        if (breaks == null)
            return result;

        for (Interval br : breaks) {
            List<Interval> newResult = new ArrayList<>();

            for (Interval current : result) {

                if (br.end.isBefore(current.start) || br.start.isAfter(current.end)) {
                    newResult.add(current);
                    continue;
                }

                if (br.start.isAfter(current.start) && br.end.isBefore(current.end)) {
                    newResult.add(new Interval(current.start, br.start));
                    newResult.add(new Interval(br.end, current.end));
                }

                else if (br.start.isBefore(current.start) && br.end.isBefore(current.end)) {
                    newResult.add(new Interval(br.end, current.end));
                }

                else if (br.start.isAfter(current.start) && br.end.isAfter(current.end)) {
                    newResult.add(new Interval(current.start, br.start));
                }

                else {

                }
            }

            result = newResult;
        }

        return result;
    }

    public static class Interval {
        public LocalDateTime start;
        public LocalDateTime end;

        public Interval(LocalDateTime s, LocalDateTime e) {
            start = s;
            end = e;
        }

        @Override
        public String toString() {
            return start + " - " + end;
        }
    }
}
