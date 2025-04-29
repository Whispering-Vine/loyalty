// src/components/CountrySelector.tsx
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import { countries } from "@/lib/countries";
  
  interface CountrySelectorProps {
    value: string;
    onValueChange: (value: string) => void;
  }
  
  export function CountrySelector({ value, onValueChange }: CountrySelectorProps) {
    // Sort countries to put US first
    const sortedCountries = [
      countries.find(c => c.code === '+1')!,
      ...countries.filter(c => c.code !== '+1')
    ];
  
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          {sortedCountries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.flag} {country.code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }