import { Descriptions } from 'antd';
import { getDisplayFields } from '~/modules/asset-management/config/specificationFieldsConfig';

const SpecificationDisplay = ({ specification, assetTypeName, bordered = true, column = { xs: 1, sm: 2, lg: 3 } }) => {
    if (!specification) {
        return <div className="text-slate-500 text-center">Chưa có thông số kỹ thuật</div>;
    }

    const displayFields = getDisplayFields(assetTypeName);

    const fieldsWithValues = displayFields
        .filter((field) => {
            const value = specification[field.key];
            return value !== null && value !== undefined && value !== '';
        })
        .map((field) => ({
            ...field,
            value: specification[field.key],
        }));

    if (fieldsWithValues.length === 0) {
        return <div className="text-slate-500 text-center">Chưa có thông tin thông số kỹ thuật</div>;
    }

    return (
        <Descriptions bordered={bordered} column={column}>
            {fieldsWithValues.map((field) => (
                <Descriptions.Item key={field.key} label={field.label} span={field.span}>
                    {field.value}
                </Descriptions.Item>
            ))}
        </Descriptions>
    );
};

export default SpecificationDisplay;
