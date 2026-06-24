import OrgChart from 'react-orgchart';
import 'react-orgchart/index.css';

const MyNode = ({ node }) => (
    <div
        style={{
            border: `1px solid ${node.color || '#90CAF9'}`,
            minWidth: 60,
            padding: 5,
            borderRadius: 5,
            margin: 5,
            textAlign: 'center',
            fontSize: 12,
        }}
    >
        <strong>{node.name}</strong>
        <div>{node.title}</div>
    </div>
);

const DepartmentOrgChart = ({ data }) => {
    const convert = (dep) => ({
        ...dep,
        children: dep.subDepartments?.map(convert) || [],
        color: '#e06d0eff',
    });

    const treeData = { name: 'HTMP', title: 'Công ty Cổ phần HTMP Việt Nam', children: data.map(convert) };

    return <OrgChart tree={treeData} NodeComponent={MyNode} />;
};

export default DepartmentOrgChart;
