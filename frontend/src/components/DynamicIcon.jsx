import * as LucideIcons from 'lucide-react';

const DynamicIcon = ({ name, size = 16, className = '', ...props }) => {
    if (!name) {
        return null;
    }

    const IconComponent = LucideIcons[name];

    if (!IconComponent) {
        const DefaultIcon = LucideIcons.HelpCircle;
        return <DefaultIcon size={size} className={className} {...props} />;
    }

    return <IconComponent size={size} className={className} {...props} />;
};

export default DynamicIcon;
