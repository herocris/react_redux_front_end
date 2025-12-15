import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Zoom, Box } from '@mui/material';
import { MapComponentProps, MapItem, MarkerContent } from '../';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
import { Icon } from 'leaflet';

export const MapComponent = ({ Mapitems, typeMap, heightMap = "75vh" }: MapComponentProps) => {
  const customIcon = new Icon({
    iconUrl: 'src/modules/map/icons/location_icon2.png',
    iconSize: [40, 40],// Ancho, alto 
  });
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
                // fitBoundsOnLoad
                fitBoundsOnUpdate
                points={Mapitems.map((ite: MapItem) => {
                  return { lat: ite.latitud, lng: ite.longitud, intensity: 0.9 }
                })
                }
                longitudeExtractor={(p: any) => p.lng}
                latitudeExtractor={(p: any) => p.lat}
                intensityExtractor={(p: any) => p.intensity}
              />
            }
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {typeMap == 'location' &&
              Mapitems?.map((marker, index) => (
                <Marker key={index} position={[marker.latitud, marker.longitud]} icon={customIcon}>
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
