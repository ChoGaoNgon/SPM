import { Tabs, message } from 'antd';
import { Laptop } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '~/components/PageHeader';
import assetTypeService from '~/modules/asset/service/AssetTypeService';
import AssetCategoryTab from '../components/AssetCategoryTab';
import AssetStatisticsTab from '../components/AssetStatisticsTab';
import AssetTab from '../components/AssetTab';

const AssetManagementPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [assetTypes, setAssetTypes] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(false);

    const activeTab = searchParams.get('tab') || 'assets';

    const handleTabChange = (key) => {
        navigate(`?tab=${key}`, { replace: true });
    };

    const fetchAssetTypes = async () => {
        setLoadingTypes(true);
        try {
            const data = await assetTypeService.getAllAssetTypes();
            setAssetTypes(data || []);
        } catch (error) {
            message.error(error.message || 'Không tải được danh sách loại tài sản');
        } finally {
            setLoadingTypes(false);
        }
    };

    useEffect(() => {
        fetchAssetTypes();
    }, []);

    return (
        <div>
            <PageHeader
                icon={Laptop}
                title="Quản lý tài sản"
                description="Quản lý và theo dõi tài sản của công ty một cách hiệu quả."
            />

            <div className="px-3 sticky top-16 bg-white dark:bg-slate-900 z-50 border-b border-slate-200 dark:border-slate-700 rounded-t-10">
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    tabBarStyle={{ marginBottom: 0, paddingInline: 0, background: 'transparent' }}
                    items={[
                        {
                            key: 'assets',
                            label: 'Tài sản',
                            children: null,
                        },
                        {
                            key: 'statistics',
                            label: 'Thống kê',
                            children: null,
                        },
                        {
                            key: 'categories',
                            label: 'Loại tài sản',
                            children: null,
                        },
                    ]}
                />
            </div>
            <div className="">
                {activeTab === 'assets' && (
                    <AssetTab
                        assetTypes={assetTypes}
                        onRefreshAssetTypes={fetchAssetTypes}
                        loadingTypes={loadingTypes}
                    />
                )}
                {activeTab === 'statistics' && (
                    <AssetStatisticsTab assetTypes={assetTypes} loadingTypes={loadingTypes} />
                )}
                {activeTab === 'categories' && (
                    <AssetCategoryTab
                        assetTypes={assetTypes}
                        loadingTypes={loadingTypes}
                        onRefreshAssetTypes={fetchAssetTypes}
                    />
                )}
            </div>
        </div>
    );
};

export default AssetManagementPage;
