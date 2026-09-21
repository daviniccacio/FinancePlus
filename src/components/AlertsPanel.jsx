// src/components/AlertsPanel.jsx
import { useRef } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle, AlertCircle } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function AlertsPanel({ transacoes = [], limites = {} }) {
  const containerRef = useRef(null);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const mesAtualTexto = hoje.toISOString().substring(0, 7);

  const contasPendentes = transacoes.filter((t) => {
    const tipoTexto = t.tipo ? t.tipo.toLowerCase().trim() : '';
    const statusTexto = t.status ? t.status.toLowerCase().trim() : '';

    const ehSaida = tipoTexto === 'saída' || tipoTexto === 'saida' || tipoTexto === 'despesa';
    const ehPendente = statusTexto === 'pendente' || statusTexto === 'a pagar' || statusTexto === 'em aberto';
    
    const dataAlvo = t.data_vencimento || t.dataVencimento;
    return ehSaida && ehPendente && !!dataAlvo;
  });

  const alertasVencimento = contasPendentes.map((transacao) => {
    const dataAlvo = transacao.data_vencimento || transacao.dataVencimento;
    let vencimento;

    if (typeof dataAlvo === 'string') {
      const separador = dataAlvo.includes('/') ? '/' : '-';
      const partes = dataAlvo.split(separador).map(Number);
      vencimento = separador === '-' 
        ? new Date(partes[0], partes[1] - 1, partes[2])
        : new Date(partes[2], partes[1] - 1, partes[0]);
    } else {
      vencimento = new Date(dataAlvo);
    }
    vencimento.setHours(0, 0, 0, 0);

    const diferencaDias = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    let statusVencimento = 'em-dia'; 
    let mensagem = '';

    if (diferencaDias < 0) {
      statusVencimento = 'vencida';
      mensagem = `Vencida há ${Math.abs(diferencaDias)} ${Math.abs(diferencaDias) === 1 ? 'dia' : 'dias'}`;
    } else if (diferencaDias <= 3) {
      statusVencimento = 'urgente';
      mensagem = diferencaDias === 0 ? 'Vence HOJE!' : `Vence em ${diferencaDias} ${diferencaDias === 1 ? 'dia' : 'dias'}`;
    }

    return {
      id: `vencim-${transacao.id}`,
      descricao: transacao.descricao,
      valor: transacao.valor,
      categoria: transacao.categoria,
      tipoAlerta: 'vencimento',
      statusVencimento,
      mensagem,
      diferencaDias
    };
  }).filter(item => item.statusVencimento === 'vencida' || item.statusVencimento === 'urgente');

  const despesasMesAtual = transacoes.filter(t => {
    const tipoTexto = t.tipo ? t.tipo.toLowerCase().trim() : '';
    const ehSaida = tipoTexto === 'saída' || tipoTexto === 'saida' || tipoTexto === 'despesa';
    const noMes = t.data && t.data.substring(0, 7) === mesAtualTexto;
    return ehSaida && noMes;
  });

  const alertasOrcamento = [];
  Object.keys(limites).forEach((cat) => {
    const config = limites[cat];
    if (config.tipo === 'orcamento') {
      const totalGasto = despesasMesAtual
        .filter(t => t.categoria?.toLowerCase().trim() === cat.toLowerCase().trim())
        .reduce((soma, t) => soma + t.valor, 0);

      const limite = config.limite;
      if (limite > 0) {
        const porcentagem = (totalGasto / limite) * 100;
        
        if (porcentagem >= 80) {
          alertasOrcamento.push({
            id: `budget-${cat}`,
            descricao: `Orçamento: ${cat}`,
            valor: totalGasto,
            categoria: cat,
            tipoAlerta: 'orcamento',
            statusVencimento: porcentagem >= 100 ? 'vencida' : 'urgente',
            mensagem: porcentagem >= 100 
              ? `Limite esgotado! (${Math.round(porcentagem)}% consumido)` 
              : `Atenção! Você atingiu ${Math.round(porcentagem)}% do limite.`,
            diferencaDias: porcentagem >= 100 ? -999 : -100 
          });
        }
      }
    }
  });

  const todosAlertas = [...alertasOrcamento, ...alertasVencimento].sort((a, b) => a.diferencaDias - b.diferencaDias);

  useGSAP(() => {
    if (todosAlertas.length > 0) {
      gsap.fromTo(
        '.alert-row',
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' }
      );
    }
  }, { dependencies: [todosAlertas.length], scope: containerRef });

  if (todosAlertas.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-white dark:bg-[#161e18] border border-gray-200 dark:border-[#273C2C] flex items-center gap-3 transition-colors duration-200 shadow-xs">
        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <p className="text-xs font-semibold text-gray-800 dark:text-[#FFE2FE]">
          Tudo sob controle! Nenhuma conta atrasada ou orçamento estourando neste mês.
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="p-5 rounded-3xl bg-white dark:bg-[#161e18] border border-gray-200 dark:border-[#273C2C] shadow-xs space-y-3 font-sans transition-colors duration-200"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-[#D3C1D2]">
          Central de Notificações e Avisos
        </h3>
      </div>
      
      <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
        {todosAlertas.map((alerta) => {
          const ehVencida = alerta.statusVencimento === 'vencida';
          return (
            <div 
              key={alerta.id} 
              className={`alert-row flex items-center justify-between p-3 rounded-2xl border text-xs font-medium transition-all hover:scale-[1.01] ${
                ehVencida
                  ? 'bg-rose-50 dark:bg-rose-950/25 border-rose-200 dark:border-rose-500/35'
                  : 'bg-amber-50 dark:bg-amber-950/25 border-amber-200 dark:border-amber-500/35'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-bold flex items-center gap-1.5 text-gray-900 dark:text-[#FFE2FE]">
                  {alerta.tipoAlerta === 'orcamento' && <AlertCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />}
                  {alerta.descricao}
                </span>
                <span className={`text-[10px] flex items-center gap-1 font-semibold ${
                  ehVencida ? 'text-rose-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                }`}>
                  <CalendarClock className="w-3.5 h-3.5" /> {alerta.mensagem}
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold block text-gray-900 dark:text-[#FFE2FE]">
                  R$ {alerta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-md font-semibold border inline-block mt-0.5 bg-white dark:bg-[#161e18] text-gray-700 dark:text-[#D3C1D2] border-gray-200 dark:border-[#273C2C]">
                  {alerta.categoria}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}