import React from 'react';
import { Select, Space } from 'antd';
import { MONTH_OPTIONS, PERIOD_TYPES, PERIOD_TYPE_OPTIONS, WEEK_OPTIONS } from '../utils/statisticsPeriod';

const StatisticsPeriodFilter = ({
    periodType,
    year,
    month,
    week,
    yearOptions,
    onPeriodTypeChange,
    onYearChange,
    onMonthChange,
    onWeekChange,
}) => {
    return (
        <Space wrap size={8}>
            <Select
                value={periodType}
                options={PERIOD_TYPE_OPTIONS}
                style={{ width: 108 }}
                onChange={onPeriodTypeChange}
            />

            <Select value={year} options={yearOptions} style={{ width: 100 }} onChange={onYearChange} />

            {periodType === PERIOD_TYPES.MONTH && (
                <Select value={month} options={MONTH_OPTIONS} style={{ width: 108 }} onChange={onMonthChange} />
            )}

            {periodType === PERIOD_TYPES.WEEK && (
                <Select value={week} options={WEEK_OPTIONS} style={{ width: 112 }} onChange={onWeekChange} />
            )}
        </Space>
    );
};

export default StatisticsPeriodFilter;
