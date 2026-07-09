import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import SummaryCards from './SummaryCards';

export default function DashboardView({ totalEntradas, totalSaidas, saldoAtual, transacoesFiltradas }) {
  
  // 1. Dados para o Gráfico de Barras: Entradas vs Saídas
  const dadosFluxo = [
    { name: 'Entradas', valor: totalEntradas, fill: '#16a34a' },
    { name: 'Saídas', valor: totalSaidas, fill: '#dc2626' }
  ];

  // 2. Dados para o Gráfico de Pizza: Agrupamento de Saídas por Categoria
  const despesasPorCategoria = transacoesFiltradas
    .filter(t => t.tipo === 'Saída')
    .reduce((acc, atual) => {
      const categoriaExistente = acc.find(item => item.name === atual.categoria);
      if (categoriaExistente) {
        categoriaExistente.value += atual.valor;
      } else {
        acc.push({ name: atual.categoria, value: atual.valor });
      }
      return acc;
    }, []);

  const CORES_GRAFICO = ['#2563eb', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6b7280'];

  const formatarMoedaToolTip = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-4">
      <SummaryCards totalEntradas={totalEntradas} totalSaidas={totalSaidas} saldoAtual={saldoAtual} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Gráfico 1: Fluxo de Caixa */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/60 shadow-xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Fluxo de Caixa Geral</h3>
          <div className="h-60 w-full text-[10px] font-semibold text-gray-400">
            <ResponsiveContainer width="100%" height="100%">
              {/* CORRIGIDO AQUI: de dadosGears para dadosFluxo */}
              <BarChart data={dadosFluxo} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `R$ ${v}`} />
                <Tooltip formatter={formatarMoedaToolTip} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                  {dadosFluxo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Despesas por Categoria */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/60 shadow-xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Despesas por Categoria</h3>
          <div className="h-60 w-full flex items-center justify-center">
            {despesasPorCategoria.length === 0 ? (
              <span className="text-xs font-medium text-gray-400">Nenhum gasto registrado neste período.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={despesasPorCategoria}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {despesasPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CORES_GRAFICO[index % CORES_GRAFICO.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={formatarMoedaToolTip} />
                  <Legend verticalAlign="bottom" height={32} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}