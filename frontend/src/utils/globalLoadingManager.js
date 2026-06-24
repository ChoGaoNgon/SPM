let activeRequestCount = 0;
const listeners = new Set();

const notify = () => {
    const isLoading = activeRequestCount > 0;
    listeners.forEach((listener) => listener(isLoading));
};

export const subscribeGlobalLoading = (listener) => {
    listeners.add(listener);
    listener(activeRequestCount > 0);

    return () => {
        listeners.delete(listener);
    };
};

const beginGlobalLoading = () => {
    activeRequestCount += 1;
    notify();
};

const endGlobalLoading = () => {
    activeRequestCount = Math.max(0, activeRequestCount - 1);
    notify();
};

export const trackGlobalLoadingRequest = (config) => {
    if (!config || config.suppressGlobalLoading || config.__globalLoadingTracked) {
        return config;
    }

    config.__globalLoadingTracked = true;
    beginGlobalLoading();
    return config;
};

export const untrackGlobalLoadingRequest = (responseOrError) => {
    const config = responseOrError?.config;

    if (!config || !config.__globalLoadingTracked) {
        return;
    }

    config.__globalLoadingTracked = false;
    endGlobalLoading();
};
