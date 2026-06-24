import dayjs from 'dayjs';

export const filterMachines = (machines = [], keyword = '', filterMachineTypeId) => {
    return machines.filter((item) => {
        const typeMatched = !filterMachineTypeId || item?.machineType?.id === filterMachineTypeId;
        const search = keyword.trim().toLowerCase();

        if (!search) {
            return typeMatched;
        }

        const codeMatched = item?.code?.toLowerCase().includes(search);
        const positionMatched = item?.position?.toLowerCase().includes(search);
        const machineNoMatched = item?.machineNo?.toString().includes(search);
        const detailMatched = (item?.machineDetails || []).some(
            (d) =>
                d?.name?.toLowerCase().includes(search) ||
                d?.model?.toLowerCase().includes(search) ||
                d?.serial?.toLowerCase().includes(search) ||
                d?.maker?.toLowerCase().includes(search),
        );

        return typeMatched && (codeMatched || positionMatched || machineNoMatched || detailMatched);
    });
};

export const flattenMachineRows = (machines = [], options = {}) => {
    const startOrder = options.startOrder || 0;

    return machines.flatMap((machine, machineIndex) => {
        const details =
            Array.isArray(machine.machineDetails) && machine.machineDetails.length > 0
                ? machine.machineDetails
                : [null];

        const rowSpan = details.length;

        return details.map((detail, index) => ({
            key: `${machine.id || machine.code}-${detail?.id || `d-${index}`}`,
            machineId: machine.id,
            machineOrder: startOrder + machineIndex + 1,
            isFirstRow: index === 0,
            rowSpan,
            code: machine.code,
            machineNo: machine.machineNo,
            machineType: machine.machineType,
            position: machine.position,
            capacityTon: machine.capacityTon,
            screw: machine.screw,
            totalElectricPower: machine.totalElectricPower,
            detailName: detail?.name,
            model: detail?.model,
            maker: detail?.maker,
            serial: detail?.serial,
            voltage: detail?.voltage,
            electricPower: detail?.electricPower,
            productionStartTime: detail?.productionStartTime,
            dispatchTime: detail?.dispatchTime,
        }));
    });
};

export const normalizeDetailRows = (machineDetails) => {
    if (!Array.isArray(machineDetails) || machineDetails.length === 0) {
        return [
            {
                name: '',
                model: '',
                serial: '',
                voltage: undefined,
                maker: '',
                electricPower: undefined,
                productionStartTime: undefined,
                dispatchTime: undefined,
            },
        ];
    }

    return machineDetails.map((d) => ({
        name: d?.name || '',
        model: d?.model || '',
        serial: d?.serial || '',
        voltage: d?.voltage !== undefined && d?.voltage !== null ? String(d.voltage) : undefined,
        maker: d?.maker || '',
        electricPower: d?.electricPower,
        productionStartTime: d?.productionStartTime ? dayjs(d.productionStartTime) : undefined,
        dispatchTime: d?.dispatchTime ? dayjs(d.dispatchTime) : undefined,
    }));
};

export const buildMachinePayload = (values) => {
    return {
        code: values.code?.trim(),
        name: values.code?.trim(),
        machineNo: values.machineNo,
        dimension: values.dimension?.trim(),
        machineTypeId: values.machineTypeId,
        machineSpecificationId: values.machineSpecificationId,
        capacityTon: values.capacityTon?.trim(),
        description: values.description?.trim(),
        position: values.position?.trim(),
        totalElectricPower: values.totalElectricPower?.trim(),
        screw: values.screw,
        machineDetails: (values.machineDetails || [])
            .map((d) => {
                const name = d?.name?.trim();
                const model = d?.model?.trim();
                const serial = d?.serial?.trim();
                const maker = d?.maker?.trim();
                const productionStartTime = d?.productionStartTime
                    ? typeof d.productionStartTime === 'string'
                        ? d.productionStartTime.trim()
                        : dayjs.isDayjs(d.productionStartTime)
                          ? d.productionStartTime.format('YYYY-MM-DD')
                          : d.productionStartTime
                    : undefined;
                const dispatchTime = d?.dispatchTime
                    ? typeof d.dispatchTime === 'string'
                        ? d.dispatchTime.trim()
                        : dayjs.isDayjs(d.dispatchTime)
                          ? d.dispatchTime.format('YYYY-MM-DD')
                          : d.dispatchTime
                    : undefined;
                const voltage = d?.voltage !== undefined && d?.voltage !== null ? String(d.voltage).trim() : undefined;
                const hasVoltage = voltage !== undefined && voltage !== '';
                const parsedElectricPower =
                    d?.electricPower === undefined || d?.electricPower === null || String(d.electricPower).trim() === ''
                        ? undefined
                        : Number(d.electricPower);
                const hasElectricPower = parsedElectricPower !== undefined && !Number.isNaN(parsedElectricPower);

                if (
                    !name &&
                    !model &&
                    !serial &&
                    !maker &&
                    !hasVoltage &&
                    !hasElectricPower &&
                    !productionStartTime &&
                    !dispatchTime
                ) {
                    return null;
                }

                return {
                    ...(name ? { name } : {}),
                    ...(model ? { model } : {}),
                    ...(serial ? { serial } : {}),
                    ...(maker ? { maker } : {}),
                    ...(hasVoltage ? { voltage } : {}),
                    ...(hasElectricPower ? { electricPower: parsedElectricPower } : {}),
                    ...(productionStartTime ? { productionStartTime } : {}),
                    ...(dispatchTime ? { dispatchTime } : {}),
                };
            })
            .filter(Boolean),
    };
};

export const toStringOptions = (values = []) => values.map((value) => ({ label: value, value }));

export const toVoltageOptions = (values = []) => values.map((value) => ({ label: `${value}V`, value: String(value) }));
