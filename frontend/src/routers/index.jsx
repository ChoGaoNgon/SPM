import { useRoutes } from 'react-router-dom';
import useAutoLogoutSync from '~/hook/useAutoLogoutSync';
import useAutoRedirect from '~/hook/useCrossTabAuthSync';
import usePermissions from '~/hook/usePermissions';
import routes from './route';

const AppRoutes = () => {
    useAutoLogoutSync();
    useAutoRedirect();
    const { contextHolder } = usePermissions();

    const element = useRoutes(routes);
    return (
        <>
            {contextHolder} 
            {element}
        </>
    );
};

export default AppRoutes;
