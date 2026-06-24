import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { breadcrumbMap } from '~/layouts/layoutConfig';

export const useDynamicTitle = () => {
    const location = useLocation();

    useEffect(() => {
        const pathname = location.pathname;

        const matchedKey = Object.keys(breadcrumbMap)
            .filter((key) => pathname.startsWith(key))
            .sort((a, b) => b.length - a.length)[0];

        const title = breadcrumbMap[matchedKey] || 'Ứng dụng';

        document.title = `HTMP | ${title}`;
    }, [location.pathname]);
};
