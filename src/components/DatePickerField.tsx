import { useController, type Control, type FieldPathByValue, type FieldValues } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import { esES } from '@mui/x-date-pickers/locales';

interface DatePickerFieldProps<T extends FieldValues, Output extends FieldValues> {
    name: FieldPathByValue<T, string | Dayjs | null | undefined>;
    control: Control<T, unknown, Output>;
    label?: string;
    required?: boolean;
    disabled?: boolean;
}

export const DatePickerField = <T extends FieldValues, Output extends FieldValues = T>({
    name, control, label = 'Selecciona una fecha', required = false, disabled,
}: DatePickerFieldProps<T, Output>) => {
    const { field, fieldState: { error } } = useController({ name, control,
        rules: required ? { required: 'La fecha es obligatoria' } : {},
    });
    const value: unknown = field.value;
    const date = typeof value === 'string' ? (value ? dayjs(value) : null) : dayjs.isDayjs(value) ? value : null;
    return <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es"
        localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}>
        <DatePicker label={label} format="DD/MM/YYYY" value={date} disabled={disabled}
            inputRef={field.ref} onChange={(newValue: Dayjs | null) => field.onChange(newValue)}
            slotProps={{ textField: { name: field.name, onBlur: field.onBlur, required,
                fullWidth: true, error: !!error, size: 'small', helperText: error?.message } }} />
    </LocalizationProvider>;
};
