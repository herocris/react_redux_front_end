import { graphColor } from './graphColors';
import { Box, useTheme } from '@mui/material';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { LineGraphProps } from '../types';



export const LineGraph = ({ data }: LineGraphProps) => {
    const { palette } = useTheme();
    return (
        <LineChart style={{ width: '100%', aspectRatio: 1.618 }} responsive data={data ?? []}>
            <CartesianGrid />
            <XAxis dataKey="name" tick={{ fill: 'currentColor' }} />
            <YAxis width="auto" tick={{ fill: 'currentColor' }}/>
            <Tooltip />
            <Legend formatter={value => <Box component="span" sx={{ color: 'text.primary' }}>{value}</Box>} />
            {Object.keys(data[0] ?? {}).map((dat, index) => {
                if (dat != 'name') {
                    return <Line key={index} dataKey={dat} stroke={graphColor(index, palette.mode)} />
                }
            })}
        </LineChart>
    )
}
