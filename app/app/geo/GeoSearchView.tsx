"use client";

import {
  Circle,
  MapPin,
  Pentagon,
  RotateCcw,
  Search,
  Target,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { LeadTable } from "@/components/leads/LeadTable";
import { LoadingSteps } from "@/components/search/LoadingSteps";
import { sortedCountries } from "@/lib/countries";
import {
  type GeoZone,
  type LatLng,
  circleAreaKm2,
  polygonAreaKm2,
} from "@/lib/geo";
import { useI18n } from "@/lib/i18n";
import type { Lead } from "@/lib/leadTypes";
import { annotateSeen, markSeen } from "@/lib/seenLeads";
import { bumpUsage, saveLeads } from "@/lib/storage";
import { cn } from "@/lib/utils";

type DrawMode = "radius" | "polygon";

interface GeoState {
  businessType: string;
  location: string;
  country: string;
  language: string;
  drawMode: DrawMode;
  center: LatLng | null;
  radiusKm: number;
  polygonPoints: LatLng[];
}

const DEFAULT_STATE: GeoState = {
  businessType: "",
  location: "",
  country: "",
  language: "",
  drawMode: "radius",
  center: null,
  radiusKm: 5,
  polygonPoints: [],
};

export default function GeoSearchView({ authed }: { authed: boolean }) {
  const { locale } = useI18n();
  const [state, setState] = React.useState<GeoState>(DEFAULT_STATE);
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [geoMeta, setGeoMeta] = React.useState<{
    total: number;
    rawResultsCount: number;
    filteredByZoneCount: number;
    durationMs: number;
  } | null>(null);
  const [mapReady, setMapReady] = React.useState(false);
  const mapRef = React.useRef<HTMLDivElement>(null);
  const googleMapRef = React.useRef<google.maps.Map | null>(null);
  const circleRef = React.useRef<google.maps.Circle | null>(null);
  const polygonRef = React.useRef<google.maps.Polygon | null>(null);
  const markerRef = React.useRef<google.maps.Marker | null>(null);

  function patch<K extends keyof GeoState>(key: K, value: GeoState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const key = getGoogleMapsKey();
    if (!key) return;

    if (window.google?.maps) {
      // Already loaded — schedule outside effect body to satisfy lint
      queueMicrotask(() => setMapReady(true));
      return;
    }

    const existing = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existing) {
      existing.addEventListener("load", () => setMapReady(true));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=drawing,geometry,places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapReady(true);
    document.head.appendChild(script);
  }, []);

  React.useEffect(() => {
    if (!mapReady || !mapRef.current || googleMapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 48.8566, lng: 2.3522 },
      zoom: 12,
      styles: darkMapStyles,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    googleMapRef.current = map;

    map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const point: LatLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };

      setState((prev) => {
        if (prev.drawMode === "radius") {
          return { ...prev, center: point };
        }
        return {
          ...prev,
          polygonPoints: [...prev.polygonPoints, point],
        };
      });
    });
  }, [mapReady]);

  const computedZone = React.useMemo<GeoZone | null>(() => {
    if (state.drawMode === "radius" && state.center) {
      return { type: "radius", circle: { center: state.center, radiusKm: state.radiusKm } };
    }
    if (state.drawMode === "polygon" && state.polygonPoints.length >= 3) {
      return { type: "polygon", polygon: { points: state.polygonPoints } };
    }
    return null;
  }, [state.center, state.radiusKm, state.polygonPoints, state.drawMode]);

  React.useEffect(() => {
    if (!googleMapRef.current) return;

    circleRef.current?.setMap(null);
    polygonRef.current?.setMap(null);
    markerRef.current?.setMap(null);

    if (state.drawMode === "radius" && state.center) {
      const circle = new google.maps.Circle({
        map: googleMapRef.current,
        center: state.center,
        radius: state.radiusKm * 1000,
        fillColor: "#6366f1",
        fillOpacity: 0.12,
        strokeColor: "#6366f1",
        strokeWeight: 2,
        strokeOpacity: 0.6,
      });
      circleRef.current = circle;

      const marker = new google.maps.Marker({
        map: googleMapRef.current,
        position: state.center,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: "#6366f1",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });
      markerRef.current = marker;

      googleMapRef.current.fitBounds(circle.getBounds()!);
    } else if (
      state.drawMode === "polygon" &&
      state.polygonPoints.length >= 3
    ) {
      const polygon = new google.maps.Polygon({
        map: googleMapRef.current,
        paths: state.polygonPoints,
        fillColor: "#6366f1",
        fillOpacity: 0.12,
        strokeColor: "#6366f1",
        strokeWeight: 2,
        strokeOpacity: 0.6,
      });
      polygonRef.current = polygon;

      const bounds = new google.maps.LatLngBounds();
      state.polygonPoints.forEach((p) => bounds.extend(p));
      googleMapRef.current.fitBounds(bounds);
    }
  }, [state.center, state.radiusKm, state.polygonPoints, state.drawMode]);

  async function geocodeLocation() {
    if (!state.location.trim() || !mapReady) return;
    const geocoder = new google.maps.Geocoder();
    try {
      const result = await geocoder.geocode({ address: state.location });
      if (result.results[0]?.geometry?.location) {
        const loc = result.results[0].geometry.location;
        const center: LatLng = { lat: loc.lat(), lng: loc.lng() };
        setState((s) => ({ ...s, center }));
        googleMapRef.current?.panTo(center);
        googleMapRef.current?.setZoom(13);
      }
    } catch {
      // geocode failed silently
    }
  }

  function resetZone() {
    circleRef.current?.setMap(null);
    polygonRef.current?.setMap(null);
    markerRef.current?.setMap(null);
    setState((s) => ({
      ...s,
      center: null,
      polygonPoints: [],
    }));
  }

  async function handleSearch() {
    if (!state.businessType.trim()) {
      setError(
        locale === "fr"
          ? "Indiquez un type d'activité"
          : "Enter a business type"
      );
      return;
    }
    if (!computedZone) {
      setError(
        locale === "fr"
          ? "Définissez une zone sur la carte"
          : "Define a zone on the map"
      );
      return;
    }

    setLoading(true);
    setError(null);
    setGeoMeta(null);

    try {
      const zonePayload =
        computedZone!.type === "radius"
          ? { type: "radius" as const, center: computedZone!.circle.center, radiusKm: computedZone!.circle.radiusKm }
          : { type: "polygon" as const, points: computedZone!.polygon.points };

      const res = await fetch("/api/search/geo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          businessType: state.businessType.trim(),
          zone: zonePayload,
          country: state.country || undefined,
          language: state.language || undefined,
          limit: 40,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setError(
          err?.error ??
            (locale === "fr"
              ? `Erreur serveur (${res.status})`
              : `Server error (${res.status})`)
        );
        return;
      }

      const data = (await res.json()) as {
        leads: Lead[];
        meta: {
          total: number;
          rawResultsCount: number;
          filteredByZoneCount: number;
          zone: Record<string, unknown>;
          sourcesUsed: string[];
          durationMs: number;
        };
      };

      setGeoMeta(data.meta);

      const annotated = annotateSeen(data.leads);
      markSeen(data.leads);
      saveLeads(annotated as Lead[]);
      bumpUsage({ searchesRun: 1, leadsFound: data.leads.length });

      setLeads(annotated as Lead[]);
    } catch {
      setError(
        locale === "fr"
          ? "Erreur lors de la recherche"
          : "Search error occurred"
      );
    } finally {
      setLoading(false);
    }
  }

  const areaDisplay = React.useMemo(() => {
    if (!computedZone) return null;
    if (computedZone.type === "radius") {
      return circleAreaKm2(computedZone.circle.radiusKm).toFixed(1);
    }
    return polygonAreaKm2(computedZone.polygon.points).toFixed(1);
  }, [computedZone]);

  const apiKey = getGoogleMapsKey();

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent-cyan">
          <MapPin size={11} />
          {locale === "fr" ? "Recherche géographique" : "Geo Search"}
        </div>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
          {locale === "fr"
            ? "Rechercher dans une zone précise"
            : "Search within a specific area"}
        </h1>
        <p className="mt-1 text-sm text-muted-strong">
          {locale === "fr"
            ? "Dessinez une zone sur la carte pour cibler vos leads."
            : "Draw a zone on the map to target your leads."}
        </p>
      </div>

      {!apiKey ? (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-6 text-center">
          <p className="text-sm text-warning">
            {locale === "fr"
              ? "Configurez NEXT_PUBLIC_GOOGLE_MAPS_KEY dans .env.local pour activer la recherche géo."
              : "Set NEXT_PUBLIC_GOOGLE_MAPS_KEY in .env.local to enable geo search."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1">
                <MapPin
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <Input
                  value={state.location}
                  onChange={(e) => patch("location", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      geocodeLocation();
                    }
                  }}
                  placeholder={
                    locale === "fr"
                      ? "Rechercher un lieu…"
                      : "Search location…"
                  }
                  className="pl-9"
                />
              </div>
              <Button size="sm" variant="outline" onClick={geocodeLocation}>
                <Target size={12} />
              </Button>
              <div className="flex rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    resetZone();
                    patch("drawMode", "radius");
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    state.drawMode === "radius"
                      ? "bg-accent/15 text-accent-cyan"
                      : "text-muted-strong hover:text-foreground"
                  )}
                >
                  <Circle size={11} />
                  {locale === "fr" ? "Rayon" : "Radius"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetZone();
                    patch("drawMode", "polygon");
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    state.drawMode === "polygon"
                      ? "bg-accent/15 text-accent-cyan"
                      : "text-muted-strong hover:text-foreground"
                  )}
                >
                  <Pentagon size={11} />
                  {locale === "fr" ? "Polygone" : "Polygon"}
                </button>
              </div>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<RotateCcw size={12} />}
                onClick={resetZone}
              >
                {locale === "fr" ? "Réinit." : "Reset"}
              </Button>
            </div>

            <div
              ref={mapRef}
              className="relative h-[420px] w-full overflow-hidden rounded-xl border border-white/[0.06]"
            >
              {!mapReady ? (
                <div className="flex h-full items-center justify-center bg-white/[0.02] text-sm text-muted">
                  {locale === "fr"
                    ? "Chargement de la carte…"
                    : "Loading map…"}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
              {computedZone ? (
                <>
                  <Badge tone="accent">
                    {computedZone?.type === "radius"
                      ? `${state.radiusKm} km`
                      : `${state.polygonPoints.length} points`}
                  </Badge>
                  {areaDisplay ? (
                    <span>
                      {locale === "fr" ? "Surface" : "Area"}: ~{areaDisplay}{" "}
                      km²
                    </span>
                  ) : null}
                </>
              ) : (
                <span>
                  {state.drawMode === "radius"
                    ? locale === "fr"
                      ? "Cliquez sur la carte pour définir le centre du rayon"
                      : "Click on the map to set the radius center"
                    : locale === "fr"
                      ? "Cliquez sur la carte pour tracer le polygone (min. 3 points)"
                      : "Click on the map to draw polygon (min. 3 points)"}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-accent-cyan">
              {locale === "fr"
                ? "Paramètres de recherche"
                : "Search Parameters"}
            </div>

            <div>
              <Label htmlFor="geo-bt">
                {locale === "fr" ? "Activité / Niche" : "Business Type"}
              </Label>
              <div className="relative">
                <Target
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <Input
                  id="geo-bt"
                  value={state.businessType}
                  onChange={(e) => patch("businessType", e.target.value)}
                  placeholder={
                    locale === "fr" ? "ex: restaurants" : "e.g. restaurants"
                  }
                  className="pl-9"
                />
              </div>
            </div>

            {state.drawMode === "radius" ? (
              <div>
                <Label htmlFor="geo-radius">
                  {locale === "fr" ? "Rayon (km)" : "Radius (km)"}
                </Label>
                <Input
                  id="geo-radius"
                  type="number"
                  min={0.5}
                  max={50}
                  step={0.5}
                  value={state.radiusKm}
                  onChange={(e) =>
                    patch(
                      "radiusKm",
                      Math.max(
                        0.5,
                        Math.min(50, Number(e.target.value) || 5)
                      )
                    )
                  }
                />
              </div>
            ) : null}

            <div>
              <Label htmlFor="geo-country">
                {locale === "fr" ? "Pays" : "Country"}
              </Label>
              <Select
                id="geo-country"
                value={state.country}
                onChange={(e) => patch("country", e.target.value)}
              >
                <option value="">
                  {locale === "fr" ? "Tous" : "Any"}
                </option>
                {sortedCountries(locale).map((c) => (
                  <option key={c.value} value={c.value}>
                    {locale === "fr" ? c.fr : c.en}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="geo-lang">
                {locale === "fr" ? "Langue" : "Language"}
              </Label>
              <Input
                id="geo-lang"
                value={state.language}
                onChange={(e) => patch("language", e.target.value)}
                placeholder="fr"
              />
            </div>

            {error ? (
              <p className="text-xs text-danger">{error}</p>
            ) : null}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              leftIcon={<Search size={14} />}
              onClick={handleSearch}
              disabled={loading || !computedZone}
            >
              {loading
                ? locale === "fr"
                  ? "Recherche…"
                  : "Searching…"
                : locale === "fr"
                  ? "Rechercher dans la zone"
                  : "Search in zone"}
            </Button>
          </div>
        </div>
      )}

      <LoadingSteps running={loading} />

      {!loading && geoMeta && geoMeta.rawResultsCount > 0 && leads.length === 0 ? (
        <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          {locale === "fr"
            ? `Google a renvoyé ${geoMeta.rawResultsCount} résultats, mais aucun ne se trouve dans la zone sélectionnée. Essayez d'agrandir la zone ou de déplacer le centre.`
            : `Google returned ${geoMeta.rawResultsCount} results, but none are within the selected zone. Try expanding the zone or moving the center.`}
        </div>
      ) : null}

      {!loading && leads.length > 0 ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <Badge tone="accent">{leads.length}</Badge>
            <span>
              {locale === "fr"
                ? "leads trouvés dans la zone"
                : "leads found in zone"}
            </span>
            {geoMeta ? (
              <>
                <span className="text-muted">·</span>
                <span>
                  {geoMeta.rawResultsCount}{" "}
                  {locale === "fr" ? "résultats bruts" : "raw results"}
                </span>
                <span className="text-muted">·</span>
                <span>{geoMeta.durationMs} ms</span>
              </>
            ) : null}
          </div>
          <LeadTable
            leads={leads}
            defaultFilename="findely-geo-search.csv"
            authed={authed}
          />
        </div>
      ) : null}
    </div>
  );
}

function getGoogleMapsKey(): string | null {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  if (!key || key === "your_key_here") return null;
  return key;
}

const darkMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b8fa3" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2a2a4a" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b6f8a" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1525" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#1e1e3a" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1e1e3a" }],
  },
];
