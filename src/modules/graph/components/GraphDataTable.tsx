import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import type { BarLineGraph, PieGraph } from '../types';

// The same query data remains available without relying on color, hover or SVG.
export const GraphDataTable = ({ data }: { data: BarLineGraph[] | PieGraph[] }) => {
    if (!data.length) return null;
    const rows: Record<string, string | number>[] = data.map(row => ({ ...row }));
    const columns = [...new Set(rows.flatMap(row => Object.keys(row)))];
    return <Box component="details" sx={{ mt: 2 }}>
        <Box component="summary" sx={{ cursor: 'pointer', p: 1 }}>Ver datos del gráfico</Box>
        <TableContainer tabIndex={0} role="region" aria-label="Datos del gráfico" sx={{ maxWidth: '100%' }}>
            <Table size="small">
                <caption>Valores del gráfico mostrado</caption>
                <TableHead><TableRow>{columns.map(key => <TableCell key={key} scope="col">
                    {key === 'name' ? 'Periodo o categoría' : key === 'value' ? 'Cantidad' : key}
                </TableCell>)}</TableRow></TableHead>
                <TableBody>{rows.map((row, index) => <TableRow key={index}>
                    {columns.map((key, column) => <TableCell key={key} component={column === 0 ? 'th' : 'td'} scope={column === 0 ? 'row' : undefined}>
                        {key in row ? String(row[key]) : '—'}
                    </TableCell>)}
                </TableRow>)}</TableBody>
            </Table>
        </TableContainer>
    </Box>;
};
