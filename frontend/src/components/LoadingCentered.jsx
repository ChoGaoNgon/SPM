import { Spin } from 'antd';

const LoadingCentered = ({ tip = 'Loading...', description = 'Đang tải dữ liệu...', size = 'large' }) => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100vh - 64px)',
                flexDirection: 'column',
            }}
        >
            <Spin tip={tip} size={size}>
                {description}
            </Spin>
        </div>
    );
};

export default LoadingCentered;
