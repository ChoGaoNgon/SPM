import React from "react";
import { Card, Tooltip } from "antd";

const CustomTooltip = ({ task }) => {
    return (
        <Card
            title={
                <Tooltip title={task.name}>
                    <div
                        style={{
                            whiteSpace: "normal",   
                            wordBreak: "break-word", 
                            fontWeight: "bold"
                        }}
                    >
                        {task.name}
                    </div>
                </Tooltip>
            }
            size="small"
            style={{ maxWidth: 400 }}
        >
            <p><strong>Nhân viên:</strong> {task.project}</p>
            <p>
                <strong>Thời gian:</strong>{" "}
                {task.start.toLocaleString()} → {task.end.toLocaleString()}
            </p>

            {task.filePath && (
                <img
                    src={`${process.env.REACT_APP_UPLOAD_URL}/${task.filePath}`}
                    alt="Ảnh công việc"
                    style={{
                        marginTop: 8,
                        maxHeight: 300,
                        width: "100%",
                        objectFit: "contain",
                        borderRadius: 4
                    }}
                />
            )}
        </Card>
    );
};

export default CustomTooltip;
