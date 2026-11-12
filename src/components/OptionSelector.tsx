import { useId, type ReactElement } from 'react';
import { BottomNavigation, BottomNavigationAction, Box, FormHelperText } from '@mui/material';
import { useController, type Control, type FieldPathByValue, type FieldValues } from 'react-hook-form';

interface OptionSelectorProps<T extends FieldValues, Output extends FieldValues> {
    name: FieldPathByValue<T, string>;
    control: Control<T, unknown, Output>;
    iconList: { value: string; label: string; icono: ReactElement }[];
    setOption?: (value: string) => void;
}

export const OptionSelector = <T extends FieldValues, Output extends FieldValues = T>(
    { name, control, iconList, setOption }: OptionSelectorProps<T, Output>,
) => {
    const { field, fieldState } = useController({ name, control });
    const id = useId();
    return <Box sx={{ width: '100%' }}>
        <BottomNavigation value={field.value} onBlur={field.onBlur} aria-describedby={fieldState.error ? id : undefined}
            onChange={(_event, value: string) => {
                field.onChange(value);
                setOption?.(value);
            }}>
            {iconList.map(icon => <BottomNavigationAction key={icon.value} value={icon.value}
                label={icon.label} aria-label={icon.label} aria-pressed={field.value === icon.value} icon={icon.icono} />)}
        </BottomNavigation>
        {fieldState.error && <FormHelperText id={id} error>{fieldState.error.message}</FormHelperText>}
    </Box>;
};
