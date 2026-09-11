// src/components/DashboardView.jsx
import { useState, useMemo, useEffect } from 'react';
import { AreaChart, DonutChart, BarChart, Flex } from '@tremor/react';
import SummaryCards from './SummaryCards';
import AlertsPanel from './AlertsPanel';
import BudgetPanel from './BudgetPanel';

// Componente de Tooltip Universal unificado para todos os gráficos
function UniversalTooltip({ active, payload, label, formatarMoeda, setItemFocado }) {
  // Atualiza o estado de foco quando hover for acionado no gráfico de rosca
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

  // 1. Para gráficos com múltiplos valores (Evolução de Fluxo ou Balanço Geral)
  if (label || payload.length > 1) {
    return (
      <div className="bg-zinc-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-zinc-800 text-xs font-semibold space-y-2 pointer-events-none">
        {label && (
          <p className="text-[11px] font-bold text-zinc-400 border-b border-zinc-800 pb-1.5">
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
                  <span className="text-zinc-300">{item.name}</span>
                </div>
                <span className="font-extrabold text-white">
                  {formatarMoeda(item.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Para o Gráfico de Rosca (Item Único de Categoria)
  const item = payload[0];
  const corBola = item.color || '#3b82f6';

  return (
    <div className="flex items-center gap-2.5 bg-zinc-900 text-white px-3.5 py-2 rounded-xl shadow-2xl border border-zinc-800 text-xs font-semibold pointer-events-none">
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: corBola }}
      />
      <span className="text-zinc-200">{item.name}</span>
      <span className="font-extrabold text-white ml-2">{formatarMoeda(item.value)}</span>
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
  // Estado para controlar o foco do mouse no gráfico de despesas
  const [itemFocadoDespesa, setItemFocadoDespesa] = useState(null);

  // Formatador monetário em Reais (R$)
  const formatarMoeda = (valor) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  // 1. Agrupa Entradas e Saídas em um único objeto para centralização ideal das barras
  const dadosResumoGeral = useMemo(() => [
    {
      descricao: 'Balanço',
      Entradas: totalEntradas,
      Saídas: totalSaidas,
    },
  ], [totalEntradas, totalSaidas]);

  // 2. Agrupa as transações por data para a linha do tempo do fluxo de caixa
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

  // 3. Agrupa as despesas por categoria
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

  // Soma total de todas as despesas por categoria
  const valorTotalDespesas = useMemo(() => {
    return despesasPorCategoria.reduce((soma, item) => soma + item.valor, 0);
  }, [despesasPorCategoria]);

  // Título e valor dinâmicos para o Gráfico de Rosca
  const valorExibidoDespesa = itemFocadoDespesa ? itemFocadoDespesa.valor : valorTotalDespesas;
  const tituloExibidoDespesa = itemFocadoDespesa ? itemFocadoDespesa.name : 'Despesas Totais';

  const PALETA_CORES = ["cyan", "violet", "pink", "amber", "emerald", "indigo", "rose"];

  return (
    <div className="space-y-6 font-sans">
      {/* Cards de Resumo Principais */}
      <SummaryCards
        totalEntradas={totalEntradas}
        totalSaidas={totalSaidas}
        saldoAtual={saldoAtual}
      />

      {/* Painéis de Alertas e Orçamentos */}
      <AlertsPanel
        transacoes={transacoesFiltradas}
        limites={limites}
      />

      <BudgetPanel
        transacoes={transacoesFiltradas}
        limites={limites}
        setLimites={setLimites}
      />

      {/* LINHA SUPERIOR: 2 Gráficos Lado a Lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* GRÁFICO 1: Resumo Geral de Entradas x Saídas (100% de largura) */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-xs transition-colors duration-200">
          
          <div className="text-center mb-2">
            <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              Entradas x Saídas
            </p>
            <div className="text-2xl font-extrabold mt-1 flex items-center justify-center gap-2">
              <span className="text-emerald-600 dark:text-emerald-400">{formatarMoeda(totalEntradas)}</span>
              <span className="text-gray-300 dark:text-zinc-700 font-normal text-lg">|</span>
              <span className="text-rose-600 dark:text-rose-400">{formatarMoeda(totalSaidas)}</span>
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
            barCategoryGap={90}
            customTooltip={(props) => (
              <UniversalTooltip
                {...props}
                formatarMoeda={formatarMoeda}
              />
            )}
          />
        </div>

        {/* GRÁFICO 2: Despesas por Categoria (Donut Interativo) */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-xs transition-colors duration-200">
          <div className="text-center mb-2">
            <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              {tituloExibidoDespesa}
            </p>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-zinc-100 mt-1 transition-all">
              {formatarMoeda(valorExibidoDespesa)}
            </p>
          </div>

          {despesasPorCategoria.length === 0 ? (
            <Flex className="h-56 items-center justify-center">
              <span className="text-xs font-medium text-gray-400 dark:text-zinc-500">
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

      {/* LINHA INFERIOR: Gráfico Largo de 100% (Evolução do Fluxo de Caixa) */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-xs transition-colors duration-200 w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
            Evolução do Fluxo de Caixa
          </h3>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Entradas
            </span>
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Saídas
            </span>
          </div>
        </div>

        {dadosFluxoTempo.length === 0 ? (
          <Flex className="h-64 items-center justify-center">
            <span className="text-xs font-medium text-gray-400 dark:text-zinc-500">
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