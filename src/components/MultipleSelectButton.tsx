import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Controller, ControllerRenderProps, FieldValues } from 'react-hook-form';
import { SelectOptions } from '../shared/interfaces/sharedInterfaces';
import { FormHelperText } from '@mui/material';
import { memo } from 'react';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};



// Componente genérico
interface MultiSelectProps {
    name: string;
    label: string;
    options: SelectOptions[];
    control: any; // Recibe el control de react-hook-form
    defaultValues?: string[]; // Valores seleccionados por defecto
    multiple: boolean
    error?: boolean
    errorMessage?: string
    sizeSmall?: boolean
}

export const MultipleSelectButton = memo(({ name, label, options, control, multiple = false, error = false, errorMessage = '', sizeSmall = false }:MultiSelectProps) => {
    //const theme = useTheme();
    const selectValue = (field: ControllerRenderProps<FieldValues, string>) => {//formateando valor si es multiple o no
        console.log(field);
        
        return multiple ? (field.value.length > 0 ? field.value : []) : (field.value != 0 ? field.value : '')
    }
console.log('carga componente select',options);

    return (
        <FormControl sx={{ mb: sizeSmall ? 1 : 2, width: '100%' }} error={error}>
            <InputLabel id={`${name}-label`}>{label}</InputLabel>
            <Controller
                name={name}
                control={control}
                //defaultValue={defaultValues} // Valores por defecto
                render={({ field }) => {                    
                    return<>
                        <Select
                            {...field}
                            size={sizeSmall ? 'small' : 'medium'}
                            labelId={`${name}-label`}
                            multiple={multiple}
                            input={<OutlinedInput label={label} />}
                            MenuProps={MenuProps}
                            error={error}
                            onChange={(event) => {
                                field.onChange(event.target.value);
                            }}
                            value={selectValue(field)}
                        >
                            {options.map((option) => (
                                <MenuItem key={option.value} value={option.value} >
                                    {option.description}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>{errorMessage}</FormHelperText>
                    </>
                }}
            />
        </FormControl>
    );
});
