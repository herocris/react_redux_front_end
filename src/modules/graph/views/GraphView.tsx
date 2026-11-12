import { AnalysisQueryStatus } from '../../analysisFilters/AnalysisQueryStatus';
import { GrapLayout } from "../../../shared/layout/GraphLayout"
import Grid from '@mui/material/Grid2';
import { useGraph } from "../hooks";
import { BarGraph,LineGraph,PieGraph,FormGraph } from "../components";
import { GraphDataTable } from '../components/GraphDataTable';

export const GraphView = () => {
    const {
        optionsStatus, initialFilters, query, enabled,
        ammunitionCollection, 
        drugCollection, 
        weaponCollection, 
        typeGraph, 
        barLineGraph,
        pieGraph, 
        setGraphType, 
        getGraphData 
    } = useGraph()
    
    return (
        <GrapLayout>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 5, lg: 3 }}>
                    <FormGraph initialFilters={initialFilters} optionsStatus={optionsStatus}
                        weaponCollection={weaponCollection}
                        drugCollection={drugCollection}
                        ammunitionCollection={ammunitionCollection}
                        setGraphType={setGraphType}
                        getGraphData={getGraphData}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 7, lg: 9 }}>
                    <AnalysisQueryStatus enabled={!!enabled} fetching={query.isFetching} error={query.error}
                        empty={(typeGraph === 'pie' ? pieGraph : barLineGraph).length === 0} retry={() => { void query.refetch(); }} />
                    {typeGraph == 'bar' && <BarGraph data={barLineGraph} />}
                    {typeGraph == 'line' && <LineGraph data={barLineGraph} />}
                    {typeGraph == 'pie' && <PieGraph data={pieGraph} />}
                    <GraphDataTable data={typeGraph === 'pie' ? pieGraph : barLineGraph} />
                </Grid>
            </Grid>
        </GrapLayout>
    )
}
