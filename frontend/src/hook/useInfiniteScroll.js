import { useCallback, useEffect, useRef } from 'react';

const useInfiniteScroll = (onLoadMore, hasMore, isLoading, options = {}) => {
    const { threshold = 0.1, rootMargin = '100px', disabled = false } = options;

    const sentinelRef = useRef(null);
    const observerRef = useRef(null);
    const isLoadingRef = useRef(false);

    const handleLoadMore = useCallback(() => {
        if (isLoadingRef.current || !hasMore || isLoading || disabled || typeof onLoadMore !== 'function') {
            return;
        }

        isLoadingRef.current = true;
        onLoadMore();

        setTimeout(() => {
            isLoadingRef.current = false;
        }, 500);
    }, [isLoading, hasMore, disabled, onLoadMore]);

    useEffect(() => {
        const currentSentinel = sentinelRef.current;

        if (disabled || !currentSentinel) {
            return;
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];
                if (firstEntry.isIntersecting) {
                    handleLoadMore();
                }
            },
            {
                threshold,
                rootMargin,
            },
        );

        observerRef.current.observe(currentSentinel);

        return () => {
            if (observerRef.current && currentSentinel) {
                observerRef.current.unobserve(currentSentinel);
                observerRef.current.disconnect();
            }
        };
    }, [handleLoadMore, threshold, rootMargin, disabled]);

    return { sentinelRef };
};

export default useInfiniteScroll;
