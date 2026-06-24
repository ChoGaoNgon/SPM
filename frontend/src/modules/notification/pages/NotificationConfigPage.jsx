import { SearchOutlined } from '@ant-design/icons';
import { Col, Empty, Input, List, message, Row, Spin } from 'antd';
import { Bell, ChevronDown, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import PageHeader from '~/components/PageHeader';
import roleService from '~/modules/authorization/services/roleService';
import departmentService from '~/modules/department/services/departmentService';
import employeeService from '~/modules/employee/services/employeeService';
import EventDetailPanel from '../components/EventDetailPanel';
import notificationRuleService from '../services/notificationRuleService';
import notificationService from '../services/notificationService';
import notificationTemplateService from '../services/notificationTemplateService';

const NotificationConfigPage = () => {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [rules, setRules] = useState([]);
    const [notificationTypes, setNotificationTypes] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [openGroups, setOpenGroups] = useState([]);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            const [eventsData, templatesData, rulesData, typesData, deptsData, rolesData, empsData] = await Promise.all(
                [
                    notificationService.getAllEvents(),
                    notificationTemplateService.getAllTemplates(),
                    notificationRuleService.getAllRules(),
                    notificationService.getAllTypes(),
                    departmentService.getRootDepartments(),
                    roleService.getAllRoles(),
                    employeeService.getAllEmployees(),
                ],
            );

            const transformedEvents = Object.entries(eventsData || {}).map(([group, items]) => ({
                group,
                items: items || [],
            }));

            setEvents(transformedEvents);
            setTemplates(templatesData);
            setRules(rulesData);
            setNotificationTypes(typesData.map((t) => ({ value: t.code, label: t.description })));
            setDepartments(deptsData);
            setRoles(rolesData);
            setEmployees(empsData);

            setOpenGroups([]);

            const allEvents = transformedEvents.flatMap((g) => g.items);
            setSelectedEvent((prev) =>
                prev ? allEvents.find((e) => e.code === prev.code) || allEvents[0] : allEvents[0],
            );
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu: ' + (error.message || ''));
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshData = useCallback(async () => {
        try {
            const [templatesData, rulesData] = await Promise.all([
                notificationTemplateService.getAllTemplates(),
                notificationRuleService.getAllRules(),
            ]);
            setTemplates(templatesData);
            setRules(rulesData);
        } catch (error) {
            message.error('Lỗi khi tải lại dữ liệu');
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    useEffect(() => {
        if (searchText) {
            setOpenGroups(events.map((g) => g.group));
        }
    }, [searchText, events]);

    const toggleGroup = (groupName) => {
        setOpenGroups(
            (prev) =>
                prev.includes(groupName)
                    ? []
                    : 
                      [groupName],
        );
    };

    const filteredEvents = events
        .map((group) => ({
            group: group.group,
            items: group.items.filter(
                (e) =>
                    !searchText ||
                    e.description?.toLowerCase().includes(searchText.toLowerCase()) ||
                    e.code?.toLowerCase().includes(searchText.toLowerCase()),
            ),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <div>
            <PageHeader
                icon={Bell}
                title="Cấu hình thông báo"
                description="Chọn sự kiện bên trái để cấu hình template và quy tắc gửi thông báo"
            />

            <Spin spinning={loading}>
                <Row gutter={16} align="top">
                    <Col xs={24} md={8} lg={7} xl={6}>
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
                            <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                                <Input
                                    placeholder="Tìm sự kiện..."
                                    prefix={<SearchOutlined />}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    allowClear
                                    size="small"
                                />
                            </div>

                            {filteredEvents.length === 0 ? (
                                <Empty className="py-8" description="Không tìm thấy sự kiện" />
                            ) : (
                                <List
                                    style={{
                                        maxHeight: 'calc(100vh - 350px)',
                                        overflow: 'auto',
                                    }}
                                    dataSource={filteredEvents}
                                    renderItem={(group) => (
                                        <div key={group.group}>
                                            <div
                                                onClick={() => toggleGroup(group.group)}
                                                className="px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-700 cursor-pointer flex justify-between items-center sticky top-0 z-10"
                                            >
                                                <span>{group.group}</span>
                                                {openGroups.includes(group.group) ? (
                                                    <ChevronDown size={14} />
                                                ) : (
                                                    <ChevronRight size={14} />
                                                )}
                                            </div>

                                            {openGroups.includes(group.group) &&
                                                group.items.map((event) => {
                                                    const tplCount = templates.filter(
                                                        (t) => t.eventCode === event.code,
                                                    ).length;
                                                    const ruleCount = rules.filter(
                                                        (r) => r.eventCode === event.code,
                                                    ).length;
                                                    const isSelected = selectedEvent?.code === event.code;

                                                    return (
                                                        <List.Item
                                                            key={event.code}
                                                            onClick={() => setSelectedEvent(event)}
                                                            className="cursor-pointer px-3 py-2.5"
                                                            style={{
                                                                background: isSelected
                                                                    ? 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)'
                                                                    : undefined,
                                                                borderLeft: isSelected
                                                                    ? '3px solid #4f46e5'
                                                                    : '3px solid transparent',
                                                                borderBottom: '1px solid #f1f5f9',
                                                            }}
                                                        >
                                                            <div className="w-full ps-2">
                                                                <div className="flex justify-between">
                                                                    <span
                                                                        className={`text-sm font-medium ${
                                                                            isSelected
                                                                                ? 'text-indigo-700'
                                                                                : 'text-slate-700 dark:text-slate-200'
                                                                        }`}
                                                                    >
                                                                        {event.description || event.code}
                                                                    </span>
                                                                </div>

                                                                <div className="flex justify-between mt-1">
                                                                    <span className="text-xs text-slate-400">
                                                                        {event.code}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </List.Item>
                                                    );
                                                })}
                                        </div>
                                    )}
                                />
                            )}
                        </div>
                    </Col>

                    <Col xs={24} md={16} lg={17} xl={18}>
                        <EventDetailPanel
                            event={selectedEvent}
                            templates={templates}
                            rules={rules}
                            notificationTypes={notificationTypes}
                            departments={departments}
                            roles={roles}
                            employees={employees}
                            onRefresh={refreshData}
                        />
                    </Col>
                </Row>
            </Spin>
        </div>
    );
};

export default NotificationConfigPage;
