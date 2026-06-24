import React from 'react';

const AppBreadcrumb = ({ items = [], onNavigate, textColor = '#111827' }) => {
    if (!items.length) return null;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {items.map((b, idx) => {
                const isLast = idx === items.length - 1;

                const isClickable = idx !== 0 && !isLast;

                return (
                    <React.Fragment key={b.url || idx}>
                        <span
                            onClick={() => isClickable && onNavigate?.(b.url)}
                            style={{
                                fontSize: 14,
                                fontWeight: isLast ? 600 : 400,
                                color: isLast ? textColor : isClickable ? '#6b7280' : '#9ca3af',
                                cursor: isClickable ? 'pointer' : 'default',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={(e) => {
                                if (isClickable) e.target.style.color = '#111827';
                            }}
                            onMouseLeave={(e) => {
                                if (isClickable) e.target.style.color = '#6b7280';
                            }}
                        >
                            {b.label}
                        </span>

                        {!isLast && <span style={{ color: '#9ca3af', fontSize: 12 }}>›</span>}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default AppBreadcrumb;
