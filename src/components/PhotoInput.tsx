import { useId, useRef, useState, useEffect } from "react";
import { Box, Avatar, Typography, IconButton, Tooltip, Zoom } from "@mui/material";
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import DeleteIcon from "@mui/icons-material/Delete";
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import { useController, type Control, type FieldPathByValue, type FieldValues } from "react-hook-form";
import { getMediaUrl } from "../helpers/getMediaUrl";
interface FileUploadFieldProps<T extends FieldValues, Output extends FieldValues> {
    name: FieldPathByValue<T, File | string | null | undefined | (File | string)[]>;
    control: Control<T, unknown, Output>;
    label?: string;
    accept?: string;
    multiple?: boolean;
}

export const PhotoInput = <T extends FieldValues, Output extends FieldValues = T>({
    name,
    control,
    label = "Subir archivo",
    accept = "image/*",
    multiple = false
}: FileUploadFieldProps<T, Output>) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const errorId = useId();
    const [previews, setPreviews] = useState<(string | undefined)[]>([]);

    const { field: { onChange, value, onBlur, ref }, fieldState: { error } } = useController({ name, control });

    useEffect(() => {
        const files: unknown[] = multiple && Array.isArray(value) ? value : [value];
        const objectUrls: string[] = [];
        const urls = files.flatMap(file => {
            if (file instanceof File) {
                const url = URL.createObjectURL(file);
                objectUrls.push(url);
                return [url];
            }
            return typeof file === "string" && file.length > 0
                ? [getMediaUrl(file)]
                : [];
        });
        setPreviews(urls);
        return () => objectUrls.forEach(url => URL.revokeObjectURL(url));
    }, [value, multiple]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;//tomando archivos de e
        if (!files || files.length === 0) return;//comprobando si vienen archivos
        const selectedFiles = Array.from(files);//crea un arreglo a partir de files
        if (multiple) {//comprobando si es multiple o no; si lo es envia todos los archivos y si no solo uno
            onChange(selectedFiles);
        } else {
            onChange(selectedFiles[0]);
        }
        e.target.value = "";
    };
    const handleRemove = (index?: number) => {
        if (multiple && Array.isArray(value)) {//comprobando si es arreglo y si es multiple
            const updatedFiles = value.filter((_: unknown, i: number) => i !== index);//quitando archivo de acuerdo al index proporcionado y actualizando la lista de archivos para volverla a setear
            onChange(updatedFiles);
        } else {
            onChange(null);//borrando archivo si solo es un unico archivo (componente no es multiple)
        }
    };
    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            {/* Input invisible */}
            <input
                type="file"
                ref={fileInputRef}
                name={name}
                aria-label={label}
                onBlur={onBlur}
                style={{ display: "none" }}
                accept={accept}
                multiple={multiple}
                onChange={handleFileChange}
            />
            {/* Vista previa */}
            {previews.length > 0 ? (
                <Box
                    display="flex"
                    flexWrap="wrap"
                    gap={1.5}
                    justifyContent="center"
                >
                    {previews.map((src, index) => (
                        <Zoom
                            in={true}
                            key={index}
                            style={{ transitionDelay: '40ms' }}
                        >
                            <Box position="relative">
                                <IconButton
                                    ref={index === 0 ? ref : undefined}
                                    aria-describedby={error ? errorId : undefined}
                                    aria-label={`Eliminar imagen ${index + 1}`}
                                    color="error"
                                    size="small"
                                    onClick={() => handleRemove(index)}
                                    sx={{
                                        position: "absolute",
                                        top: -8,
                                        right: -16,
                                        bgcolor: "white",
                                        "&:hover": { bgcolor: "white" },
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                                <Avatar
                                    src={src}
                                    alt={`Vista previa ${index + 1}`}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        border: "2px solid #1976d2",
                                        boxShadow: 5,
                                    }}
                                >
                                    <BrokenImageOutlinedIcon titleAccess="Imagen no disponible" />
                                </Avatar>
                            </Box>
                        </Zoom>
                    ))}
                </Box>
            ) : (
                <Zoom
                    in={true}
                    style={{ transitionDelay: '40ms' }}
                >
                    <Tooltip title={label} disableInteractive>
                        <Box
                            component="button"
                            ref={ref}
                            type="button"
                            aria-label={label}
                            aria-invalid={!!error}
                            aria-describedby={error ? errorId : undefined}
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            sx={{
                                border: '4px dashed grey',
                                borderRadius: '10px',
                                width: '100%',
                                cursor: 'pointer',
                                minHeight: 100
                            }}
                            p={1}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <AddPhotoAlternateOutlinedIcon fontSize="large" color="disabled" />
                        </Box>
                    </Tooltip>
                </Zoom>
            )}
            {error && (
                <Typography id={errorId} role="alert" color="error" variant="caption">
                    {error.message}
                </Typography>
            )}
        </Box>
    );
};
