interface SparklineProps {
    data: number[];
    height?: number;
    color?: string;
}

export function Sparkline({ data, height = 28, color = 'var(--ink)' }: SparklineProps) {
    if (!data.length) return null;

    const max = Math.max(...data, 1);
    const width = data.length * 7;
    const barW = 5;
    const gap = 2;

    return (
        <svg width={width} height={height} className="spark" style={{ display: 'block', flexShrink: 0 }}>
            {data.map((v, i) => {
                const barH = Math.max(2, (v / max) * height);
                return (
                    <rect
                        key={i}
                        x={i * (barW + gap)}
                        y={height - barH}
                        width={barW}
                        height={barH}
                        rx={1.5}
                        fill={color}
                        opacity={0.7}
                    />
                );
            })}
        </svg>
    );
}
