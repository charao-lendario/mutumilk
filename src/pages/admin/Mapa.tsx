import React, { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { mockRoteiros, getVendedores, formatCurrency } from "@/data/mock";
import type { MockVisita } from "@/data/mock";
import { getVisitaComUpdate, useMockStore } from "@/stores/mockStore";
import {
  CheckCircle2, Clock, MapPin, ShoppingCart, MessageSquare,
  ChevronDown, ChevronUp, Filter,
} from "lucide-react";

const VENDEDOR_COLORS: Record<string, string> = {
  "vendedor-001": "#0ea5e9",
  "vendedor-002": "#8b5cf6",
  "vendedor-003": "#22c55e",
  "vendedor-004": "#f59e0b",
  "vendedor-005": "#f43f5e",
};

function createMarkerIcon(color: string, filled: boolean): L.DivIcon {
  const size = 14;
  const border = 3;
  return L.divIcon({
    className: "",
    iconSize: [size + border * 2, size + border * 2],
    iconAnchor: [(size + border * 2) / 2, (size + border * 2) / 2],
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: ${border}px solid ${color};
      background: ${filled ? color : "transparent"};
      box-shadow: 0 0 8px ${color}66;
    "></div>`,
  });
}

export default function Mapa() {
  const vendedores = getVendedores();
  const [filteredVendedores, setFilteredVendedores] = useState<string[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const toggleVendedor = (id: string) => {
    setFilteredVendedores((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const showAll = filteredVendedores.length === 0;

  const vendedoresData = useMemo(() => {
    return vendedores.map((v) => {
      const roteiro = mockRoteiros.find((r) => r.vendedor_id === v.id);
      const visitas = roteiro ? roteiro.visitas.map((vis) => getVisitaComUpdate(vis)) : [];
      const concluidas = visitas.filter((vis) => vis.status !== "pendente").length;
      return {
        ...v,
        roteiro,
        visitas,
        concluidas,
        total: visitas.length,
        pct: visitas.length > 0 ? Math.round((concluidas / visitas.length) * 100) : 0,
        color: VENDEDOR_COLORS[v.id] || "#64748b",
      };
    });
  }, [vendedores]);

  const visibleVendedores = useMemo(
    () => (showAll ? vendedoresData : vendedoresData.filter((v) => filteredVendedores.includes(v.id))),
    [vendedoresData, filteredVendedores, showAll],
  );

  const VendedorButton = ({ v, compact = false }: { v: typeof vendedoresData[0]; compact?: boolean }) => {
    const isActive = filteredVendedores.includes(v.id);
    return (
      <button
        onClick={() => toggleVendedor(v.id)}
        className={`${compact ? "p-2 min-w-[120px]" : "w-full p-3"} rounded-xl text-left transition-all border ${
          isActive
            ? "glass-strong border-white/20"
            : "glass border-white/[0.06] hover:border-white/[0.12]"
        }`}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: v.color }} />
          <span className={`${compact ? "text-[11px]" : "text-xs"} font-semibold truncate`}>{v.full_name}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
          <span>{v.concluidas}/{v.total}</span>
          <span className="font-semibold" style={{ color: v.color }}>{v.pct}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${v.pct}%`, backgroundColor: v.color }}
          />
        </div>
      </button>
    );
  };

  return (
    <DashboardLayout title="Mapa ao Vivo" subtitle="Acompanhe seus vendedores em tempo real">
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)] animate-fade-in-up">

        {/* Mobile: Compact filter strip */}
        <div className="lg:hidden shrink-0">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="w-full glass p-3 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {showAll ? "Todos os vendedores" : `${filteredVendedores.length} selecionado(s)`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Mini color dots preview */}
              <div className="flex -space-x-1">
                {(showAll ? vendedoresData : vendedoresData.filter((v) => filteredVendedores.includes(v.id))).slice(0, 5).map((v) => (
                  <div
                    key={v.id}
                    className="w-3 h-3 rounded-full border border-background"
                    style={{ backgroundColor: v.color }}
                  />
                ))}
              </div>
              {mobileFilterOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </button>

          {mobileFilterOpen && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setFilteredVendedores([])}
                className={`p-2 min-w-[100px] rounded-xl text-left text-xs font-medium transition-all border shrink-0 ${
                  showAll
                    ? "glass-strong border-primary/40 text-primary"
                    : "glass border-white/[0.06] text-muted-foreground"
                }`}
              >
                <MapPin className="h-3 w-3 mb-1" />
                Todos
              </button>
              {vendedoresData.map((v) => (
                <div key={v.id} className="shrink-0">
                  <VendedorButton v={v} compact />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop: Sidebar */}
        <div className="hidden lg:flex w-[280px] shrink-0 flex-col gap-3 overflow-y-auto pr-1">
          <button
            onClick={() => setFilteredVendedores([])}
            className={`w-full p-3 rounded-xl text-left text-sm font-medium transition-all border ${
              showAll
                ? "glass-strong border-primary/40 text-primary"
                : "glass border-white/[0.06] text-muted-foreground hover:border-white/[0.12]"
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Todos os Vendedores</span>
            </div>
          </button>
          {vendedoresData.map((v) => (
            <VendedorButton key={v.id} v={v} />
          ))}
        </div>

        {/* Map */}
        <div className="flex-1 min-h-[300px] rounded-xl overflow-hidden border border-white/[0.08] relative">
          <MapContainer
            center={[-23.55, -46.63]}
            zoom={11}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {visibleVendedores.map((v) => (
              <React.Fragment key={v.id}>
                {/* Polylines */}
                {v.visitas.length > 1 && (() => {
                  const segments: { positions: [number, number][]; dashed: boolean }[] = [];
                  for (let i = 0; i < v.visitas.length - 1; i++) {
                    const from = v.visitas[i];
                    const to = v.visitas[i + 1];
                    const isDashed = from.status === "pendente" || to.status === "pendente";
                    segments.push({
                      positions: [
                        [from.latitude, from.longitude],
                        [to.latitude, to.longitude],
                      ],
                      dashed: isDashed,
                    });
                  }
                  return segments.map((seg, idx) => (
                    <Polyline
                      key={`line-${v.id}-${idx}`}
                      positions={seg.positions}
                      pathOptions={{
                        color: v.color,
                        weight: 2.5,
                        opacity: seg.dashed ? 0.4 : 0.8,
                        dashArray: seg.dashed ? "8 6" : undefined,
                      }}
                    />
                  ));
                })()}

                {/* Markers */}
                {v.visitas.map((vis) => {
                  const isConcluida = vis.status !== "pendente";
                  const icon = createMarkerIcon(v.color, isConcluida);
                  return (
                    <Marker key={vis.id} position={[vis.latitude, vis.longitude]} icon={icon}>
                      <Popup>
                        <div className="min-w-[200px] text-sm">
                          <p className="font-bold text-sm mb-1">{vis.cliente_nome}</p>
                          <p className="text-xs opacity-70 mb-2">{v.full_name}</p>
                          <div className="flex items-center gap-1.5 mb-1">
                            {isConcluida ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Clock className="h-3.5 w-3.5 text-amber-400" />
                            )}
                            <span className="text-xs font-medium">
                              {vis.status === "visita_concluida"
                                ? "Visita concluida"
                                : vis.status === "contato_realizado"
                                  ? "Contato realizado"
                                  : "Pendente"}
                            </span>
                          </div>
                          {vis.pedido_id && (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                              <ShoppingCart className="h-3 w-3" />
                              <span>Venda realizada</span>
                            </div>
                          )}
                          {vis.justificativa && !vis.pedido_id && (
                            <div className="flex items-start gap-1.5 text-xs text-amber-400 mt-1">
                              <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                              <span>{vis.justificativa}</span>
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </React.Fragment>
            ))}
          </MapContainer>

          {/* Legend - hidden on small mobile, compact on medium */}
          <div className="absolute bottom-4 left-4 z-[1000] glass-strong rounded-xl p-2.5 sm:p-3 space-y-1 hidden sm:block">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Legenda
            </p>
            {vendedoresData.map((v) => (
              <div key={v.id} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color }} />
                <span className="text-muted-foreground">{v.full_name}</span>
              </div>
            ))}
            <div className="border-t border-white/[0.06] pt-1.5 mt-1.5 space-y-1">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-white" />
                <span>Concluida</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-white" />
                <span>Pendente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
