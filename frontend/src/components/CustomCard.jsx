const cardStyle = {
    borderRadius: '12px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.06)',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid #1e90ff',
};

const iconStyle = {
    fontSize: '1.5rem',
};

const labelStyle = {
    fontWeight: 600,
};

const CustomCard = ({ icon, label, external, onClick }) => {
    const handleClick = () => {
        if (onClick) onClick();
    };

    const content = (
        <>
            <span style={iconStyle}>{icon}</span>
            <span style={labelStyle}>{label}</span>
        </>
    );

    if (external) {
        return (
            <a
                href={external}
                style={cardStyle}
                onMouseOver={(e) => (e.currentTarget.style.background = '#eef1f7')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                target="_blank"
                rel="noopener noreferrer"
            >
                {content}
            </a>
        );
    }

    return (
        <div
            style={cardStyle}
            onClick={handleClick}
            onMouseOver={(e) => (e.currentTarget.style.background = '#eef1f7')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
        >
            {content}
        </div>
    );
};

export default CustomCard;
