import React, { useEffect, useMemo, useState } from "react";
import { Button, Drawer, Flex, Input, List, Space, Tag, Typography, Checkbox } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

type Section = {
    key: string;
    label: string;
    options?: string[];
    dynamicOptions?: any[]; // employees
    type?: string; // if you want month picker later
};

type Props = {
    open: boolean;
    onClose: () => void;
    sections: Section[];
    selected: Record<string, any[]>;
    onApply: (filters: Record<string, any[]>) => void;
    onClear: () => void;
};

export default function TaskFilterDrawer({
    open,
    onClose,
    sections,
    selected,
    onApply,
    onClear,
}: Props) {
    const [activeKey, setActiveKey] = useState(sections?.[0]?.key || "");
    const [local, setLocal] = useState<Record<string, any[]>>({});
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (open) {
            setLocal(selected || {});
            setActiveKey(sections?.[0]?.key || "");
            setSearch("");
        }
    }, [open, selected, sections]);

    const activeSection = useMemo(() => sections.find((s) => s.key === activeKey), [sections, activeKey]);

    const options = useMemo(() => {
        const sec = activeSection;
        if (!sec) return [];
        const list = (sec.dynamicOptions ?? sec.options ?? []).map((opt: any) => {
            const value = opt?._id ?? opt?.value ?? opt;
            const label = opt?.name ?? opt?.label ?? opt;
            return { value, label };
        });

        const q = search.trim().toLowerCase();
        if (!q) return list;
        return list.filter((x: any) => String(x.label).toLowerCase().includes(q));
    }, [activeSection, search]);

    const toggle = (sectionKey: string, value: any) => {
        const current = local?.[sectionKey] ?? [];
        const next = current.includes(value) ? current.filter((x: any) => x !== value) : [...current, value];
        setLocal((p) => ({ ...p, [sectionKey]: next }));
    };

    const selectedCount = useMemo(
        () => Object.values(local || {}).reduce((acc, arr) => acc + (arr?.length || 0), 0),
        [local]
    );

    return (
        <Drawer
            open={open}
            onClose={onClose}
            width={760}
            title={
                <Flex justify="space-between" align="center">
                    <Space direction="vertical" size={0}>
                        <Title level={4} style={{ margin: 0 }}>
                            Filters
                        </Title>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Select filters and apply to the task list
                        </Text>
                    </Space>

                    <Space>
                        {selectedCount ? <Tag color="blue">{selectedCount} selected</Tag> : null}
                        <Button onClick={() => { setLocal({}); onClear(); }} danger>
                            Clear
                        </Button>
                        <Button type="primary" onClick={() => { onApply(local); onClose(); }}>
                            Apply
                        </Button>
                    </Space>
                </Flex>
            }
            bodyStyle={{ padding: 0 }}
        >
            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", height: "100%" }}>
                {/* Left: sections */}
                <div style={{ borderRight: "1px solid rgba(2,6,23,.08)", padding: 12 }}>
                    <List
                        dataSource={sections}
                        renderItem={(s) => (
                            <List.Item
                                style={{
                                    cursor: "pointer",
                                    borderRadius: 10,
                                    padding: "10px 12px",
                                    background: activeKey === s.key ? "rgba(82,64,214,.10)" : "transparent",
                                    border: activeKey === s.key ? "1px solid rgba(82,64,214,.25)" : "1px solid transparent",
                                }}
                                onClick={() => setActiveKey(s.key)}
                            >
                                <Flex justify="space-between" style={{ width: "100%" }}>
                                    <Text strong={activeKey === s.key}>{s.label}</Text>
                                    {(local?.[s.key]?.length ?? 0) > 0 ? (
                                        <Tag color="purple">{local[s.key].length}</Tag>
                                    ) : null}
                                </Flex>
                            </List.Item>
                        )}
                    />
                </div>

                {/* Right: options */}
                <div style={{ padding: 16 }}>
                    <Space direction="vertical" size={12} style={{ width: "100%" }}>
                        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                            <Space direction="vertical" size={0}>
                                <Text strong style={{ fontSize: 16 }}>
                                    {activeSection?.label || "Filters"}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Select one or more values
                                </Text>
                            </Space>

                            <Input
                                allowClear
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                prefix={<SearchOutlined />}
                                placeholder="Search options..."
                                style={{ width: 280 }}
                            />
                        </Flex>

                        <div
                            style={{
                                border: "1px solid rgba(2,6,23,.06)",
                                borderRadius: 14,
                                padding: 12,
                                maxHeight: "62vh",
                                overflow: "auto",
                            }}
                        >
                            {options.length === 0 ? (
                                <Text type="secondary">No options</Text>
                            ) : (
                                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                                    {options.map((opt: any) => {
                                        const checked = (local?.[activeKey] ?? []).includes(opt.value);
                                        return (
                                            <div
                                                key={String(opt.value)}
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    padding: "10px 12px",
                                                    borderRadius: 12,
                                                    border: checked ? "1px solid rgba(82,64,214,.28)" : "1px solid rgba(2,6,23,.06)",
                                                    background: checked ? "rgba(82,64,214,.08)" : "#fff",
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => toggle(activeKey, opt.value)}
                                            >
                                                <Text>{opt.label}</Text>
                                                <Checkbox checked={checked} />
                                            </div>
                                        );
                                    })}
                                </Space>
                            )}
                        </div>
                    </Space>
                </div>
            </div>
        </Drawer>
    );
}