import { useRef } from 'react';
import { setServerFormErrors } from '../../../helpers/setServerFormErrors';
import { Alert,Typography,Box } from '@mui/material';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { confiscationSchema } from '../validators';
import { ConfiscationMap, FieldsForm } from './';
import { useConfiscationForm } from '../hooks';
import type { Confiscation } from '../types';


type FormFields = z.infer<typeof confiscationSchema>;
export const ConfiscationForm = ({ initial }: { initial?: Confiscation }) => {
    const {
        openMap,
        onSaveOrUptdate,
        handleOpenMap,
    } = useConfiscationForm(initial)

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
        control,
    } = useForm<z.input<typeof confiscationSchema>, unknown, FormFields>({
        // RHF takes this snapshot once. Refetches never reset the draft.
        defaultValues: initial ?? { fecha: '', observacion: '', direccion: '', departamento: '', municipalidad: '', latitud: 51.505, longitud: -0.09 },
        resolver: zodResolver(confiscationSchema)
    });
    //console.log(activeConfiscation);

    const submitting = useRef(false);
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        if (submitting.current) return;
        submitting.current = true;
        try {
            await onSaveOrUptdate(data);
        } catch (error) {
            setServerFormErrors(error, setError, ['identificador', 'fecha', 'observacion', 'direccion', 'departamento', 'municipalidad', 'latitud', 'longitud']);
        } finally {
            submitting.current = false;
        }
    };

    return (
        <>
            <Box sx={{
                //position: 'absolute',
                // top: '54%',
                // left: '57%',
                //transform: 'translate(-50%, -50%)',
                // gridRow: '3',
                // gridColumn: 'span 3',
                width: '100%',
                boxShadow: 24,
                p: 4,
            }}>
                <Typography variant='h5' sx={{ mb: 1 }}>{initial?.id ? 'Editar decomiso' : 'Crear decomiso'}</Typography>
                {errors.root?.server && <Alert severity="error">{errors.root.server.message}</Alert>}
                {openMap ?
                    <ConfiscationMap handleOpen={handleOpenMap} lat={initial?.latitud ?? 51.505} lng={initial?.longitud ?? -0.09} nameLat={'latitud'} nameLng={'longitud'} nameDepto={'departamento'} nameMuni={'municipalidad'} control={control} />
                    :
                    <FieldsForm handleSubmit={handleSubmit} onSubmit={onSubmit} loading={isSubmitting} register={register} errors={errors} handleOpenMap={handleOpenMap} control={control} />
                }
            </Box>
        </>
    );
}

