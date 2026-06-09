interface BarChartProps {
    data: number[];
    labels?: string[];
    height?: number;
}

export function BarChart({ data, labels, height = 180 }: BarChartProps) {
    const max = Math.max(...data, 1);
    const todayIndex = data.length - 1;

    return (
        <div className="bars" style={{ height }}>
            {data.map((v, i) => (
                <div className="bar-col" key={i}>
                    <div
                        className="bar"
                        style={{
                            height: `${(v / max) * 100}%`,
                            background: i === todayIndex ? 'var(--ink)' : 'var(--line-2)',
                        }}
                        title={`${v} klik`}
                    />
                    {labels && <div className="bar-x">{labels[i]}</div>}
                </div>
            ))}
        </div>
    );
}
