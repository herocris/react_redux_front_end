import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { LineGraphProps } from '../types';

const randomHexColor = (): string => {
    return "#" + Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0");
}

export const LineGraph = ({ data }: LineGraphProps) => {
    return (
        <LineChart style={{ width: '100%', aspectRatio: 1.618 }} responsive data={data ?? []}>
            <CartesianGrid />
            <XAxis dataKey="name" />
            <YAxis width="auto"/>
            <Tooltip />
            <Legend />
            {Object.keys(data[0] ?? {}).map((dat, index) => {
                if (dat != 'name') {
                    return <Line key={index} dataKey={dat} stroke={randomHexColor()} />
                }
            })}
        </LineChart>
    )
}
