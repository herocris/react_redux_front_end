// DatePickerField.tsx
import * as React from 'react';
import { Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';

interface DatePickerFieldProps {
  name: string;
  control: any;
  label?: string;
  required?: boolean;
}

export const DatePickerField = React.memo(({
  name,
  control,
  label = 'Selecciona una fecha',
  required = false,
}:DatePickerFieldProps) => {
  //console.log('carga date');
  
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: 'La fecha es obligatoria' } : {}}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <DatePicker
            label={label}
            format="DD/MM/YYYY"
            value={typeof value === "string" ? dayjs(value) : value}//si viene de la base de datos (en texto) lo transforma para que sea compatible
            onChange={(newValue: Dayjs | null) => onChange(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!error,
                size: "small",
                helperText: error?.message,
              },
            }}
          />
        )}
      />
    </LocalizationProvider>
  );
});
