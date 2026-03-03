import { Button, Divider, Space, Tag, Typography } from "antd";
import {
    CheckCircleFilled,
    CreditCardOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const tryParseJson = (text: string) => {
    try {
        // handle accidental ```json ... ``` wrapping
        const cleaned = text
            .trim()
            .replace(/^```json/i, "")
            .replace(/^```/i, "")
            .replace(/```$/i, "")
            .trim();

        return JSON.parse(cleaned);
    } catch {
        return null;
    }
};

const Pill = ({ children }: { children: React.ReactNode }) => (
    <Tag
        style={{
            borderRadius: 999,
            padding: "2px 10px",
            fontWeight: 800,
            borderColor: "#e2e8f0",
            background: "#f8fafc",
            color: "#0f172a",
        }}
    >
        {children}
    </Tag>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div
            style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                background: "linear-gradient(135deg, #1677ff, #722ed1)",
                boxShadow: "0 10px 18px rgba(22, 119, 255, 0.18)",
            }}
        />
        <Text style={{ fontWeight: 950, color: "#0f172a", fontSize: 14 }}>{children}</Text>
    </div>
);

const renderNextSteps = (nextSteps?: string[]) => {
    if (!Array.isArray(nextSteps) || nextSteps.length === 0) return null;

    return (
        <div style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: 900, color: "#0f172a" }}>Next steps</Text>
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                {nextSteps.slice(0, 4).map((s, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: 12,
                            padding: "10px 12px",
                        }}
                    >
                        <CheckCircleFilled style={{ color: "#10b981", marginTop: 3 }} />
                        <Text style={{ color: "#334155", lineHeight: 1.55 }}>{s}</Text>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PricingCard = ({
    plan,
}: {
    plan: {
        name?: string;
        billing?: "monthly" | "yearly" | "payg";
        price_inr?: string;
        includes?: string[];
        best_for?: string;
        badge?: string;
    };
}) => {
    const isPopular = (plan.badge || "").toLowerCase().includes("popular") || (plan.name || "").toLowerCase() === "growth";

    return (
        <div
            style={{
                borderRadius: 16,
                border: isPopular ? "2px solid #722ed1" : "1px solid #e2e8f0",
                background: "#ffffff",
                padding: 14,
                boxShadow: isPopular ? "0 18px 45px -25px rgba(114,46,209,0.55)" : "0 2px 10px rgba(2,6,23,0.04)",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <Text style={{ fontWeight: 950, color: "#0f172a", fontSize: 14 }}>{plan.name || "Plan"}</Text>
                        {isPopular && (
                            <Tag color="purple" style={{ borderRadius: 999, fontWeight: 800, margin: 0 }}>
                                Most Popular
                            </Tag>
                        )}
                        {plan.billing && <Pill>{plan.billing.toUpperCase()}</Pill>}
                    </div>

                    <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 8 }}>
                        <Text style={{ fontWeight: 950, color: "#0f172a", fontSize: 18 }}>
                            {plan.price_inr || "Contact for pricing"}
                        </Text>
                    </div>

                    {plan.best_for && (
                        <div style={{ marginTop: 6 }}>
                            <Text style={{ color: "#64748b" }}>{plan.best_for}</Text>
                        </div>
                    )}
                </div>

                <div
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: 14,
                        background: "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flex: "0 0 auto",
                    }}
                >
                    <CreditCardOutlined style={{ color: "#0f172a" }} />
                </div>
            </div>

            {Array.isArray(plan.includes) && plan.includes.length > 0 && (
                <>
                    <Divider style={{ margin: "12px 0", borderColor: "#eef2f7" }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {plan.includes.slice(0, 6).map((x, i) => (
                            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                <CheckCircleFilled style={{ color: "#10b981", marginTop: 3 }} />
                                <Text style={{ color: "#334155", lineHeight: 1.55 }}>{x}</Text>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const JsonFallbackCard = ({ data }: { data: any }) => (
    <div
        style={{
            background: "#0b1220",
            color: "#e2e8f0",
            borderRadius: 14,
            padding: 12,
            border: "1px solid rgba(148,163,184,0.2)",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            fontSize: 12,
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
        }}
    >
        {JSON.stringify(data, null, 2)}
    </div>
);

export const BotMessage = ({ text }: { text: string }) => {
    const data = tryParseJson(text);

    if (!data) {
        return <Text style={{ color: "#0f172a", lineHeight: 1.6 }}>{text}</Text>;
    }

    // 1) feature_list
    if (data.type === "feature_list") {
        return (
            <div>
                <SectionTitle>{data.title || "Details"}</SectionTitle>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(data.items || []).map((it: any, idx: number) => (
                        <div
                            key={idx}
                            style={{
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: 14,
                                padding: "10px 12px",
                            }}
                        >
                            <div style={{ fontWeight: 950, color: "#0f172a" }}>{it.label}</div>
                            <div style={{ color: "#64748b", marginTop: 2, lineHeight: 1.55 }}>{it.value}</div>
                        </div>
                    ))}
                </div>

                {renderNextSteps(data.next_steps)}
            </div>
        );
    }

    // 2) steps
    if (data.type === "steps") {
        return (
            <div>
                <SectionTitle>{data.title || "Steps"}</SectionTitle>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(data.steps || []).map((s: string, idx: number) => (
                        <div
                            key={idx}
                            style={{
                                display: "flex",
                                gap: 10,
                                alignItems: "flex-start",
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: 14,
                                padding: "10px 12px",
                            }}
                        >
                            <div
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 10,
                                    background: "linear-gradient(135deg, #1677ff, #722ed1)",
                                    color: "#fff",
                                    fontWeight: 900,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 12,
                                    flex: "0 0 auto",
                                }}
                            >
                                {idx + 1}
                            </div>
                            <Text style={{ color: "#334155", lineHeight: 1.55 }}>{s}</Text>
                        </div>
                    ))}
                </div>

                {Array.isArray(data.notes) && data.notes.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                        <Text style={{ fontWeight: 900, color: "#0f172a" }}>Notes</Text>
                        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                            {data.notes.slice(0, 4).map((n: string, i: number) => (
                                <div
                                    key={i}
                                    style={{
                                        background: "rgba(22,119,255,0.06)",
                                        border: "1px solid rgba(22,119,255,0.18)",
                                        borderRadius: 14,
                                        padding: "10px 12px",
                                    }}
                                >
                                    <Text style={{ color: "#334155", lineHeight: 1.55 }}>{n}</Text>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // 3) pricing
    if (data.type === "pricing") {
        return (
            <div>
                <SectionTitle>{data.title || "Pricing"}</SectionTitle>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {(data.plans || []).map((p: any, idx: number) => (
                        <PricingCard key={idx} plan={p} />
                    ))}
                </div>

                {data.disclaimer && (
                    <div style={{ marginTop: 12 }}>
                        <div
                            style={{
                                borderRadius: 14,
                                padding: "10px 12px",
                                background: "rgba(250,140,22,0.08)",
                                border: "1px solid rgba(250,140,22,0.22)",
                                display: "flex",
                                gap: 10,
                                alignItems: "flex-start",
                            }}
                        >
                            <ThunderboltOutlined style={{ color: "#fa8c16", marginTop: 3 }} />
                            <Text style={{ color: "#7c2d12", lineHeight: 1.55 }}>{data.disclaimer}</Text>
                        </div>
                    </div>
                )}

                {renderNextSteps(data.next_steps)}
            </div>
        );
    }

    // 4) text
    if (data.type === "text") {
        return (
            <div>
                {data.title && <SectionTitle>{data.title}</SectionTitle>}
                <Text style={{ color: "#0f172a", lineHeight: 1.6 }}>{data.text || ""}</Text>
                {renderNextSteps(data.next_steps)}
            </div>
        );
    }

    // fallback: show a pretty JSON card (so it never looks broken)
    return <JsonFallbackCard data={data} />;
};