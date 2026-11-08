import axios from 'axios';

export interface GeocodingAddress {
    department: string;
    municipality: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';

export const reverseGeocode = async (lat: number, lng: number, signal: AbortSignal): Promise<GeocodingAddress> => {
    // This public service must not use the backend client's credential settings.
    const { data } = await axios.get<unknown>('https://nominatim.openstreetmap.org/reverse', {
        params: { lat, lon: lng, format: 'json', addressdetails: 1 },
        signal,
        withCredentials: false,
    });
    const address = isRecord(data) && isRecord(data.address) ? data.address : {};
    return {
        department: text(address.state),
        municipality: text(address.municipality) || text(address.town) || text(address.city),
    };
};
