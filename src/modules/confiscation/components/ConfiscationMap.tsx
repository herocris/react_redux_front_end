import { ConfiscationMapModalProps } from '../';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import Grid from '@mui/material/Grid2';
import { Button, Typography, Zoom, Box } from '@mui/material';
import axios from 'axios';
import { Controller } from 'react-hook-form';


export const ConfiscationMap = ({ handleOpen, lat, lng, nameLat, nameLng, nameDepto, nameMuni, control }: ConfiscationMapModalProps) => {
    const fetchLocationData = async (lat: number, lng: number, onChangeDepto: Function, onChangeMuni: Function) => {
        try {
            const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
                params: {
                    lat,
                    lon: lng,
                    format: 'json',
                    addressdetails: 1,
                },
            });

            const data = response.data;
            //console.log(data);

            const address = data.address || {};
            onChangeDepto(address.state)
            onChangeMuni(address.municipality || address.town || address.city)
            //setMapData(lat, lng, address.state, address.municipality || address.town || address.city)

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error al obtener dirección:', error.response?.data || error.message);
            } else {
                console.error('Error desconocido:', error);
            }
        }
    };

    // 🧭 Este componente escucha los clics en el mapa
    const LocationMarker = ({ onChangeLat, onChangeLng, onChangeDepto, onChangeMuni, lati, longi }: any) => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                onChangeLat(lat)
                onChangeLng(lng)
                fetchLocationData(lat, lng, onChangeDepto, onChangeMuni);
                console.log('Coordenadas:', lat, lng);
            },
        });

        return <Marker position={[lati, longi]}>
            <Popup>
                Lat: {lati.toFixed(5)} <br /> Lng: {longi.toFixed(5)}
            </Popup>
        </Marker>

    };
    return (
        <>
            <Zoom in={true} style={{ transitionDelay: '150ms' }}  >
                <Box>
                    <Controller
                        name={nameMuni}
                        control={control}
                        render={({ field: {  onChange: onChangeMuni } }) => (
                            <Controller
                                name={nameDepto}
                                control={control}
                                render={({ field: {  onChange: onChangeDepto } }) => (
                                    <Controller
                                        name={nameLat}
                                        control={control}
                                        defaultValue={lat}
                                        render={({ field: { value: lat, onChange: onChangeLat } }) => (
                                            <Controller
                                                name={nameLng}
                                                control={control}
                                                defaultValue={lng}
                                                render={({ field: { value: lng, onChange: onChangeLng } }) => (
                                                    <MapContainer
                                                        center={[lat, lng]}
                                                        zoom={13}
                                                        style={{ height: '400px', width: '100%' }}
                                                    >
                                                        <TileLayer
                                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                        />
                                                        <LocationMarker onChangeLat={onChangeLat} onChangeLng={onChangeLng} onChangeDepto={onChangeDepto} onChangeMuni={onChangeMuni} lati={lat} longi={lng} />
                                                    </MapContainer>
                                                )} />
                                        )} />
                                )} />
                        )} />
                    <Typography sx={{ mb: 1 }}>Detalles de dirección</Typography>
                    <Grid size={{ xs: 12, sm: 12 }} container spacing={2} sx={{ mb: 1, mt: 2 }}>
                        <Button variant='outlined' fullWidth onClick={() => handleOpen(false)}>
                            <AddLocationAltIcon />
                        </Button>
                    </Grid>
                </Box>
            </Zoom>
        </>
    );
};

