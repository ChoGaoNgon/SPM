import { Spin, message } from 'antd';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import departmentService from '~/modules/department/services/departmentService';

export default function DepartmentTree({ onSelectDepartment }) {
    const [loading, setLoading] = useState(false);
    const [treeData, setTreeData] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState(new Set());
    const [selectedKey, setSelectedKey] = useState(null);

    const fetchDepartments = useCallback(async () => {
        setLoading(true);
        try {
            const data = await departmentService.getRootDepartments();

            if (!Array.isArray(data)) {
                throw new Error('Dữ liệu phòng ban không hợp lệ');
            }

            const mapToTree = (list = []) =>
                list.map((dep) => {
                    const children = Array.isArray(dep?.subDepartments)
                        ? dep.subDepartments.map((sub) => ({
                              title: `${String(sub?.name ?? 'Không tên')} (${Number(sub?.employeeCount ?? 0)})`,
                              key: String(sub?.id ?? ''),
                              children: [],
                          }))
                        : [];

                    return {
                        title: `${String(dep?.name ?? 'Không tên')} (${Number(dep?.employeeCount ?? 0)})`,
                        key: String(dep?.id ?? ''),
                        children,
                    };
                });

            setTreeData(mapToTree(data));
        } catch (error) {
            const errorMsg =
                typeof error === 'string' ? error : error?.message || 'Có lỗi xảy ra khi tải danh sách phòng ban';

            message.error(String(errorMsg));
            setTreeData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    const toggleExpand = (key) => {
        setExpandedKeys((prev) => {
            const newExpanded = new Set(prev);
            newExpanded.has(key) ? newExpanded.delete(key) : newExpanded.add(key);
            return newExpanded;
        });
    };

    const handleSelect = (key, node) => {
        setSelectedKey(key);

        if (typeof onSelectDepartment === 'function') {
            onSelectDepartment(key, node);
        }
    };

    const renderTreeNode = (node, level = 0) => {
        if (!node || typeof node !== 'object') return null;

        const isExpanded = expandedKeys.has(node.key);
        const hasChildren = Array.isArray(node.children) && node.children.length > 0;
        const isSelected = selectedKey === node.key;

        return (
            <div key={String(node.key)}>
                <button
                    type="button"
                    onClick={() => {
                        if (hasChildren) toggleExpand(node.key);
                        handleSelect(node.key, node);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-left ${
                        isSelected
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                    }`}
                    style={{ marginLeft: `${level * 12}px` }}
                >
                    {hasChildren ? (
                        <span className="flex-shrink-0 w-5 flex items-center justify-center">
                            {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-blue-500" />
                            ) : (
                                <ChevronRight className="w-5 h-5 text-gray-500" />
                            )}
                        </span>
                    ) : (
                        <span className="w-5" />
                    )}

                    <span className="text-sm font-medium flex-1">{String(node.title ?? 'Không tên')}</span>
                </button>

                {hasChildren && isExpanded && (
                    <div>{node.children.map((child) => renderTreeNode(child, level + 1))}</div>
                )}
            </div>
        );
    };

    return (
        <Spin spinning={loading} wrapperClassName="w-full">
            <div className="w-full space-y-1">
                {treeData.length > 0
                    ? treeData.map((node) => renderTreeNode(node))
                    : !loading && <div className="text-center text-gray-500 py-4">Không có dữ liệu</div>}
            </div>
        </Spin>
    );
}
