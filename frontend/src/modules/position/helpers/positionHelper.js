const LEVEL_1_CODES = ["NVHTQL", "NVCC", "GS", "GSCC", "TC"];
const LEVEL_2_CODES = ["TP", "PP", "TPCC"];

export const PositionHelper = {
    isLevel1Manager(positionCode) {
        return LEVEL_1_CODES.includes(positionCode);
    },
    isLevel2Manager(positionCode) {
        return LEVEL_2_CODES.includes(positionCode);
    },
};