import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { BrowserRouter } from 'react-router-dom';

import './App.css';
import { ThemeProvider } from './contexts/ThemeContext';
import AppRoutes from './routers';

dayjs.locale('vi');

const App = () => {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <ConfigProvider locale={viVN}>
                    <AppRoutes />
                </ConfigProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
};

export default App;
