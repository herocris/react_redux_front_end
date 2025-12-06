import { useDrugConfiscation } from '../hooks';
import { Box } from '@mui/material';
import { DrugConfiscationForm } from './';
import { ListSubConfiscation } from '../../confiscation/components';
import { AlertDialog } from '../../../components';

export const CrudDrugConfiscation = () => {
    const {
        drugConfiscations,
        activeDrugConfiscation,
        openDrugConfiscationForm,
        drugCollection,
        drugPresentationCollection,
        openDialogDrugConfiscation,
        onDeleteDrugConfiscation,
        onSaveOrUptdateDrugConfiscation,
        setIdDrugConfiscation,
        handleOpenDrugConfiscationForm,
        handleOpenDialogDrugConfiscation,
    } = useDrugConfiscation();


    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            {openDrugConfiscationForm
                ?
                <div>
                    <DrugConfiscationForm
                        activeDrugConfiscation={activeDrugConfiscation}
                        drugCollection={drugCollection}
                        drugPresentationCollection={drugPresentationCollection}
                        onSaveOrUptdate={onSaveOrUptdateDrugConfiscation}
                        handleOpen={handleOpenDrugConfiscationForm}
                        handleOpenDialog={handleOpenDialogDrugConfiscation}
                    />
                    {openDialogDrugConfiscation &&
                        <AlertDialog
                            title='Borrar'
                            dialogMessage="Deseas borrar el decomiso?"
                            DeleteEntity={onDeleteDrugConfiscation}
                            handleOpen={handleOpenDialogDrugConfiscation} />
                    }
                </div>
                :
                <ListSubConfiscation
                    setOpen={handleOpenDrugConfiscationForm}
                    list={drugConfiscations}
                    setActiveSubConfiscation={setIdDrugConfiscation}
                />

            }
        </Box>
    )
}
