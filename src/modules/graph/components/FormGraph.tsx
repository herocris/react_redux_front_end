import { CatalogOptionsStatus } from '../../resouce/components/CatalogOptionsStatus';
import { Box, Button, Zoom } from '@mui/material'
import { Timeline, BarChart, PieChart,Save, AllInbox, HomeRepairServiceOutlined, Vaccines } from '@mui/icons-material';
import Grid from '@mui/material/Grid2';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { graphSchema } from '../validators';
import { useWatch } from 'react-hook-form';
import { DatePickerField } from '../../../components/DatePickerField';
import { OptionSelector } from '../../../components/OptionSelector';
import { MultipleSelectButton } from '../../../components/MultipleSelectButton';
import { FormGraphProps } from '../types';
import { useAppDispatch } from '../../../hooks/hooks';
import { applyAnalysisFilters } from '../../analysisFilters/slices/analysisFiltersSlice';


type FormFields = z.infer<typeof graphSchema>;
const initStateForm: FormFields = { //asingandole tipo FormFields (graphSchema) para que no de problemas al ponerlo en defaultValues del useForm
    period: 1,
    typeConfiscation: "Drogas",
    typeGraph: "bar",
    start_date: '',
    end_date: '',
    drugs: [],
    weapons: [],
    ammunitions: [],
}

const confiscationIconList = [
    {
        value: 'Drogas',
        label: 'Drogas',
        icono: <Vaccines />
    },
    {
        value: 'Armas',
        label: 'Armas',
        icono: <AllInbox />
    },
    {
        value: 'Municiones',
        label: 'Municiones',
        icono: <HomeRepairServiceOutlined />
    },
]

const graphIconList = [
    {
        value: 'bar',
        label: 'Barra',
        icono: <BarChart />
    },
    {
        value: 'line',
        label: 'Línea',
        icono: <Timeline />
    },
    {
        value: 'pie',
        label: 'Pastel',
        icono: <PieChart />
    },
]

const periodList = [{ value: 1, description: 'Meses' }, { value: 2, description: 'Años' }]


export const FormGraph = ({ optionsStatus, drugCollection, weaponCollection, ammunitionCollection, setGraphType, getGraphData, initialFilters }: FormGraphProps) => {
    const dispatch = useAppDispatch();


    const {
        handleSubmit,
        formState: { errors, },
        control,
    } = useForm<z.input<typeof graphSchema>, unknown, FormFields>({
        defaultValues: { ...initStateForm, ...initialFilters },
        resolver: zodResolver(graphSchema)
    });
    const confiscationSelected = useWatch({ control, name: 'typeConfiscation' });
    //console.log(errors);

    const onSubmit: SubmitHandler<z.infer<typeof graphSchema>> = async (data) => {
        if (optionsStatus.pending || optionsStatus.error) return;
        dispatch(applyAnalysisFilters({
            start_date: data.start_date,
            end_date: data.end_date,
            drugs: data.drugs,
            weapons: data.weapons ?? [],
            ammunitions: data.ammunitions ?? [],
        }));
        getGraphData(data)
    };

    return (
        <Zoom in={true} style={{ transitionDelay: '50ms' }}>
            <Box
                sx={{
                    width: '100%',
                    boxShadow: 24,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                <CatalogOptionsStatus {...optionsStatus} />
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container sx={{ display: 'flex', alignItems: 'center', alignContent: 'center' }}>
                        <Grid size={{ xs: 12 }} container spacing={2} sx={{ mt: 0, display: 'flex', alignItems: 'center', alignContent: 'center', gap: 2 }}>
                            <Grid size={{ xs: 12, md: 12 }}>
                                <MultipleSelectButton
                                    name="period"
                                    label="Periodo"
                                    options={periodList}
                                    control={control}
                                    multiple={false}
                                    error={!!errors?.period}
                                    errorMessage={errors.period?.message}
                                    sizeSmall={true}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                                <DatePickerField name={'start_date'} label="Fecha inicial" control={control} />
                            </Grid>
                            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                                <DatePickerField name={'end_date'} label="Fecha final" control={control} />
                            </Grid>
                            <OptionSelector name='typeConfiscation' iconList={confiscationIconList} control={control} />
                            <Grid size={{ xs: 12, md: 12 }}>
                                {(confiscationSelected == 'Drogas' && drugCollection.length > 0) &&
                                    <MultipleSelectButton disabled={optionsStatus.pending || !!optionsStatus.error}
                                        name="drugs"
                                        label="Drogas"
                                        options={drugCollection}
                                        control={control}
                                        multiple={true}
                                        error={!!errors?.drugs}
                                        errorMessage={errors.drugs?.message}
                                        sizeSmall={true}
                                    />
                                }
                                {confiscationSelected == 'Armas' &&
                                    <MultipleSelectButton disabled={optionsStatus.pending || !!optionsStatus.error}
                                        name="weapons"
                                        label="Armas"
                                        options={weaponCollection}
                                        control={control}
                                        multiple={true}
                                        error={!!errors?.weapons}
                                        errorMessage={errors.weapons?.message}
                                        sizeSmall={true}
                                    />
                                }
                                {confiscationSelected == 'Municiones' &&
                                    <MultipleSelectButton disabled={optionsStatus.pending || !!optionsStatus.error}
                                        name="ammunitions"
                                        label="Municiones"
                                        options={ammunitionCollection}
                                        control={control}
                                        multiple={true}
                                        error={!!errors?.ammunitions}
                                        errorMessage={errors.ammunitions?.message}
                                        sizeSmall={true}
                                    />
                                }
                            </Grid>
                            <OptionSelector name='typeGraph' setOption={value => setGraphType(value)} iconList={graphIconList} control={control} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12 }} sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                            <Button aria-label='Aplicar filtros' disabled={optionsStatus.pending || !!optionsStatus.error} type='submit' variant='contained' loading={false} sx={{ width: '100%' }}>
                                <Save/>
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Zoom>
    )
}
