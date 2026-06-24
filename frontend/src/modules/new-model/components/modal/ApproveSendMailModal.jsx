import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Select, Space, Checkbox, Input, Table, message } from 'antd';
import PropTypes from 'prop-types';
import mailAddressService from '~/modules/mail/services/mailAddressService';
import modelService from '../../services/modelService';
import renderTag from '~/components/RenderTag';

const { TextArea } = Input;

const ApproveSendMailModal = ({ open, onCancel, modelId, modelCode, onSuccess }) => {
    const [mails, setMails] = useState([]);
    const [toIds, setToIds] = useState([]);
    const [ccIds, setCcIds] = useState([]);
    const [bccIds, setBccIds] = useState([]);
    const [emailTitle, setEmailTitle] = useState('');
    const [emailContent, setEmailContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [ccVisible, setCcVisible] = useState(false);
    const [bccVisible, setBccVisible] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        setLoading(true);
        mailAddressService
            .getAllActiveMailAddresses()
            .then((data) => {
                setMails(data || []);
            })
            .catch(() => {
                message.error('Không tải được danh sách email');
            })
            .finally(() => setLoading(false));

        setToIds([]);
        setCcIds([]);
        setBccIds([]);
        setCcVisible(false);
        setBccVisible(false);
        setEmailTitle(`Thông báo Model mới ${modelCode} `);
        setEmailContent(
            `Kính gửi quý đồng nghiệp,\n\nTất cả sản phẩm thuộc Model ${modelCode} đã được phê duyệt. Vui lòng kiểm tra chi tiết tại hệ thống quản lý sản phẩm.\n\nTrân trọng.`,
        );
    }, [open, modelCode]);

    const mailOptions = useMemo(
        () =>
            mails.map((m) => ({
                label: `${m.displayName} (${m.email})`,
                value: m.id,
            })),
        [mails],
    );

    const mailTableData = useMemo(() => mails.map((m) => ({ key: m.id, ...m })), [mails]);

    const departmentFilters = useMemo(
        () =>
            [...new Map(mails.map((m) => [m.departmentId, m.departmentName]))].map(([id, name]) => ({
                text: name,
                value: id,
            })),
        [mails],
    );

    const getMailType = (id) => {
        if (toIds.includes(id)) return 'TO';
        if (ccIds.includes(id)) return 'CC';
        if (bccIds.includes(id)) return 'BCC';
        return null;
    };

    const setToExclusive = (ids) => {
        const unique = [...new Set(ids)];
        setToIds(unique);
        setCcIds((prev) => prev.filter((id) => !unique.includes(id)));
        setBccIds((prev) => prev.filter((id) => !unique.includes(id)));
    };

    const setCcExclusive = (ids) => {
        const unique = [...new Set(ids)];
        setCcIds(unique);
        setToIds((prev) => prev.filter((id) => !unique.includes(id)));
        setBccIds((prev) => prev.filter((id) => !unique.includes(id)));
    };

    const setBccExclusive = (ids) => {
        const unique = [...new Set(ids)];
        setBccIds(unique);
        setToIds((prev) => prev.filter((id) => !unique.includes(id)));
        setCcIds((prev) => prev.filter((id) => !unique.includes(id)));
    };

    const handleSend = async () => {
        if (toIds.length === 0) {
            message.warning('Phải chọn ít nhất 1 email To');
            return;
        }

        if (!emailTitle.trim()) {
            message.warning('Vui lòng nhập tiêu đề email');
            return;
        }

        if (!emailContent.trim()) {
            message.warning('Vui lòng nhập nội dung email');
            return;
        }

        setSending(true);
        try {
            await modelService.approveAndSendMail({
                modelId,
                to: toIds,
                cc: ccIds,
                bcc: bccIds,
                title: emailTitle,
                content: emailContent,
            });
            message.success('Phê duyệt và gửi mail thành công');
            onCancel();
            onSuccess?.();
        } catch (error) {
            message.error(error?.message || 'Phê duyệt và gửi mail thất bại');
        } finally {
            setSending(false);
        }
    };

    const mailColumns = [
        {
            title: 'Gửi',
            width: 180,
            align: 'center',
            render: (_, record) => {
                const type = getMailType(record.id);
                return (
                    <Space>
                        <Checkbox
                            checked={type === 'TO'}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setToExclusive([...toIds, record.id]);
                                } else {
                                    setToExclusive(toIds.filter((x) => x !== record.id));
                                }
                            }}
                        >
                            To
                        </Checkbox>
                        <Checkbox
                            checked={type === 'CC'}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setCcExclusive([...ccIds, record.id]);
                                    setCcVisible(true);
                                } else {
                                    const next = ccIds.filter((x) => x !== record.id);
                                    setCcExclusive(next);
                                    if (next.length === 0) {
                                        setCcVisible(false);
                                    }
                                }
                            }}
                        >
                            CC
                        </Checkbox>
                        <Checkbox
                            checked={type === 'BCC'}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setBccExclusive([...bccIds, record.id]);
                                    setBccVisible(true);
                                } else {
                                    const next = bccIds.filter((x) => x !== record.id);
                                    setBccExclusive(next);
                                    if (next.length === 0) {
                                        setBccVisible(false);
                                    }
                                }
                            }}
                        >
                            BCC
                        </Checkbox>
                    </Space>
                );
            },
        },
        {
            title: 'Phòng ban',
            dataIndex: 'departmentName',
            filters: departmentFilters,
            onFilter: (value, record) => record.departmentId === value,
        },
        { title: 'Tên', dataIndex: 'displayName' },
        { title: 'Email', dataIndex: 'email' },
    ];

    return (
        <Modal
            title="Phê duyệt tất cả sản phẩm và gửi mail"
            open={open}
            onCancel={onCancel}
            onOk={handleSend}
            okText="Gửi mail"
            confirmLoading={sending}
            width={900}
            style={{ top: 20 }}
            bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div className="flex items-center gap-3">
                    <b className="w-10 text-right">To:</b>
                    <Select
                        mode="multiple"
                        showSearch
                        placeholder="Chọn email To"
                        options={mailOptions}
                        value={toIds}
                        onChange={setToExclusive}
                        optionFilterProp="label"
                        tagRender={renderTag('blue')}
                        style={{ flex: 1 }}
                        loading={loading}
                    />
                    <div className="flex flex-col text-blue-600 cursor-pointer select-none">
                        <span onClick={() => setCcVisible(true)}>CC</span>
                        <span onClick={() => setBccVisible(true)}>BCC</span>
                    </div>
                </div>

                {ccVisible && (
                    <div className="flex items-center gap-3">
                        <b className="w-10 text-right">CC:</b>
                        <Select
                            mode="multiple"
                            showSearch
                            autoFocus
                            placeholder="Chọn email CC"
                            options={mailOptions}
                            value={ccIds}
                            onChange={setCcExclusive}
                            optionFilterProp="label"
                            tagRender={renderTag('orange')}
                            style={{ flex: 1 }}
                        />
                    </div>
                )}

                {bccVisible && (
                    <div className="flex items-center gap-3">
                        <b className="w-10 text-right">BCC:</b>
                        <Select
                            mode="multiple"
                            showSearch
                            autoFocus
                            placeholder="Chọn email BCC"
                            options={mailOptions}
                            value={bccIds}
                            onChange={setBccExclusive}
                            optionFilterProp="label"
                            tagRender={renderTag('red')}
                            style={{ flex: 1 }}
                        />
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <b className="w-10 text-right">Tiêu đề:</b>
                    <Input value={emailTitle} onChange={(e) => setEmailTitle(e.target.value)} />
                </div>

                <div className="flex items-start gap-3">
                    <b className="w-10 text-right">Nội dung:</b>
                    <TextArea value={emailContent} onChange={(e) => setEmailContent(e.target.value)} rows={6} />
                </div>

                <Table
                    size="small"
                    rowKey="id"
                    columns={mailColumns}
                    dataSource={mailTableData}
                    pagination={false}
                    scroll={{ y: 260 }}
                />
            </Space>
        </Modal>
    );
};

ApproveSendMailModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    modelId: PropTypes.number.isRequired,
    modelCode: PropTypes.string,
    onSuccess: PropTypes.func,
};

ApproveSendMailModal.defaultProps = {
    modelCode: '',
    onSuccess: null,
};

export default ApproveSendMailModal;
