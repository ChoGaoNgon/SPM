import dayjs from 'dayjs';

export const mapToGanttTask = (report, index) => {
    const start = dayjs(report.startDateTime).toDate();
    let end = dayjs(report.endDateTime).toDate();

    if (!end || !report.endDateTime || !dayjs(end).isAfter(start)) {
        end = dayjs(start).add(1, 'hour').toDate();
    }

    return {
        id: `${report.id}`,
        name: report.taskDescription || `Công việc ${index + 1}`,
        start,
        end,
        type: 'task',
        progress: 100,
        project: report.employeeName,
        isDisabled: true,
        filePath: report.filePath,
    };
};
