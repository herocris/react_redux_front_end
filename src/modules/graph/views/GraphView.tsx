import { GrapLayout } from "../../../shared/layout/GraphLayout"
import Grid from '@mui/material/Grid2';
import { useGraph } from "../hooks";
import { BarGraph,LineGraph,PieGraph,FormGraph } from "../components";

export const GraphView = () => {
    const { 
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
                    <FormGraph
                        weaponCollection={weaponCollection}
                        drugCollection={drugCollection}
                        ammunitionCollection={ammunitionCollection}
                        setGraphType={setGraphType}
                        getGraphData={getGraphData}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 7, lg: 9 }}>
                    {typeGraph == 'bar' && <BarGraph data={barLineGraph} />}
                    {typeGraph == 'line' && <LineGraph data={barLineGraph} />}
                    {typeGraph == 'pie' && <PieGraph data={pieGraph} />}
                </Grid>
            </Grid>
        </GrapLayout>
    )
}
