// src/components/DashboardView.jsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { AreaChart, DonutChart, BarChart, Flex } from '@tremor/react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import SummaryCards from './SummaryCards';
import AlertsPanel from './AlertsPanel';
import BudgetPanel from './BudgetPanel';

gsap.registerPlugin(useGSAP);

// Tooltip com visual moderno e bordas harmonizadas
function UniversalTooltip({ active, payload, label, formatarMoeda, setItemFocado }) {
  useEffect(() => {
    if (setItemFocado) {
      if (active && payload && payload.length) {
        setItemFocado({ name: payload[0].name, valor: payload[0].value });
      } else {
        setItemFocado(null);
      }
    }
  }, [active, payload, setItemFocado]);

  if (!active || !payload || !payload.length) return null;

  if (label || payload.length > 1) {
    return (
      <div 
        style={{
          backgroundColor: '#161e18',
          borderColor: '#626868',
          color: '#FFE2FE'
        }}
        className="px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold space-y-2 pointer-events-none backdrop-blur-md"
      >
        {label && (
          <p style={{ color: '#D3C1D2', borderColor: '#273C2C' }} className="text-[11px] font-bold border-b pb-1.5">
            {label}
          </p>
        )}
        <div className="space-y-1.5">
          {payload.map((item, index) => {
            const corBola = item.name === 'Entradas' ? '#10b981' : '#f43f5e';
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color || corBola }}
                  />
                  <span style={{ color: '#D3C1D2' }}>{item.name}</span>
                </div>
                <span className="font-extrabold text-[#FFE2FE]">
                  {formatarMoeda(item.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const item = payload[0];
  const corBola = item.color || '#D3C1D2';

  return (
    <div 
      style={{
        backgroundColor: '#161e18',
        borderColor: '#626868',
        color: '#FFE2FE'
      }}
      className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl shadow-2xl border text-xs font-semibold pointer-events-none"
    >
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: corBola }}
      />
      <span style={{ color: '#D3C1D2' }}>{item.name}</span>
      <span className="font-extrabold text-[#FFE2FE] ml-2">{formatarMoeda(item.value)}</span>
    </div>
  );
}

export default function DashboardView({
  totalEntradas,
  totalSaidas,
  saldoAtual,
  transacoesFiltradas,
  limites = {},
  setLimites
}) {
  const containerRef = useRef(null);
  const [itemFocadoDespesa, setItemFocadoDespesa] = useState(null);

  const formatarMoeda = (valor) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  // Entrada sequencial fluida no carregamento
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.6 } });

    tl.from('.gsap-card', {
      y: 30,
      opacity: 0,
      stagger: 0.08,
      clearProps: 'transform,opacity',
    });
  }, { scope: containerRef });

  const dadosResumoGeral = useMemo(() => [
    {
      descricao: 'Balanço',
      Entradas: totalEntradas,
      Saídas: totalSaidas,
    },
  ], [totalEntradas, totalSaidas]);

  const dadosFluxoTempo = useMemo(() => {
    const mapa = {};
    const ordenadas = [...transacoesFiltradas].sort((a, b) => new Date(a.data) - new Date(b.data));

    ordenadas.forEach((t) => {
      const dataFormatada = t.data ? t.data.split('-').reverse().slice(0, 2).join('/') : 'Geral';

      if (!mapa[dataFormatada]) {
        mapa[dataFormatada] = { Data: dataFormatada, Entradas: 0, Saídas: 0 };
      }

      if (t.tipo === 'Entrada') {
        mapa[dataFormatada].Entradas += Number(t.valor);
      } else if (t.tipo === 'Saída') {
        mapa[dataFormatada].Saídas += Number(t.valor);
      }
    });

    return Object.values(mapa);
  }, [transacoesFiltradas]);

  const despesasPorCategoria = useMemo(() => {
    const mapaCategorias = {};

    transacoesFiltradas
      .filter((t) => t.tipo === 'Saída')
      .forEach((t) => {
        const cat = t.categoria || 'Outros';
        mapaCategorias[cat] = (mapaCategorias[cat] || 0) + Number(t.valor);
      });

    return Object.keys(mapaCategorias).map((categoria) => ({
      name: categoria,
      valor: mapaCategorias[categoria],
    }));
  }, [transacoesFiltradas]);

  const valorTotalDespesas = useMemo(() => {
    return despesasPorCategoria.reduce((soma, item) => soma + item.valor, 0);
  }, [despesasPorCategoria]);

  const valorExibidoDespesa = itemFocadoDespesa ? itemFocadoDespesa.valor : valorTotalDespesas;
  const tituloExibidoDespesa = itemFocadoDespesa ? itemFocadoDespesa.name : 'Despesas Totais';

  const PALETA_CORES = ["emerald", "violet", "rose", "amber", "cyan", "indigo", "pink"];

  return (
    <div ref={containerRef} className="space-y-6 font-sans">
      
      {/* 1. Cards de Resumo Principais */}
      <div className="gsap-card">
        <SummaryCards
          totalEntradas={totalEntradas}
          totalSaidas={totalSaidas}
          saldoAtual={saldoAtual}
        />
      </div>

      {/* 2. Painéis de Alertas e Orçamentos */}
      <div className="gsap-card">
        <AlertsPanel
          transacoes={transacoesFiltradas}
          limites={limites}
        />
      </div>

      <div className="gsap-card">
        <BudgetPanel
          transacoes={transacoesFiltradas}
          limites={limites}
          setLimites={setLimites}
        />
      </div>

      {/* 3. LINHA SUPERIOR: 2 Gráficos Lado a Lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* GRÁFICO 1: Resumo Geral de Entradas x Saídas */}
        <div 
          style={{
            backgroundColor: '#161e18',
            borderColor: '#273C2C',
            color: '#FFE2FE'
          }}
          className="gsap-card border p-6 rounded-3xl shadow-lg transition-transform hover:-translate-y-0.5 duration-200"
        >
          <div className="text-center mb-2">
            <p style={{ color: '#D3C1D2' }} className="text-xs font-bold uppercase tracking-wider">
              Entradas x Saídas
            </p>
            <div className="text-2xl font-extrabold mt-1 flex items-center justify-center gap-2">
              <span className="text-emerald-400">{formatarMoeda(totalEntradas)}</span>
              <span style={{ color: '#626868' }} className="font-normal text-lg">|</span>
              <span className="text-rose-400">{formatarMoeda(totalSaidas)}</span>
            </div>
          </div>

          <BarChart
            className="h-56 mt-2 w-full"
            data={dadosResumoGeral}
            index="descricao"
            categories={['Entradas', 'Saídas']}
            colors={['emerald', 'rose']}
            valueFormatter={formatarMoeda}
            showLegend={false}
            yAxisWidth={75}
            barSize={36}
            customTooltip={(props) => (
              <UniversalTooltip
                {...props}
                formatarMoeda={formatarMoeda}
              />
            )}
          />
        </div>

        {/* GRÁFICO 2: Despesas por Categoria (Donut Interativo) */}
        <div 
          style={{
            backgroundColor: '#161e18',
            borderColor: '#273C2C',
            color: '#FFE2FE'
          }}
          className="gsap-card border p-6 rounded-3xl shadow-lg transition-transform hover:-translate-y-0.5 duration-200"
        >
          <div className="text-center mb-2">
            <p style={{ color: '#D3C1D2' }} className="text-xs font-bold uppercase tracking-wider">
              {tituloExibidoDespesa}
            </p>
            <p style={{ color: '#FFE2FE' }} className="text-2xl font-extrabold mt-1 transition-all">
              {formatarMoeda(valorExibidoDespesa)}
            </p>
          </div>

          {despesasPorCategoria.length === 0 ? (
            <Flex className="h-56 items-center justify-center">
              <span style={{ color: '#939196' }} className="text-xs font-medium">
                Nenhum gasto registrado neste período.
              </span>
            </Flex>
          ) : (
            <DonutChart
              className="h-56 mt-2"
              data={despesasPorCategoria}
              category="valor"
              index="name"
              valueFormatter={formatarMoeda}
              colors={PALETA_CORES}
              variant="donut"
              showLabel={false}
              showLegend={false}
              customTooltip={(props) => (
                <UniversalTooltip
                  {...props}
                  setItemFocado={setItemFocadoDespesa}
                  formatarMoeda={formatarMoeda}
                />
              )}
            />
          )}
        </div>

      </div>

      {/* 4. LINHA INFERIOR: Evolução do Fluxo de Caixa */}
      <div 
        style={{
          backgroundColor: '#161e18',
          borderColor: '#273C2C',
          color: '#FFE2FE'
        }}
        className="gsap-card border p-6 rounded-3xl shadow-lg transition-transform hover:-translate-y-0.5 duration-200 w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ color: '#D3C1D2' }} className="text-xs font-bold uppercase tracking-wider">
            Evolução do Fluxo de Caixa
          </h3>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Entradas
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Saídas
            </span>
          </div>
        </div>

        {dadosFluxoTempo.length === 0 ? (
          <Flex className="h-64 items-center justify-center">
            <span style={{ color: '#939196' }} className="text-xs font-medium">
              Sem movimentações para exibir no gráfico.
            </span>
          </Flex>
        ) : (
          <AreaChart
            className="h-64 mt-2"
            data={dadosFluxoTempo}
            index="Data"
            categories={['Entradas', 'Saídas']}
            colors={['emerald', 'rose']}
            valueFormatter={formatarMoeda}
            showLegend={false}
            yAxisWidth={75}
            curveType="linear"
            showGridLines={false}
            connectNulls={true}
            customTooltip={(props) => (
              <UniversalTooltip
                {...props}
                formatarMoeda={formatarMoeda}
              />
            )}
          />
        )}
      </div>

    </div>
  );
}