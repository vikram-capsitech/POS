import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Flex,
    Form,
    Input,
    Row,
    Select,
    Space,
    Switch,
    Typography,
    message,
    TimePicker,
} from "antd";
import { AudioOutlined, DeleteOutlined, SaveOutlined } from "@ant-design/icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";

import {
    hrmListEmployees as fetchEmployees,
    hrmGetTaskById as fetchTaskById,
    hrmListSops as allSopApi,
    hrmUpdateTask as updateTask,
    hrmCreateTask as createTask,
} from "../../../Api/index";
import { requestHandler } from "../../../Utils/index";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

import { Employee } from "../../../Interfaces/Employee";

type Sop = { _id: string; title?: string; status?: string };

type TaskPayload = {
    title: string;
    description: string;
    assignTo: string; // employeeId
    category: string;
    priority: string;
    sop?: string | null;
    aiReview: boolean;
    deadline: { startDate?: Date; endDate?: Date };
};

export default function CreateTaskAntd() {
    const { id, orgId } = useParams();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [sops, setSops] = useState<Sop[]>([]);

    // AntD Form
    const [form] = Form.useForm<TaskPayload>();

    // deadline state (Range + time)
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>(() => [dayjs(), dayjs()]);
    const [startTime, setStartTime] = useState<Dayjs>(() => dayjs());
    const [endTime, setEndTime] = useState<Dayjs>(() => dayjs());

    // audio recording
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSec, setRecordingSec] = useState(0);
    const timerRef = useRef<number | null>(null);

    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const categories = useMemo(() => ["Cleaning", "Kitchen", "Purchase", "Others"], []);
    const priorities = useMemo(() => ["Low", "Medium", "High"], []);

    const buildDateTime = (date: Dayjs, time: Dayjs) => {
        return date
            .hour(time.hour())
            .minute(time.minute())
            .second(0)
            .millisecond(0)
            .toDate();
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    const loadEmployees = async () => {
        requestHandler(
            () => fetchEmployees() as any,
            setLoading,
            (data: any) => {
                const list = data?.data?.data ?? [];
                setEmployees(Array.isArray(list) ? list : []);
            },
            (err: string) => message.error(err)
        );
    };

    const loadSops = async () => {
        requestHandler(
            () => allSopApi() as any,
            null,
            (data: any) => {
                const list = data?.data?.sops ?? [];
                setSops(Array.isArray(list) ? list : []);
            },
            (err: string) => message.error(err)
        );
    };

    const loadTask = async (taskId: string) => {
        requestHandler(
            () => fetchTaskById(taskId) as any,
            setLoading,
            (data: any) => {
                const task = data?.data;

                form.setFieldsValue({
                    title: task?.title ?? "",
                    description: task?.description ?? "",
                    category: task?.category ?? "",
                    priority: task?.priority ?? "",
                    assignTo: task?.assignTo?._id ?? task?.assignTo?.[0]?._id ?? "",
                    sop: task?.sop?._id ?? null,
                    aiReview: Boolean(task?.aiReview),
                    deadline: task?.deadline ?? {},
                });

                const sd = task?.deadline?.startDate ? dayjs(task.deadline.startDate) : dayjs();
                const ed = task?.deadline?.endDate ? dayjs(task.deadline.endDate) : dayjs();

                setDateRange([sd.startOf("day"), ed.startOf("day")]);
                setStartTime(sd);
                setEndTime(ed);

                if (task?.voiceNote) {
                    setAudioURL(task.voiceNote);
                    setAudioBlob(null); // remote audio, no blob
                }
            },
            (err: string) => message.error(err)
        );
    };

    useEffect(() => {
        loadEmployees();
        loadSops();
        if (isEditMode && id) loadTask(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleStartStopRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            if (timerRef.current) window.clearInterval(timerRef.current);
            timerRef.current = null;
            setIsRecording(false);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mr = new MediaRecorder(stream);
            mediaRecorderRef.current = mr;
            audioChunksRef.current = [];

            mr.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mr.onstop = () => {
                // stop mic
                stream.getTracks().forEach((t) => t.stop());

                const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioURL(url);
                setRecordingSec(0);
            };

            setRecordingSec(0);
            timerRef.current = window.setInterval(() => setRecordingSec((p) => p + 1), 1000);

            mr.start();
            setIsRecording(true);
        } catch (e) {
            message.error("Microphone access denied. Please allow mic permissions.");
        }
    };

    const deleteVoiceNote = () => {
        if (audioURL?.startsWith("blob:")) URL.revokeObjectURL(audioURL);
        setAudioURL(null);
        setAudioBlob(null);
    };

    const onChangeRange = (v: any) => {
        if (!v) return;
        setDateRange(v);
    };

    const onSubmit = async () => {
        try {
            const values = await form.validateFields();

            // build deadline from dateRange + startTime/endTime
            const startDate = buildDateTime(dateRange[0], startTime);
            const endDate = buildDateTime(dateRange[1], endTime);

            const fd = new FormData();
            fd.append("title", values.title);
            fd.append("description", values.description);
            fd.append("assignTo", values.assignTo);
            fd.append("category", values.category);
            fd.append("priority", values.priority || "");
            fd.append("deadline[startDate]", String(startDate));
            fd.append("deadline[endDate]", String(endDate));
            fd.append("aiReview", String(Boolean(values.aiReview)));

            if (values.sop) fd.append("sop", values.sop);

            if (audioBlob) {
                fd.append("voiceNote", audioBlob, "voiceNote.webm");
            }

            if (isEditMode && id) {
                requestHandler(
                    () => updateTask(id, fd) as any,
                    setLoading,
                    () => {
                        message.success("Task updated");
                        navigate(`/client/${orgId}/task`);
                    },
                    (err: string) => message.error(err)
                );
            } else {
                requestHandler(
                    () => createTask(fd) as any,
                    setLoading,
                    () => {
                        message.success("Task created");
                        navigate(`/client/${orgId}/task`);
                    },
                    (err: string) => message.error(err)
                );
            }
        } catch {
            // antd validation errors are already shown inline
        }
    };

    const containerStyle: React.CSSProperties = {
        width: "100%",
        padding: 16,
    };

    const cardStyle: React.CSSProperties = {
        width: "100%",
        borderRadius: 16,
    };

    return (
        <div style={containerStyle}>
            <div
                style={{
                    width: "100%",
                    maxWidth: 1400,
                    margin: "0 auto",
                }}
            >
                <Card style={cardStyle} bodyStyle={{ padding: 18 }}>
                    {/* Breadcrumb */}
                    <Space direction="vertical" size={2} style={{ width: "100%" }}>
                        <Space size={8}>
                            <Link to={`/client/${orgId}/task`} style={{ textDecoration: "none" }}>
                                <Text type="secondary">{isEditMode ? "Task Overview" : "Task Overview"}</Text>
                            </Link>
                            <Text type="secondary">›</Text>
                            <Text strong>{isEditMode ? "Edit Task" : "Create Task"}</Text>
                        </Space>

                        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                            <Title level={4} style={{ margin: 0 }}>
                                {isEditMode ? "Edit Task" : "Create Task"}
                            </Title>

                            <Space>
                                <Button onClick={() => navigate(`/client/${orgId}/task`)}>Cancel</Button>
                                <Button type="primary" icon={<SaveOutlined />} onClick={onSubmit} loading={loading}>
                                    {isEditMode ? "Update" : "Save"}
                                </Button>
                            </Space>
                        </Flex>
                    </Space>

                    <Divider style={{ margin: "12px 0" }} />

                    <Form<TaskPayload>
                        form={form}
                        layout="vertical"
                        initialValues={{
                            title: "",
                            description: "",
                            assignTo: "",
                            category: "",
                            priority: "",
                            sop: null,
                            aiReview: false,
                        }}
                    >
                        <Row gutter={[12, 12]}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Task Title"
                                    name="title"
                                    rules={[{ required: true, message: "Task title is required" }]}
                                >
                                    <Input placeholder="e.g. Kitchen deep cleaning" style={{ borderRadius: 12, height: 44 }} />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Assign to"
                                    name="assignTo"
                                    rules={[{ required: true, message: "Please assign to an employee" }]}
                                >
                                    <Select
                                        showSearch
                                        placeholder="Select employee"
                                        optionFilterProp="label"
                                        style={{ borderRadius: 12 }}
                                        options={(employees || [])
                                            .filter((e) => e?.profile?.jobRole === "employee" || !e?.profile?.jobRole)
                                            .map((e) => ({
                                                value: e._id,
                                                label: e.displayName || e.userName,
                                            }))}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24}>
                                <Form.Item
                                    label="Description"
                                    name="description"
                                    rules={[{ required: true, message: "Description is required" }]}
                                >
                                    <TextArea rows={4} placeholder="Provide description for the task" style={{ borderRadius: 12 }} />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={8}>
                                <Form.Item
                                    label="Category"
                                    name="category"
                                    rules={[{ required: true, message: "Please select a category" }]}
                                >
                                    <Select
                                        placeholder="Select category"
                                        style={{ borderRadius: 12 }}
                                        options={categories.map((c) => ({ value: c, label: c }))}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={8}>
                                <Form.Item label="Priority" name="priority">
                                    <Select
                                        placeholder="Select priority"
                                        style={{ borderRadius: 12 }}
                                        options={priorities.map((p) => ({ value: p, label: p }))}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={8}>
                                <Form.Item label="Attach SOP (optional)" name="sop">
                                    <Select
                                        allowClear
                                        placeholder="Select SOP"
                                        style={{ borderRadius: 12 }}
                                        options={(sops || [])
                                            .filter((s) => s?.status === "Active" || !s?.status)
                                            .map((s) => ({ value: s._id, label: s.title || s._id }))}
                                    />
                                </Form.Item>
                            </Col>

                            {/* Deadline */}
                            <Col xs={24} md={12}>
                                <Form.Item label="Deadline (Date Range)">
                                    <RangePicker
                                        value={dateRange}
                                        onChange={onChangeRange}
                                        style={{ width: "100%", borderRadius: 12, height: 44 }}
                                        allowClear={false}
                                    />
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Select start and end dates
                                    </Text>
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={6}>
                                <Form.Item label="Start Time">
                                    <TimePicker
                                        value={startTime}
                                        onChange={(v) => v && setStartTime(v)}
                                        format="HH:mm"
                                        style={{ width: "100%", borderRadius: 12, height: 44 }}
                                        allowClear={false}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={6}>
                                <Form.Item label="End Time">
                                    <TimePicker
                                        value={endTime}
                                        onChange={(v) => v && setEndTime(v)}
                                        format="HH:mm"
                                        style={{ width: "100%", borderRadius: 12, height: 44 }}
                                        allowClear={false}
                                    />
                                </Form.Item>
                            </Col>

                            {/* Voice note */}
                            <Col xs={24} md={12}>
                                <Form.Item label="Voice note">
                                    <div
                                        style={{
                                            border: "1px solid rgba(2,6,23,.10)",
                                            borderRadius: 12,
                                            padding: 12,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <Space direction="vertical" size={0}>
                                            <Text strong>
                                                {isRecording ? "Recording..." : audioURL ? "Voice note ready" : "No voice note"}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {isRecording ? `Time: ${formatTime(recordingSec)}` : "Tap to start/stop recording"}
                                            </Text>
                                        </Space>

                                        <Space>
                                            <Button
                                                icon={<AudioOutlined />}
                                                onClick={handleStartStopRecording}
                                                style={{ borderRadius: 10 }}
                                            >
                                                {isRecording ? "Stop" : "Record"}
                                            </Button>
                                            <Button
                                                icon={<DeleteOutlined />}
                                                danger
                                                disabled={!audioURL}
                                                onClick={deleteVoiceNote}
                                                style={{ borderRadius: 10 }}
                                            />
                                        </Space>
                                    </div>

                                    {audioURL ? (
                                        <div style={{ marginTop: 10 }}>
                                            <audio controls src={audioURL} style={{ width: "100%" }} />
                                        </div>
                                    ) : null}
                                </Form.Item>
                            </Col>

                            {/* AI Review */}
                            <Col xs={24} md={12}>
                                <Form.Item label="AI Review" name="aiReview" valuePropName="checked">
                                    <div
                                        style={{
                                            border: "1px solid rgba(2,6,23,.10)",
                                            borderRadius: 12,
                                            padding: 12,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 12,
                                        }}
                                    >
                                        <Space direction="vertical" size={0}>
                                            <Text strong>Enable AI Review</Text>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                If enabled, AI can review task quality/completion notes.
                                            </Text>
                                        </Space>
                                        <Switch />
                                    </div>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider style={{ margin: "10px 0" }} />

                        <Flex justify="end" gap={10} wrap="wrap">
                            <Button onClick={() => navigate(`/client/${orgId}/task`)} style={{ borderRadius: 10 }}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={onSubmit}
                                loading={loading}
                                style={{ borderRadius: 10 }}
                            >
                                {isEditMode ? "Update" : "Save"}
                            </Button>
                        </Flex>
                    </Form>
                </Card>
            </div>
        </div>
    );
}