import React from 'react';
import { Spin, Typography } from 'antd';
import useInfiniteScroll from '~/hook/useInfiniteScroll';

const { Text } = Typography;

const InfiniteScrollLoader = ({
    onLoadMore,
    hasMore,
    loading = false,
    loadingMore = false,
    totalLoaded = 0,
    total = 0,
    loadingMessage = 'Đang tải thêm dữ liệu...',
    completedMessage = 'Đã tải hết tất cả dữ liệu',
    options = {},
}) => {
    const { sentinelRef } = useInfiniteScroll(onLoadMore, hasMore, loadingMore || loading, options);

    return (
        <div style={{ height: '20px', margin: '10px 0' }}>
            {loadingMore && (
                <div className="text-center py-4">
                    <Spin tip={loadingMessage} />
                </div>
            )}

            {hasMore && !loading && <div ref={sentinelRef} style={{ height: '1px' }} />}

            {!hasMore && totalLoaded > 0 && (
                <div className="text-center py-4 text-gray-500">
                    <Text type="secondary">{completedMessage}</Text>
                </div>
            )}
        </div>
    );
};

export default InfiniteScrollLoader;
