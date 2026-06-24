import { Tag } from 'antd';

const renderTag = (color) => (props) => {
    const { label, closable, onClose } = props;
    return (
        <Tag color={color} closable={closable} onClose={onClose} style={{ marginRight: 4 }}>
            {label}
        </Tag>
    );
};
export default renderTag;
