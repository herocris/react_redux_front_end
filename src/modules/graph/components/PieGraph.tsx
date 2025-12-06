import { Cell, Pie, PieChart, PieLabelRenderProps, SectorProps, Sector, Tooltip } from 'recharts';
import { TooltipIndex } from 'recharts/types/state/tooltipSlice';

const randomHexColor = (): string => {
    return "#" + Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0");
}

const RADIAN = Math.PI / 180;
//const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelRenderProps) => {

    // @ts-expect-error type unknown https://github.com/recharts/recharts/issues/6380
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    // @ts-expect-error type unknown https://github.com/recharts/recharts/issues/6380
    const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
    // @ts-expect-error type unknown https://github.com/recharts/recharts/issues/6380
    const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

    return (
        // @ts-expect-error type unknown https://github.com/recharts/recharts/issues/6380
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {/* @ts-expect-error type unknown https://github.com/recharts/recharts/issues/6380 */}
            {`${((percent ?? 1) * 100).toFixed(0)}%`}
        </text>
    );
};

interface PieGraphProps {
    data: any[]
    isAnimationActive?: boolean,
    defaultIndex?: TooltipIndex;
}
type Coordinate = {
    x: number;
    y: number;
};

type PieSectorData = {
    percent?: number;
    name?: string | number;
    midAngle?: number;
    middleRadius?: number;
    tooltipPosition?: Coordinate;
    value?: number;
    paddingAngle?: number;
    dataKey?: string;
    payload?: any;
};
type PieSectorDataItem = React.SVGProps<SVGPathElement> & Partial<SectorProps> & PieSectorData;

const renderActiveShape = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    //percent,
    value,
}: PieSectorDataItem) => {
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * (midAngle ?? 1));
    const cos = Math.cos(-RADIAN * (midAngle ?? 1));
    const sx = (cx ?? 0) + ((outerRadius ?? 0) + 10) * cos;
    const sy = (cy ?? 0) + ((outerRadius ?? 0) + 10) * sin;
    const mx = (cx ?? 0) + ((outerRadius ?? 0) + 30) * cos;
    const my = (cy ?? 0) + ((outerRadius ?? 0) + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            {/* <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
                {payload.name}
            </text> */}
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={(outerRadius ?? 0) + 6}
                outerRadius={(outerRadius ?? 0) + 10}
                fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${payload.name} ${value}`}</text>
            {/* <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                {`(Rate ${((percent ?? 1) * 100).toFixed(2)}%)`}
            </text> */}
        </g>
    );
};


export const PieGraph = ({ data, isAnimationActive = true, defaultIndex = undefined }: PieGraphProps) => {
    return (
        <PieChart
            style={{
                width: '100%',
                height:'100%',
                // maxWidth: '500px',
                // maxHeight: '80vh',
                aspectRatio: 2

            }}
            responsive
            // margin={{
            //     top:-340,
            //     right: 120,
            //     bottom: 0,
            //     left: 120,
            // }}
            >
            <Pie
                activeShape={renderActiveShape}
                data={data ?? []}
                labelLine={false}
                label={renderCustomizedLabel}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={isAnimationActive}
            >
                {data?.map((entry, _index) => (
                    <Cell key={`cell-${entry.name}`} fill={randomHexColor()} />
                ))}
            </Pie>
            <Tooltip content={() => null} defaultIndex={defaultIndex} />
        </PieChart>
    )
}
