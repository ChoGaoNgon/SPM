export const CHART_COLORS = {
    MOLD_TRIAL: {
        primary: '#8884d8',
        light: '#e8f3ff',
        border: '#bfdbfe',
        text: '#1e40af',
        hover: '#f0f4ff',
    },
    EVENT: {
        primary: '#82ca9d',
        light: '#f0fdf4',
        border: '#bbf7d0',
        text: '#15803d',
        hover: '#f7fee7',
    },
    SECOND_PROCESS: {
        primary: '#38bdf8',
        light: '#f0f9ff',
        border: '#bae6fd',
        text: '#0369a1',
        hover: '#e0f2fe',
    },
    MP: {
        primary: '#ffc658',
        light: '#fffbeb',
        border: '#fed7aa',
        text: '#ea580c',
        hover: '#fef3c7',
    },
    OTHER: {
        primary: '#ff7c7c',
        light: '#fef2f2',
        border: '#fecaca',
        text: '#dc2626',
        hover: '#fee2e2',
    },
};

export const getPlanTypeColors = (planType) => {
    switch (planType) {
        case 'MOLD_TRIAL':
            return CHART_COLORS.MOLD_TRIAL;
        case 'EVENT':
            return CHART_COLORS.EVENT;
        case 'SECOND_PROCESS':
            return CHART_COLORS.SECOND_PROCESS;
        case 'MP':
            return CHART_COLORS.MP;
        default:
            return CHART_COLORS.OTHER;
    }
};

export const PLAN_TYPE_ICONS = {
    MOLD_TRIAL: {
        color: CHART_COLORS.MOLD_TRIAL.text,
        bgColor: CHART_COLORS.MOLD_TRIAL.light,
        borderColor: CHART_COLORS.MOLD_TRIAL.border,
    },
    EVENT: {
        color: CHART_COLORS.EVENT.text,
        bgColor: CHART_COLORS.EVENT.light,
        borderColor: CHART_COLORS.EVENT.border,
    },
    SECOND_PROCESS: {
        color: CHART_COLORS.SECOND_PROCESS.text,
        bgColor: CHART_COLORS.SECOND_PROCESS.light,
        borderColor: CHART_COLORS.SECOND_PROCESS.border,
    },
    MP: {
        color: CHART_COLORS.MP.text,
        bgColor: CHART_COLORS.MP.light,
        borderColor: CHART_COLORS.MP.border,
    },
};

export const getPlanTypeClasses = (planType) => {
    switch (planType) {
        case 'MOLD_TRIAL':
            return {
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                textColor: 'text-blue-700',
                hoverColor: 'hover:bg-blue-100',
            };
        case 'EVENT':
            return {
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                textColor: 'text-green-700',
                hoverColor: 'hover:bg-green-100',
            };
        case 'SECOND_PROCESS':
            return {
                bgColor: 'bg-sky-50',
                borderColor: 'border-sky-200',
                textColor: 'text-sky-700',
                hoverColor: 'hover:bg-sky-100',
            };
        case 'MP':
            return {
                bgColor: 'bg-orange-50',
                borderColor: 'border-orange-200',
                textColor: 'text-orange-700',
                hoverColor: 'hover:bg-orange-100',
            };
        default:
            return {
                bgColor: 'bg-gray-50',
                borderColor: 'border-gray-200',
                textColor: 'text-gray-700',
                hoverColor: 'hover:bg-gray-100',
            };
    }
};
