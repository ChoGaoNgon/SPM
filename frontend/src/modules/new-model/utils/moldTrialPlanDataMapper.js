import dayjs from 'dayjs';
import { formatDateTime } from '~/utils/formatter';
import { renderResultTag } from '~/utils/renderTag';
import { EMPTY_PLACEHOLDER } from '../constants/constants';

const calculateTrialDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '';

    const start = dayjs(startTime);
    const end = dayjs(endTime);
    const totalMinutes = end.diff(start, 'minute');
    const totalHours = totalMinutes / 60;
    const displayHours = Math.round(totalHours * 100) / 100;

    return `${displayHours} giờ`;
};

const formatEmployeeInfo = (code, name) => {
    if (!code && !name) return EMPTY_PLACEHOLDER;
    if (!code) return name;
    if (!name) return code;
    return `${code} - ${name}`;
};

const formatRequestDateTime = (value) => {
    if (!value) return EMPTY_PLACEHOLDER;
    return dayjs(value).format('HH:mm DD/MM/YYYY');
};

const parseStructuredNote = (note) => {
    if (!note || typeof note !== 'string') {
        return null;
    }

    try {
        const parsed = JSON.parse(note);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
        return null;
    }
};

const renderNoteFooter = (noteData, fallbackNote) => {
    const noteText = noteData?.note || fallbackNote;
    const updatedBy = noteData?.updatedBy;

    if (!noteText && !updatedBy) {
        return null;
    }

    return (
        <span style={{ color: '#8c8c8c', fontSize: 12 }}>
            {updatedBy ? `${updatedBy}: ` : ''}
            {noteText}
        </span>
    );
};

const renderRequestedTimeValue = (currentTime, note) => {
    const noteData = parseStructuredNote(note);
    const previousValue = noteData?.oldValue;
    const hasStructuredChange = previousValue && previousValue !== currentTime;

    if (!hasStructuredChange && !noteData?.note) {
        return formatRequestDateTime(currentTime);
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {hasStructuredChange ? (
                    <span style={{ color: '#cf1322', textDecoration: 'line-through', fontWeight: 500 }}>
                        {formatRequestDateTime(previousValue)}
                    </span>
                ) : null}
                <span style={{ color: '#1677ff', fontWeight: 600 }}>{formatRequestDateTime(currentTime)}</span>
            </div>
            {renderNoteFooter(noteData, note?.trim())}
        </div>
    );
};

const renderRequestedMachineValue = (currentMachine, note) => {
    const noteData = parseStructuredNote(note);
    const previousValue = noteData?.oldValue;
    const hasStructuredChange = previousValue && previousValue !== currentMachine;

    if (!hasStructuredChange && !noteData?.note) {
        return currentMachine || EMPTY_PLACEHOLDER;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {hasStructuredChange ? (
                    <span style={{ color: '#cf1322', textDecoration: 'line-through', fontWeight: 500 }}>
                        {previousValue}
                    </span>
                ) : null}
                <span style={{ color: '#1677ff', fontWeight: 600 }}>{currentMachine || EMPTY_PLACEHOLDER}</span>
            </div>
            {renderNoteFooter(noteData, note?.trim())}
        </div>
    );
};

const getPlanLabels = (typePlan) => {
    const labels = {
        MOLD_TRIAL: {
            requestStartTime: 'Thời gian yêu cầu bắt đầu thử khuôn:',
            requestEndTime: 'Thời gian yêu cầu kết thúc thử khuôn:',
            requestDuration: 'Thời gian thử khuôn yêu cầu:',
            actualStartTime: 'Thời gian thực tế bắt đầu thử khuôn:',
            actualEndTime: 'Thời gian thực tế kết thúc thử khuôn:',
            actualDuration: 'Thời gian thử khuôn thực tế:',
            quantity: 'Số mẫu thử:',
            purpose: 'Mục đích thử:',
            result: 'Kết quả thử khuôn:',
        },
        EVENT: {
            requestStartTime: 'Thời gian yêu cầu bắt đầu chạy event:',
            requestEndTime: 'Thời gian yêu cầu kết thúc chạy event:',
            requestDuration: 'Thời gian chạy event yêu cầu:',
            actualStartTime: 'Ngày bắt đầu chạy event thực tế:',
            actualEndTime: 'Ngày kết thúc chạy event thực tế:',
            actualDuration: 'Thời gian chạy event thực tế:',
            quantity: 'Số lượng sản xuất:',
            purpose: 'Mục đích chạy event:',
            result: 'Kết quả chạy event:',
        },
        SECOND_PROCESS: {
            requestStartTime: 'Thời gian yêu cầu bắt đầu secondProcess:',
            requestEndTime: 'Thời gian yêu cầu kết thúc secondProcess:',
            requestDuration: 'Thời gian secondProcess yêu cầu:',
            actualStartTime: 'Thời gian thực tế bắt đầu secondProcess:',
            actualEndTime: 'Thời gian thực tế kết thúc secondProcess:',
            actualDuration: 'Thời gian secondProcess thực tế:',
            quantity: 'Số lượng gia công:',
            purpose: 'Mục đích secondProcess:',
            result: 'Kết quả secondProcess:',
        },
    };

    return labels[typePlan] || labels.MOLD_TRIAL;
};

