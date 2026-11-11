import { useId } from 'react';
import { OutlinedInput, InputLabel, MenuItem, FormControl, Select, FormHelperText } from '@mui/material';
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

interface MultiSelectProps<T extends FieldValues, Output extends FieldValues> {
    // Coercing schemas accept unknown inputs; the field path and Control stay linked.
    name: FieldPath<T>;
    label: string;
    options: { value: number; description: string }[];
    control: Control<T, unknown, Output>;
    multiple: boolean;
    disabled?: boolean;
    error?: boolean;
    errorMessage?: string;
    sizeSmall?: boolean;
}

const MenuProps = { PaperProps: { style: { maxHeight: 224, width: 250 } } };

export const MultipleSelectButton = <T extends FieldValues, Output extends FieldValues = T>(
    { name, label, options, control, multiple, disabled, error, errorMessage, sizeSmall = false }: MultiSelectProps<T, Output>,
) => {
    const { field, fieldState } = useController({ name, control });
    const id = useId();
    const invalid = error ?? fieldState.invalid;
    const value: unknown = field.value;
    // Preserve identifier types, including numeric zero. RHF owns selection and reset.
    const selected = multiple ? (Array.isArray(value) ? value : [])
        : typeof value === 'string' || typeof value === 'number' ? value : '';
    return <FormControl sx={{ mb: sizeSmall ? 0 : 2, width: '100%' }} error={invalid} disabled={disabled}>
        <InputLabel id={id + '-label'}>{label}</InputLabel>
        <Select {...field} inputRef={field.ref} disabled={disabled} size={sizeSmall ? 'small' : 'medium'}
            labelId={id + '-label'} aria-describedby={id + '-error'} multiple={multiple}
            input={<OutlinedInput label={label} />} MenuProps={MenuProps} value={selected}>
            {options.map(option => <MenuItem key={option.value} value={option.value}>{option.description}</MenuItem>)}
        </Select>
        <FormHelperText id={id + '-error'}>{errorMessage ?? fieldState.error?.message}</FormHelperText>
    </FormControl>;
};
