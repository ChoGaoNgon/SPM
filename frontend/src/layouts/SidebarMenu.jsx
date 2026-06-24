import { Menu, message, Spin } from 'antd';
import { Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DynamicIcon from '~/components/DynamicIcon';
import menuService from '~/services/menuService';

const FIXED_ROUTES = [
    '/product-manager/models',
    '/product-manager/molds',
    '/product-manager/mp-template',
    '/product-manager/customers',
];

const SidebarMenu = ({ collapsed, isDarkMode, onItemClick }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = isDarkMode ? 'dark' : 'light';

    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openKeys, setOpenKeys] = useState([]);

    const mustChangePassword = localStorage.getItem('mustChangePassword') === 'true';

    useEffect(() => {
        const fetchMenu = async () => {
            setLoading(true);
            try {
                const data = await menuService.getMenuBySystemType('SYSTEM_1');
                const formattedMenu = formatMenuItems(data);
                setMenuItems(formattedMenu);
            } catch (error) {
                message.error(error.message || 'Lỗi tải menu');
            } finally {
                setLoading(false);
            }
        };

        if (!mustChangePassword) {
            fetchMenu();
        } else {
            setLoading(false);
        }
    }, [mustChangePassword]);

    const formatMenuItems = (items) => {
        return items.map((item) => {
            const isExternal = item.key?.startsWith('http');

            return {
                key: item.key,
                icon: <DynamicIcon name={item.icon} size={16} />,
                label: item.label,
                onClick:
                    item.children && item.children.length > 0
                        ? undefined
                        : () => {
                              if (isExternal) {
                                  window.location.href = item.key;
                              } else {
                                  navigate(item.key);
                              }
                          },
                children: item.children && item.children.length > 0 ? formatMenuItems(item.children) : undefined,
            };
        });
    };

    if (mustChangePassword) {
        return null;
    }

    const getSelectedKeys = () => {
        const pathname = location.pathname;

        const fixed = FIXED_ROUTES.find((route) => pathname.startsWith(route));
        if (fixed) return [fixed];

        return [pathname];
    };

    const handleOpenChange = (keys) => {
        setOpenKeys(keys);
    };

    if (loading) {
        return (
            <div
                style={{
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div
            style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div className="h-16 px-4 flex items-center border-b border-slate-50 dark:border-slate-700">
                <div className={`flex items-center  ${collapsed ? 'mx-auto' : 'gap-3'}`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-600 to-indigo-500 shadow-lg grid place-items-center">
                        <Shield className="w-6 h-6 text-white" />
                    </div>

                    <div
                        className={`
                            overflow-hidden
                            transition-all duration-300 ease-in-out
                            ${collapsed ? 'w-0 opacity-0 -translate-x-2' : 'w-44 opacity-100 translate-x-0'}
                        `}
                    >
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                            HTMP Portal
                        </h1>
                        <p className="text-[10px] font-bold text-accent-500 uppercase tracking-widest whitespace-nowrap">
                            Enterprise Edition
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 pt-2 hide-scrollbar">
                <Menu
                    mode="inline"
                    theme={theme}
                    selectedKeys={getSelectedKeys()}
                    openKeys={openKeys}
                    onOpenChange={handleOpenChange}
                    items={menuItems}
                    onClick={() => onItemClick && onItemClick()}
                />
            </div>
        </div>
    );
};

export default SidebarMenu;
