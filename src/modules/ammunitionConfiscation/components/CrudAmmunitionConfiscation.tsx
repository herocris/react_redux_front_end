import { useAmmunitionConfiscation } from '../hooks';
import { Box } from '@mui/material';
import { AmmunitionConfiscationForm } from './';
import { ListSubConfiscation } from '../../confiscation/components/';
import { AlertDialog } from '../../../components';

export const CrudAmmunitionConfiscation = () => {
    const {
        ammunitionConfiscations,
        activeAmmunitionConfiscation,
        openAmmunitionConfiscationForm,
        ammunitionCollection,
        openDialogAmmunitionConfiscation,
        onDeleteAmmunitionConfiscation,
        onSaveOrUptdateAmmunitionConfiscation,
        setIdAmmunitionConfiscation,
        handleOpenAmmunitionConfiscationForm,
        handleOpenDialogAmmunitionConfiscation,
    } = useAmmunitionConfiscation();
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            {openAmmunitionConfiscationForm
                ?
                <div>
                    <AmmunitionConfiscationForm
                        activeAmmunitionConfiscation={activeAmmunitionConfiscation}
                        ammunitionCollection={ammunitionCollection}
                        onSaveOrUptdate={onSaveOrUptdateAmmunitionConfiscation}
                        handleOpen={handleOpenAmmunitionConfiscationForm}
                        handleOpenDialog={handleOpenDialogAmmunitionConfiscation}
                    />
                    {openDialogAmmunitionConfiscation &&
                        <AlertDialog
                            title='Borrar'
                            dialogMessage="Deseas borrar el decomiso?"
                            DeleteEntity={onDeleteAmmunitionConfiscation}
                            handleOpen={handleOpenDialogAmmunitionConfiscation} />
                    }
                </div>
                :
                <ListSubConfiscation
                    setOpen={handleOpenAmmunitionConfiscationForm}
                    list={ammunitionConfiscations}
                    setActiveSubConfiscation={setIdAmmunitionConfiscation}
                />
            }
        </Box>
    )
}
