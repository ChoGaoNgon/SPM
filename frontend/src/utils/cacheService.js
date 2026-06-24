const DEFAULT_TTL = 1000 * 60 * 30;

class CacheService {
    set(key, data, ttl = DEFAULT_TTL) {
        try {
            const item = {
                data,
                timestamp: Date.now(),
                ttl,
            };
            localStorage.setItem(key, JSON.stringify(item));
        } catch (error) {}
    }

    get(key) {
        try {
            const itemStr = localStorage.getItem(key);
            if (!itemStr) {
                return null;
            }

            const item = JSON.parse(itemStr);
            const now = Date.now();

            if (now - item.timestamp > item.ttl) {
                this.remove(key);
                return null;
            }

            return item.data;
        } catch (error) {
            return null;
        }
    }

    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {}
    }

    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach((key) => {
                if (key.startsWith('cache_')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {}
    }

    has(key) {
        return this.get(key) !== null;
    }

    async fetchWithCache(key, fetchFn, ttl = DEFAULT_TTL) {
        const cached = this.get(key);
        if (cached !== null) {
            return cached;
        }

        const data = await fetchFn();

        this.set(key, data, ttl);

        return data;
    }
}

const cacheService = new CacheService();
export default cacheService;

export const CACHE_KEYS = {
    DEPARTMENTS: 'cache_departments',
    POSITIONS: 'cache_positions',
    ROLES: 'cache_roles',
    EMPLOYEE_STATUSES: 'cache_employee_statuses',
};
