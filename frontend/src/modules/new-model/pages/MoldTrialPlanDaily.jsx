import { Button, Checkbox, DatePicker, Input, message, Modal, Select, Space, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { Bell, ExternalLink, Mails } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import renderTag from '~/components/RenderTag';
import mailAddressService from '~/modules/mail/services/mailAddressService';
import { renderApprovedStatusTag } from '~/utils/renderTag';
import productMoldTrialPlanService from '../services/productPlanService';

const MoldTrialPlanDaily = () => {
    const [moldTrialPlan, setMoldTrialPlan] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [notifyLoading, setNotifyLoading] = useState(false);
    const [ccVisible, setCcVisible] = useState(false);
    const [bccVisible, setBccVisible] = useState(false);

    const [mails, setMails] = useState([]);
    const [openMailModal, setOpenMailModal] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const dateParam = searchParams.get('date');

    useEffect(() => {
        if (dateParam) {
            setSelectedDate(dayjs(dateParam));
        }
    }, [dateParam]);

    const [toIds, setToIds] = useState([]);
    const [ccIds, setCcIds] = useState([]);
    const [bccIds, setBccIds] = useState([]);
    const [emailTitle, setEmailTitle] = useState('');
    const [emailContent, setEmailContent] = useState(
        `Kính gửi quý đồng nghiệp,\n\nĐây là thông báo về kế hoạch thử khuôn cho ngày ${selectedDate.format(
            'DD/MM/YYYY',
        )}.\n\nVui lòng kiểm tra chi tiết trong hệ thống quản lý sản phẩm.\n\nTrân trọng.`,
    );

    const isCcShown = ccVisible || ccIds.length > 0;
    const isBccShown = bccVisible || bccIds.length > 0;

    useEffect(() => {
        const fetchMoldTrialPlan = async () => {
            setLoading(true);
            try {
                const date = selectedDate.format('YYYY-MM-DD');
                const data = await productMoldTrialPlanService.search(date, 'MOLD_TRIAL');
                setMoldTrialPlan(data);
            } catch (error) {
                message.error(error?.message || 'Lỗi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        const fetchMails = async () => {
            try {
                const data = await mailAddressService.getAllActiveMailAddresses();
                setMails(data);
            } catch {
                message.error('Không tải được danh sách mail');
            }
        };

        fetchMails();
        fetchMoldTrialPlan();
    }, [selectedDate]);

    const getMailType = (id) => {
        if (toIds.includes(id)) return 'TO';
        if (ccIds.includes(id)) return 'CC';
        if (bccIds.includes(id)) return 'BCC';
        return null;
    };

    const setToExclusive = (ids) => {
        const unique = [...new Set(ids)];
        setToIds(unique);
        setCcIds((p) => p.filter((id) => !unique.includes(id)));
        setBccIds((p) => p.filter((id) => !unique.includes(id)));
    };

    const setCcExclusive = (ids) => {
        const unique = [...new Set(ids)];
        setCcIds(unique);
        setToIds((p) => p.filter((id) => !unique.includes(id)));
        setBccIds((p) => p.filter((id) => !unique.includes(id)));
    };

    const setBccExclusive = (ids) => {
        const unique = [...new Set(ids)];
        setBccIds(unique);
        setToIds((p) => p.filter((id) => !unique.includes(id)));
        setCcIds((p) => p.filter((id) => !unique.includes(id)));
    };

    const mailOptions = useMemo(
        () =>
            mails.map((m) => ({
                label: `${m.displayName} (${m.email})`,
                value: m.id,
            })),
        [mails],
    );

    const mailTableData = useMemo(
        () =>
            mails.map((m) => ({
                key: m.id,
                ...m,
            })),
        [mails],
    );

    const departmentFilters = useMemo(
        () =>
            [...new Map(mails.map((m) => [m.departmentId, m.departmentName]))].map(([id, name]) => ({
                text: name,
                value: id,
            })),
        [mails],
    );

    const handleSendNotifications = async () => {
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

        setNotifyLoading(true);
        try {
            await productMoldTrialPlanService.sendMoldTrialPlanMail({
                date: selectedDate.format('YYYY-MM-DD'),
                to: toIds,
                cc: ccIds,
                bcc: bccIds,
                title: emailTitle,
                content: emailContent,
            });

            message.success('Gửi mail thành công');
            setOpenMailModal(false);
            setToIds([]);
            setCcIds([]);
            setBccIds([]);
            setEmailTitle('');
            setEmailContent('');
        } catch (error) {
            message.error(error?.message || 'Gửi mail thất bại');
        } finally {
            setNotifyLoading(false);
        }
    };

    const getStatusTag = (status) => {
        const statusConfig = {
            PLANNED: { color: 'blue', text: 'Đã lên kế hoạch' },
            WAITTINGAPPROVALRESIN: { color: 'gold', text: 'Chờ duyệt vật liệu' },
            WAITTINGAPPROVALPLAN: { color: 'gold', text: 'Chờ duyệt kế hoạch' },
            IN_PROGRESS: { color: 'processing', text: 'Đang thực hiện' },
            COMPLETED: { color: 'success', text: 'Hoàn thành' },
            CANCELLED: { color: 'error', text: 'Đã hủy' },
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const columns = [
        {
            title: 'STT',
            width: 60,
            align: 'center',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Tên Trial',
            dataIndex: 'trialName',
            width: 120,
            render: (text, record) => (
                <a
                    href={`/product-manager/models/${record.modelId}/products/${record.productId}/plan/${record.trialId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-sky-700 truncate block hover:underline cursor-pointer "
                >
                    {text}
                    <ExternalLink size={14} className="flex-shrink-0" />
                </a>
            ),
        },
        {
            title: 'Mã Model',
            dataIndex: 'modelCode',
            width: 120,
            render: (text, record) => (
                <a
                    href={`/product-manager/models/${record.modelId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-sky-700 truncate block hover:underline cursor-pointer "
                >
                    {text}
                    <ExternalLink size={14} className="flex-shrink-0" />
                </a>
            ),
        },
        {
            title: 'Mã Sản phẩm',
            dataIndex: 'productCode',
            width: 150,
            render: (text, record) => (
                <a
                    href={`/product-manager/models/${record.modelId}/products/${record.productId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-sky-700 truncate block hover:underline cursor-pointer "
                >
                    {text}
                    <ExternalLink size={14} className="flex-shrink-0" />
                </a>
            ),
        },
        { title: 'Mã Khuôn', dataIndex: 'moldCode', width: 120, render: (text) => text || 'Không có' },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 150,
            align: 'center',
            render: (status) => renderApprovedStatusTag(status),
        },
    ];

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

    const handleShowCc = () => {
        setCcVisible(true);
    };

    const handleShowBcc = () => {
        setBccVisible(true);
    };

    const handleCcBlur = () => {
        if (ccIds.length === 0) {
            setCcVisible(false);
        }
    };

    const handleBccBlur = () => {
        if (bccIds.length === 0) {
            setBccVisible(false);
        }
    };

    return (
        <>
            <div className="flex justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Bell size={26} className="text-blue-600" />
                    <h1 className="text-2xl font-bold">Danh sách thử khuôn ngày</h1>
                    <DatePicker
                        value={selectedDate}
                        onChange={(v) => setSelectedDate(v || dayjs())}
                        allowClear={false}
                    />
                </div>

                <Space>
                    <Button
                        className="bg-[#ea4335] text-white"
                        icon={<Mails size={16} />}
                        onClick={() => setOpenMailModal(true)}
                    >
                        Gửi thông báo
                    </Button>
                </Space>
            </div>

            <Table rowKey="trialId" loading={loading} columns={columns} dataSource={moldTrialPlan} bordered />

            <Modal
                title="Chọn email nhận thông báo"
                open={openMailModal}
                onCancel={() => setOpenMailModal(false)}
                onOk={handleSendNotifications}
                okText="Gửi mail"
                confirmLoading={notifyLoading}
                width={900}
                style={{ top: 20 }}
                bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
            >
                <Space direction="vertical" style={{ width: '100%', marginTop: 12 }}>
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
                        />

                        <div className="flex flex-col text-blue-600 cursor-pointer select-none">
                            <span onClick={handleShowCc}>CC</span>
                            <span onClick={handleShowBcc}>BCC</span>
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
                                onBlur={handleCcBlur}
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
                                onBlur={handleBccBlur}
                                optionFilterProp="label"
                                tagRender={renderTag('red')}
                                style={{ flex: 1 }}
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <b className="w-10 text-right">Tiêu đề:</b>
                        <Input
                            placeholder="Tiêu đề"
                            value={emailTitle}
                            onChange={(e) => setEmailTitle(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <b className="w-10 text-right">Nội dung:</b>
                        <Input.TextArea
                            value={emailContent}
                            onChange={(e) => setEmailContent(e.target.value)}
                            rows={6}
                        />
                    </div>
                </Space>

                <Table
                    size="small"
                    rowKey="id"
                    columns={mailColumns}
                    dataSource={mailTableData}
                    pagination={false}
                    scroll={{ y: 300 }}
                    style={{ marginTop: 12 }}
                />
            </Modal>
        </>
    );
};

export default MoldTrialPlanDaily;
