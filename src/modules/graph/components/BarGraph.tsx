import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarGraphProps } from '../types';


const randomHexColor = (): string => {
    return "#" + Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0");
}

export const BarGraph = ({ data }: BarGraphProps) => {
    return (
        <BarChart
            style={{ width: '100%', aspectRatio: 1.618 }}
            responsive
            data={data ?? []}
            margin={{
                top: 5,
                right: 0,
                left: 0,
                bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis width="auto" />
            <Tooltip />
            <Legend />
            {Object.keys(data[0] ?? {}).map((dat, index) => {
                if (dat != 'name') {
                    return <Bar key={index} dataKey={dat} fill={randomHexColor()} activeBar={<Rectangle fill="pink" stroke="blue" />} />
                }
            })}
        </BarChart>
    )
}
