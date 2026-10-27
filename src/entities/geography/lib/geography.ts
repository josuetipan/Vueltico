import { GEO_CITIES, GEO_COUNTRIES, type GeoCity, type GeoCountry } from "../config/catalog";

export function getCountryById(countryId: string): GeoCountry | undefined {
  return GEO_COUNTRIES.find((c) => c.id === countryId);
}

export function getCountryName(countryId: string): string {
  return getCountryById(countryId)?.name ?? countryId;
}

export function listCitiesForCountry(countryId: string): GeoCity[] {
  return GEO_CITIES.filter((c) => c.countryId === countryId);
}

export function getCityById(cityId: string): GeoCity | undefined {
  return GEO_CITIES.find((c) => c.id === cityId);
}

export function getCityName(cityId: string): string {
  return getCityById(cityId)?.name ?? cityId;
}

export function findCityIdByName(countryId: string, cityName: string): string | null {
  const normalized = cityName.trim().toLowerCase();
  const match = GEO_CITIES.find(
    (c) => c.countryId === countryId && c.name.toLowerCase() === normalized,
  );
  return match?.id ?? null;
}

/** Resuelve ids para formularios a partir de datos persistidos (p. ej. cityId null + nombre). */
export function resolveGeographySelection(input: {
  countryId: string | null;
  cityId: string | null;
  cityName?: string;
}): { countryId: string; cityId: string } {
  const countryId = input.countryId ?? GEO_COUNTRIES[0]?.id ?? "ec";
  const cities = listCitiesForCountry(countryId);
  const fromId =
    input.cityId && cities.some((c) => c.id === input.cityId) ? input.cityId : null;
  const fromName = input.cityName ? findCityIdByName(countryId, input.cityName) : null;
  const cityId = fromId ?? fromName ?? cities[0]?.id ?? "";
  return { countryId, cityId };
}

export function geographyLabels(countryId: string, cityId: string): { country: string; city: string } {
  return {
    country: getCountryName(countryId),
    city: getCityName(cityId),
  };
}
