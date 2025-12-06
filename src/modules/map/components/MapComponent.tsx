import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Zoom, Box } from '@mui/material';
import { MapComponentProps, MapItem,MarkerContent } from '../';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';

export const MapComponent = ({ Mapitems, typeMap }: MapComponentProps) => {
  return (
    <>
      <Zoom in={true} style={{ transitionDelay: '150ms' }}  >
        <Box>
          <MapContainer
            center={[14.2654645, -86.5689548]}
            zoom={9}
            style={{ height: '75vh', width: '100%' }}
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
                <Marker key={index} position={[marker.latitud, marker.longitud]}>
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
