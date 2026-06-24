import { ClipboardCheck } from 'lucide-react';
import PageHeader from '~/components/PageHeader';
import QcqaPendingInspectionPlans from '../components/QcqaPendingInspectionPlans';
import QcqaPendingSampleReceipts from '../components/QcqaPendingSampleReceipts';

const DashboardQCQA = () => {
    return (
        <>
            <PageHeader
                icon={ClipboardCheck}
                title="Tổng quan QAC"
                description="Theo dõi danh sách kế hoạch cần nhập thông tin kiểm tra mẫu"
            />

            <div className="space-y-6">
                <QcqaPendingSampleReceipts />
                <QcqaPendingInspectionPlans />
            </div>
        </>
    );
};

export default DashboardQCQA;
