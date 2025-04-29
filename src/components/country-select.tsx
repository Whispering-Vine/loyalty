// src/components/CountrySelector.tsx
"use client";

import React, { useEffect, useRef, useMemo } from "react";
import twemoji from "twemoji";

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

export function CountrySelector({
  value,
  onValueChange,
}: CountrySelectorProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Sort so US is first
  const sorted = useMemo(() => {
    const us = countries.find((c) => c.code === "+1")!;
    return [us, ...countries.filter((c) => c.code !== "+1")];
  }, []);

  // After first render, replace all emoji text with SVGs
  useEffect(() => {
    if (rootRef.current) {
      // twemoji.parse will only replace text nodes with <img>
      twemoji.parse(rootRef.current, {
        folder: "svg",
        ext: ".svg",
      });
    }
  }, []);

  return (
    <div ref={rootRef}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          {sorted.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {/* render the raw flag character */}
              <span className="inline-block align-middle mr-2">
                {country.flag}
              </span>
              <span className="align-middle">{country.code}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}