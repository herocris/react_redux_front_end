import { Button, TextField, Zoom } from '@mui/material'
import Grid from '@mui/material/Grid2';
import { Map, Save } from '@mui/icons-material';
import { FieldsFormProps } from '../';
import { DatePickerField } from '../../../components';

export const FieldsForm = ({ handleSubmit, onSubmit, loading, register, errors, handleOpenMap, control }: FieldsFormProps) => {
    return (
        <Zoom in={true} style={{ transitionDelay: '150ms' }}  >
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container sx={{ alignItems: 'center', alignContent: 'center', display: 'flex' }}>
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                        <DatePickerField name={'fecha'} control={control} />
                    </Grid>
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                        <TextField
                            disabled={loading}
                            label="Observacion"
                            placeholder='observation'
                            fullWidth
                            {...register("observacion")}
                            error={!!errors.observacion}
                            helperText={errors.observacion?.message}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                        <TextField
                            disabled={loading}
                            label="Dirección"
                            placeholder='direccion'
                            fullWidth
                            {...register("direccion")}
                            error={!!errors.direccion}
                            helperText={errors.direccion?.message}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                        <TextField
                            disabled={loading}
                            label="Departmento"
                            placeholder='departamento'
                            fullWidth
                            {...register("departamento")}
                            error={!!errors.departamento}
                            helperText={errors.departamento?.message}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                        <TextField
                            disabled={loading}
                            label="Municipalidad"
                            placeholder='municipalidad'
                            fullWidth
                            {...register("municipalidad")}
                            error={!!errors.municipalidad}
                            helperText={errors.municipalidad?.message}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12 }} container spacing={2} sx={{ mb: 1, mt: 2 }}>
                        <Button variant='outlined' fullWidth onClick={() => handleOpenMap(true)}>
                            <Map />
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12 }} container spacing={2} sx={{ mb: 2, mt: 2 }}>
                        <Button type='submit' variant='contained' fullWidth loading={loading}>
                            <Save />
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Zoom>
    )
}
