import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccessToken } from '~/utils/authTokenStore';

export default function useCrossTabAuthSync() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'logout-event') {
                navigate('/login');
            }
            if (event.key === 'accessToken') {
                if (event.newValue) {
                    if (window.location.pathname === '/login') {
                        navigate('/');
                    }
                } else if (window.location.pathname !== '/login') {
                    navigate('/login');
                }
            }
            if (event.key === 'employee') {
                if (event.newValue && getAccessToken()) {
                    if (window.location.pathname === '/login') {
                        navigate('/');
                    }
                } else {
                    if (window.location.pathname !== '/login') {
                        navigate('/login');
                    }
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [navigate]);
}
