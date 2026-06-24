export const PERIOD_TYPES = {
    WEEK: 'WEEK',
    MONTH: 'MONTH',
    YEAR: 'YEAR',
};

export const PERIOD_TYPE_OPTIONS = [
    { label: 'Tuần', value: PERIOD_TYPES.WEEK },
    { label: 'Tháng', value: PERIOD_TYPES.MONTH },
    { label: 'Năm', value: PERIOD_TYPES.YEAR },
];

export const getCurrentISOWeek = (date = new Date()) => {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    return Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7);
};

export const getCurrentISOWeekYear = (date = new Date()) => {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
    return utcDate.getUTCFullYear();
};

export const buildYearOptions = (startYear = 2020, endYear = new Date().getFullYear() + 1) =>
    Array.from({ length: endYear - startYear + 1 }, (_, index) => {
        const year = startYear + index;
        return { label: `${year}`, value: year };
    });

export const WEEK_OPTIONS = Array.from({ length: 53 }, (_, index) => ({
    label: `Tuần ${index + 1}`,
    value: index + 1,
}));

export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
    label: `Tháng ${index + 1}`,
    value: index + 1,
}));

export const buildPeriodParams = ({ periodType, year, month, week }) => {
    const params = {
        periodType,
        year,
    };

    if (periodType === PERIOD_TYPES.WEEK) {
        params.week = week;
    }

    if (periodType === PERIOD_TYPES.MONTH) {
        params.month = month;
    }

    return params;
};
