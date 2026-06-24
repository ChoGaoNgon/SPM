import { message, Spin } from 'antd';
import * as LucideIcons from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '~/contexts/ThemeContext';
import menuService from '~/services/menuService';

const MENU_TONES = [
    { soft: '#fde2e7', icon: '#e11d48' },
    { soft: '#fef3c7', icon: '#d97706' },
    { soft: '#ede9fe', icon: '#7c3aed' },
    { soft: '#ffedd5', icon: '#ea580c' },
    { soft: '#cffafe', icon: '#0891b2' },
    { soft: '#fef9c3', icon: '#d4a23a' },
    { soft: '#dbeafe', icon: '#4ea8de' },
    { soft: '#e0e7ff', icon: '#7c83fd' },
    { soft: '#dcfce7', icon: '#059669' },
    { soft: '#fee2e2', icon: '#dc2626' },
    { soft: '#ecfccb', icon: '#65a30d' },
    { soft: '#ccfbf1', icon: '#0f9f9a' },
    { soft: '#ffedd5', icon: '#f97316' },
    { soft: '#dbeafe', icon: '#2563eb' },
    { soft: '#f5d0fe', icon: '#c026d3' },
    { soft: '#ede9fe', icon: '#9333ea' },
];

const MenuCard = ({ to, icon, label, disabled, tone, isDark, onNavigate }) => {
    const Icon = LucideIcons[icon] || LucideIcons.Package;

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onNavigate(to)}
            className={`
                w-full  rounded-[16px] border transition-all duration-200 ease-out
                ${
                    disabled
                        ? isDark
                            ? 'border-gray-700 bg-slate-800/60 cursor-not-allowed shadow-md'
                            : 'border-gray-200 bg-white/70 cursor-not-allowed shadow-md'
                        : isDark
                          ? 'border-slate-700 bg-slate-900/90 hover:bg-slate-800 hover:border-slate-600 hover:-translate-y-1 hover:shadow-lg shadow-md'
                          : 'border-[#dbe4f0] bg-white hover:bg-white hover:border-[#c7d5e5] hover:-translate-y-1 hover:shadow-lg shadow-md'
                }
            `}
        >
            <span className="flex items-center gap-4 w-full  p-2 text-left">
                <span
                    className="w-[40px] h-[40px] flex items-center justify-center rounded-[12px] flex-shrink-0"
                    style={{
                        backgroundColor: tone.soft,
                        color: tone.icon,
                        opacity: disabled ? 0.42 : 1,
                    }}
                >
                    <Icon size={20} strokeWidth={2.2} />
                </span>
                <span
                    className={`text-base leading-[1.4] tracking-[-0.01em] font-bold ${
                        isDark ? 'text-[#e5edf7]' : 'text-gray-900'
                    }`}
                >
                    {label}
                </span>
            </span>
        </button>
    );
};

const isInternalRoute = (value) => typeof value === 'string' && value.startsWith('/');

const System2Menu = () => {
    const [user, setUser] = useState(null);
    const [groupedMenus, setGroupedMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { isDark } = useTheme();

    const handleNavigate = (destination) => {
        if (!destination) {
            return;
        }

        if (!isInternalRoute(destination)) {
            window.location.assign(destination);
            return;
        }

        navigate(destination);
    };

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('employee'));
        if (!storedUser) {
            navigate('/login');
        } else {
            setUser(storedUser);
        }
    }, [navigate]);

    useEffect(() => {
        const fetchMenuItems = async () => {
            const storedUser = localStorage.getItem('employee');
            if (!storedUser) {
                return;
            }

            try {
                setLoading(true);

                const [menus, groups] = await Promise.all([
                    menuService.getMenuBySystemType('SYSTEM_2'),
                    menuService.getAllGroupMenus(),
                ]);

                const transformedMenus = menus.map((menu) => ({
                    to: menu.key,
                    icon: menu.icon || 'Package',
                    label: menu.label,
                    disabled: menu.isActive === false || menu.isVisible === false,
                    groupMenu: menu.groupMenu,
                }));

                const grouped = groups
                    .map((group) => ({
                        name: group.name,
                        description: group.description,
                        color: group.color,
                        menus: transformedMenus.filter((menu) => menu.groupMenu === group.name),
                    }))
                    .filter((group) => group.menus.length > 0);

                setGroupedMenus(grouped);
            } catch (error) {
                message.error('Không thể tải danh sách menu');
                setGroupedMenus([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems();
    }, []);

    if (!user) return null;

    return (
        <div className={`w-full ${isDark ? 'bg-slate-900' : ''}`}>
            <div className="w-full mx-auto ">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Spin size="large" tip="Đang tải menu..." />
                    </div>
                ) : groupedMenus.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Không có menu nào
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        {groupedMenus.map((group, groupIndex) => (
                            <div
                                key={group.name}
                                className={`flex flex-col gap-4 p-6 rounded-2xl shadow-sm ${
                                    isDark ? 'bg-slate-800' : 'bg-white'
                                }`}
                            >
                                <div
                                    className="flex items-center gap-3 py-3 px-4 -mx-6 -mt-6 mb-2 rounded-t-xl"
                                    style={{
                                        background: isDark
                                            ? `linear-gradient(135deg, ${group.color}30 0%, ${group.color}18 100%)`
                                            : `linear-gradient(135deg, ${group.color}28 0%, ${group.color}15 100%)`,
                                        borderBottom: `3px solid ${group.color}60`,
                                    }}
                                >
                                    <h2
                                        className={`text-xl font-bold tracking-tight ${
                                            isDark ? 'text-[#e5edf7]' : 'text-slate-800'
                                        }`}
                                        style={{ color: isDark ? undefined : group.color }}
                                    >
                                        {group.description}
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {group.menus.map((item, index) => (
                                        <MenuCard
                                            key={index}
                                            {...item}
                                            tone={MENU_TONES[(groupIndex * 3 + index) % MENU_TONES.length]}
                                            isDark={isDark}
                                            onNavigate={handleNavigate}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default System2Menu;
