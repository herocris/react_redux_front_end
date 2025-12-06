import { useEffect } from 'react';
import { Typography,Box } from '@mui/material';
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
        errorMessage,
        onSaveOrUptdate,
        handleOpenMap,
        loading,
        activeConfiscation
    } = useConfiscationForm()

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, },
        control,        
    } = useForm<FormFields>({
        defaultValues: activeConfiscation,
        resolver: zodResolver(confiscationSchema)
    });
    //console.log(activeConfiscation);

    const onSubmit: SubmitHandler<z.infer<typeof confiscationSchema>> = async (data) => {
        await onSaveOrUptdate(data)
    };

    useEffect(() => {
        if (typeof errorMessage === 'object') {
            for (const formValue of Object.keys(errorMessage)) {
                setError(formValue as keyof FormFields, {
                    message: (errorMessage as Record<string, string[]>)[formValue].toString()
                });
            }
        }
    }, [errorMessage]);

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
                {openMap ?
                    <ConfiscationMap handleOpen={handleOpenMap} lat={activeConfiscation.latitud} lng={activeConfiscation.longitud} nameLat={'latitud'} nameLng={'longitud'} nameDepto={'departamento'} nameMuni={'municipalidad'} control={control} />
                    :
                    <FieldsForm handleSubmit={handleSubmit} onSubmit={onSubmit} loading={loading} register={register} errors={errors} handleOpenMap={handleOpenMap} control={control} />
                }
            </Box>
        </>
    );
}

