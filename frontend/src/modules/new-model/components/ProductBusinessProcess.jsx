import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    LoadingOutlined,
    ShopOutlined,
    SmileOutlined,
    SolutionOutlined,
    UserOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import { Col, message, Row, Tag, theme, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '~/contexts/ThemeContext';
import { useIsMobile } from '~/hook/useIsMobile';
import productService from '../services/productService';

const StepDetail = ({ item, isDarkMode }) => (
    <div
        style={{
            background: isDarkMode ? '#2a2a2a' : '#fafafa',
            borderRadius: 8,
            padding: 16,
            marginBottom: 12,
            border: `1px solid ${isDarkMode ? '#404040' : '#e8e8e8'}`,
            transition: 'all 0.3s ease',
            cursor: 'pointer',
        }}
        className="step-item"
    >
        <Row gutter={12} align="middle">
            <Col flex="auto">
                <div
                    style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: isDarkMode ? '#fff' : '#333',
                        marginBottom: 4,
                    }}
                >
                    {item.stepName}
                </div>
                <div
                    style={{
                        fontSize: 12,
                        color: isDarkMode ? '#bbb' : '#666',
                        opacity: 0.8,
                    }}
                >
                    👤 {item.responsibleBy || 'Chưa phân công'}
                </div>
            </Col>
            <Col>
                <Tag
                    style={{
                        borderRadius: 16,
                        padding: '4px 12px',
                        fontWeight: 500,
                        fontSize: 11,
                    }}
                    color={
                        item.result === 'DELAYED' || item.result === 'NG' || item.result === 'Bị từ chối'
                            ? 'error'
                            : item.result === 'OK' || item.result === 'Đã xử lý' || item.result === 'Đã phê duyệt'
                              ? 'success'
                              : item.result === 'PLANNED' || item.result === 'Chưa xử lý' || item.result === 'NGA'
                                ? 'gold'
                                : 'default'
                    }
                >
                    {item.result}
                </Tag>
            </Col>
        </Row>
        {item.remark && (
            <div
                style={{
                    marginTop: 12,
                    padding: '8px 12px',
                    background: isDarkMode ? '#333' : '#f0f0f0',
                    borderRadius: 6,
                    borderLeft: `3px solid ${isDarkMode ? '#555' : '#d9d9d9'}`,
                    fontSize: 12,
                    color: isDarkMode ? '#ccc' : '#666',
                }}
            >
                <b>💬 Ghi chú:</b> {item.remark}
            </div>
        )}
    </div>
);

const statusMeta = {
    PLANNED: { color: 'warning', text: 'PLANNED', icon: <UserOutlined /> },
    RUNNING: { color: 'processing', text: 'RUNNING', icon: <LoadingOutlined /> },
    CANCELLED: { color: 'default', text: 'CANCELLED', icon: <WarningOutlined /> },
    DELAYED: { color: 'error', text: 'DELAYED', icon: <WarningOutlined /> },
    COMPLETED: { color: 'success', text: 'COMPLETED', icon: <SmileOutlined /> },
    APPROVED: { color: 'success', text: 'Đã duyệt', icon: <CheckCircleOutlined /> },
    REJECTED: { color: 'error', text: 'Từ chối', icon: <CloseCircleOutlined /> },
    PENDING: { color: 'default', text: 'Chờ duyệt', icon: <ClockCircleOutlined /> },
};

