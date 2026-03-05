import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Button,
    Card,
    Col,
    Divider,
    Flex,
    Form,
    Input,
    Row,
    Select,
    Space,
    Typography,
    message,
} from "antd";
import {
    SaveOutlined,
    PlusOutlined,
    DeleteOutlined,
    AudioOutlined,
    BookOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    hrmCreateSop,
    hrmGetSopById,
    hrmUpdateSop,
} from "../../../Api/index";
import { requestHandler } from "../../../Utils/index";

const { Title, Text } = Typography;
const { TextArea } = Input;

type StepItem = {
    id: number;
    name: string;
    items: string[];
};

type SopPayload = {
    title: string;
    description?: string;
    category: string;
    status: string;
    difficultyLevel: string;
    estimatedTime: string;
    owner?: string;
    steps?: StepItem[];
};

const CATEGORIES = ["Cleaning", "Kitchen", "Maintenance", "Purchase", "Others"];
const STATUSES = ["Active", "Review", "Draft"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const ESTIMATED_TIMES = ["15 min", "30 min", "45 min", "1 hr", "2 hr", "3 hr"];

export default function CreateSop() {
    const { id, orgId } = useParams();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm<SopPayload>();

    // Steps state
    const [steps, setSteps] = useState<StepItem[]>([
        { id: 1, name: "", items: [""] },
    ]);

    // Voice note
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSec, setRecordingSec] = useState(0);
    const timerRef = useRef<number | null>(null);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    const loadSop = (sopId: string) => {
        requestHandler(
            () => hrmGetSopById(sopId) as any,
            setLoading,
            (data: any) => {
                const sop = data?.data;
                form.setFieldsValue({
                    title: sop?.title ?? "",
                    description: sop?.description ?? "",
                    category: sop?.category ?? "",
                    status: sop?.status ?? "Active",
                    difficultyLevel: sop?.difficultyLevel ?? "Easy",
                    estimatedTime: sop?.estimatedTime ?? "30 min",
                });
                if (sop?.steps && Array.isArray(sop.steps) && sop.steps.length > 0) {
                    setSteps(sop.steps.map((s: any, idx: number) => ({
                        id: s.id ?? idx + 1,
                        name: s.name ?? "",
                        items: Array.isArray(s.items) && s.items.length > 0 ? s.items : [""],
                    })));
                }
                if (sop?.voiceNote) {
                    setAudioURL(sop.voiceNote);
                }
            },
            (err) => message.error(err)
        );
    };

    useEffect(() => {
        if (isEditMode && id) loadSop(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // ── Steps helpers ──────────────────────────────────────────────
    const addStep = () => {
        setSteps((prev) => [
            ...prev,
            { id: prev.length + 1, name: "", items: [""] },
        ]);
    };

    const removeStep = (idx: number) => {
        setSteps((prev) => prev.filter((_, i) => i !== idx));
    };

    const updateStepName = (idx: number, name: string) => {
        setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, name } : s)));
    };

    const addItem = (stepIdx: number) => {
        setSteps((prev) =>
            prev.map((s, i) =>
                i === stepIdx ? { ...s, items: [...s.items, ""] } : s
            )
        );
    };

    const removeItem = (stepIdx: number, itemIdx: number) => {
        setSteps((prev) =>
            prev.map((s, i) =>
                i === stepIdx
                    ? { ...s, items: s.items.filter((_, j) => j !== itemIdx) }
                    : s
            )
        );
    };

    const updateItem = (stepIdx: number, itemIdx: number, value: string) => {
        setSteps((prev) =>
            prev.map((s, i) =>
                i === stepIdx
                    ? {
                        ...s,
                        items: s.items.map((it, j) => (j === itemIdx ? value : it)),
                    }
                    : s
            )
        );
    };

    // ── Voice note ─────────────────────────────────────────────────
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
                stream.getTracks().forEach((t) => t.stop());
                const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                setAudioBlob(blob);
                setAudioURL(URL.createObjectURL(blob));
                setRecordingSec(0);
            };

            setRecordingSec(0);
            timerRef.current = window.setInterval(
                () => setRecordingSec((p) => p + 1),
                1000
            );
            mr.start();
            setIsRecording(true);
        } catch {
            message.error("Microphone access denied.");
        }
    };

    const deleteVoiceNote = () => {
        if (audioURL?.startsWith("blob:")) URL.revokeObjectURL(audioURL);
        setAudioURL(null);
        setAudioBlob(null);
    };

    // ── Submit ─────────────────────────────────────────────────────
    const onSubmit = async () => {
        try {
            const values = await form.validateFields();

            const fd = new FormData();
            fd.append("title", values.title);
            fd.append("description", values.description || "");
            fd.append("category", values.category);
            fd.append("status", values.status);
            fd.append("difficultyLevel", values.difficultyLevel);
            fd.append("estimatedTime", values.estimatedTime);

            // Clean steps – remove empties
            const cleanSteps = steps
                .filter((s) => s.name.trim())
                .map((s, idx) => ({
                    id: idx + 1,
                    name: s.name.trim(),
                    items: s.items.filter((it) => it.trim()),
                }));
            fd.append("steps", JSON.stringify(cleanSteps));

            if (audioBlob) {
                fd.append("voiceNote", audioBlob, "voiceNote.webm");
            }

            if (isEditMode && id) {
                requestHandler(
                    () => hrmUpdateSop(id, fd) as any,
                    setLoading,
                    () => {
                        message.success("SOP updated successfully");
                        navigate(`/client/${orgId}/sop`);
                    },
                    (err) => message.error(err)
                );
            } else {
                requestHandler(
                    () => hrmCreateSop(fd) as any,
                    setLoading,
                    () => {
                        message.success("SOP created successfully");
                        navigate(`/client/${orgId}/sop`);
                    },
                    (err) => message.error(err)
                );
            }
        } catch {
            // inline validation errors
        }
    };

    return (
        <div style={{
            padding: 16, width: "100%",
        }} >
            <div style={{
                width: "100%",
                maxWidth: 1400,
                margin: "0 auto",
            }}>
                <Card style={{
                    borderRadius: 16, width: "100%",
                }} bodyStyle={{ padding: 20 }}>
                    {/* Breadcrumb + Header */}
                    <Space direction="vertical" size={2} style={{ width: "100%" }}>
                        <Space size={8}>
                            <Link to={`/client/${orgId}/sop`} style={{ textDecoration: "none" }}>
                                <Text type="secondary">SOP Management</Text>
                            </Link>
                            <Text type="secondary">›</Text>
                            <Text strong>{isEditMode ? "Edit SOP" : "Create SOP"}</Text>
                        </Space>

                        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                            <Space>
                                <BookOutlined style={{ fontSize: 20, color: "#1677ff" }} />
                                <Title level={4} style={{ margin: 0 }}>
                                    {isEditMode ? "Edit SOP" : "Create New SOP"}
                                </Title>
                            </Space>
                            <Space>
                                <Button onClick={() => navigate(`/client/${orgId}/sop`)}>
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={onSubmit}
                                    loading={loading}
                                    style={{ borderRadius: 10 }}
                                >
                                    {isEditMode ? "Update" : "Save SOP"}
                                </Button>
                            </Space>
                        </Flex>
                    </Space>

                    <Divider style={{ margin: "14px 0" }} />

                    <Form<SopPayload>
                        form={form}
                        layout="vertical"
                        initialValues={{
                            title: "",
                            description: "",
                            category: "",
                            status: "Active",
                            difficultyLevel: "Easy",
                            estimatedTime: "30 min",
                        }}
                    >
                        <Row gutter={[14, 0]}>
                            {/* Title */}
                            <Col xs={24} md={16}>
                                <Form.Item
                                    label="SOP Title"
                                    name="title"
                                    rules={[{ required: true, message: "Title is required" }]}
                                >
                                    <Input
                                        placeholder="e.g. Kitchen Deep Cleaning Procedure"
                                        style={{ borderRadius: 10, height: 42 }}
                                    />
                                </Form.Item>
                            </Col>

                            {/* Category */}
                            <Col xs={24} md={8}>
                                <Form.Item
                                    label="Category"
                                    name="category"
                                    rules={[{ required: true, message: "Category is required" }]}
                                >
                                    <Select
                                        placeholder="Select category"
                                        style={{ borderRadius: 10 }}
                                        options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                                    />
                                </Form.Item>
                            </Col>

                            {/* Status */}
                            <Col xs={24} md={8}>
                                <Form.Item label="Status" name="status">
                                    <Select
                                        style={{ borderRadius: 10 }}
                                        options={STATUSES.map((s) => ({ value: s, label: s }))}
                                    />
                                </Form.Item>
                            </Col>

                            {/* Difficulty */}
                            <Col xs={24} md={8}>
                                <Form.Item label="Difficulty Level" name="difficultyLevel">
                                    <Select
                                        style={{ borderRadius: 10 }}
                                        options={DIFFICULTIES.map((d) => ({ value: d, label: d }))}
                                    />
                                </Form.Item>
                            </Col>

                            {/* Estimated Time */}
                            <Col xs={24} md={8}>
                                <Form.Item label="Estimated Time" name="estimatedTime">
                                    <Select
                                        style={{ borderRadius: 10 }}
                                        options={ESTIMATED_TIMES.map((t) => ({ value: t, label: t }))}
                                    />
                                </Form.Item>
                            </Col>

                            {/* Description */}
                            <Col xs={24}>
                                <Form.Item label="Description" name="description">
                                    <TextArea
                                        rows={3}
                                        placeholder="Briefly describe the purpose of this SOP..."
                                        style={{ borderRadius: 10 }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Steps Section */}
                        <Divider orientation="left" style={{ fontSize: 14 }}>
                            <Space>
                                <Text strong>Steps</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    ({steps.length} step{steps.length !== 1 ? "s" : ""})
                                </Text>
                            </Space>
                        </Divider>

                        <Space direction="vertical" style={{ width: "100%" }} size={12}>
                            {steps.map((step, si) => (
                                <Card
                                    key={si}
                                    size="small"
                                    style={{
                                        borderRadius: 12,
                                        border: "1px solid rgba(22,119,255,.2)",
                                        background: "rgba(22,119,255,.02)",
                                    }}
                                    title={
                                        <Flex justify="space-between" align="center">
                                            <Text strong style={{ color: "#1677ff" }}>
                                                Step {si + 1}
                                            </Text>
                                            {steps.length > 1 && (
                                                <Button
                                                    size="small"
                                                    danger
                                                    type="text"
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => removeStep(si)}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </Flex>
                                    }
                                >
                                    <Space direction="vertical" style={{ width: "100%" }} size={8}>
                                        <Input
                                            placeholder="Step name (e.g. Prepare cleaning supplies)"
                                            value={step.name}
                                            onChange={(e) => updateStepName(si, e.target.value)}
                                            style={{ borderRadius: 8 }}
                                        />

                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            Sub-items (checklist)
                                        </Text>

                                        {step.items.map((item, ii) => (
                                            <Flex key={ii} gap={8} align="center">
                                                <Input
                                                    placeholder={`Item ${ii + 1}`}
                                                    value={item}
                                                    onChange={(e) => updateItem(si, ii, e.target.value)}
                                                    style={{ borderRadius: 8 }}
                                                />
                                                {step.items.length > 1 && (
                                                    <Button
                                                        size="small"
                                                        danger
                                                        type="text"
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => removeItem(si, ii)}
                                                    />
                                                )}
                                            </Flex>
                                        ))}

                                        <Button
                                            size="small"
                                            type="dashed"
                                            icon={<PlusOutlined />}
                                            onClick={() => addItem(si)}
                                            style={{ borderRadius: 8 }}
                                        >
                                            Add Item
                                        </Button>
                                    </Space>
                                </Card>
                            ))}

                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={addStep}
                                style={{ width: "100%", borderRadius: 10 }}
                            >
                                Add Step
                            </Button>
                        </Space>

                        {/* Voice Note */}
                        <Divider orientation="left" style={{ fontSize: 14, marginTop: 20 }}>
                            <Text strong>Voice Note (Optional)</Text>
                        </Divider>

                        <div
                            style={{
                                border: "1px solid rgba(2,6,23,.10)",
                                borderRadius: 12,
                                padding: 14,
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                justifyContent: "space-between",
                            }}
                        >
                            <Space direction="vertical" size={0}>
                                <Text strong>
                                    {isRecording
                                        ? "Recording..."
                                        : audioURL
                                            ? "Voice note attached"
                                            : "No voice note"}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {isRecording
                                        ? `Time: ${formatTime(recordingSec)}`
                                        : "Tap to start/stop recording"}
                                </Text>
                            </Space>
                            <Space>
                                <Button
                                    icon={<AudioOutlined />}
                                    onClick={handleStartStopRecording}
                                    type={isRecording ? "primary" : "default"}
                                    danger={isRecording}
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

                        {audioURL && (
                            <div style={{ marginTop: 10 }}>
                                <audio controls src={audioURL} style={{ width: "100%" }} />
                            </div>
                        )}

                        <Divider style={{ margin: "18px 0" }} />

                        <Flex justify="end" gap={10} wrap="wrap">
                            <Button onClick={() => navigate(`/client/${orgId}/sop`)}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={onSubmit}
                                loading={loading}
                                style={{ borderRadius: 10 }}
                            >
                                {isEditMode ? "Update SOP" : "Save SOP"}
                            </Button>
                        </Flex>
                    </Form>
                </Card>
            </div>
        </div>
    );
}
