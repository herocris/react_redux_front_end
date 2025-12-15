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

export const FormMap = ({ drugCollection, weaponCollection, ammunitionCollection, setMapType, getMapData }: FormGraphProps) => {
    //const [confiscationSelected, setConfiscationSelected] = useState('Drogas')

    const {
        handleSubmit,
        formState: { errors, },
        control,
        //setValue
    } = useForm<FormFields>({
        defaultValues: initStateForm,
        resolver: zodResolver(mapSchema)
    });
    //console.log('carga formulario');
    //console.log(errors);

    const onSubmit: SubmitHandler<z.infer<typeof mapSchema>> = async (data) => {
        console.log(data);
        getMapData(data)
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
                            <OptionSelector name='typeMap' setOption={setMapType} iconList={graphIconList} control={control} />
                            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                                <DatePickerField name={'start_date'} control={control} />
                            </Grid>
                            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                                <DatePickerField name={'end_date'} control={control} />
                            </Grid>

                            <Grid size={{ xs: 12, md: 12 }}>
                                {drugCollection.length > 0 &&
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
                                {weaponCollection.length > 0 &&
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
                                {ammunitionCollection.length > 0 &&
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

                        </Grid>
                        <Grid size={{ xs: 12, sm: 12 }} sx={{ mt: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                            <Button type='submit' variant='contained' loading={false} sx={{ width: '100%' }}>
                                <Save />
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Zoom>
    )
}