const ProductBusinessProcess = ({ productId }) => {
    const { token } = theme.useToken();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [progress, setProgress] = useState([]);
    const scrollContainerRef = React.useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const themeCtx = useTheme();

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const data = await productService.getProductStatisticsByProgress(productId);
                setProgress(data);
            } catch (error) {
                message.error(error);
            }
        };
        fetchProgress();
    }, []);

    const handleMouseDown = (e) => {
        if (isMobile) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
        document.body.style.userSelect = 'none';
    };

    const handleMouseMove = React.useCallback(
        (e) => {
            if (!isDragging || isMobile) return;
            e.preventDefault();
            const x = e.pageX - scrollContainerRef.current.offsetLeft;
            const walk = (x - startX) * 1.5;
            scrollContainerRef.current.scrollLeft = scrollLeft - walk;
        },
        [isDragging, isMobile, startX, scrollLeft],
    );

    const handleMouseUp = () => {
        if (!isDragging || isMobile) return;
        setIsDragging(false);
        document.body.style.userSelect = '';
    };

    const handleMouseLeave = () => {
        if (isDragging) {
            setIsDragging(false);
            document.body.style.userSelect = '';
        }
    };

    const handleStageClick = (url, e) => {
        if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        window.open(url, '_blank');
    };

    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                document.body.style.userSelect = '';
            }
        };

        if (isDragging) {
            document.addEventListener('mouseup', handleGlobalMouseUp);
            document.addEventListener('mouseleave', handleGlobalMouseUp);
        }

        return () => {
            document.removeEventListener('mouseup', handleGlobalMouseUp);
            document.removeEventListener('mouseleave', handleGlobalMouseUp);
            document.body.style.userSelect = '';
        };
    }, [isDragging]);

    if (progress.length === 0) {
        return (
            <div style={{ padding: 16, textAlign: 'center', color: token.colorTextSecondary }}>
                Không có dữ liệu tiến độ sản phẩm.
            </div>
        );
    }

    return (
        <div style={{ padding: isMobile ? 12 : 24 }}>
            {!isMobile && progress.length > 2 && (
                <div
                    style={{
                        textAlign: 'center',
                        marginBottom: 16,
                        fontSize: 13,
                        color: token.colorTextSecondary,
                        opacity: 0.8,
                    }}
                >
                    💡 Kéo để cuộn xem các giai đoạn
                </div>
            )}
            <style>
                {`
                .step-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                
                .stage-card {
                    background: ${themeCtx.isDarkMode ? '#1a1a1a' : 'white'};
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                    border: 1px solid ${themeCtx.isDarkMode ? '#333' : '#e8e8e8'};
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    transition: all 0.3s ease;
                    position: relative;
                    z-index: 2;
                    pointer-events: auto;
                }
                
                .stage-card:hover {
                    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                    transform: translateY(-2px);
                }
                
                .stage-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid ${themeCtx.isDarkMode ? '#333' : '#f0f0f0'};
                    user-select: none;
                }
                
                .stage-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 12px;
                    font-size: 18px;
                }
                
                .stage-number {
                    position: absolute;
                    top: -10px;
                    left: -10px;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 14px;
                    color: white;
                    z-index: 5;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                }
                
                .process-timeline {
                    position: relative;
                }
                
                .scroll-container {
                    user-select: none;
                }
                
                .scroll-container.dragging {
                    cursor: grabbing !important;
                }
                
                .scroll-container.dragging * {
                    pointer-events: none;
                }
                
                .scroll-container.dragging .stage-card .ant-tag {
                    pointer-events: auto;
                }
                
                ${
                    !isMobile
                        ? `
                .process-timeline > div:first-child::-webkit-scrollbar {
                    height: 6px;
                }
                
                .process-timeline > div:first-child::-webkit-scrollbar-track {
                    background: ${themeCtx.isDarkMode ? '#2a2a2a' : '#f1f1f1'};
                    border-radius: 6px;
                }
                
                .process-timeline > div:first-child::-webkit-scrollbar-thumb {
                    background: ${themeCtx.isDarkMode ? '#555' : '#c1c1c1'};
                    border-radius: 6px;
                }
                
                .process-timeline > div:first-child::-webkit-scrollbar-thumb:hover {
                    background: ${themeCtx.isDarkMode ? '#666' : '#a1a1a1'};
                }
                `
                        : `
                .process-timeline::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 15px;
                    width: 2px;
                    background: linear-gradient(180deg, ${themeCtx.isDarkMode ? '#333' : '#e8e8e8'} 0%, ${themeCtx.isDarkMode ? '#333' : '#e8e8e8'} 100%);
                    z-index: 0;
                    pointer-events: none;
                }
                `
                }
                
                @media (max-width: 768px) {
                    .stage-card {
                        padding: 16px;
                        margin-bottom: 32px;
                        margin-left: 20px;
                    }
                }
                `}
            </style>

            <div className="process-timeline">
                {isMobile ? (
                    <div>
                        {progress.map((stage, idx) => {
                            const meta = statusMeta[stage.status] || statusMeta.PLANNED;

                            let icon = meta.icon;
                            if (stage.stageName && stage.stageName.trim().toUpperCase().startsWith('T')) {
                                icon = <SolutionOutlined />;
                            } else if ((stage.stageName || '').toLowerCase().includes('event')) {
                                icon = <CalendarOutlined />;
                            } else if ((stage.stageName || '').toUpperCase().trim() === 'MP') {
                                icon = <ShopOutlined />;
                            }

                            const iconColor =
                                meta.text === 'CANCELLED'
                                    ? token.colorTextDisabled
                                    : meta.text === 'RUNNING'
                                      ? token.colorPrimary
                                      : meta.text === 'DELAYED'
                                        ? token.colorError
                                        : meta.text === 'COMPLETED'
                                          ? token.colorSuccess
                                          : token.colorWarning;

                            return (
                                <div key={stage.stageName + idx} className="stage-card">
                                    <div className="stage-number" style={{ background: iconColor }}>
                                        {idx + 1}
                                    </div>

                                    <div className="stage-header">
                                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                            <div
                                                className="stage-icon"
                                                style={{
                                                    background: `${iconColor}20`,
                                                    color: iconColor,
                                                }}
                                            >
                                                {icon}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h3
                                                    style={{
                                                        margin: 0,
                                                        fontSize: 16,
                                                        fontWeight: 600,
                                                        color: themeCtx.isDarkMode ? '#fff' : '#333',
                                                    }}
                                                >
                                                    {stage.stageName}
                                                </h3>
                                            </div>
                                        </div>

                                        <Tooltip title="Xem chi tiết">
                                            <Tag
                                                style={{
                                                    borderRadius: 20,
                                                    padding: '6px 16px',
                                                    fontWeight: 600,
                                                    fontSize: 12,
                                                    cursor: 'pointer',
                                                    border: 'none',
                                                    background: iconColor,
                                                    color: 'white',
                                                }}
                                                onClick={(e) => handleStageClick(stage.url, e)}
                                            >
                                                {meta.text}
                                            </Tag>
                                        </Tooltip>
                                    </div>

                                    <div>
                                        {stage.steps && stage.steps.length > 0 ? (
                                            stage.steps.map((step, i) => (
                                                <StepDetail key={i} item={step} isDarkMode={themeCtx.isDarkMode} />
                                            ))
                                        ) : (
                                            <div
                                                style={{
                                                    textAlign: 'center',
                                                    color: token.colorTextSecondary,
                                                    padding: '32px 0',
                                                    fontSize: 13,
                                                }}
                                            >
                                                📋 Chưa có bước thực hiện nào
                                            </div>
                                        )}
                                    </div>

                                    {idx < progress.length - 1 && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                bottom: '-20px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                color: iconColor,
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                                zIndex: 1,
                                                background: themeCtx.isDarkMode ? '#1a1a1a' : 'white',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: `0 2px 8px rgba(0,0,0,0.1)`,
                                                border: `2px solid ${themeCtx.isDarkMode ? '#1a1a1a' : 'white'}`,
                                            }}
                                        >
                                            ↓
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div
                        ref={scrollContainerRef}
                        className={`scroll-container ${isDragging ? 'dragging' : ''}`}
                        style={{
                            overflowX: 'auto',
                            overflowY: 'visible',
                            paddingBottom: 16,
                            scrollbarWidth: 'thin',
                            scrollBehavior: isDragging ? 'auto' : 'smooth',
                            cursor: isDragging ? 'grabbing' : 'grab',
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div
                            style={{
                                display: 'flex',
                                gap: 32,
                                minWidth: 'fit-content',
                                position: 'relative',
                                paddingTop: 20,
                                paddingBottom: 20,
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '72px',
                                    left: '32px',
                                    right: '32px',
                                    height: '2px',
                                    background: `linear-gradient(90deg, ${themeCtx.isDarkMode ? '#333' : '#e8e8e8'} 0%, ${themeCtx.isDarkMode ? '#333' : '#e8e8e8'} 100%)`,
                                    zIndex: 0,
                                    pointerEvents: 'none',
                                }}
                            />

                            {progress.map((stage, idx) => {
                                const meta = statusMeta[stage.status] || statusMeta.PLANNED;

                                let icon = meta.icon;
                                if (stage.stageName && stage.stageName.trim().toUpperCase().startsWith('T')) {
                                    icon = <SolutionOutlined />;
                                } else if ((stage.stageName || '').toLowerCase().includes('event')) {
                                    icon = <CalendarOutlined />;
                                } else if ((stage.stageName || '').toUpperCase().trim() === 'MP') {
                                    icon = <ShopOutlined />;
                                }

                                const iconColor =
                                    meta.text === 'CANCELLED'
                                        ? token.colorTextDisabled
                                        : meta.text === 'RUNNING'
                                          ? token.colorPrimary
                                          : meta.text === 'DELAYED'
                                            ? token.colorError
                                            : meta.text === 'COMPLETED'
                                              ? token.colorSuccess
                                              : token.colorWarning;

                                return (
                                    <div
                                        key={stage.stageName + idx}
                                        style={{
                                            minWidth: '320px',
                                            maxWidth: '320px',
                                            position: 'relative',
                                        }}
                                    >
                                        <div className="stage-card" style={{ marginBottom: 0 }}>
                                            <div className="stage-number" style={{ background: iconColor }}>
                                                {idx + 1}
                                            </div>

                                            <div
                                                className="stage-header"
                                                onMouseDown={handleMouseDown}
                                                onMouseMove={handleMouseMove}
                                                onMouseUp={handleMouseUp}
                                                onMouseLeave={handleMouseLeave}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                                    <div
                                                        className="stage-icon"
                                                        style={{
                                                            background: `${iconColor}20`,
                                                            color: iconColor,
                                                        }}
                                                    >
                                                        {icon}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <h3
                                                            style={{
                                                                margin: 0,
                                                                fontSize: 16,
                                                                fontWeight: 600,
                                                                color: themeCtx.isDarkMode ? '#fff' : '#333',
                                                            }}
                                                        >
                                                            {stage.stageName}
                                                        </h3>
                                                    </div>
                                                </div>

                                                <Tooltip title="Xem chi tiết">
                                                    <Tag
                                                        style={{
                                                            borderRadius: 20,
                                                            padding: '6px 16px',
                                                            fontWeight: 600,
                                                            fontSize: 12,
                                                            cursor: 'pointer',
                                                            border: 'none',
                                                            background: iconColor,
                                                            color: 'white',
                                                        }}
                                                        onClick={(e) => handleStageClick(stage.url, e)}
                                                    >
                                                        {meta.text}
                                                    </Tag>
                                                </Tooltip>
                                            </div>

                                            <div style={{ minHeight: 120 }}>
                                                {stage.steps && stage.steps.length > 0 ? (
                                                    stage.steps.map((step, i) => (
                                                        <StepDetail
                                                            key={i}
                                                            item={step}
                                                            isDarkMode={themeCtx.isDarkMode}
                                                        />
                                                    ))
                                                ) : (
                                                    <div
                                                        style={{
                                                            textAlign: 'center',
                                                            color: token.colorTextSecondary,
                                                            padding: '32px 0',
                                                            fontSize: 13,
                                                        }}
                                                    >
                                                        📋 Chưa có bước thực hiện nào
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {idx < progress.length - 1 && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '60px',
                                                    right: '-16px',
                                                    color: iconColor,
                                                    fontSize: '20px',
                                                    fontWeight: 'bold',
                                                    zIndex: 1,
                                                    background: themeCtx.isDarkMode ? '#1a1a1a' : 'white',
                                                    borderRadius: '50%',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: `0 2px 8px rgba(0,0,0,0.1)`,
                                                    border: `2px solid ${themeCtx.isDarkMode ? '#1a1a1a' : 'white'}`,
                                                }}
                                            >
                                                →
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductBusinessProcess;
