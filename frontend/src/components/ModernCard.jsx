import { Card } from 'antd';

const ModernCard = ({ title, children, onClick }) => {
    return (
        <Card
            title={
                <div
                    style={{
                        whiteSpace: 'normal',
                        wordWrap: 'break-word',
                        fontWeight: 500,
                        textAlign: 'center',
                    }}
                >
                    {title}
                </div>
            }
            hoverable
            onClick={onClick}
            style={{
                padding: 0,
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: '0.2s',
            }}
            styles={{
                header: { fontWeight: 700, textAlign: 'center', padding: '0 5px' },
            }}
        >
            {children}
        </Card>
    );
};

export default ModernCard;
