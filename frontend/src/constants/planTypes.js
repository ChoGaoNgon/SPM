export const PLAN_TYPES = {
    MOLD_TRIAL: 'MOLD_TRIAL',
    EVENT: 'EVENT',
    SECOND_PROCESS: 'SECOND_PROCESS',
    MP: 'MP',
};

export const PLAN_TYPE_LABELS = {
    [PLAN_TYPES.MOLD_TRIAL]: 'Thử khuôn',
    [PLAN_TYPES.EVENT]: 'Event',
    [PLAN_TYPES.SECOND_PROCESS]: 'Second Process',
    [PLAN_TYPES.MP]: 'MP',
};

export const isValidPlanType = (planType) => {
    return Object.values(PLAN_TYPES).includes(planType);
};

export default PLAN_TYPES;
