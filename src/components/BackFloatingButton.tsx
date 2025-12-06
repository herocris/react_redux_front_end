import { Box, Fab } from "@mui/material"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {  useNavigate } from "react-router";

export const BackFloatingButton = () => {
    const navigate = useNavigate();
    //const location = useLocation();
    //console.log(location.state);
    
    return (
        <Box
            //left={250}
            width='100%'
            marginTop={1}
            //position='absolute'
            //sx={{ gridRow: '1', gridColumn: 'span 2' }}
        >
            {/* <Fab color="primary" aria-label="add" onClick={() => navigate('/confiscation', { state: location.state })}>
                <ArrowBackIcon />
            </Fab> */}
            <Fab color="primary" aria-label="add" onClick={() => navigate('/confiscation')}>
                <ArrowBackIcon />
            </Fab>
        </Box>
    )
}
