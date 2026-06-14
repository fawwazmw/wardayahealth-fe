import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Hospital {
  id: number;
  name: string;
  patientCount: number;
}

interface MapPoint {
  code: string;
  name: string;
  count: number;
  hospitals?: Hospital[];
}

interface Props {
  points: MapPoint[];
}

const COUNTRY_COORDS: Record<string, [number, number]> = {
  SG: [1.3521, 103.8198],
  GB: [51.5074, -0.1278],
  CN: [39.9042, 116.4074],
  KR: [37.5665, 126.978],
  US: [38.9072, -77.0369],
  AU: [-33.8688, 151.2093],
  JP: [35.6762, 139.6503],
  IN: [28.6139, 77.209],
  DE: [52.52, 13.405],
  FR: [48.8566, 2.3522],
};

const COUNTRY_ZOOM: Record<string, number> = {
  SG: 11,
  GB: 6,
  CN: 4,
  KR: 7,
  US: 4,
  AU: 4,
  JP: 6,
  IN: 5,
  DE: 6,
  FR: 6,
};

export const WorldMap: React.FC<Props> = ({ points }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<MapPoint | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [20, 60],
      zoom: 2,
      minZoom: 2,
      maxZoom: 14,
      scrollWheelZoom: true,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "",
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
      markersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    const markers = markersRef.current;
    if (!map || !markers) return;

    markers.clearLayers();

    points.forEach((point) => {
      const coords = COUNTRY_COORDS[point.code];
      if (!coords) return;
      const radius = Math.max(10, Math.min(28, point.count * 2 + 6));

      const marker = L.circleMarker(coords, {
        radius,
        color: "#e91e8c",
        fillColor: "#e91e8c",
        fillOpacity: 0.5,
        weight: 2,
      });

      marker.bindTooltip(`<b>${point.name}</b><br/>${point.count} patients`, {
        permanent: true,
        direction: "top",
        offset: [0, -radius],
        className: "leaflet-tooltip-dark",
      });

      marker.on("click", () => {
        const zoom = COUNTRY_ZOOM[point.code] || 5;
        map.flyTo(coords, zoom, { duration: 1 });
        setSelectedCountry(point);
      });

      marker.addTo(markers);
    });
  }, [points]);

  const handleResetView = () => {
    mapInstance.current?.flyTo([20, 60], 2, { duration: 1 });
    setSelectedCountry(null);
  };

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full rounded-xl overflow-hidden"
        style={{ height: 360, background: "#111318" }}
      />

      {selectedCountry && (
        <div
          className="absolute bottom-4 left-4 z-[1000] rounded-lg p-4 max-w-[280px]"
          style={{ backgroundColor: "rgba(17, 19, 24, 0.95)", border: "1px solid #2a2f3e", backdropFilter: "blur(8px)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: "#e91e8c20", color: "#e91e8c" }}>
                {selectedCountry.code}
              </span>
              <span className="text-sm font-semibold text-white">{selectedCountry.name}</span>
            </div>
            <button
              onClick={handleResetView}
              className="text-[10px] px-2 py-1 rounded text-[#9ca3af] hover:text-white transition-colors"
              style={{ backgroundColor: "#2a2f3e" }}
            >
              ✕ Close
            </button>
          </div>
          <div className="text-xs text-[#9ca3af] mb-2">
            {selectedCountry.count} patients · {selectedCountry.hospitals?.length || 0} hospitals
          </div>
          {selectedCountry.hospitals && selectedCountry.hospitals.length > 0 && (
            <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
              {selectedCountry.hospitals.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between px-2 py-1.5 rounded text-xs"
                  style={{ backgroundColor: "#1a1d23" }}
                >
                  <span className="text-[#e5e7eb] truncate mr-2">{h.name}</span>
                  <span className="text-[#e91e8c] font-semibold flex-shrink-0">{h.patientCount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
