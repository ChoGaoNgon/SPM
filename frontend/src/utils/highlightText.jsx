import React from 'react';

export const highlightText = (text, keyword, options = {}) => {
    const { emptyFallback = '', markClassName, markStyle, markProps = {}, textKeyPrefix = 'highlight' } = options;

    if (text === null || text === undefined || text === '') {
        return emptyFallback;
    }

    if (!keyword?.trim()) {
        return text;
    }

    const safeText = String(text);
    const normalizedKeyword = keyword.trim();
    const escapedKeyword = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedKeyword})`, 'gi');

    return safeText.split(regex).map((part, index) => {
        const key = `${textKeyPrefix}-${index}-${part}`;
        if (part.toLowerCase() === normalizedKeyword.toLowerCase()) {
            return (
                <mark key={key} className={markClassName} style={markStyle} {...markProps}>
                    {part}
                </mark>
            );
        }
        return <React.Fragment key={key}>{part}</React.Fragment>;
    });
};

export default highlightText;
