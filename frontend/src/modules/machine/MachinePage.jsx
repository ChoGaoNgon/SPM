import { Tabs, message } from 'antd';
import { Bot } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '~/components/PageHeader';
import MachineListTab from '~/modules/machine/MachineListTab';
import MachineSpecificationTab from '~/modules/machine/MachineSpecificationTab';
import MachineTypeTab from '~/modules/machine/MachineTypeTab';
import machineTypeService from '~/modules/machine/service/machineTypeService';

const MachinePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [machineTypes, setMachineTypes] = useState([]);
    const [loadingMachineTypes, setLoadingMachineTypes] = useState(false);
    const activeTab = searchParams.get('tab') || 'machines';

    const handleTabChange = (key) => {
        navigate(`?tab=${key}`, { replace: true });
    };

    const fetchMachineTypes = async () => {
        setLoadingMachineTypes(true);
        try {
            const data = await machineTypeService.getAllMachineTypes();
            setMachineTypes(data || []);
        } catch (error) {
            message.error(error.message || 'Không tải được danh sách loại máy');
        } finally {
            setLoadingMachineTypes(false);
        }
    };

    useEffect(() => {
        fetchMachineTypes();
    }, []);

    return (
        <div className="h-full overflow-y-auto">
            <PageHeader
                icon={Bot}
                title="Quản lý máy"
                description="Quản lý và theo dõi máy của công ty một cách hiệu quả."
            />
            <div className="px-3 sticky top-0 bg-white dark:bg-slate-900 z-50 border-b border-slate-200 dark:border-slate-700 rounded-t-10">
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    tabBarStyle={{ marginBottom: 0, paddingInline: 0, background: 'transparent' }}
                    items={[
                        {
                            key: 'machines',
                            label: 'Danh sách máy',
                            children: null,
                        },
                        {
                            key: 'machineTypes',
                            label: 'Loại máy',
                            children: null,
                        },
                        {
                            key: 'machineSpecifications',
                            label: 'Spec máy',
                            children: null,
                        },
                        {
                            key: 'statistics',
                            label: 'Thống kê',
                            children: null,
                        },
                    ]}
                />
            </div>

            <div>
                {activeTab === 'machines' && <MachineListTab machineTypes={machineTypes} />}
                {activeTab === 'machineTypes' && (
                    <MachineTypeTab
                        machineTypes={machineTypes}
                        loadingTypes={loadingMachineTypes}
                        onRefreshMachineTypes={fetchMachineTypes}
                    />
                )}
                {activeTab === 'machineSpecifications' && <MachineSpecificationTab machineTypes={machineTypes} />}
            </div>
        </div>
    );
};

export default MachinePage;
