import { CatalogOptionsStatus } from '../../resouce/components/CatalogOptionsStatus';
import { Box, Button, Zoom } from '@mui/material'
import Grid from '@mui/material/Grid2';
import  {Whatshot,LocationOn,Save} from '@mui/icons-material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { mapSchema } from '../validators';
import { MultipleSelectButton, DatePickerField, OptionSelector } from '../../../components';
//import { useState } from 'react';
import { FormGraphProps } from '../';
import { useAppDispatch } from '../../../hooks/hooks';
import { applyAnalysisFilters } from '../../analysisFilters/slices/analysisFiltersSlice';

type FormFields = z.infer<typeof mapSchema>;
const initStateForm: FormFields = { //asingandole tipo FormFields (mapSchema) para que no de problemas al ponerlo en defaultValues del useForm
    typeMap: 'location',
    start_date: '',
    end_date: '',
    drugs: [],
    weapons: [],
    ammunitions: [],
}



const graphIconList = [
    {
        value: 'location',
        label: 'Ubicación',
        icono: <LocationOn />
    },
    {
        value: 'hot',
        label: 'Calor',
        icono: <Whatshot />
    },
]

export const FormMap = ({ optionsStatus, drugCollection, weaponCollection, ammunitionCollection, setMapType, getMapData }: FormGraphProps) => {
    const dispatch = useAppDispatch();

    const {
        handleSubmit,
        formState: { errors, },
        control,
        //setValue
    } = useForm<z.input<typeof mapSchema>, unknown, FormFields>({
        defaultValues: initStateForm,
        resolver: zodResolver(mapSchema)
    });
    //console.log('carga formulario');
    //console.log(errors);

    const onSubmit: SubmitHandler<z.infer<typeof mapSchema>> = async (data) => {
        if (optionsStatus.pending || optionsStatus.error) return;
        dispatch(applyAnalysisFilters({
            start_date: data.start_date,
            end_date: data.end_date,
            drugs: data.drugs,
            weapons: data.weapons ?? [],
            ammunitions: data.ammunitions ?? [],
        }));
        getMapData(data)
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
                            <OptionSelector name='typeMap' setOption={value => setMapType(value)} iconList={graphIconList} control={control} />
                            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                                <DatePickerField name={'start_date'} control={control} />
                            </Grid>
                            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                                <DatePickerField name={'end_date'} control={control} />
                            </Grid>

                            <Grid size={{ xs: 12, md: 12 }}>
                                {drugCollection.length > 0 &&
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
                                {weaponCollection.length > 0 &&
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
                                {ammunitionCollection.length > 0 &&
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

                        </Grid>
                        <Grid size={{ xs: 12, sm: 12 }} sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                            <Button aria-label='Aplicar filtros' disabled={optionsStatus.pending || !!optionsStatus.error} type='submit' variant='contained' loading={false} sx={{ width: '100%' }}>
                                <Save />
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Zoom>
    )
}
