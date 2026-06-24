import { Link } from 'react-router-dom';
import { breadcrumbMap } from '~/layouts/layoutConfig';

export function getBreadcrumbItems(pathname) {
    const pathSnippets = pathname.split('/').filter((i) => i);

    const breadcrumbItems = pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;

        const matchedKey = Object.keys(breadcrumbMap).find((key) => {
            const regex = new RegExp('^' + key.replace(/:\w+/g, '[^/]+') + '$');
            return regex.test(url);
        });

        const name = breadcrumbMap[matchedKey] || url;

        return {
            key: url,
            title: <Link to={url}>{name}</Link>,
        };
    });

    return breadcrumbItems;
}
