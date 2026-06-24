import { message } from 'antd';
import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import background from '~/assets/img/background/background.webp';
import authService from '~/modules/auth/services/authService';

const BACKGROUND_IMAGE_URL = background;
export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [error, setError] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!authService.isAuthenticated()) return;

        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect');

        if (redirect && redirect.startsWith('/')) {
            navigate(redirect, { replace: true });
        } else {
            const isElectricalOrNMD = authService.isInDepartments(['P-CD', 'P-NMD']);

            if (!isElectricalOrNMD) {
                navigate('/system-2', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [navigate, location.search]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!code || !password) {
            setError('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const data = await authService.login(code, password);

            if (data.mustChangePassword) {
                message.info('Vui lòng đổi mật khẩu trước khi tiếp tục.');
                navigate('/change-password', { replace: true });
                return;
            }

            const returnUrl = localStorage.getItem('returnUrl');
            const params = new URLSearchParams(location.search);
            const redirect = params.get('redirect');

            if (returnUrl) {
                localStorage.removeItem('returnUrl');
                navigate(returnUrl, { replace: true });
            } else if (redirect && redirect.startsWith('/')) {
                navigate(redirect, { replace: true });
            } else {
                const wontRedirect = authService.isInDepartments(['P-CD', 'P-NMD', 'P-IT&ERP', 'IT', 'BGD']);

                if (!wontRedirect) {
                    navigate('/system-2', { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-end bg-cover bg-center"
            style={{ backgroundImage: `url('${BACKGROUND_IMAGE_URL}')` }}
        >
            <div className="md:w-1/2 w-full min-h-screen flex items-center justify-center relative">
                <div
                    className="absolute inset-0 z-10"
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                    }}
                />

                <div className="w-full max-w-md p-10 relative z-20 mx-6">
                    <h2 className="text-3xl font-light text-white mb-1">Chào mừng quay trở lại</h2>
                    <p className="text-sm text-gray-300 mb-8">Vui lòng nhập thông tin của bạn.</p>

                    {error && (
                        <div className="bg-red-800 text-red-200 px-4 py-2 rounded mb-4 text-center text-sm bg-opacity-50">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-300 font-medium mb-1 text-sm">Mã nhân viên</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                autoFocus
                                className="w-full px-4 py-3 border-b border-gray-600 focus:outline-none focus:border-green-400 transition placeholder-gray-500"
                                placeholder="Nhập mã nhân viên"
                            />
                        </div>

                        <div className="relative">
                            <label className="block text-gray-300 font-medium mb-1 text-sm">Mật khẩu</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 border-b border-gray-600 focus:outline-none focus:border-green-400 transition placeholder-gray-500"
                                placeholder="••••••••"
                            />
                            <div
                                className="absolute right-3 top-9 text-gray-400 hover:text-gray-300 cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-800 text-white font-semibold py-3 rounded-md shadow-lg hover:bg-blue-700 transition disabled:opacity-50 mt-8"
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>

                        <p className="text-center text-gray-400 text-sm mt-4">
                            Bạn chưa có tài khoản?
                            <a href="tel:0393049255" className="text-blue-400 font-medium hover:underline ml-1">
                                Liên hệ với phòng IT
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
