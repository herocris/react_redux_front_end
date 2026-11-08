import { useCallback, useEffect, useRef, useState } from 'react';
import { reverseGeocode, type GeocodingAddress } from '../api/reverseGeocoding';

export const useReverseGeocoding = (onAddress: (address: GeocodingAddress) => void) => {
    const pending = useRef<AbortController | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => () => {
        pending.current?.abort();
        pending.current = null;
    }, []);

    const locate = useCallback(async (lat: number, lng: number) => {
        pending.current?.abort();
        const request = new AbortController();
        pending.current = request;
        setLoading(true);
        setError(null);
        try {
            const address = await reverseGeocode(lat, lng, request.signal);
            if (pending.current !== request || request.signal.aborted) return;
            onAddress(address);
            if (!address.department || !address.municipality) {
                setError('La dirección está incompleta. Completa el departamento y el municipio en el formulario.');
            }
        } catch {
            if (pending.current !== request || request.signal.aborted) return;
            setError('No se pudo obtener la dirección. Completa el departamento y el municipio en el formulario.');
        } finally {
            if (pending.current === request) {
                pending.current = null;
                setLoading(false);
            }
        }
    }, [onAddress]);

    return { locate, loading, error };
};