export const mapGeneralInformation = (moldTrialPlan) => {
    if (!moldTrialPlan) return [];

    const typePlan = moldTrialPlan.typePlan || 'MOLD_TRIAL';
    const labels = getPlanLabels(typePlan);

    const fields = [
        {
            label: labels.requestStartTime,
            value: renderRequestedTimeValue(moldTrialPlan.requestStartTime, moldTrialPlan.requestStartTimeNote),
        },
        {
            label: labels.requestEndTime,
            value: renderRequestedTimeValue(moldTrialPlan.requestEndTime, moldTrialPlan.requestEndTimeNote),
        },
        {
            label: labels.requestDuration,
            value: calculateTrialDuration(moldTrialPlan.requestStartTime, moldTrialPlan.requestEndTime),
        },
        {
            label: labels.actualStartTime,
            value: moldTrialPlan.actualStartTime
                ? dayjs(moldTrialPlan.actualStartTime).format('HH:mm DD/MM/YYYY')
                : EMPTY_PLACEHOLDER,
        },
        {
            label: labels.actualEndTime,
            value: moldTrialPlan.actualEndTime
                ? dayjs(moldTrialPlan.actualEndTime).format('HH:mm DD/MM/YYYY')
                : EMPTY_PLACEHOLDER,
        },
        {
            label: labels.actualDuration,
            value:
                moldTrialPlan.actualStartTime && moldTrialPlan.actualEndTime
                    ? `${dayjs(moldTrialPlan.actualEndTime)
                          .diff(dayjs(moldTrialPlan.actualStartTime), 'hour', true)
                          .toFixed(2)} giờ`
                    : EMPTY_PLACEHOLDER,
        },
    ];

    fields.push({
        label: 'Ngày yêu cầu gửi mẫu:',
        value: moldTrialPlan?.expectedFaSubmitDate
            ? formatDateTime(moldTrialPlan?.expectedFaSubmitDate)
            : EMPTY_PLACEHOLDER,
    });

    if (typePlan === 'MOLD_TRIAL') {
        fields.push({
            label: 'Ngày gửi mẫu thực tế:',
            value: moldTrialPlan.actualFaSubmitDate
                ? dayjs(moldTrialPlan.actualFaSubmitDate).format('DD/MM/YYYY')
                : EMPTY_PLACEHOLDER,
        });
    }

    fields.push(
        {
            label: labels.quantity,
            value: moldTrialPlan?.sampleQuantity || EMPTY_PLACEHOLDER,
        },
        {
            label: 'Người chịu trách nhiệm:',
            value: formatEmployeeInfo(moldTrialPlan.responsibleEmployeeCode, moldTrialPlan.responsibleEmployeeName),
        },
        {
            label: labels.purpose,
            value: moldTrialPlan.purpose || EMPTY_PLACEHOLDER,
        },
    );

    const numberOfPeopleLabel = typePlan === 'SECOND_PROCESS' ? 'Số công nhân' : 'Số người sản xuất lấy hàng';
    fields.push({
        label: numberOfPeopleLabel,
        value: moldTrialPlan.numberOfPeople ? `${moldTrialPlan.numberOfPeople} người` : EMPTY_PLACEHOLDER,
    });

    if (typePlan !== 'SECOND_PROCESS') {
        fields.push({
            label: 'Nhà máy / Chi phí:',
            value: moldTrialPlan.costFactory || EMPTY_PLACEHOLDER,
        });
    }

    fields.push(
        {
            label: labels.result,
            value: renderResultTag(moldTrialPlan.overallApproveResult),
        },
        {
            label: 'Ghi chú:',
            value: moldTrialPlan.remark || EMPTY_PLACEHOLDER,
        },
    );

    return fields;
};

