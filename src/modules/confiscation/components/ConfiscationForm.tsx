import { useRef } from 'react';
import { getApiErrorMessage, getApiErrorText } from '../../../api/apiErrors';
import { Alert,Typography,Box } from '@mui/material';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { confiscationSchema } from '../validators';
import { ConfiscationMap, FieldsForm } from './';
import { useConfiscationForm } from '../hooks';


type FormFields = z.infer<typeof confiscationSchema>;
export const ConfiscationForm = () => {
    const {
        openMap,
        onSaveOrUptdate,
        handleOpenMap,
        activeConfiscation
    } = useConfiscationForm()

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
        control,        
    } = useForm<z.input<typeof confiscationSchema>, unknown, FormFields>({
        defaultValues: activeConfiscation,
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
            setError('root.server', { message: getApiErrorText(error) });
            const message = getApiErrorMessage(error);
            if (typeof message === 'object') {
                for (const [field, messages] of Object.entries(message)) {
                    if (Object.prototype.hasOwnProperty.call(confiscationSchema.shape, field)) {
                        setError(field as keyof FormFields, { message: messages.join(' ') });
                    }
                }
            }
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
                <Typography variant='h5' sx={{ mb: 1 }}>{activeConfiscation.identificador?'Editar decomiso':'Crear decomiso'}</Typography>
                {errors.root?.server && <Alert severity="error">{errors.root.server.message}</Alert>}
                {openMap ?
                    <ConfiscationMap handleOpen={handleOpenMap} lat={activeConfiscation.latitud} lng={activeConfiscation.longitud} nameLat={'latitud'} nameLng={'longitud'} nameDepto={'departamento'} nameMuni={'municipalidad'} control={control} />
                    :
                    <FieldsForm handleSubmit={handleSubmit} onSubmit={onSubmit} loading={isSubmitting} register={register} errors={errors} handleOpenMap={handleOpenMap} control={control} />
                }
            </Box>
        </>
    );
}

