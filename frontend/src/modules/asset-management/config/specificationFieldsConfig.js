export const ASSET_TYPE_SPECIFICATION_FIELDS = {
    COMPUTER: {
        name: 'Máy tính',
        keywords: ['máy tính', 'laptop', 'pc', 'computer', 'server', 'máy chủ'],
        fields: [
            { key: 'ram', label: 'RAM', span: 2 },
            { key: 'rom', label: 'ROM', span: 2 },
            { key: 'cpu', label: 'CPU', span: 2 },
            { key: 'manufacture', label: 'Hãng sản xuất', span: 2 },
            { key: 'ipAddress', label: 'IP Address', span: 2 },
        ],
    },

    NETWORK: {
        name: 'Thiết bị mạng',
        keywords: ['router', 'switch', 'modem', 'access point', 'firewall', 'thiết bị mạng'],
        fields: [
            { key: 'manufacture', label: 'Hãng sản xuất', span: 2 },
            { key: 'ipAddress', label: 'IP Address', span: 2 },
            { key: 'dimension', label: 'Kích thước', span: 2 },
            { key: 'weight', label: 'Cân nặng', span: 1 },
        ],
    },

    FURNITURE: {
        name: 'Nội thất',
        keywords: ['bàn', 'ghế', 'tủ', 'kệ', 'nội thất', 'furniture'],
        fields: [
            { key: 'dimension', label: 'Kích thước', span: 2 },
            { key: 'weight', label: 'Cân nặng', span: 1 },
            { key: 'color', label: 'Màu sắc', span: 1 },
            { key: 'material', label: 'Chất liệu', span: 2 },
            { key: 'manufacture', label: 'Hãng sản xuất', span: 2 },
        ],
    },

    ELECTRICAL: {
        name: 'Thiết bị điện',
        keywords: ['máy in', 'máy photocopy', 'máy fax', 'máy chiếu', 'tivi', 'màn hình', 'thiết bị điện'],
        fields: [
            { key: 'manufacture', label: 'Hãng sản xuất', span: 2 },
            { key: 'dimension', label: 'Kích thước', span: 2 },
            { key: 'weight', label: 'Cân nặng', span: 1 },
            { key: 'color', label: 'Màu sắc', span: 1 },
        ],
    },

    VEHICLE: {
        name: 'Phương tiện',
        keywords: ['xe', 'ô tô', 'xe máy', 'xe đạp', 'phương tiện'],
        fields: [
            { key: 'manufacture', label: 'Hãng sản xuất', span: 2 },
            { key: 'color', label: 'Màu sắc', span: 1 },
            { key: 'dimension', label: 'Kích thước', span: 2 },
            { key: 'weight', label: 'Cân nặng', span: 1 },
        ],
    },

    DEFAULT: {
        name: 'Khác',
        keywords: [],
        fields: [
            { key: 'manufacture', label: 'Hãng sản xuất', span: 2 },
            { key: 'dimension', label: 'Kích thước', span: 2 },
            { key: 'weight', label: 'Cân nặng', span: 1 },
            { key: 'color', label: 'Màu sắc', span: 1 },
            { key: 'material', label: 'Chất liệu', span: 2 },
            { key: 'ram', label: 'RAM', span: 1 },
            { key: 'rom', label: 'ROM', span: 1 },
            { key: 'cpu', label: 'CPU', span: 2 },
            { key: 'ipAddress', label: 'IP Address', span: 2 },
        ],
    },
};

export const getAssetTypeSpecificationConfig = (assetTypeName) => {
    if (!assetTypeName) return ASSET_TYPE_SPECIFICATION_FIELDS.DEFAULT;

    const typeName = assetTypeName.toLowerCase();

    for (const [key, config] of Object.entries(ASSET_TYPE_SPECIFICATION_FIELDS)) {
        if (key === 'DEFAULT') continue;

        const isMatch = config.keywords.some((keyword) => typeName.includes(keyword.toLowerCase()));

        if (isMatch) {
            return config;
        }
    }

    return ASSET_TYPE_SPECIFICATION_FIELDS.DEFAULT;
};

export const getDisplayFields = (assetTypeName) => {
    const config = getAssetTypeSpecificationConfig(assetTypeName);
    return config.fields;
};

export const shouldDisplayField = (fieldKey, assetTypeName) => {
    const displayFields = getDisplayFields(assetTypeName);
    return displayFields.some((field) => field.key === fieldKey);
};
