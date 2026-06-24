import { Modal } from 'antd';

const VideoPreview = ({ visible, file, onCancel }) => {
    if (!file || !file.filePath) return null;

    const fileUrl = `${process.env.REACT_APP_UPLOAD_URL}/${file.filePath}`;
    const ext = file.filePath.split('.').pop().toLowerCase();

    return (
        <Modal
            visible={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
            centered
            bodyStyle={{ textAlign: 'center' }}
        >
            <video controls style={{ width: '100%', maxHeight: '80vh' }} autoPlay>
                <source src={fileUrl} type={`video/${ext}`} />
                Trình duyệt không hỗ trợ video.
            </video>
        </Modal>
    );
};

export default VideoPreview;
