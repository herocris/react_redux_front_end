import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

import { memo, ReactElement, useState } from 'react';
import { Controller } from 'react-hook-form';

interface iconListType {
    value: string
    label: string
    icono: ReactElement
}
interface OptionSelectorProps {
    name: string
    iconList: iconListType[]
    setOption?: Function
    control: any
}
export const OptionSelector = memo(({ name, iconList, setOption=()=>{}, control }: OptionSelectorProps) => {
    console.log('carga option selector',iconList[0].value);
    
    const [value, setValue] = useState(0);
    const handleChange = (newValue: number) => {
        setOption(iconList[newValue].value);//para obtener el valor del label del icono
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Controller
                name={name}
                control={control}
                render={({ field }) => {
                    return <>
                        <BottomNavigation
                            //showLabels
                            value={value}
                            onChange={(_event: React.SyntheticEvent, newValue: number) => {
                                field.onChange(iconList[newValue].value);
                                handleChange(newValue)
                            }}
                        >
                            {iconList.map((icon, index) => (
                                <BottomNavigationAction key={index} label={icon.label} icon={icon.icono} />
                            ))}
                        </BottomNavigation>
                    </>
                }}
            />
        </Box>
    )
})
