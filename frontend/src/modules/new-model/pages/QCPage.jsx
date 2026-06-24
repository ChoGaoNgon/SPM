import { Tabs } from 'antd';
import TabPane from 'antd/es/tabs/TabPane';
import DefectCodeTable from '../components/DefectCodeTable';

const QCPage = () => {
    const handleTabChange = (key) => {};
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div>
                <Tabs type="card">
                    <TabPane tab="Danh sách sản phẩm chờ kiểm tra" key="1"></TabPane>
                    <TabPane tab="Danh sách mã lỗi" key="list-error-codes">
                        <DefectCodeTable />
                    </TabPane>
                </Tabs>
            </div>
        </div>
    );
};

export default QCPage;
