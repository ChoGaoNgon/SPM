import { useState } from 'react';
import PendingFaPlans from '~/components/charts/PendingFaPlans';
import CustomerPlanStatisticsChart from '../../../components/charts/CustomerPlanStatisticsChart';
import PlansPendingApproval from '../../../components/charts/PlansPendingApproval';
import ProductsDelayedMp from '../../../components/charts/ProductsDelayedMp';
import ProductsPendingApproval from '../../../components/charts/ProductsPendingApproval';
import StatisticsSummary from '../../../components/statistics/StatisticsSummary';
import EventStatusStatisticsTable from '../../../components/tables/EventStatusStatisticsTable';
import MoldTrialPlanDashboardTable from '../../../components/tables/MoldTrialPlanDashboardTable';
import ProductListTable from '../../../components/tables/ProductListTable';

const PLAN_TYPE_OPTIONS = [
    { value: 'EVENT', label: 'Event' },
    { value: 'MOLD_TRIAL', label: 'Thu khuon' },
    { value: 'SECOND_PROCESS', label: 'Gia cong lan 2' },
    { value: 'MP', label: 'MP' },
];

const DashboardNMDPage = () => {
    const [selectedPlanType, setSelectedPlanType] = useState(null);
    const [selectedPlanTitle, setSelectedPlanTitle] = useState('');
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [statisticsPlanType, setStatisticsPlanType] = useState('EVENT');

    const handleShowDetail = (planType, planTitle) => {
        setSelectedPlanType(planType);
        setSelectedPlanTitle(planTitle);
        setIsTableModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsTableModalOpen(false);
        setSelectedPlanType(null);
        setSelectedPlanTitle('');
    };

    return (
        <div>
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-4">
                    <ProductsPendingApproval />
                </div>

                <div className="col-span-12 lg:col-span-4">
                    <PlansPendingApproval />
                </div>
                <div className="col-span-12 lg:col-span-4">
                    <ProductsDelayedMp />
                </div>
                <div className="col-span-12 lg:col-span-4">
                    <PendingFaPlans />
                </div>
                <div className="col-span-12 lg:col-span-4">
                    <StatisticsSummary onShowDetail={handleShowDetail} />
                </div>
            </div>

            <div className="col-span-12 ">
                <MoldTrialPlanDashboardTable />
            </div>

            <div className="col-span-12 mt-6">
                <CustomerPlanStatisticsChart defaultLimit={10} />
            </div>

            <div className="col-span-12 mt-6">
                <div className="mb-3 flex items-center justify-end gap-2">
                    <label htmlFor="statistics-plan-type" className="text-sm font-medium text-gray-700">
                        Loai ke hoach thong ke
                    </label>
                    <select
                        id="statistics-plan-type"
                        value={statisticsPlanType}
                        onChange={(event) => setStatisticsPlanType(event.target.value)}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                        {PLAN_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <EventStatusStatisticsTable planType={statisticsPlanType} />
            </div>

            <ProductListTable
                planType={selectedPlanType}
                planTitle={selectedPlanTitle}
                isOpen={isTableModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default DashboardNMDPage;
