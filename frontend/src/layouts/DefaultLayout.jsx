import { MenuOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Drawer, FloatButton, Grid, Layout, Tooltip } from 'antd';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { useTheme } from '~/contexts/ThemeContext';
import { useDynamicTitle } from '~/hook/useDynamicTitle';
import HeaderBar from './HeaderBar';
import SidebarMenu from './SidebarMenu';
import TopProgressBar from './TopProgressBar';

import '~/styles/DefaultLayout.css';

const { useBreakpoint } = Grid;
const { Content, Footer, Sider } = Layout;
const HEADER_HEIGHT = 64;
const LOADING_BAR_HEIGHT = 3;

const DefaultLayout = () => {
    useDynamicTitle();
    const [collapsed, setCollapsed] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const { isDark, toggleTheme, themeAlgorithm } = useTheme();

    const theme = isDark ? 'dark' : 'light';
    const backgroundColor = isDark ? '#001529' : '#fff';
    const textColor = isDark ? '#fff' : '#000';
    const subTextColor = isDark ? '#ccc' : '#666';

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const siderWidth = 250;
    const siderCollapsedWidth = 80;

    return (
        <ConfigProvider theme={{ algorithm: themeAlgorithm }}>
            <Layout style={{ minHeight: '100vh', background: backgroundColor }}>
                {!isMobile && (
                    <Sider
                        width={siderWidth}
                        collapsedWidth={siderCollapsedWidth}
                        collapsible
                        collapsed={collapsed}
                        onCollapse={setCollapsed}
                        theme={theme}
                        style={{
                            position: 'fixed',
                            top: 0,
                            bottom: 0,
                            height: '100vh',
                            zIndex: 1000,
                        }}
                    >
                        <SidebarMenu collapsed={collapsed} isDarkMode={isDark} />
                    </Sider>
                )}

                {isMobile && (
                    <Drawer
                        open={drawerOpen}
                        onClose={() => setDrawerOpen(false)}
                        placement="left"
                        bodyStyle={{ padding: 0 }}
                    >
                        <SidebarMenu collapsed={false} isDarkMode={isDark} onItemClick={() => setDrawerOpen(false)} />
                    </Drawer>
                )}

                <Layout
                    style={{
                        marginLeft: isMobile ? 0 : collapsed ? siderCollapsedWidth : siderWidth,
                        transition: 'margin-left 0.3s',
                    }}
                >
                    <HeaderBar
                        collapsed={collapsed}
                        backgroundColor={backgroundColor}
                        textColor={textColor}
                        subTextColor={subTextColor}
                        isDarkMode={isDark}
                        toggleTheme={toggleTheme}
                        style={{
                            left: isMobile ? 0 : collapsed ? siderCollapsedWidth : siderWidth,
                            width: isMobile ? '100%' : `calc(100% - ${collapsed ? siderCollapsedWidth : siderWidth}px)`,
                            height: HEADER_HEIGHT,
                        }}
                        extra={
                            isMobile && (
                                <Button
                                    type="text"
                                    icon={<MenuOutlined style={{ fontSize: 22, color: textColor }} />}
                                    onClick={() => setDrawerOpen(true)}
                                />
                            )
                        }
                    />

                    <TopProgressBar
                        top={HEADER_HEIGHT}
                        left={isMobile ? 0 : collapsed ? siderCollapsedWidth : siderWidth}
                        width={isMobile ? '100%' : `calc(100% - ${collapsed ? siderCollapsedWidth : siderWidth}px)`}
                    />

                    <Content
                        style={{
                            marginTop: HEADER_HEIGHT + LOADING_BAR_HEIGHT,
                            padding: 24,
                        }}
                    >
                        <div
                            style={{
                                minHeight: 'calc(100vh - 182px)',
                                color: textColor,
                                paddingBottom: 24,
                            }}
                        >
                            <Outlet context={{ collapsed }} />
                        </div>
                    </Content>

                    <Footer style={{ textAlign: 'center', color: subTextColor }} className="app-footer" />
                </Layout>
            </Layout>
            <Tooltip title="Lên đầu trang" placement="left">
                <FloatButton.BackTop
                    visibilityHeight={200}
                    type="primary"
                    style={{
                        backgroundColor: '#155eef',
                    }}
                />
            </Tooltip>
        </ConfigProvider>
    );
};

export default DefaultLayout;
