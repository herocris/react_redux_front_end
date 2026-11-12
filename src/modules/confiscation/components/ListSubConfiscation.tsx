import { Avatar, List, ListItem, ListItemText, ListItemAvatar, Badge, Box, Button, ListItemButton, Typography, Zoom } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { getMediaUrl } from '../../../helpers/getMediaUrl';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import { memo } from 'react';
import { AmmunitionConfiscation } from '../../ammunitionConfiscation';
import { WeaponConfiscation } from '../../weaponConfiscation';
import { DrugConfiscation } from '../../drugConfiscation';


interface ListSubConfiscationProps {
    onCreate?: () => void
    onEdit?: (id: number) => void
    onDelete?: (id: number) => void
    list: DrugConfiscation[] | WeaponConfiscation[] | AmmunitionConfiscation[]
    disabled?: boolean
}

export const ListSubConfiscation = memo(({ onCreate, onEdit, onDelete, list, disabled }: ListSubConfiscationProps) => {
    return (
        <Zoom in={true} style={{ transitionDelay: '50ms' }}>
            <Box sx={{ width: '100%' }}>
                {onCreate && <Button aria-label="Añadir subdecomiso" disabled={disabled} fullWidth color="success" variant="contained" sx={{ mb: 1 }} onClick={onCreate}>
                    <AddCircleIcon fontSize="medium" />
                </Button>}
                <List sx={{ width: '100%', maxHeight: 220, overflow: 'auto', background: 'background.default' }}>
                    {list.length > 0
                        ?
                        list.map((itemList: DrugConfiscation | WeaponConfiscation | AmmunitionConfiscation, index) => (
                            <ListItem key={itemList.identificador ?? index} disablePadding sx={{ display: 'block' }}><ListItemButton disabled={disabled || !onEdit} onClick={() => { if (itemList.identificador !== undefined) onEdit?.(itemList.identificador); }}>
                                <ListItemAvatar>
                                    <Badge badgeContent={itemList.cantidad} color="primary" sx={{ margin: 0 }}>
                                        <Avatar alt="Foto del subdecomiso" src={getMediaUrl(itemList.foto)}>
                                            <BrokenImageOutlinedIcon titleAccess="Imagen no disponible" />
                                        </Avatar>
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
                            {onDelete && <Button disabled={disabled} aria-label="Borrar subdecomiso" onClick={() => { if (itemList.identificador !== undefined) onDelete(itemList.identificador); }}>Borrar</Button>}
                            </ListItem>
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
