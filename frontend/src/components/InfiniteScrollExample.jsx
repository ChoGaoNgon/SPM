import { Button, Card, List, message, Spin } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import useInfiniteScroll from '~/hook/useInfiniteScroll';

const InfiniteScrollExample = () => {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchItems = async (pageNumber, pageSize = 20) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const totalItems = 100;
        const startIndex = pageNumber * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);

        const newItems = Array.from({ length: endIndex - startIndex }, (_, index) => ({
            id: startIndex + index,
            title: `Item ${startIndex + index + 1}`,
            description: `Mô tả cho item số ${startIndex + index + 1}`,
        }));

        return {
            content: newItems,
            number: pageNumber,
            size: pageSize,
            totalElements: totalItems,
            hasMore: endIndex < totalItems,
        };
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const response = await fetchItems(0);
                setItems(response.content);
                setPage(0);
                setHasMore(response.hasMore);
            } catch (error) {
                message.error('Không thể tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;

        try {
            setLoadingMore(true);
            const nextPage = page + 1;
            const response = await fetchItems(nextPage);

            setItems((prev) => [...prev, ...response.content]);
            setPage(nextPage);
            setHasMore(response.hasMore);
        } catch (error) {
            message.error('Không thể tải thêm dữ liệu');
        } finally {
            setLoadingMore(false);
        }
    }, [page, loadingMore, hasMore]);

    const { sentinelRef } = useInfiniteScroll(loadMore, hasMore, loadingMore || loading);

    const handleReset = () => {
        setItems([]);
        setPage(0);
        setHasMore(true);
        setLoading(false);
        setLoadingMore(false);
    };

    return (
        <Card
            title="Ví dụ Infinite Scroll"
            extra={
                <Button onClick={handleReset} disabled={loading || loadingMore}>
                    Reset
                </Button>
            }
        >
            <List
                loading={loading}
                dataSource={items}
                renderItem={(item) => (
                    <List.Item key={item.id}>
                        <List.Item.Meta title={item.title} description={item.description} />
                    </List.Item>
                )}
            />

            {loadingMore && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin tip="Đang tải thêm..." />
                </div>
            )}

            {hasMore && !loading && <div ref={sentinelRef} style={{ height: '20px' }} />}

            {!hasMore && !loading && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    Đã hiển thị tất cả dữ liệu ({items.length} items)
                </div>
            )}
        </Card>
    );
};

export default InfiniteScrollExample;
