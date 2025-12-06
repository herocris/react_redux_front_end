import { useEffect } from 'react';
import {Box,Modal,Button, TextField, Typography, Zoom} from '@mui/material';
import Grid from '@mui/material/Grid2';
import SaveIcon from '@mui/icons-material/Save';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DrugFormModalProps } from '../';
import { SubmitHandler, useForm } from "react-hook-form";
import { drugSchema } from '../validators';
import { boxStyleFormModal } from '../../../helpers/boxStyle';
import { PhotoInput } from '../../../components';



type FormFields = z.infer<typeof drugSchema>;
export const DrugFormModal = ({ handleOpen,
     loading,
     onSaveOrUptdate,
     activeDrug,
     errorMessage 
    }: DrugFormModalProps) => {
    const { 
        register, 
        handleSubmit, 
        setError, 
        formState: { errors, }, 
        reset, 
        control 
    } = useForm<FormFields>({
        defaultValues: activeDrug, 
        resolver: zodResolver(drugSchema)
    });

    const onSubmit: SubmitHandler<z.infer<typeof drugSchema>> = async (data) => {
        await onSaveOrUptdate(data)
        reset()
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
            <Modal
                open={true}
                onClose={() => {
                    handleOpen(false)
                    reset()
                }}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={boxStyleFormModal}>
                    <Typography variant='h5' sx={{ mb: 1 }}>{activeDrug.id?'Editar droga':'Crear droga'}</Typography>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Zoom in={true} style={{ transitionDelay: '150ms' }}>
                            <Grid container sx={{ alignItems: 'center', alignContent: 'center', display: 'flex' }}>
                                <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                                    <TextField
                                        disabled={loading}
                                        label="Descripción"
                                        placeholder='descripcion'
                                        fullWidth
                                        {...register("descripcion")}
                                        error={!!errors.descripcion}
                                        helperText={errors.descripcion?.message}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                                    <PhotoInput
                                        name="logo"
                                        control={control}
                                        label="Subir imagen de perfil"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 12 }} container spacing={2} sx={{ mb: 2, mt: 2 }}>
                                    <Button type='submit' variant='contained' fullWidth loading={loading}>
                                        <SaveIcon />
                                    </Button>
                                </Grid>
                            </Grid>
                        </Zoom>
                    </form>
                </Box>
            </Modal>
        </>
    );
}

