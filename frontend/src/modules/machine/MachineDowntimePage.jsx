import { Bot } from 'lucide-react';
import React from 'react';
import PageHeader from '~/components/PageHeader';
import MachineDowntimeTab from '~/modules/machine/MachineDowntimeTab';

const MachineDowntimePage = () => {
    return (
        <div>
            <PageHeader icon={Bot} title="Thời gian dừng máy" description="Theo dõi và phân tích thời gian dừng máy." />
            <MachineDowntimeTab />
        </div>
    );
};

export default MachineDowntimePage;
