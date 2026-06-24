import { breadcrumbMap } from '~/layouts/layoutConfig';
import modelService from '~/modules/new-model/services/modelService';
import productMoldTrialPlanService from '~/modules/new-model/services/productPlanService';
import productService from '~/modules/new-model/services/productService';

const modelNameCache = {};
const productNameCache = {};
const trialPlanNameCache = {};
const eventNameCache = {};

const HIDDEN_SEGMENTS = ['model', 'models', 'product', 'products', 'plan', 'event', 'events'];

export const getBreadcrumbItems = async (pathname) => {
    const pathnames = pathname.split('/').filter(Boolean);
    const items = [];

    for (let idx = 0; idx < pathnames.length; idx++) {
        const url = '/' + pathnames.slice(0, idx + 1).join('/');

        const matchedKey = Object.keys(breadcrumbMap).find((key) => {
            const regex = new RegExp('^' + key.replace(/:\w+/g, '[^/]+') + '$');
            return regex.test(url);
        });

        let label = pathnames[idx];

        if (pathnames[idx - 1] === 'models') {
            label = await fetchModelCode(pathnames[idx]);
        } else if (pathnames[idx - 1] === 'products') {
            label = await fetchProductCode(pathnames[idx]);
        } else if (pathnames[idx - 1] === 'plan') {
            label = await fetchTrialPlanCode(pathnames[idx]);
        } else if (breadcrumbMap[matchedKey]) {
            label = breadcrumbMap[matchedKey];
        }

        items.push({ url, label });
    }

    return items.filter((item) => !HIDDEN_SEGMENTS.includes(item.label));
};

export const fetchModelCode = async (id) => {
    if (modelNameCache[id]) return modelNameCache[id];
    try {
        const res = await modelService.getModelById(id);
        modelNameCache[id] = res?.code || `Model ${id}`;
        return modelNameCache[id];
    } catch {
        return `Model ${id}`;
    }
};

export const fetchProductCode = async (id) => {
    if (productNameCache[id]) return productNameCache[id];
    try {
        const res = await productService.getProductById(id);
        productNameCache[id] = res?.code || `Product ${id}`;
        return productNameCache[id];
    } catch {
        return `Product ${id}`;
    }
};

export const fetchTrialPlanCode = async (id) => {
    if (trialPlanNameCache[id]) return trialPlanNameCache[id];
    try {
        const res = await productMoldTrialPlanService.getMoldTrialPlanById(id);
        trialPlanNameCache[id] = res?.name || `Kế hoạch ${id}`;
        return trialPlanNameCache[id];
    } catch {
        return `Kế hoạch ${id}`;
    }
};
