import PrivateRoute from '~/components/PrivateRoute';
import DefaultLayout from '~/layouts/DefaultLayout';
import AttendanceByDepartmentPage from '~/modules/attendance/pages';
import AttendanceRawLogsPage from '~/modules/attendance/pages/RawLogs';
import ChangePasswordPage from '~/modules/auth/pages/ChangePasswordPage';
import LoginPage from '~/modules/auth/pages/LoginPage';
import SessionManagementPage from '~/modules/auth/pages/SessionManagerPage';
import RolePermissionManager from '~/modules/authorization/pages';
import CustomerManagerPage from '~/modules/customer/pages';
import DepartmentManagerPage from '~/modules/department/pages';
import EmployeeManagerPage from '~/modules/employee/pages';
import ModelDetailPage from '~/modules/new-model/pages/ModelDetailPage';
import ModelListPage from '~/modules/new-model/pages/ModelListPage';
import MoldPage from '~/modules/new-model/pages/MoldPage';
import ProductDetailPage from '~/modules/new-model/pages/ProductDetailPage';
import ProductFormPage from '~/modules/new-model/pages/ProductFormPage';
import NotificationPage from '~/modules/notification/pages/NotificationPage';
import PositionManagerPage from '~/modules/position/pages';
import ElectricalOrderPage from '~/modules/purchase-order/pages';
import SystemFeedbackPage from '~/modules/system-feedback/pages';
import ElectricalDailyTasksPage from '~/modules/work-report/pages';
import EmployeeSchedule from '~/modules/work-schedule';
import MyWorkSchedule from '~/modules/work-schedule/MyWorkSchedule';
import OvertimeManager from '~/modules/work-schedule/OvertimeManager';
import ShiftChangeManager from '~/modules/work-schedule/ShiftChangeManager';
import WorkScheduleEnhanced from '~/modules/work-schedule/WorkScheduleEnhanced';
import WorkScheduleLockPage from '~/modules/work-schedule/WorkScheduleLockPage';
import AboutPage from '~/pages/AboutPage';
import CompanyDocumentViewerPage from '~/pages/CompanyDocumentViewerPage';
import HomePage from '~/pages/HomePage';
import NotFound from '~/pages/NotFound';

import AssetBorrowPage from '~/modules/asset-management/pages/AssetBorrowPage';
import AssetDetailPage from '~/modules/asset-management/pages/AssetDetailPage';
import AssetManagementPage from '~/modules/asset-management/pages/AssetManagementPage';
import LimitPlanConfigPage from '~/modules/limit-plan-config/LimitPlanConfigPage';
import MachineDowntimePage from '~/modules/machine/MachineDowntimePage';
import MachinePage from '~/modules/machine/MachinePage';
import MailAddressPage from '~/modules/mail/pages';
import ApproveResultDepartmentPage from '~/modules/new-model/pages/ApproveResultDepartmentPage';
import MoldTrialPlanDaily from '~/modules/new-model/pages/MoldTrialPlanDaily';
import PlanApprovalTemplatePage from '~/modules/new-model/pages/PlanApprovalTemplatePage';
import ProductPlanDetailPage from '~/modules/new-model/pages/ProductPlanDetailPage';
import QCPage from '~/modules/new-model/pages/QCPage';
import NotificationConfigPage from '~/modules/notification/pages/NotificationConfigPage';
import System2Menu from '~/modules/system2/System2Menu';
import ShiftPatternManagement from '~/modules/work-schedule/ShiftPatternManagement';
import AuditLogPage from '~/pages/admin/AuditLogPage';
import MenuConfig from '~/pages/admin/MenuConfig';
import OeeReportExportPage from '~/pages/OeeReportExportPage';
import ProductionPlanDowntimeExportPage from '~/pages/ProductionPlanDowntimeExportPage';

