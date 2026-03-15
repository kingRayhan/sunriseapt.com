"use client";

import { cn } from "@/lib/utils";
import { Loader2Icon, MapPinIcon } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

export interface PlaceSuggestion {
  placeId: string;
  place: string;
  mainText: string;
  secondaryText: string;
  description: string;
}

export interface PlaceDetails {
  lat: number;
  lng: number;
  formattedAddress: string;
  displayName?: string;
}

export interface SearchLocationInputProps {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onSelect?: (details: PlaceDetails) => void;
  /** Debounce delay in ms for search requests */
  debounceMs?: number;
}

const DEBOUNCE_MS = 300;
const MIN_INPUT_LENGTH = 2;

export function SearchLocationInput({
  value = "",
  placeholder = "Search for a place or address...",
  disabled = false,
  className,
  onSelect,
  debounceMs = DEBOUNCE_MS,
}: SearchLocationInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const sessionTokenRef = useRef<string | undefined>(undefined);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync controlled value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < MIN_INPUT_LENGTH) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/places/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: input.trim(),
          sessionToken: sessionTokenRef.current || undefined,
        }),
      });
      if (!res.ok) {
        setSuggestions([]);
        return;
      }
      const data = (await res.json()) as { suggestions?: PlaceSuggestion[] };
      setSuggestions(data.suggestions ?? []);
      setSelectedIndex(-1);
      setOpen(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (inputValue.length < MIN_INPUT_LENGTH) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      void fetchSuggestions(inputValue);
    }, debounceMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue, debounceMs, fetchSuggestions]);

  const fetchDetailsAndSelect = useCallback(
    async (suggestion: PlaceSuggestion) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/places/details?placeId=${encodeURIComponent(suggestion.placeId)}`,
        );
        if (!res.ok) return;
        const details = (await res.json()) as PlaceDetails;
        setInputValue(details.formattedAddress || suggestion.description);
        setOpen(false);
        setSuggestions([]);
        sessionTokenRef.current = undefined;
        onSelect?.(details);
        setTimeout(() => {
          setInputValue("");
        }, 0);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [onSelect],
  );

  const handleSelect = useCallback(
    (suggestion: PlaceSuggestion) => {
      void fetchDetailsAndSelect(suggestion);
    },
    [fetchDetailsAndSelect],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open || suggestions.length === 0) {
        if (e.key === "Escape") setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i < suggestions.length - 1 ? i + 1 : i));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : -1));
        return;
      }
      if (
        e.key === "Enter" &&
        selectedIndex >= 0 &&
        suggestions[selectedIndex]
      ) {
        e.preventDefault();
        handleSelect(suggestions[selectedIndex]);
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
        setSelectedIndex(-1);
      }
    },
    [open, suggestions, selectedIndex, handleSelect],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPinIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-9 pr-9"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="search-location-listbox"
          aria-activedescendant={
            selectedIndex >= 0
              ? `search-location-option-${selectedIndex}`
              : undefined
          }
        />
        {loading && (
          <Loader2Icon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>
      {open && suggestions.length > 0 && (
        <ul
          id="search-location-listbox"
          role="listbox"
          className="absolute z-[1000] mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover py-1 text-popover-foreground shadow-md"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.placeId}
              id={`search-location-option-${i}`}
              role="option"
              aria-selected={i === selectedIndex}
              className={cn(
                "flex cursor-pointer items-start gap-2 px-3 py-2 text-sm outline-none",
                i === selectedIndex && "bg-accent text-accent-foreground",
              )}
              onMouseEnter={() => setSelectedIndex(i)}
              onMouseLeave={() => setSelectedIndex(-1)}
              onClick={() => handleSelect(s)}
            >
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-foreground">
                  {s.mainText}
                  {s.secondaryText ? (
                    <span className="text-muted-foreground">
                      {" "}
                      {s.secondaryText}
                    </span>
                  ) : null}
                </div>
                {s.description !== s.mainText && (
                  <div className="truncate text-xs text-muted-foreground">
                    {s.description}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
