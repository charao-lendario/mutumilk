import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StatusVisita, MockVisita } from "@/data/mock/roteiros";

interface VisitaUpdate {
  visitaId: string;
  status: StatusVisita;
  pedidoId?: string | null;
  justificativa?: string | null;
  concluidaAt?: string;
}

interface NovoPedido {
  id: string;
  clienteId: string;
  clienteNome: string;
  vendedorId: string;
  valorTotal: number;
  itens: { produtoId: string; produtoNome: string; quantidade: number; precoUnitario: number; subtotal: number }[];
  dataPedido: string;
}

interface MockStore {
  visitaUpdates: Record<string, VisitaUpdate>;
  pedidosNovos: NovoPedido[];
  rotaIniciada: Record<string, boolean>;

  updateVisita: (update: VisitaUpdate) => void;
  addPedido: (pedido: NovoPedido) => void;
  setRotaIniciada: (roteiroId: string, iniciada: boolean) => void;
  getVisitaStatus: (visitaId: string) => VisitaUpdate | undefined;
  resetStore: () => void;
}

export const useMockStore = create<MockStore>()(
  persist(
    (set, get) => ({
      visitaUpdates: {},
      pedidosNovos: [],
      rotaIniciada: {},

      updateVisita: (update) =>
        set((state) => ({
          visitaUpdates: { ...state.visitaUpdates, [update.visitaId]: update },
        })),

      addPedido: (pedido) =>
        set((state) => ({
          pedidosNovos: [...state.pedidosNovos, pedido],
        })),

      setRotaIniciada: (roteiroId, iniciada) =>
        set((state) => ({
          rotaIniciada: { ...state.rotaIniciada, [roteiroId]: iniciada },
        })),

      getVisitaStatus: (visitaId) => get().visitaUpdates[visitaId],

      resetStore: () => set({ visitaUpdates: {}, pedidosNovos: [], rotaIniciada: {} }),
    }),
    { name: "mutumilk-mock-store" }
  )
);

export function getVisitaComUpdate(visita: MockVisita): MockVisita {
  const store = useMockStore.getState();
  const update = store.visitaUpdates[visita.id];
  if (!update) return visita;

  return {
    ...visita,
    status: update.status,
    pedido_id: update.pedidoId ?? visita.pedido_id,
    justificativa: update.justificativa ?? visita.justificativa,
    concluida_at: update.concluidaAt ?? visita.concluida_at,
  };
}
