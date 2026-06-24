import { Tabs } from 'antd';
import { Wrench } from 'lucide-react';
import PageHeader from '~/components/PageHeader';
import MoldTrialPlanDashboardTable from '~/components/tables/MoldTrialPlanDashboardTable';
import MoldDevelopingByCustomerChart from '../components/MoldDevelopingByCustomerChart';
import MoldIssueStatisticsCards from '../components/MoldIssueStatisticsCards';

const DashboardMOLD = () => {
    return (
        <>
            <PageHeader
                icon={Wrench}
                title="Dashboard khuôn"
                description="Theo dõi vấn đề phát sinh khi thử khuôn và khu vực báo cáo"
            />

            <Tabs
                type="card"
                items={[
                    {
                        key: 'mold-issues',
                        label: 'Vấn đề phát sinh khi thử khuôn',
                        children: <MoldIssueStatisticsCards />,
                    },
                    {
                        key: 'report',
                        label: 'Báo cáo',
                        children: (
                            <div className="space-y-4">
                                <MoldDevelopingByCustomerChart />
                                <MoldTrialPlanDashboardTable />
                            </div>
                        ),
                    },
                ]}
            />
        </>
    );
};

export default DashboardMOLD;
