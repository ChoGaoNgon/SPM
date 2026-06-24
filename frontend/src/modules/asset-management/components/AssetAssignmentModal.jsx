import { Button, DatePicker, Form, message, Modal, Radio } from 'antd';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import DepartmentSelect from '~/components/select/DepartmentSelect';
import EmployeeSelect from '~/components/select/EmployeeSelect';
import assetAssignmentService from '~/services/assetAssignmentService';

const AssetAssignmentModal = ({ open, onCancel, onSuccess, assetId, assignment, isEdit }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (!open) {
            form.resetFields();
        } else if (isEdit && assignment) {
            const assignType = assignment.employeeUseName ? 'EMPLOYEE' : 'DEPARTMENT';
            form.setFieldsValue({
                assignType,
                employeeId: assignment.employeeUseId,
                departmentId: assignment.departmentUseId,
                assignAt: assignment.assignAt ? dayjs(assignment.assignAt) : null,
            });
        }
    }, [open, form, isEdit, assignment]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const payload = {
                assetId: Number(assetId),
                employeeUseId: values.assignType === 'EMPLOYEE' ? Number(values.employeeId) : null,
                departmentUseId: values.assignType === 'DEPARTMENT' ? Number(values.departmentId) : null,
                assignAt: values.assignAt.format('YYYY-MM-DD'),
                returnAt: values.returnAt ? values.returnAt.format('YYYY-MM-DD') : null,
            };

            if (isEdit && assignment?.id) {
                await assetAssignmentService.updateAssetAssignment(assignment.id, payload);
                message.success('Cập nhật phân công tài sản thành công');
            } else {
                await assetAssignmentService.createAssetAssignment(payload);
                message.success('Cấp phát tài sản thành công');
            }

            onSuccess?.();
            onCancel();
        } catch (error) {
            if (error?.errorFields) return;

            message.error(error.message || 'Không thể cấp phát tài sản');
        }
    };

    return (
        <Modal
            title={isEdit ? 'Cập nhật cấp phát tài sản' : 'Cấp phát tài sản'}
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button key="ok" type="primary" onClick={handleSubmit}>
                    {isEdit ? 'Cập nhật' : 'Cấp phát'}
                </Button>,
            ]}
            destroyOnHidden
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="assignType"
                    label="Cấp cho"
                    rules={[{ required: true, message: 'Chọn đối tượng cấp phát' }]}
                >
                    <Radio.Group
                        onChange={() => {
                            form.setFieldsValue({
                                employeeId: undefined,
                                departmentId: undefined,
                            });
                        }}
                    >
                        <Radio value="EMPLOYEE">Nhân viên</Radio>
                        <Radio value="DEPARTMENT">Phòng ban</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item shouldUpdate>
                    {() => {
                        const type = form.getFieldValue('assignType');

                        if (type === 'EMPLOYEE') {
                            return (
                                <Form.Item
                                    name="employeeId"
                                    label="Nhân viên sử dụng"
                                    rules={[{ required: true, message: 'Chọn nhân viên' }]}
                                >
                                    <EmployeeSelect placeholder="Chọn nhân viên" />
                                </Form.Item>
                            );
                        }

                        if (type === 'DEPARTMENT') {
                            return (
                                <Form.Item
                                    name="departmentId"
                                    label="Phòng ban sử dụng"
                                    rules={[{ required: true, message: 'Chọn phòng ban' }]}
                                >
                                    <DepartmentSelect placeholder="Chọn phòng ban" />
                                </Form.Item>
                            );
                        }

                        return null;
                    }}
                </Form.Item>

                <Form.Item
                    name="assignAt"
                    label="Ngày cấp phát"
                    rules={[{ required: true, message: 'Chọn ngày cấp phát' }]}
                >
                    <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày cấp phát" />
                </Form.Item>

                {isEdit && (
                    <Form.Item name="returnAt" label="Ngày trả">
                        <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày trả" />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};

export default AssetAssignmentModal;
