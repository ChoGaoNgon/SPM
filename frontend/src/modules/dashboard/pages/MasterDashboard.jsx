import { Tabs } from 'antd';
import React from 'react';
import DashboardNMDPage from './DashboardNMDPage';
import DashboardIT from './DashboardIT';
import DashboardElectricalPage from './DashboardElectricalPage';
import DashboardMOLD from './DashboardMOLD';
import DashboardQCQA from './DashboardQCQA';

const MasterDashboard = () => {
    const TABS_DATA = [
        {
            key: 'nmd',
            label: 'New Model Department',
            content: <DashboardNMDPage />,
        },
        {
            key: 'it',
            label: 'IT&ERP',
            content: <DashboardIT />,
        },
        {
            key: 'cd',
            label: 'Cơ điện',
            content: <DashboardElectricalPage />,
        },
        {
            key: 'mold',
            label: 'MOLD',
            content: <DashboardMOLD />,
        },
        {
            key: 'qcqa',
            label: 'QC&QA',
            content: <DashboardQCQA />,
        },
    ];
    return (
        <>
            <Tabs type="card" defaultActiveKey="it">
                {TABS_DATA.map((tab) => (
                    <Tabs.TabPane tab={tab.label} key={tab.key}>
                        {tab.content}
                    </Tabs.TabPane>
                ))}
            </Tabs>
        </>
    );
};

export default MasterDashboard;
