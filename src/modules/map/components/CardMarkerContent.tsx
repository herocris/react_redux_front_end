//import { getEnvVariables } from '../../../helpers/getEnvVariables';
import { Button, Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
import { Link } from 'react-router';
import { AmmunitionConfiscation } from '../../ammunitionConfiscation';
import { DrugConfiscation } from '../../drugConfiscation';
import { WeaponConfiscation } from '../../weaponConfiscation';
import { CardMarkerContentProps } from '../';

//const { VITE_LOCAL_PHOTOS_URL } = getEnvVariables();

const isDrugConfiscation = (item: any): item is DrugConfiscation =>
  'droga_nombre' in item

const isWeaponConfiscation = (item: any): item is WeaponConfiscation =>
  'arma_nombre' in item

const isAmmunitionConfiscation = (item: any): item is AmmunitionConfiscation =>
  'municion_nombre' in item

export const CardMarkerContent = ({ itemSubConfiscation }: CardMarkerContentProps) => {

    return (
        <Card sx={{ maxWidth: 345 }}>
            <CardMedia
                sx={{ height: 140 }}
                //image={`${VITE_LOCAL_PHOTOS_URL}/${itemSubConfiscation?.foto}`}
                image={itemSubConfiscation?.foto as string}
                title="media info"
            />
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {isDrugConfiscation(itemSubConfiscation) && `Nombre:${itemSubConfiscation.droga_nombre}`}
                    {isWeaponConfiscation(itemSubConfiscation) && `Nombre:${itemSubConfiscation.arma_nombre}`}
                    {isAmmunitionConfiscation(itemSubConfiscation) && `Nombre:${itemSubConfiscation.municion_nombre}`}                
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Cantidad: {itemSubConfiscation?.cantidad}
                </Typography>
            </CardContent>
            <CardActions>
                <Link to={`/confiscation/edit/${itemSubConfiscation?.decomiso}`}>
                    <Button size="small">Ver</Button>
                </Link>
            </CardActions>
        </Card>
    )
}
