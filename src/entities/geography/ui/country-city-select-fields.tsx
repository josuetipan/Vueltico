import { useMemo } from "react";
import { GEO_COUNTRIES } from "@/entities/geography/config/catalog";
import { listCitiesForCountry } from "@/entities/geography/lib/geography";
import { SelectField } from "@/shared/ui/select-field";

type CountryCitySelectFieldsProps = {
  countryId: string;
  cityId: string;
  onCountryIdChange: (countryId: string) => void;
  onCityIdChange: (cityId: string) => void;
  idPrefix?: string;
  countryError?: string;
  cityError?: string;
};

export function CountryCitySelectFields({
  countryId,
  cityId,
  onCountryIdChange,
  onCityIdChange,
  idPrefix = "geo",
  countryError,
  cityError,
}: CountryCitySelectFieldsProps) {
  const cityOptions = useMemo(() => listCitiesForCountry(countryId), [countryId]);

  function handleCountryChange(nextCountryId: string) {
    onCountryIdChange(nextCountryId);
    const cities = listCitiesForCountry(nextCountryId);
    const keepsCurrent = cities.some((c) => c.id === cityId);
    if (!keepsCurrent) {
      onCityIdChange(cities[0]?.id ?? "");
    }
  }

  return (
    <>
      <SelectField
        id={`${idPrefix}-country`}
        label="País"
        value={countryId}
        onChange={handleCountryChange}
        options={GEO_COUNTRIES.map((c) => ({ value: c.id, label: c.name }))}
        error={countryError}
      />
      <SelectField
        id={`${idPrefix}-city`}
        label="Ciudad"
        value={cityId}
        onChange={onCityIdChange}
        options={cityOptions.map((c) => ({ value: c.id, label: c.name }))}
        error={cityError}
      />
    </>
  );
}
