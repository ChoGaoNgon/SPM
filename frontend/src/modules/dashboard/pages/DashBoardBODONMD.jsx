import { Tabs } from 'antd';
import React from 'react';
import DashboardNMDPage from './DashboardNMDPage';

const DashBoardBODONMD = () => {
    return (
        <Tabs type="card" defaultActiveKey="nmd">
            <Tabs.TabPane tab="BGD" key="bod">
                <div>Đang phát triển</div>
            </Tabs.TabPane>
            <Tabs.TabPane tab="NMD" key="nmd">
                <DashboardNMDPage />
            </Tabs.TabPane>
        </Tabs>
    );
};

export default DashBoardBODONMD;
