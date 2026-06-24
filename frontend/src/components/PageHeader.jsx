import React from 'react';

const PageHeader = ({ icon: Icon, title, description, iconSize = 24 }) => {
    return (
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Icon size={iconSize} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
                    {description && <p className="text-slate-600 dark:text-slate-400">{description}</p>}
                </div>
            </div>
        </div>
    );
};

export default PageHeader;
