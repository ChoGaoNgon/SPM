export const openProductDetail = (product) => {
    const url = `/product-manager/models/${product.modelId || product.id}/products/${product.id}`;
    window.open(url, '_blank');
};
