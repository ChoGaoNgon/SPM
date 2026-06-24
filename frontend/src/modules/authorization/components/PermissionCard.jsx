import React from "react";
import { Card, Row, Col, Checkbox, Tooltip } from "antd";

export default function PermissionCard({ permissions, checkedList, onToggle }) {
    return (
        <div>
            <Row gutter={[16, 16]}>
                {permissions.map((perm) => (
                    <Col span={12} key={perm.code}>
                        <Tooltip title={perm.code}>
                            <Checkbox
                                checked={checkedList.includes(perm.code)}
                                onChange={() => onToggle(perm.code)}
                            >
                                {perm.description}
                            </Checkbox>
                        </Tooltip>
                    </Col>
                ))}
            </Row>
        </div>
    );
}
