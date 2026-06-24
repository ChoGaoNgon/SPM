import { DownloadOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useState } from 'react';

export default function CompanyDocumentViewerPage() {
    const documents = [
        {
            key: 'healthcheck2025',
            title: 'Thông báo khám sức khỏe định kỳ - Năm 2025',
            description: 'Thông báo chi tiết về kế hoạch khám sức khỏe cho cán bộ, công nhân viên năm 2025.',
            fileUrl: require('~/assets/files/01.THÔNG BÁO KHÁM SỨC KHỎE 2025.pdf'),
            icon: <FilePdfOutlined />,
            category: 'Sức khỏe',
        },
        {
            key: 'calendar2026',
            title: 'Lịch làm việc khối gián tiếp - Năm 2026',
            description: 'Lịch làm việc và nghỉ của khối gián tiếp năm 2026, Công ty CP HTMP Việt Nam.',
            fileUrl: require('~/assets/files/CALENDAR 2026_LỊCH LÀM VIỆC KHỐI GIÁN TIẾP_ CP HTMP.pdf'),
            icon: <FilePdfOutlined />,
            category: 'Lịch làm việc',
        },
    ];

    const [selectedDoc, setSelectedDoc] = useState(documents[0]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = selectedDoc.fileUrl;
        link.download = selectedDoc.title + '.pdf';
        link.click();
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 gap-4">
            <div className="w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">📚</span>
                        <h2 className="text-xl font-bold">Tài liệu công ty</h2>
                    </div>
                    <p className="text-blue-100 text-sm">{documents.length} tài liệu</p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {documents.map((doc) => (
                        <button
                            key={doc.key}
                            onClick={() => setSelectedDoc(doc)}
                            className={`w-full text-left px-4 py-4 border-b border-gray-200 dark:border-gray-700 transition-all duration-200 ${
                                selectedDoc.key === doc.key
                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-blue-500'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="text-blue-500 text-xl mt-1">{doc.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 hover:text-blue-600">
                                        {doc.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{doc.category}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {selectedDoc.title}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedDoc.description}</p>
                        </div>
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 whitespace-nowrap shadow-md hover:shadow-lg"
                        >
                            <DownloadOutlined />
                            <span>Tải xuống</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden p-4">
                    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner bg-gray-900">
                        <iframe
                            src={selectedDoc.fileUrl}
                            title={selectedDoc.title}
                            className="w-full h-full border-0"
                        />
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <FilePdfOutlined className="text-red-500" />
                        <span>PDF Document</span>
                    </div>
                    <span>
                        {documents.findIndex((d) => d.key === selectedDoc.key) + 1} / {documents.length}
                    </span>
                </div>
            </div>
        </div>
    );
}
