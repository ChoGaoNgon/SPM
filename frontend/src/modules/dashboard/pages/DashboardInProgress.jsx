import { Clock, Construction, Hammer, Sparkles, Wrench } from 'lucide-react';

const DashboardInProgress = () => {
    return (
        <div className="w-full min-h-[80vh] flex flex-col justify-center items-center  ">
            <div className="relative mb-6">
                <div className="animate-bounce">
                    <Construction className="w-24 h-24 text-blue-500" />
                </div>
                <div className="absolute -top-2 -right-2 animate-pulse">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Trang tổng quan đang được phát triển!</h1>

            <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
                Chúng tôi đang xây dựng một dashboard tuyệt vời cho bạn
            </p>

            <div className="flex items-center space-x-4 text-gray-500">
                <Wrench className="w-5 h-5 animate-pulse" />
                <span className="text-sm">Đang phát triển...</span>
                <Hammer className="w-5 h-5 animate-pulse" />
            </div>

            <div className="w-64 bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
            </div>

            <div className="flex items-center mt-4 text-gray-400">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-xs">Dự kiến hoàn thành trong thời gian sớm nhất</span>
            </div>
        </div>
    );
};

export default DashboardInProgress;
