import departmentService from '~/modules/department/services/departmentService';

const flattenDepartments = async (depts, prefix = '') => {
    let result = [];
    for (const dept of depts) {
        const displayName = prefix ? `|__ ${dept.name}` : dept.name;
        result.push({ ...dept, displayName });

        const subDepts = dept.children || dept.subDepartments || dept.subs || dept.sub || [];
        if (subDepts && subDepts.length > 0) {
            const flatSubs = await flattenDepartments(subDepts, displayName);
            result = result.concat(flatSubs);
        }
    }
    return result;
};

export const fetchDepartments = async () => {
    try {
        const deps = await departmentService.getRootDepartments();
        const flatDeps = await flattenDepartments(deps);
        return flatDeps || [];
    } catch (err) {
        return [];
    }
};
