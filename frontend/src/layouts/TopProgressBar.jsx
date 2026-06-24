import { useEffect, useRef, useState } from 'react';
import { subscribeGlobalLoading } from '~/utils/globalLoadingManager';
import './TopProgressBar.css';

const TopProgressBar = ({ top = 64, left = 0, width = '100%' }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    const startDelayRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const hideTimerRef = useRef(null);

    useEffect(() => {
        const unsubscribe = subscribeGlobalLoading(setIsLoading);
        return unsubscribe;
    }, []);

    const dynamicCeilingRef = useRef(72);

    useEffect(() => {
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }

        if (startDelayRef.current) {
            clearTimeout(startDelayRef.current);
            startDelayRef.current = null;
        }

        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }

        if (isLoading) {
            dynamicCeilingRef.current = Math.floor(Math.random() * 18) + 58;
            startDelayRef.current = setTimeout(() => {
                setVisible(true);
                setProgress((prev) => (prev > 5 ? prev : 8));
            }, 120);

            progressIntervalRef.current = setInterval(() => {
                setProgress((prev) => {
                    const nextCeiling = Math.min(
                        91,
                        dynamicCeilingRef.current + (dynamicCeilingRef.current < 90 ? 0.075 : 0.02),
                    );
                    dynamicCeilingRef.current = nextCeiling;

                    const gap = nextCeiling - prev;
                    if (gap <= 0.02) {
                        return prev;
                    }

                    const step = Math.max(0.008, gap * 0.05);
                    return Math.min(nextCeiling, prev + step);
                });
            }, 80);
        } else {
            setProgress(100);
            hideTimerRef.current = setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 220);
        }

        return () => {
            if (startDelayRef.current) {
                clearTimeout(startDelayRef.current);
                startDelayRef.current = null;
            }

            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }

            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
                hideTimerRef.current = null;
            }
        };
    }, [isLoading]);

    return (
        <div
            className={`top-progress ${visible ? 'top-progress--active' : ''}`}
            style={{ top, left, width }}
            aria-hidden
        >
            <div className="top-progress__bar" style={{ width: `${progress}%` }} />
        </div>
    );
};

export default TopProgressBar;
