import dayjs from 'dayjs';

export const renderTimeRange = (startTime, endTime) => {
    if (!startTime && !endTime) return <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>Chưa có dữ liệu</span>;

    const format = 'HH:mm DD/MM/YYYY';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
            {startTime && (
                <div style={{ fontSize: '13px', lineHeight: '1.2' }}>
                    <span style={{ color: '#8c8c8c', marginRight: '8px', fontSize: '11px', fontWeight: '600' }}>
                        TỪ
                    </span>
                    <span style={{ color: '#262626', fontFamily: 'monospace' }}>{dayjs(startTime).format(format)}</span>
                </div>
            )}
            {endTime && (
                <div style={{ fontSize: '13px', lineHeight: '1.2' }}>
                    <span style={{ color: '#8c8c8c', marginRight: '4px', fontSize: '11px', fontWeight: '600' }}>
                        ĐẾN
                    </span>
                    <span style={{ color: '#262626', fontFamily: 'monospace' }}>{dayjs(endTime).format(format)}</span>
                </div>
            )}
        </div>
    );
};

export const renderSingleTime = (time) => {
    if (!time) return <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>--/--</span>;

    const format = 'HH:mm DD/MM/YYYY';

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span
                style={{
                    color: '#262626',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    padding: '2px 6px',
                }}
            >
                {dayjs(time).format(format)}
            </span>
        </div>
    );
};
