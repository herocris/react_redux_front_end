import { Avatar, List, ListItemText, ListItemAvatar, Badge, Box, Button, ListItemButton, Typography, Zoom } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { getEnvVariables } from '../../../helpers/getEnvVariables';
import { memo } from 'react';
import { AmmunitionConfiscation } from '../../ammunitionConfiscation';
import { WeaponConfiscation } from '../../weaponConfiscation';
import { DrugConfiscation } from '../../drugConfiscation';


interface ListSubConfiscationProps {
    setOpen: Function
    list: DrugConfiscation[] | WeaponConfiscation[] | AmmunitionConfiscation[]
    setActiveSubConfiscation: Function
}

const { VITE_LOCAL_PHOTOS_URL } = getEnvVariables();

export const ListSubConfiscation = memo(({ setOpen, list, setActiveSubConfiscation }: ListSubConfiscationProps) => {
    const clickItemList = (id: string) => {
        setActiveSubConfiscation(id)
        setOpen(true)
    }
    const newItemList = () => {
        setActiveSubConfiscation(0)
        setOpen(true)
    }
    console.log('carga listItem', list);
    return (
        <Zoom in={true} style={{ transitionDelay: '50ms' }}>
            <Box sx={{ width: '100%' }}>
                <Button fullWidth color="success" variant="contained" sx={{ mb: 1 }} onClick={() => newItemList()}>
                    <AddCircleIcon fontSize="medium" />
                </Button>
                <List sx={{ width: '100%', maxHeight: 220, overflow: 'auto', background: 'background.default' }}>
                    {list.length > 0
                        ?
                        list.map((itemList: DrugConfiscation | WeaponConfiscation | AmmunitionConfiscation, index) => (
                            <ListItemButton key={index} onClick={() => clickItemList(itemList?.identificador as string)}>
                                <ListItemAvatar>
                                    <Badge badgeContent={itemList.cantidad} color="primary" sx={{ margin: 0 }}>
                                        <Avatar alt={"Remy Sharp"} src={`${VITE_LOCAL_PHOTOS_URL}/${itemList?.foto}` as string} />
                                    </Badge>
                                </ListItemAvatar>
                                {
                                    'droga_nombre' in itemList && //comprobando el tipo de itemList
                                    <ListItemText primary={itemList.droga_nombre} secondary={itemList.presentacion_nombre} />
                                }
                                {
                                    'arma_nombre' in itemList &&
                                    <ListItemText primary={itemList.arma_nombre} />
                                }
                                {
                                    'municion_nombre' in itemList &&
                                    <ListItemText primary={itemList.municion_nombre} />
                                }
                            </ListItemButton>
                        )
                        )
                        :
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>

                            <Typography color='textDisabled'>
                                sin registros
                            </Typography>
                        </Box>
                    }
                </List>
            </Box>
        </Zoom>
    )
}
)