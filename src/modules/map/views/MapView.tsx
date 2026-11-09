import { AnalysisQueryStatus } from '../../analysisFilters/AnalysisQueryStatus';
import { GrapLayout } from "../../../shared/layout/GraphLayout"
import Grid from '@mui/material/Grid2';
import { FormMap ,MapComponent} from "../components";
import { useMap } from "../hooks";



export const MapView = () => {
    const {
        optionsStatus, initialFilters, query, enabled,
        ammunitionCollection, 
        drugCollection, 
        weaponCollection,  
        Mapitems,
        typeMap, 
        setMapType, 
    } = useMap()


    
    return (
        <GrapLayout>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 5, lg: 3 }}>
                    <FormMap initialFilters={initialFilters} optionsStatus={optionsStatus}
                        weaponCollection={weaponCollection}
                        drugCollection={drugCollection}
                        ammunitionCollection={ammunitionCollection}
                        setMapType={setMapType}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 7, lg: 9 }}>
                    <AnalysisQueryStatus enabled={!!enabled} fetching={query.isFetching} error={query.error}
                        empty={Mapitems.length === 0} retry={() => { void query.refetch(); }} />
                    <MapComponent Mapitems={Mapitems} typeMap={typeMap} />
                </Grid>
            </Grid>
        </GrapLayout>
    )
}
