import React from 'react';
import CustomerPlanStatisticsChart from '~/components/charts/CustomerPlanStatisticsChart';
import ProductsPendingApproval from '~/components/charts/ProductsPendingApproval';

const DashboardBusiness = () => {
    return (
        <>
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-4">
                    <ProductsPendingApproval />
                </div>
            </div>
            <div className="col-span-12 mt-6">
                <CustomerPlanStatisticsChart defaultLimit={10} />
            </div>
        </>
    );
};

export default DashboardBusiness;
