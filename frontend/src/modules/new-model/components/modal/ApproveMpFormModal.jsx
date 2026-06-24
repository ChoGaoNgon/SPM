import { UploadOutlined } from '@ant-design/icons';
import { Button, Form, Modal, Upload } from 'antd';
import TextArea from 'antd/es/input/TextArea';

const ApproveMpFormModal = ({ open, onCancel, productCode, initialValues, onSuccess }) => {
    const handleOk = () => {
        if (onSuccess) onSuccess();
        onCancel();
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            title={`Phê duyệt sản phẩm MP - ${productCode}`}
            onOk={handleOk}
            okText="Phê duyệt"
            cancelText="Hủy"
        >
            <Form layout="vertical" name="approveMpForm" autoComplete="off">
                <Form.Item name="remark" label="Ghi chú">
                    <TextArea style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="remark" label="Ghi chú">
                    <Upload
                        multiple
                        listType="picture"
                        beforeUpload={() => false}
                        accept=".png,.jpg,.jpeg,.gif,.bmp,.mp4,.webm,.ogg"
                    >
                        <Button type="default" icon={<UploadOutlined />}>
                            Tải lên ảnh / video
                        </Button>
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ApproveMpFormModal;
