import authService from '~/modules/auth/services/authService';
import MoldTrialPlanFormModal from './MoldTrialPlanFormModal';
import MoldTrialPlanKTModal from './PlanKTModal';
import MoldTrialPlanLogModal from './PlanLOGModal';

const MoldTrialPlanWrapperModal = (props) => {
    const currentDepartmentCode = authService.getDepartmentCode();
    const isSuperAdmin = authService.hasRole('SUPERADMIN');

    if (isSuperAdmin || currentDepartmentCode === 'P-NMD') {
        return <MoldTrialPlanFormModal {...props} />;
    }

    if (isSuperAdmin || currentDepartmentCode === 'NVLSX' || currentDepartmentCode === 'VPSX') {
        return <MoldTrialPlanLogModal {...props} />;
    }

    if (isSuperAdmin || currentDepartmentCode === 'KT') {
        return <MoldTrialPlanKTModal {...props} />;
    }

};

export default MoldTrialPlanWrapperModal;
