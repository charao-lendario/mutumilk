import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Package, Search, Tag, TrendingUp, ArrowUpRight, Percent,
} from "lucide-react";

const mockProdutos = [
  { id: 1, nome: "Queijo Mussarela", variacao: "5kg", categoria: "Queijos", preco: 35.00, precoAnterior: 38.00, unidade: "kg", emPromocao: true },
  { id: 2, nome: "Leite Integral", variacao: "1L", categoria: "Leites", preco: 4.00, precoAnterior: 4.00, unidade: "un", emPromocao: false },
  { id: 3, nome: "Iogurte Natural", variacao: "1kg", categoria: "Iogurtes", preco: 10.00, precoAnterior: 10.00, unidade: "un", emPromocao: false },
  { id: 4, nome: "Manteiga Extra", variacao: "500g", categoria: "Manteigas", preco: 15.00, precoAnterior: 16.50, unidade: "un", emPromocao: true },
  { id: 5, nome: "Requeijao Cremoso", variacao: "400g", categoria: "Cremosos", preco: 10.00, precoAnterior: 10.00, unidade: "un", emPromocao: false },
  { id: 6, nome: "Queijo Prato", variacao: "3kg", categoria: "Queijos", preco: 42.00, precoAnterior: 42.00, unidade: "kg", emPromocao: false },
  { id: 7, nome: "Creme de Leite", variacao: "200g", categoria: "Cremosos", preco: 3.50, precoAnterior: 3.50, unidade: "un", emPromocao: false },
  { id: 8, nome: "Leite Desnatado", variacao: "1L", categoria: "Leites", preco: 4.50, precoAnterior: 4.50, unidade: "un", emPromocao: false },
  { id: 9, nome: "Iogurte Grego", variacao: "500g", categoria: "Iogurtes", preco: 12.00, precoAnterior: 14.00, unidade: "un", emPromocao: true },
  { id: 10, nome: "Queijo Coalho", variacao: "1kg", categoria: "Queijos", preco: 28.00, precoAnterior: 28.00, unidade: "kg", emPromocao: false },
  { id: 11, nome: "Leite Condensado", variacao: "395g", categoria: "Especiais", preco: 6.50, precoAnterior: 6.50, unidade: "un", emPromocao: false },
  { id: 12, nome: "Ricota Fresca", variacao: "500g", categoria: "Queijos", preco: 15.00, precoAnterior: 17.00, unidade: "un", emPromocao: true },
  { id: 13, nome: "Manteiga com Sal", variacao: "200g", categoria: "Manteigas", preco: 8.00, precoAnterior: 8.00, unidade: "un", emPromocao: false },
  { id: 14, nome: "Bebida Lactea", variacao: "1L", categoria: "Iogurtes", preco: 5.50, precoAnterior: 5.50, unidade: "un", emPromocao: false },
  { id: 15, nome: "Queijo Provolone", variacao: "Defumado 500g", categoria: "Queijos", preco: 32.00, precoAnterior: 32.00, unidade: "un", emPromocao: false },
];

const categorias = ["Todos", "Queijos", "Leites", "Iogurtes", "Manteigas", "Cremosos", "Especiais"];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function Produtos() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todos");

  const filtered = mockProdutos.filter(p => {
    const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.categoria.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "Todos" || p.categoria === catFilter;
    return matchSearch && matchCat;
  });

  const emPromocao = mockProdutos.filter(p => p.emPromocao).length;

  return (
    <DashboardLayout title="Produtos" subtitle="Catalogo de produtos e precos">
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Produtos", value: mockProdutos.length, icon: Package, color: "text-sky-400", bgGlow: "bg-sky-500/20" },
            { label: "Em Promocao", value: emPromocao, icon: Percent, color: "text-emerald-400", bgGlow: "bg-emerald-500/20" },
            { label: "Categorias", value: categorias.length - 1, icon: Tag, color: "text-violet-400", bgGlow: "bg-violet-500/20" },
            { label: "Crescimento", value: "+12%", icon: TrendingUp, color: "text-amber-400", bgGlow: "bg-amber-500/20" },
          ].map((s, i) => (
            <div key={s.label} className={`glass p-4 rounded-xl relative overflow-hidden animate-fade-in-up stagger-${i + 1}`}>
              <div className={`absolute -top-8 -right-8 w-24 h-24 ${s.bgGlow} rounded-full blur-2xl`} />
              <s.icon className={`h-4 w-4 ${s.color} mb-2`} />
              <p className="text-2xl font-bold relative">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Category */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up stagger-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card/60 border-white/[0.08] focus:border-primary/40"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  catFilter === cat
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] border border-white/[0.06]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <Card
              key={p.id}
              className="glass overflow-hidden group hover:border-white/20 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${0.3 + i * 0.03}s` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 flex items-center justify-center group-hover:from-sky-500/30 group-hover:to-blue-600/30 transition-colors">
                      <Package className="h-5 w-5 text-sky-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{p.nome}</p>
                      <p className="text-[11px] text-muted-foreground">{p.variacao}</p>
                    </div>
                  </div>
                  {p.emPromocao && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                      PROMO
                    </span>
                  )}
                </div>

                <div className="flex items-end justify-between mt-4 pt-3 border-t border-white/[0.06]">
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-white/[0.05] text-muted-foreground">{p.categoria}</span>
                  </div>
                  <div className="text-right">
                    {p.emPromocao && p.precoAnterior > p.preco && (
                      <p className="text-[11px] text-muted-foreground line-through">{formatCurrency(p.precoAnterior)}/{p.unidade}</p>
                    )}
                    <p className={`text-lg font-bold ${p.emPromocao ? 'text-emerald-400' : ''}`}>
                      {formatCurrency(p.preco)}<span className="text-xs text-muted-foreground font-normal">/{p.unidade}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground animate-fade-in">
          <span>Exibindo {filtered.length} de {mockProdutos.length} produtos</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ArrowUpRight className="h-3 w-3" /> {emPromocao} em promocao
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}
