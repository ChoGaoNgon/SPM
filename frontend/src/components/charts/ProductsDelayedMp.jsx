import { AlertCircle, AlertTriangle, CheckCircle, Loader2, Package, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../../modules/new-model/services/productService';

const ProductsDelayedMp = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProductsDelayedMp();
    }, []);

    const fetchProductsDelayedMp = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await productService.getProductsByDelayMp();
            setProducts(response);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const totalDelayed = products.length;

    const handleProductClick = (product) => {
        navigate(`/product-manager/models/${product.modelId}/products/${product.id}`);
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md h-full">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md h-full">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                        <p className="text-red-600 font-medium">Lỗi khi tải dữ liệu</p>
                        <p className="text-gray-500 text-sm mt-1">{error}</p>
                        <button
                            onClick={fetchProductsDelayedMp}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4 inline mr-2" />
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Sản phẩm trễ MP</h3>
                        <p className="text-sm text-gray-600">Danh sách sản phẩm bị trễ Mass Production</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {totalDelayed} sản phẩm
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                {totalDelayed === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-800 mb-2">Tuyệt vời!</h4>
                            <p className="text-gray-600">Không có sản phẩm nào bị trễ MP</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="max-h-[360px] overflow-y-auto space-y-3 mb-4 pr-2">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer"
                                    onClick={() => handleProductClick(product)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-red-100 rounded">
                                            <Package className="h-4 w-4 text-red-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-800">{product.code}</h4>
                                            <p className="text-sm text-gray-600">{product.name}</p>
                                            {product.modelCode && (
                                                <p className="text-xs text-gray-500">Model: {product.modelCode}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end space-y-2">
                                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                            Trễ MP
                                        </span>
                                        <div className="text-right text-xs text-gray-500">
                                            {product.mpScheduledDate && (
                                                <div>
                                                    KH MP:{' '}
                                                    {new Date(product.mpScheduledDate).toLocaleDateString('vi-VN')}
                                                </div>
                                            )}
                                            {product.createdAt && (
                                                <div>
                                                    Tạo: {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {totalDelayed > 3 && (
                            <div className="text-center text-xs text-gray-500 mb-4">
                                Cuộn để xem thêm {totalDelayed - 3} sản phẩm
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductsDelayedMp;
