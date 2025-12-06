import { Grow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AuthLayoutProps } from '../';

export const AuthLayout = ({ children, title = '' }: AuthLayoutProps) => {
    return (
        <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: '100vh', backgroundColor: 'background.paper', padding: 4 }}
        >
            <Grow
                in={true}
                style={{ transformOrigin: '1 0 0' }}
                {...(true ? { timeout: 1000 } : {})}
            >
                <Grid
                    className='box-shadow'
                    size={{ xs: 12 }}
                    sx={{
                        width: { sm: 450 },
                        backgroundColor: 'background.default',
                        padding: 3,
                        borderRadius: 2
                    }}>
                    <Typography variant='h5' sx={{ mb: 1 }}>{title}</Typography>
                    {children}
                </Grid>
            </Grow>
        </Grid >
    )
}