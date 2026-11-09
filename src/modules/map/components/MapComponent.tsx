import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Zoom, Box } from '@mui/material';
import { MapComponentProps, MarkerContent } from '../';
import { HeatmapLayer } from './HeatmapLayer';
import { Icon } from 'leaflet';
import locationIcon from '/src/modules/map/icons/location_icon2.png';
import { useMemo } from 'react';

const customIcon = new Icon({ iconUrl: locationIcon, iconSize: [40, 40] });

export const MapComponent = ({ Mapitems, typeMap, heightMap = "75vh" }: MapComponentProps) => {
  const validItems = useMemo(() => Mapitems.filter(item => Number.isFinite(item.latitud) && Number.isFinite(item.longitud)), [Mapitems]);
  const points = useMemo(() => validItems.map(item => ({ lat: item.latitud, lng: item.longitud, intensity: 0.9 })), [validItems]);
  return (
    <>
      <Zoom in={true} style={{ transitionDelay: '150ms' }}  >
        <Box>
          <MapContainer
            center={[14.2654645, -86.5689548]}
            zoom={9}
            style={{ height: heightMap, width: '100%' }}
          >
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
                <Marker key={marker.id} position={[marker.latitud, marker.longitud]} icon={customIcon}>
                  <Popup>
                    <MarkerContent marker={marker} />
                  </Popup>
                </Marker>
              ))
            }
          </MapContainer>
        </Box>
      </Zoom>
    </>
  )
}
