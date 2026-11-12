import { Box, Fab } from "@mui/material"
import AddIcon from '@mui/icons-material/Add';
import { memo } from "react";

interface AddFloatingButtonProps {
    handleOpen: (open: boolean) => void;
}
export const AddFloatingButton = memo(({ handleOpen }: AddFloatingButtonProps) => {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "end",
                marginTop: 2,
                width: '100%'
            }}
        >
            <Fab color="primary" aria-label="Añadir" onClick={()=>handleOpen(true)}>
                <AddIcon />
            </Fab>
        </Box>
    )
})