export const mapDetailInformation = (moldTrialPlan) => {
    if (!moldTrialPlan) return [];

    const typePlan = moldTrialPlan.typePlan || 'MOLD_TRIAL';

    const fields = [];

    if (typePlan !== 'SECOND_PROCESS') {
        fields.push(
            {
                label: 'Mã máy:',
                value: renderRequestedMachineValue(
                    moldTrialPlan.machineCode || EMPTY_PLACEHOLDER,
                    moldTrialPlan.requestMachineNote,
                ),
                span: 2,
            },
            { label: 'Vị trí máy:', value: moldTrialPlan.machinePosition || EMPTY_PLACEHOLDER },
            { label: 'Số máy thử yêu cầu:', value: moldTrialPlan.machineNo || EMPTY_PLACEHOLDER },
            { label: 'Công suất máy:', value: moldTrialPlan.machineCapacityTon || EMPTY_PLACEHOLDER },
            { label: 'Công đoạn:', value: moldTrialPlan.processStep || EMPTY_PLACEHOLDER },
        );
    } else {
        fields.push({ label: 'Số lần thử:', value: moldTrialPlan.tryNo || EMPTY_PLACEHOLDER });
    }

    fields.push(
        { label: 'Máy sấy:', value: moldTrialPlan.dryer || EMPTY_PLACEHOLDER, span: 2 },

        { label: 'Nhiệt độ sấy:', value: moldTrialPlan.dryingTemperature || EMPTY_PLACEHOLDER },
        { label: 'Nhiệt độ sấy thực tế:', value: moldTrialPlan.dryingTemperatureActual || EMPTY_PLACEHOLDER },
        { label: 'Thời gian sấy:', value: moldTrialPlan.dryingTime || EMPTY_PLACEHOLDER },
        { label: 'Thời gian sấy thực tế:', value: moldTrialPlan.dryingTimeActual || EMPTY_PLACEHOLDER },
        { label: 'Nhiệt độ trục vít:', value: moldTrialPlan.screwTemperature || EMPTY_PLACEHOLDER },
        { label: 'Nhiệt độ trục vít thực tế:', value: moldTrialPlan.screwTemperatureActual || EMPTY_PLACEHOLDER },
    );

    return fields;
};

