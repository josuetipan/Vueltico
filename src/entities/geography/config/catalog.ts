export type GeoCountry = { id: string; name: string };
export type GeoCity = { id: string; countryId: string; name: string };

export const GEO_COUNTRIES: GeoCountry[] = [
  { id: "ec", name: "Ecuador" },
  { id: "co", name: "Colombia" },
  { id: "pe", name: "Perú" },
];

export const GEO_CITIES: GeoCity[] = [
  { id: "ec-quito", countryId: "ec", name: "Quito" },
  { id: "ec-guayaquil", countryId: "ec", name: "Guayaquil" },
  { id: "ec-cuenca", countryId: "ec", name: "Cuenca" },
  { id: "ec-manta", countryId: "ec", name: "Manta" },
  { id: "ec-ambato", countryId: "ec", name: "Ambato" },
  { id: "ec-machala", countryId: "ec", name: "Machala" },
  { id: "ec-loja", countryId: "ec", name: "Loja" },
  { id: "ec-portoviejo", countryId: "ec", name: "Portoviejo" },
  { id: "ec-riobamba", countryId: "ec", name: "Riobamba" },
  { id: "ec-santo-domingo", countryId: "ec", name: "Santo Domingo" },
  { id: "ec-esmeraldas", countryId: "ec", name: "Esmeraldas" },
  { id: "co-bogota", countryId: "co", name: "Bogotá" },
  { id: "co-medellin", countryId: "co", name: "Medellín" },
  { id: "co-cali", countryId: "co", name: "Cali" },
  { id: "pe-lima", countryId: "pe", name: "Lima" },
  { id: "pe-arequipa", countryId: "pe", name: "Arequipa" },
  { id: "pe-trujillo", countryId: "pe", name: "Trujillo" },
];
