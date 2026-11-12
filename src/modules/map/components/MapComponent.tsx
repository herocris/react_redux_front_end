import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import { Zoom, Box, Button } from '@mui/material';
import { MapComponentProps, MarkerContent } from '../';
import { HeatmapLayer } from './HeatmapLayer';
import { Icon, type Marker as LeafletMarker } from 'leaflet';
import locationIcon from '/src/modules/map/icons/location_icon2.png';
import { useMemo, useRef } from 'react';
import type { MapItem } from '../types';

const customIcon = new Icon({ iconUrl: locationIcon, iconSize: [40, 40] });

const DecomisoMarker = ({ marker }: { marker: MapItem }) => {
  const ref = useRef<LeafletMarker>(null);
  const close = () => ref.current?.closePopup();
  return <Marker ref={ref} position={[marker.latitud, marker.longitud]} icon={customIcon}
    alt={`Decomiso ${marker.id}`} title={`Decomiso ${marker.id}`}
    eventHandlers={{
      popupopen: () => requestAnimationFrame(() => {
        if (ref.current?.isPopupOpen()) ref.current.getPopup()?.getElement()?.querySelector<HTMLButtonElement>('button')?.focus();
      }),
      popupclose: () => ref.current?.getElement()?.focus(),
    }}>
    <Popup closeButton={false}>
      <Box onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close(); } }}>
        <MarkerContent marker={marker} />
        <Button autoFocus onClick={close}>Cerrar detalle</Button>
      </Box>
    </Popup>
  </Marker>;
};

export const MapComponent = ({ Mapitems, typeMap, heightMap = "75vh" }: MapComponentProps) => {
  const validItems = useMemo(() => Mapitems.filter(item => Number.isFinite(item.latitud) && Number.isFinite(item.longitud)), [Mapitems]);
  const points = useMemo(() => validItems.map(item => ({ lat: item.latitud, lng: item.longitud, intensity: 0.9 })), [validItems]);
  return (
    <>
      <Zoom in={true} style={{ transitionDelay: '150ms' }}  >
        <Box role="region" aria-label="Mapa de decomisos">
          <MapContainer
            center={[14.2654645, -86.5689548]}
            zoom={9}
            zoomControl={false}
            style={{ height: heightMap, width: '100%' }}
          >
            <ZoomControl zoomInTitle="Acercar" zoomOutTitle="Alejar" />
            {typeMap == 'hot' &&
              <HeatmapLayer
                points={points}
              />
            }
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {typeMap == 'location' &&
              validItems.map(marker => (
                <DecomisoMarker key={marker.id} marker={marker} />
              ))
            }
          </MapContainer>
        </Box>
      </Zoom>
    </>
  )
}