export const mapFaInspectionInformation = (faInspection) => [
    {
        label: 'Nhận mẫu từ nhân viên:',
        value: formatEmployeeInfo(faInspection?.receivedByEmployeeCode, faInspection?.receivedByEmployeeName),
    },
    {
        label: 'Ngày nhận mẫu:',
        value: faInspection?.receivedDate ? dayjs(faInspection.receivedDate).format('DD/MM/YYYY') : EMPTY_PLACEHOLDER,
    },
    {
        label: 'Ngày kiểm tra thực tế:',
        value: faInspection?.inspectionDate
            ? dayjs(faInspection.inspectionDate).format('DD/MM/YYYY')
            : EMPTY_PLACEHOLDER,
    },
    {
        label: 'Số lượng kiểm tra:',
        value: faInspection?.inspectedQuantity ? `${faInspection.inspectedQuantity} pcs` : EMPTY_PLACEHOLDER,
    },
    {
        label: 'Số lượng NG:',
        value: faInspection?.ngQuantity
            ? `${faInspection.ngQuantity} pcs - ${faInspection.ngRate} %`
            : EMPTY_PLACEHOLDER,
    },
    {
        label: 'Nhân viên kiểm tra ngoại quan:',
        value: formatEmployeeInfo(faInspection?.visualCheckedByCode, faInspection?.visualCheckedByName),
    },
    {
        label: 'Kết quả kiểm tra ngoại quan:',
        value: renderResultTag(faInspection?.visualResult),
    },
    {
        label: 'Mã lỗi ngoại quan:',
        span: 2,
        value:
            faInspection?.visualDefectDetails && faInspection.visualDefectDetails.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {faInspection.visualDefectDetails.map((detail, index) => (
                        <div key={`visual-${detail.id || index}`}>
                            <strong>{detail.defectCode}</strong>
                            {detail.defectCodeDescription ? ` - ${detail.defectCodeDescription}` : ''}
                            {`: SL ${detail.quantity || 0}`}
                            {detail.note ? ` - ${detail.note}` : ''}
                        </div>
                    ))}
                </div>
            ) : (
                EMPTY_PLACEHOLDER
            ),
    },
    {
        label: 'Nhân viên kiểm tra kích thước:',
        value: formatEmployeeInfo(faInspection?.dimensionCheckedByCode, faInspection?.dimensionCheckedByName),
    },
    {
        label: 'Kết quả kiểm tra kích thước:',
        value: renderResultTag(faInspection?.dimensionResult),
    },
    {
        label: 'Mã lỗi kích thước:',
        span: 2,
        value:
            faInspection?.dimensionDefectDetails && faInspection.dimensionDefectDetails.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {faInspection.dimensionDefectDetails.map((detail, index) => (
                        <div key={`dimension-${detail.id || index}`}>
                            <strong>{detail.defectCode}</strong>
                            {detail.defectCodeDescription ? ` - ${detail.defectCodeDescription}` : ''}
                            {`: SL ${detail.quantity || 0}`}
                            {detail.note ? ` - ${detail.note}` : ''}
                        </div>
                    ))}
                </div>
            ) : (
                EMPTY_PLACEHOLDER
            ),
    },
    {
        label: 'Nhân viên kiểm tra cuối cùng:',
        value: formatEmployeeInfo(faInspection?.finalCheckedByCode, faInspection?.finalCheckedByName),
    },
    {
        label: 'Kết quả kiểm tra cuối cùng:',
        value: renderResultTag(faInspection?.finalResult),
    },
    {
        label: 'Ghi chú QC:',
        value: faInspection?.qcNote || EMPTY_PLACEHOLDER,
    },

    {
        label: 'File đính kèm:',
        value: faInspection?.filePath ? (
            <a
                href={`${process.env.REACT_APP_UPLOAD_URL}/${faInspection.filePath}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                {faInspection.filePath.split('/').pop()}
            </a>
        ) : (
            EMPTY_PLACEHOLDER
        ),
    },
];

export const mapDeliveryInformation = (faDelivery, typePlan = 'MOLD_TRIAL') => {
    const isMoldTrial = typePlan === 'MOLD_TRIAL' || typePlan === 'THU_KHUON';
    const deliveryLabel = isMoldTrial ? 'Ngày gửi mẫu:' : 'Ngày giao hàng:';
    const noteLabel = isMoldTrial ? 'Ghi chú gửi mẫu:' : 'Ghi chú giao hàng:';

    return [
        {
            label: deliveryLabel,
            value: faDelivery?.deliveryDate ? dayjs(faDelivery.deliveryDate).format('DD/MM/YYYY') : EMPTY_PLACEHOLDER,
        },
        {
            label: 'Số lượng vận chuyển:',
            value: faDelivery?.deliveryQuantity || EMPTY_PLACEHOLDER,
        },
        {
            label: noteLabel,
            value: faDelivery?.deliveryNote || EMPTY_PLACEHOLDER,
        },
        {
            label: 'Ngày khách hàng phản hổi:',
            value: faDelivery?.feedbackDate ? dayjs(faDelivery.feedbackDate).format('DD/MM/YYYY') : EMPTY_PLACEHOLDER,
        },
        {
            label: 'Khách hàng phản hồi:',
            value: faDelivery?.feedbackComment || EMPTY_PLACEHOLDER,
        },
        {
            label: 'File Khách hàng:',
            value: faDelivery?.feedbackFileUrl ? (
                <a href={`${process.env.REACT_APP_UPLOAD_URL}/${faDelivery.feedbackFileUrl}`}>
                    {faDelivery.feedbackFileUrl.split('/').pop()}
                </a>
            ) : (
                EMPTY_PLACEHOLDER
            ),
        },
        {
            label: 'Khách hàng đánh giá:',
            value: renderResultTag(faDelivery?.feedbackResult),
        },
        {
            label: 'File điều kiện đúc:',
            value: faDelivery?.conditionFileUrl ? (
                <a href={`${process.env.REACT_APP_UPLOAD_URL}/${faDelivery.conditionFileUrl}`}>
                    {faDelivery.conditionFileUrl.split('/').pop()}
                </a>
            ) : (
                EMPTY_PLACEHOLDER
            ),
        },
        {
            label: 'Trạng thái duyệt file điều kiện đúc:',
            value: renderResultTag(faDelivery?.conditionFileApprovalResult),
        },
        {
            label: 'Người duyệt:',
            value: faDelivery?.conditionFileApprovedBy || EMPTY_PLACEHOLDER,
        },
        {
            label: 'Thời gian duyệt:',
            value: faDelivery?.conditionFileApprovedAt
                ? dayjs(faDelivery.conditionFileApprovedAt).format('HH:mm DD/MM/YYYY')
                : EMPTY_PLACEHOLDER,
        },
        {
            label: 'Ghi chú duyệt:',
            value: faDelivery?.conditionFileApprovalNote || EMPTY_PLACEHOLDER,
        },
    ];
};
