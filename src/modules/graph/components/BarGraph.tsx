import { graphColor } from './graphColors';
import { Box, useTheme } from '@mui/material';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarGraphProps } from '../types';




export const BarGraph = ({ data }: BarGraphProps) => {
    const { palette } = useTheme();
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
            <XAxis dataKey="name" tick={{ fill: 'currentColor' }} />
            <YAxis width="auto" tick={{ fill: 'currentColor' }} />
            <Tooltip />
            <Legend formatter={value => <Box component="span" sx={{ color: 'text.primary' }}>{value}</Box>} />
            {Object.keys(data[0] ?? {}).map((dat, index) => {
                if (dat != 'name') {
                    return <Bar key={index} dataKey={dat} fill={graphColor(index, palette.mode)} activeBar={<Rectangle stroke={palette.text.primary} strokeWidth={2} />} />
                }
            })}
        </BarChart>
    )
}
