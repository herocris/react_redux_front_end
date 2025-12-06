import { Box, Button, Zoom } from '@mui/material'
import { Timeline, BarChart, PieChart,Save, AllInbox, HomeRepairServiceOutlined, Vaccines } from '@mui/icons-material';
import Grid from '@mui/material/Grid2';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { graphSchema } from '../validators';
import { useState } from 'react';
import { DatePickerField,OptionSelector,MultipleSelectButton } from '../../../components';
import { FormGraphProps } from '../types';


type FormFields = z.infer<typeof graphSchema>;
const initStateForm: FormFields = { //asingandole tipo FormFields (graphSchema) para que no de problemas al ponerlo en defaultValues del useForm
    period: 0,
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
        label: 'Linea',
        icono: <Timeline />
    },
    {
        value: 'pie',
        label: 'Pastel',
        icono: <PieChart />
    },
]

const periodList = [{ value: 1, description: 'Meses' }, { value: 2, description: 'Años' }]


export const FormGraph = ({ drugCollection, weaponCollection, ammunitionCollection, setGraphType, getGraphData }: FormGraphProps) => {
    const [confiscationSelected, setConfiscationSelected] = useState('Drogas')

    const {
        handleSubmit,
        formState: { errors, },
        control,
    } = useForm<FormFields>({
        defaultValues: initStateForm,
        resolver: zodResolver(graphSchema)
    });
    //console.log('carga formulario');
    //console.log(errors);

    const onSubmit: SubmitHandler<z.infer<typeof graphSchema>> = async (data) => {
        getGraphData(data, data.typeConfiscation)
    };
    //para resetear los select de subdecomisos no seleccionados
    // useEffect(() => {
    //     if (confiscationSelected == 'Drogas') {
    //         console.log('Drogas');
    //         setValue('ammunitions', [])
    //         setValue('weapons', [])
    //     } else if (confiscationSelected == 'Armas') {
    //         console.log('Armas');
    //         setValue('ammunitions', [])
    //         setValue('drugs', [])
    //     } else if (confiscationSelected == 'Municiones') {
    //         console.log('Municiones');
    //         setValue('weapons', [])
    //         setValue('drugs', [])
    //     }
    // }, [confiscationSelected])

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
                                <DatePickerField name={'start_date'} control={control} />
                            </Grid>
                            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                                <DatePickerField name={'end_date'} control={control} />
                            </Grid>
                            <OptionSelector name='typeConfiscation' iconList={confiscationIconList} setOption={setConfiscationSelected} control={control} />
                            <Grid size={{ xs: 12, md: 12 }}>
                                {(confiscationSelected == 'Drogas' && drugCollection.length > 0) &&
                                    <MultipleSelectButton
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
                                    <MultipleSelectButton
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
                                    <MultipleSelectButton
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
                            <OptionSelector name='typeGraph' setOption={setGraphType} iconList={graphIconList} control={control} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 12 }} sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                            <Button type='submit' variant='contained' loading={false} sx={{ width: '100%' }}>
                                <Save/>
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Zoom>
    )
}
