//import { getEnvVariables } from '../../../helpers/getEnvVariables';
import { CardMarkerContent } from './';
import { MarkerContentProps } from '../';
import { DrugConfiscation } from '../../drugConfiscation';
import { AmmunitionConfiscation } from '../../ammunitionConfiscation';
import { WeaponConfiscation } from '../../weaponConfiscation';



//const { VITE_LOCAL_PHOTOS_URL } = getEnvVariables();

export const MarkerContent = ({ marker }: MarkerContentProps) => {
    return (
        <div>
            {marker?.drug_confiscations.length > 0 && marker?.drug_confiscations.map((drug_conf: DrugConfiscation, index: number) => (
                <CardMarkerContent key={index} itemSubConfiscation={drug_conf} />
            ))}
            {marker?.weapon_confiscations.length > 0 && marker?.weapon_confiscations.map((weapon_conf: WeaponConfiscation, index: number) => (
                <CardMarkerContent key={index} itemSubConfiscation={weapon_conf} />
            ))}
            {marker?.ammunition_confiscations.length > 0 && marker?.ammunition_confiscations.map((ammunition_conf: AmmunitionConfiscation, index: number) => (
                <CardMarkerContent key={index} itemSubConfiscation={ammunition_conf} />
            ))}
        </div>


    )
}
