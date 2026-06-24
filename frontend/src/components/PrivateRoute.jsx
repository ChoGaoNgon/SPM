import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '~/modules/auth/services/authService';

const PrivateRoute = ({ children }) => {
    const [isLogined, setIsLogined] = useState(authService.isAuthenticated());
    const location = useLocation();

    useEffect(() => {
        const handleStorageChange = () => {
            setIsLogined(authService.isAuthenticated());
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    if (!isLogined) {
        const returnUrl = `${location.pathname}${location.search}${location.hash}`;

        localStorage.setItem('returnUrl', returnUrl);
        return <Navigate to="/login" replace />;
    }

    localStorage.removeItem('returnUrl');
    return children;
};

export default PrivateRoute;
