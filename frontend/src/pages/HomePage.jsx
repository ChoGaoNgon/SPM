import authService from '~/modules/auth/services/authService';
import DashBoardBGD from '~/modules/dashboard/pages/DashBoardBGD';
import DashBoardBODONMD from '~/modules/dashboard/pages/DashBoardBODONMD';
import DashboardBusiness from '~/modules/dashboard/pages/DashboardBusiness';
import DashboardElectricalPage from '~/modules/dashboard/pages/DashboardElectricalPage';
import DashboardInProgress from '~/modules/dashboard/pages/DashboardInProgress';
import DashboardMOLD from '~/modules/dashboard/pages/DashboardMOLD';
import DashboardNMDPage from '~/modules/dashboard/pages/DashboardNMDPage';
import DashboardQCQA from '~/modules/dashboard/pages/DashboardQCQA';
import MasterDashboard from '~/modules/dashboard/pages/MasterDashboard';

const HomePage = () => {
    const employee = authService.getEmployee();
    const parentDepartmentCode = employee?.departmentCode || employee?.parentDepartmentCode;

    switch (parentDepartmentCode) {
        case 'P-CD':
        case 'TDH':
        case 'CD':
        case 'KTL':
            return <DashboardElectricalPage />;

        case 'P-NMD':
            return <DashboardNMDPage />;

        case 'BGD':
            return <DashBoardBGD />;

        case 'BODO&NMD':
            return <DashBoardBODONMD />;

        case 'P-KD':
        case 'KD':
        case 'MH':
            return <DashboardBusiness />;

        case 'IT':
        case 'P-IT&ERP':
            return <MasterDashboard />;

        case 'MOLD':
            return <DashboardMOLD />;

        case 'QC':
        case 'QA':
        case 'P-QA&QC':
            return <DashboardQCQA />;
        default:
            return <DashboardInProgress />;
    }
};

export default HomePage;
