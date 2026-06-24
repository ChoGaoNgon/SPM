export const getMachineOptionLabel = (machine) => {
    if (!machine) return '';

    const code = machine.code || 'Chưa có mã máy';
    const machineNo = machine.machineNo != null ? `Máy số ${machine.machineNo}` : 'Chưa có số máy';
    const capacityTon = machine.capacityTon ? `${machine.capacityTon} tấn` : 'Chưa có công suất';
    const position = machine.position || 'Chưa có vị trí';

    return `${code} | ${machineNo} | ${capacityTon} | ${position}`;
};

export const buildMachineAutoCompleteOptions = (machines = []) => {
    return machines.map((machine) => ({
        value: machine.code || '',
        label: getMachineOptionLabel(machine),
        searchText: `${machine.code || ''} ${machine.machineNo || ''} ${machine.capacityTon || ''} ${machine.position || ''}`,
        machineId: machine.id,
        machineNo: machine.machineNo,
        machineCapacityTon: machine.capacityTon,
        machinePosition: machine.position,
    }));
};

export const findMachineByCode = (machines = [], machineCode) => {
    return machines.find((machine) => machine.code === machineCode) || null;
};
