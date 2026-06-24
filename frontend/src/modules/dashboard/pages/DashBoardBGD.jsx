import { Card } from 'antd';
import React from 'react';
import { useState } from 'react';
import StatisticsSummary from '~/components/statistics/StatisticsSummary';
import ProductListTable from '~/components/tables/ProductListTable';

const DashBoardBGD = () => {
    const [selectedPlanType, setSelectedPlanType] = useState(null);
    const [selectedPlanTitle, setSelectedPlanTitle] = useState('');
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);

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
        <>
            <ProductListTable
                planType={selectedPlanType}
                planTitle={selectedPlanTitle}
                isOpen={isTableModalOpen}
                onClose={handleCloseModal}
            />
            <div>
                <Card title="Sản phẩm mới" style={{ width: '100%' }}>
                    <StatisticsSummary onShowDetail={handleShowDetail} />
                </Card>
            </div>
        </>
    );
};

export default DashBoardBGD;
