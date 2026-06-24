import NoAccess from '~/components/NoAccess';
import authService from '~/modules/auth/services/authService';
import WorkReportPage from './WorkReportPage';

const ElectricalDailyTasksPage = () => {
    if (
        authService.hasRole('ADMIN') ||
        authService.hasRole('SUPERADMIN') ||
        authService.hasRole('MANAGER') ||
        authService.hasRole('HEAD') ||
        authService.hasRole('EMPLOYEE')
    ) {
        return <WorkReportPage />;
    }

    return <NoAccess />;
};

export default ElectricalDailyTasksPage;
