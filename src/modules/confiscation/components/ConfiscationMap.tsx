import 'leaflet/dist/leaflet.css';
import { useCallback, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { ConfiscationMapModalProps } from '../types';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMapEvents } from 'react-leaflet';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import Grid from '@mui/material/Grid2';
import { Alert, Button, Typography, Zoom, Box } from '@mui/material';
import { useController } from 'react-hook-form';
import { useReverseGeocoding } from '../hooks/useReverseGeocoding';
import type { GeocodingAddress } from '../api/reverseGeocoding';

interface LocationMarkerProps {
    lat: number;
    lng: number;
    onSelect: (lat: number, lng: number) => void;
}
const focusMapRegion = (element: HTMLDivElement | null) => { element?.focus(); };

const LocationMarker = ({ lat, lng, onSelect }: LocationMarkerProps) => {
    useMapEvents({
        click(event) {
            onSelect(event.latlng.lat, event.latlng.lng);
        },
    });

    return <Marker position={[lat, lng]}>
        <Popup>
            Lat: {lat.toFixed(5)} <br /> Lng: {lng.toFixed(5)}
        </Popup>
    </Marker>;
};

export const ConfiscationMap = ({ handleOpen, lat, lng, nameLat, nameLng, nameDepto, nameMuni, control }: ConfiscationMapModalProps) => {
    const mapRef = useRef<LeafletMap>(null);
    const { field: latitude } = useController({ name: nameLat, control, defaultValue: lat });
    const { field: longitude } = useController({ name: nameLng, control, defaultValue: lng });
    const { field: { onChange: onDepartment } } = useController({ name: nameDepto, control });
    const { field: { onChange: onMunicipality } } = useController({ name: nameMuni, control });
    const setAddress = useCallback((address: GeocodingAddress) => {
        onDepartment(address.department);
        onMunicipality(address.municipality);
    }, [onDepartment, onMunicipality]);
    const { locate, loading, error } = useReverseGeocoding(setAddress);
    const { onChange: onLatitude } = latitude;
    const { onChange: onLongitude } = longitude;

    const selectLocation = useCallback((newLat: number, newLng: number) => {
        onLatitude(newLat);
        onLongitude(newLng);
        onDepartment('');
        onMunicipality('');
        void locate(newLat, newLng);
    }, [onLatitude, onLongitude, onDepartment, onMunicipality, locate]);

    return (
        <Zoom in={true} style={{ transitionDelay: '150ms' }}>
            <Box ref={focusMapRegion} tabIndex={-1} role="region" aria-label="Mapa para seleccionar ubicación">
                <Typography>Desplaza el mapa con las flechas y usa su centro, o pulsa una ubicación.</Typography>
                <MapContainer
                    ref={mapRef}
                    center={[latitude.value, longitude.value]}
                    zoom={13}
                    zoomControl={false}
                    style={{ height: '400px', width: '100%' }}
                >
                    <ZoomControl zoomInTitle="Acercar" zoomOutTitle="Alejar" />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker lat={latitude.value} lng={longitude.value} onSelect={selectLocation} />
                </MapContainer>
                <Button onClick={() => {
                    const center = mapRef.current?.getCenter();
                    if (center) selectLocation(center.lat, center.lng);
                }}>Usar centro del mapa</Button>
                <Typography sx={{ mb: 1 }}>Detalles de dirección</Typography>
                {loading && <Typography role="status">Buscando dirección...</Typography>}
                {error && <Alert severity="warning">{error}</Alert>}
                <Grid size={{ xs: 12, sm: 12 }} container spacing={2} sx={{ mb: 1, mt: 2 }}>
                    <Button variant='outlined' fullWidth onClick={() => handleOpen(false)} startIcon={<AddLocationAltIcon />}>
                        Volver al formulario
                    </Button>
                </Grid>
            </Box>
        </Zoom>
    );
};

