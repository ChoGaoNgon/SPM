import React from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';

const VideoThumbnail = ({ file, onClick }) => {
    if (!file || !file.filePath) return null;

    const ext = file.filePath.split('.').pop().toLowerCase();
    const url = `${process.env.REACT_APP_UPLOAD_URL}/${file.filePath}`;

    return (
        <div
            onClick={onClick}
            style={{
                display: 'inline-block',
                position: 'relative',
                padding: 5,
                cursor: 'pointer',
            }}
        >
            <video height={70} style={{ display: 'block' }}>
                <source src={url} type={`video/${ext}`} />
            </video>

            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    fontSize: 28,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                }}
                className="video-overlay"
            >
                <PlayCircleOutlined />
            </div>

            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                }}
                onMouseEnter={(e) => (e.currentTarget.previousSibling.style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.previousSibling.style.opacity = 0)}
            />
        </div>
    );
};

export default VideoThumbnail;
