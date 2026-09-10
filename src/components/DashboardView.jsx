// src/components/DashboardView.jsx
import { useMemo } from 'react';
import { Card, Text, DonutChart, AreaChart, Flex } from '@tremor/react';
import SummaryCards from './SummaryCards';
import AlertsPanel from './AlertsPanel';
import BudgetPanel from './BudgetPanel';

export default function DashboardView({ 
  totalEntradas, 
  totalSaidas, 
  saldoAtual, 
  transacoesFiltradas, 
  limites = {}, 
  setLimites 
}) {

  // 1. Prepara a linha do tempo para o AreaChart
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

  // 2. Agrupa as despesas por categoria para o DonutChart
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

  // Paleta de cores mapeada para o CSS
  const PALETA_CORES = ["cyan", "violet", "pink", "amber", "emerald", "indigo", "rose"];

  return (
    <div className="space-y-4">
      <SummaryCards 
        totalEntradas={totalEntradas} 
        totalSaidas={totalSaidas} 
        saldoAtual={saldoAtual} 
      />

      <AlertsPanel 
        transacoes={transacoesFiltradas} 
        limites={limites} 
      />

      <BudgetPanel 
        transacoes={transacoesFiltradas} 
        limites={limites} 
        setLimites={setLimites} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Gráfico 1: Evolução do Fluxo de Caixa */}
        <Card className="bg-white dark:bg-zinc-900 border-gray-200/60 dark:border-zinc-800 rounded-3xl">
          <Text className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
            Evolução do Fluxo de Caixa
          </Text>
          
          {dadosFluxoTempo.length === 0 ? (
            <Flex className="h-60 items-center justify-center">
              <span className="text-xs font-medium text-gray-400 dark:text-zinc-500">
                Sem movimentações para exibir no gráfico.
              </span>
            </Flex>
          ) : (
            <AreaChart
              className="h-60 mt-2"
              data={dadosFluxoTempo}
              index="Data"
              categories={['Entradas', 'Saídas']}
              colors={['emerald', 'rose']}
              valueFormatter={formatarMoeda}
              yAxisWidth={80}
            />
          )}
        </Card>

        {/* Gráfico 2: Despesas por Categoria */}
        <Card className="bg-white dark:bg-zinc-900 border-gray-200/60 dark:border-zinc-800 rounded-3xl">
          <Text className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
            Despesas por Categoria
          </Text>

          {despesasPorCategoria.length === 0 ? (
            <Flex className="h-60 items-center justify-center">
              <span className="text-xs font-medium text-gray-400 dark:text-zinc-500">
                Nenhum gasto registrado neste período.
              </span>
            </Flex>
          ) : (
            <DonutChart
              className="h-60 mt-2"
              data={despesasPorCategoria}
              category="valor"
              index="name"
              valueFormatter={formatarMoeda}
              colors={PALETA_CORES}
              showLegend={true}
              showLabel={true}
            />
          )}
        </Card>

      </div>
    </div>
  );
}