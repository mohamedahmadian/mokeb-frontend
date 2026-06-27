import { useQuery } from '@tanstack/react-query';
import api from './api';
import fallbackLocations from './iran-locations.json';
import type { IranLocation } from './iran-locations';

const FALLBACK_IRAN_LOCATIONS = fallbackLocations as IranLocation[];

async function fetchIranLocations(): Promise<IranLocation[]> {
  try {
    const { data } = await api.get<IranLocation[]>('/locations/iran');
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // Backend may be unavailable during local dev; use bundled fallback.
  }

  return FALLBACK_IRAN_LOCATIONS;
}

export function useIranLocations() {
  return useQuery({
    queryKey: ['iran-locations'],
    queryFn: fetchIranLocations,
    staleTime: Infinity,
    gcTime: Infinity,
    initialData: FALLBACK_IRAN_LOCATIONS,
  });
}