const routes = [
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '*',
        element: <NotFound />,
    },

    {
        path: '/',
        element: (
            <PrivateRoute>
                <DefaultLayout />
            </PrivateRoute>
        ),
        children: [
            { path: '', element: <HomePage /> },
            { path: 'employees', element: <EmployeeManagerPage /> },

            { path: 'dep-pos/departments', element: <DepartmentManagerPage /> },
            { path: 'dep-pos/positions', element: <PositionManagerPage /> },

            { path: 'schedules/all', element: <EmployeeSchedule /> },
            { path: 'schedules/work-schedule', element: <WorkScheduleEnhanced /> },
            { path: 'schedules/department-lock', element: <WorkScheduleLockPage /> },
            { path: 'schedules/shift-patterns', element: <ShiftPatternManagement /> },
            { path: 'attendances/daily', element: <AttendanceByDepartmentPage /> },
            { path: 'attendances/raw-logs', element: <AttendanceRawLogsPage /> },
            { path: 'schedules/me', element: <MyWorkSchedule /> },
            { path: 'schedules/shift-manager', element: <ShiftChangeManager /> },
            { path: 'schedules/overtime-manager', element: <OvertimeManager /> },

            { path: 'tasks-daily', element: <ElectricalDailyTasksPage /> },
            { path: 'orders', element: <ElectricalOrderPage /> },

            //Quản lý máy
            { path: 'machines', element: <MachinePage /> },
            { path: 'machines/downtime', element: <MachineDowntimePage /> },

            { path: '/product-manager/customers', element: <CustomerManagerPage /> },
            { path: '/product-manager/models', element: <ModelListPage /> },
            { path: '/product-manager/models/:id', element: <ModelDetailPage /> },
            { path: '/product-manager/models/:id/products/:productId', element: <ProductDetailPage /> },
            {
                path: '/product-manager/models/:id/products/:productId/plan/:planId',
                element: <ProductPlanDetailPage />,
            },
            { path: '/product-manager/qc-new-production', element: <QCPage /> },
            { path: '/product-manager/limit-plan-config', element: <LimitPlanConfigPage /> },
            { path: '/product-manager/models/:id/create', element: <ProductFormPage mode="create" /> },
            { path: '/product-manager/models/:id/products/:productId/edit', element: <ProductFormPage mode="edit" /> },
            { path: '/product-manager/mold-trial-plans-daily', element: <MoldTrialPlanDaily /> },
            { path: '/product-manager/molds', element: <MoldPage /> },
            { path: '/product-manager/mold-trial-plans-approve-results', element: <ApproveResultDepartmentPage /> },
            { path: '/product-manager/product-plan-approval-templates', element: <PlanApprovalTemplatePage /> },

            { path: 'other', element: <CompanyDocumentViewerPage /> },

            { path: 'system-feedbacks', element: <SystemFeedbackPage /> },

            { path: 'notifications', element: <NotificationPage /> },

            { path: 'change-password', element: <ChangePasswordPage /> },

            { path: 'assets-management/assets', element: <AssetManagementPage /> },
            { path: 'assets-management/assets/:assetId', element: <AssetDetailPage /> },
            { path: 'assets-management/assets-borrow', element: <AssetBorrowPage /> },

            { path: '/report/oee', element: <OeeReportExportPage /> },
            { path: '/report/plan-downtime', element: <ProductionPlanDowntimeExportPage /> },


            { path: 'admin/permissions', element: <RolePermissionManager /> },
            { path: 'admin/loginsessions', element: <SessionManagementPage /> },
            { path: 'admin/notifications-config', element: <NotificationConfigPage /> },
            { path: 'admin/mail-addresses', element: <MailAddressPage /> },
            { path: 'admin/menu-config', element: <MenuConfig /> },
            { path: 'admin/audit-logs', element: <AuditLogPage /> },

            { path: 'about', element: <AboutPage /> },
            { path: 'system-2', element: <System2Menu /> },
        ],
    },
];

export default routes;
