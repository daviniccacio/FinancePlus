// src/components/DashboardView.jsx
import { useState, useMemo, useEffect } from 'react';
import { AreaChart, DonutChart, Flex } from '@tremor/react';
import SummaryCards from './SummaryCards';
import AlertsPanel from './AlertsPanel';
import BudgetPanel from './BudgetPanel';

// Componente da Janela Flutuante (Tooltip) exatamente como o do site oficial da Tremor
function CustomTooltip({ active, payload, setItemFocado, formatarMoeda }) {
  useEffect(() => {
    if (active && payload && payload.length) {
      setItemFocado({
        name: payload[0].name,
        valor: payload[0].value,
      });
    } else {
      setItemFocado(null);
    }
  }, [active, payload, setItemFocado]);

  if (!active || !payload || !payload.length) return null;

  const data = payload[0];

  return (
    <div className="flex items-center gap-2.5 bg-zinc-900 text-white px-3.5 py-2 rounded-xl shadow-2xl border border-zinc-800 text-xs font-semibold animate-in fade-in zoom-in-95 duration-100 pointer-events-none">
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: data.color || '#3b82f6' }}
      />
      <span className="text-zinc-200">{data.name}</span>
      <span className="font-extrabold text-white ml-2">{formatarMoeda(data.value)}</span>
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
  const [itemFocado, setItemFocado] = useState(null);

  // 1. Agrupa as transações por data para o gráfico de linha/área
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

  // 2. Agrupa as despesas por categoria
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

  const formatarMoeda = (valor) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  // Soma total de todas as despesas por categoria
  const valorTotalDespesas = useMemo(() => {
    return despesasPorCategoria.reduce((soma, item) => soma + item.valor, 0);
  }, [despesasPorCategoria]);

  const valorExibido = itemFocado ? itemFocado.valor : valorTotalDespesas;
  const tituloExibido = itemFocado ? itemFocado.name : 'Despesas Totais';

  const PALETA_CORES = ["cyan", "violet", "pink", "amber", "emerald", "indigo", "rose"];

  return (
    <div className="space-y-6 font-sans">
      {/* Cards de Resumo */}
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

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Evolução do Fluxo de Caixa */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-xs transition-colors duration-200">
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
              connectNulls={true}
            />
          )}
        </div>

        {/* Gráfico 2: Despesas por Categoria (Visual Idêntico à Tremor) */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-xs transition-colors duration-200">
          
          {/* Valor Superior Dinâmico (Muda ao passar o rato) */}
          <div className="text-center mb-2">
            <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              {tituloExibido}
            </p>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-zinc-100 mt-1 transition-all">
              {formatarMoeda(valorExibido)}
            </p>
          </div>

          {despesasPorCategoria.length === 0 ? (
            <Flex className="h-64 items-center justify-center">
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
              showLabel={false} /* Desativa o texto no centro do furo */
              showLegend={false}
              customTooltip={(props) => (
                <CustomTooltip
                  {...props}
                  setItemFocado={setItemFocado}
                  formatarMoeda={formatarMoeda}
                />
              )}
            />
          )}
        </div>

      </div>
    </div>
  );
}