import dayjs from 'dayjs';

export const formatDateTime = (val) => {
    if (!val) return null;

    if (dayjs.isDayjs(val)) {
        return val.format('YYYY-MM-DDTHH:mm:ss');
    }

    if (val instanceof Date) {
        return dayjs(val).format('YYYY-MM-DDTHH:mm:ss');
    }

    if (typeof val === 'string') {
        const d = dayjs(val);
        if (!d.isValid()) return null;

        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(val)) {
            return d.format(' HH:mm:ss DD-MM-YYYY');
        }

        return d.format('YYYY-MM-DDTHH:mm:ss');
    }

    return null;
};

export const formatDate = (val) => {
    if (!val) return null;

    if (dayjs.isDayjs(val)) {
        return val.format('YYYY-MM-DD');
    }

    if (val instanceof Date) {
        return dayjs(val).format('YYYY-MM-DD');
    }

    if (typeof val === 'string') {
        const d = dayjs(val);
        if (!d.isValid()) return null;

        if (/^\d{4}-\d{2}-\d{2}/.test(val)) {
            return d.format('DD-MM-YYYY');
        }

        return d.format('YYYY-MM-DD');
    }

    return null;
};
